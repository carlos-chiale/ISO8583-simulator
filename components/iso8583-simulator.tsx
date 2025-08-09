"use client"

import { useState, useEffect } from "react"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { TransactionForm } from "@/components/transaction-form"
import { TransactionHistory } from "@/components/transaction-history"
import { MessageViewer } from "@/components/message-viewer"
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert"
import { AlertCircle } from "lucide-react"
import type { Transaction } from "@/lib/types"
import { formatIso8583Message } from "@/lib/iso8583"
import { sendTransaction, parseNetworkResponse, type NetworkConfig } from "@/lib/network-service"

interface Iso8583SimulatorProps {
  headerTerminalTransaction?: Transaction | null
  networkConfig: NetworkConfig
}

export function Iso8583Simulator({ headerTerminalTransaction, networkConfig }: Iso8583SimulatorProps) {
  const [transactions, setTransactions] = useState<Transaction[]>([])
  const [currentMessage, setCurrentMessage] = useState<{ formatted: string; wire: string } | null>(null)
  const [currentResponse, setCurrentResponse] = useState<{ formatted: string; wire: string } | null>(null)
  const [activeTab, setActiveTab] = useState("transaction")
  const [isProcessing, setIsProcessing] = useState(false)
  const [networkError, setNetworkError] = useState<string | null>(null)

  // Process header terminal transactions
  useEffect(() => {
    if (headerTerminalTransaction) {
      console.log("Received header terminal transaction:", headerTerminalTransaction)
      handleTerminalTransaction(headerTerminalTransaction)
    }
  }, [headerTerminalTransaction])

  const handleSubmitTransaction = async (transaction: Transaction) => {
    setIsProcessing(true)
    setNetworkError(null)

    // Generate ISO 8583 message
    const { formatted, wire } = formatIso8583Message(transaction)
    setCurrentMessage({ formatted, wire })

    try {
      if (networkConfig.enabled) {
        // Send to network
        console.log("Sending transaction to network:", transaction)
        const result = await sendTransaction(transaction, networkConfig)

        if (result.success && result.response) {
          // Parse the network response
          const response = parseNetworkResponse(result.response, transaction)
          setCurrentResponse(response)

          // Extract status from response
          const approved = result.response.approved === true || result.response.status === "approved"
          const responseCode = result.response.responseCode || (approved ? "00" : "05")
          const authCode = result.response.authCode || (approved ? generateRandomAuthCode() : "")

          // Add to transaction history
          const newTransaction = {
            ...transaction,
            timestamp: new Date(),
            status: approved ? "approved" : "declined",
            responseCode,
            authCode,
            source: transaction.source || "form",
          }

          setTransactions((prev) => [newTransaction, ...prev])
        } else {
          // Handle network error
          setNetworkError(result.error || "Failed to process transaction")

          // Create a declined transaction for the history
          const newTransaction = {
            ...transaction,
            timestamp: new Date(),
            status: "declined",
            responseCode: "96", // System error
            source: transaction.source || "form",
          }

          setTransactions((prev) => [newTransaction, ...prev])

          // Create an error response
          const errorResponse = {
            formatted: `ISO8583 Response:
MTI: 0210
Field 039 (Response Code): 96
Field 044 (Response Message): SYSTEM ERROR - ${result.error}
`,
            wire: `0210${wire.substring(4, 40)}9600      ${wire.substring(60)}`,
          }

          setCurrentResponse(errorResponse)
        }
      } else {
        // Simulate response locally
        await simulateLocalResponse(transaction, wire)
      }
    } catch (error: any) {
      console.error("Transaction processing error:", error)
      setNetworkError(error.message || "An unexpected error occurred")

      // Create an error response
      const errorResponse = {
        formatted: `ISO8583 Response:
MTI: 0210
Field 039 (Response Code): 96
Field 044 (Response Message): SYSTEM ERROR
`,
        wire: `0210${wire.substring(4, 40)}9600      ${wire.substring(60)}`,
      }

      setCurrentResponse(errorResponse)

      // Add failed transaction to history
      const newTransaction = {
        ...transaction,
        timestamp: new Date(),
        status: "declined",
        responseCode: "96", // System error
        source: transaction.source || "form",
      }

      setTransactions((prev) => [newTransaction, ...prev])
    } finally {
      setIsProcessing(false)
    }
  }

  const simulateLocalResponse = async (transaction: Transaction, wire: string) => {
    // Add a delay to simulate network latency
    await new Promise((resolve) => setTimeout(resolve, 1500))

    const approved = Math.random() > 0.2 // 80% approval rate
    const responseCode = approved ? "00" : "05"
    const responseMessage = approved ? "APPROVED" : "DECLINED"
    const authCode = approved ? generateRandomAuthCode() : ""

    const response = {
      formatted: `ISO8583 Response:
MTI: 0210
Field 039 (Response Code): ${responseCode}
Field 044 (Response Message): ${responseMessage}
Field 038 (Auth Code): ${authCode}
`,
      wire: `0210${wire.substring(4, 40)}${responseCode}00${authCode || "      "}${wire.substring(60)}`,
    }

    setCurrentResponse(response)

    // Add to transaction history
    const newTransaction = {
      ...transaction,
      timestamp: new Date(),
      status: approved ? "approved" : "declined",
      responseCode,
      authCode,
      source: transaction.source || "form",
    }

    setTransactions((prev) => [newTransaction, ...prev])
  }

  const handleTerminalTransaction = async (transaction: Transaction) => {
    console.log("Processing terminal transaction:", transaction)
    setIsProcessing(true)
    setNetworkError(null)

    // Ensure all required fields are present
    const processedTransaction: Transaction = {
      ...transaction,
      timestamp: new Date(),
      source: "terminal", // Add source to identify terminal transactions
    }

    // Generate ISO 8583 message for terminal transaction
    const { formatted, wire } = formatIso8583Message(processedTransaction)
    setCurrentMessage({ formatted, wire })

    try {
      if (networkConfig.enabled) {
        // Send to network
        console.log("Sending terminal transaction to network:", processedTransaction)
        const result = await sendTransaction(processedTransaction, networkConfig)

        if (result.success && result.response) {
          // Parse the network response
          const response = parseNetworkResponse(result.response, processedTransaction)
          setCurrentResponse(response)

          // Extract status from response
          const approved = result.response.approved === true || result.response.status === "approved"
          const responseCode = result.response.responseCode || (approved ? "00" : "05")
          const authCode = result.response.authCode || (approved ? generateRandomAuthCode() : "")

          // Update the transaction with response data
          const updatedTransaction = {
            ...processedTransaction,
            status: approved ? "approved" : "declined",
            responseCode,
            authCode,
          }

          setTransactions((prev) => [updatedTransaction, ...prev])
        } else {
          // Handle network error
          setNetworkError(result.error || "Failed to process transaction")

          // Create a declined transaction for the history
          const newTransaction = {
            ...processedTransaction,
            status: "declined",
            responseCode: "96", // System error
          }

          setTransactions((prev) => [newTransaction, ...prev])

          // Create an error response
          const errorResponse = {
            formatted: `ISO8583 Response:
MTI: 0210
Field 039 (Response Code): 96
Field 044 (Response Message): SYSTEM ERROR - ${result.error}
`,
            wire: `0210${wire.substring(4, 40)}9600      ${wire.substring(60)}`,
          }

          setCurrentResponse(errorResponse)
        }
      } else {
        // Use the status from the terminal transaction if available, otherwise simulate
        const approved = processedTransaction.status ? processedTransaction.status === "approved" : Math.random() > 0.2
        const responseCode = processedTransaction.responseCode || (approved ? "00" : "05")
        const responseMessage = approved ? "APPROVED" : "DECLINED"
        const authCode = processedTransaction.authCode || (approved ? generateRandomAuthCode() : "")

        // Create response
        const response = {
          formatted: `ISO8583 Response:
MTI: 0210
Field 039 (Response Code): ${responseCode}
Field 044 (Response Message): ${responseMessage}
Field 038 (Auth Code): ${authCode}
`,
          wire: `0210${wire.substring(4, 40)}${responseCode}00${authCode || "      "}${wire.substring(60)}`,
        }

        // Add a delay to simulate network latency
        await new Promise((resolve) => setTimeout(resolve, 1000))

        setCurrentResponse(response)

        // Update the transaction with response data if not already set
        const updatedTransaction = {
          ...processedTransaction,
          status: approved ? "approved" : "declined",
          responseCode,
          authCode,
        }

        setTransactions((prev) => [updatedTransaction, ...prev])
      }
    } catch (error: any) {
      console.error("Terminal transaction processing error:", error)
      setNetworkError(error.message || "An unexpected error occurred")

      // Create an error response
      const errorResponse = {
        formatted: `ISO8583 Response:
MTI: 0210
Field 039 (Response Code): 96
Field 044 (Response Message): SYSTEM ERROR
`,
        wire: `0210${wire.substring(4, 40)}9600      ${wire.substring(60)}`,
      }

      setCurrentResponse(errorResponse)

      // Add failed transaction to history
      const newTransaction = {
        ...processedTransaction,
        status: "declined",
        responseCode: "96", // System error
      }

      setTransactions((prev) => [newTransaction, ...prev])
    } finally {
      setIsProcessing(false)
    }
  }

  const handleSelectTransaction = (transaction: Transaction) => {
    // Generate ISO 8583 message for the selected transaction
    const { formatted, wire } = formatIso8583Message(transaction)
    setCurrentMessage({ formatted, wire })

    // Create response based on transaction status
    const approved = transaction.status === "approved"
    const responseCode = transaction.responseCode || (approved ? "00" : "05")
    const responseMessage = approved ? "APPROVED" : "DECLINED"

    const response = {
      formatted: `ISO8583 Response:
MTI: 0210
Field 039 (Response Code): ${responseCode}
Field 044 (Response Message): ${responseMessage}
Field 038 (Auth Code): ${transaction.authCode || ""}
`,
      wire: `0210${wire.substring(4, 40)}${responseCode}00${transaction.authCode || "      "}${wire.substring(60)}`,
    }

    setCurrentResponse(response)
  }

  function generateRandomAuthCode(): string {
    return Math.random().toString(36).substring(2, 8).toUpperCase()
  }

  return (
    <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
      <div className="lg:col-span-2">
        <Tabs value={activeTab} onValueChange={setActiveTab} className="w-full">
          <TabsList className="grid w-full grid-cols-2">
            <TabsTrigger value="transaction">New Transaction</TabsTrigger>
            <TabsTrigger value="history">Transaction History</TabsTrigger>
          </TabsList>
          <TabsContent value="transaction">
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center justify-between">
                  <span>Create Transaction</span>
                  {networkConfig.enabled && <span className="text-sm font-normal text-green-600">Network Mode</span>}
                </CardTitle>
                <CardDescription>Configure and send a new ISO 8583 financial transaction</CardDescription>
              </CardHeader>
              <CardContent>
                {networkError && (
                  <Alert variant="destructive" className="mb-4">
                    <AlertCircle className="h-4 w-4" />
                    <AlertTitle>Error</AlertTitle>
                    <AlertDescription>{networkError}</AlertDescription>
                  </Alert>
                )}

                <TransactionForm onSubmit={handleSubmitTransaction} isProcessing={isProcessing} />
              </CardContent>
            </Card>
          </TabsContent>
          <TabsContent value="history">
            <Card>
              <CardHeader>
                <CardTitle>Transaction History</CardTitle>
                <CardDescription>View your recent transaction history from both form and terminal</CardDescription>
              </CardHeader>
              <CardContent>
                <TransactionHistory transactions={transactions} onSelectTransaction={handleSelectTransaction} />
              </CardContent>
            </Card>
          </TabsContent>
        </Tabs>
      </div>
      <div>
        <MessageViewer message={currentMessage} response={currentResponse} isProcessing={isProcessing} />
      </div>
    </div>
  )
}
