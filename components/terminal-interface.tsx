"use client"

import { useState, useRef, useEffect } from "react"
import { Dialog, DialogContent, DialogTrigger } from "@/components/ui/dialog"
import { Button } from "@/components/ui/button"
import { CardSwipe } from "@/components/card-swipe"
import { ChipReader } from "@/components/chip-reader"
import { ContactlessReader } from "@/components/contactless-reader"
import { Wifi, Battery, Signal, CreditCard, CreditCardIcon, MonitorSpeaker, WifiOff } from "lucide-react"
import type { Transaction } from "@/lib/types"
import { cn } from "@/lib/utils"
import type { CardOption } from "@/components/card-selection-dialog"
import { sendTransaction, type NetworkConfig, DEFAULT_NETWORK_CONFIG } from "@/lib/network-service"

interface TerminalInterfaceProps {
  onTransactionComplete?: (transaction: Transaction) => void
  defaultTransaction?: Transaction
  standalone?: boolean
  selectedCard?: CardOption | null
  networkConfig?: NetworkConfig
}

// Currency options with Uruguayan Pesos as second option
const currencies = [
  { code: "USD", symbol: "$", numeric: "840", name: "US Dollar", rate: 1 },
  { code: "UYU", symbol: "$U", numeric: "858", name: "Uruguayan Peso", rate: 39.5 }, // Approximate exchange rate
  { code: "EUR", symbol: "€", numeric: "978", name: "Euro", rate: 0.92 },
  { code: "GBP", symbol: "£", numeric: "826", name: "British Pound", rate: 0.79 },
  { code: "JPY", symbol: "¥", numeric: "392", name: "Japanese Yen", rate: 150.5 },
  { code: "CAD", symbol: "C$", numeric: "124", name: "Canadian Dollar", rate: 1.36 },
  { code: "AUD", symbol: "A$", numeric: "036", name: "Australian Dollar", rate: 1.52 },
  { code: "CHF", symbol: "Fr", numeric: "756", name: "Swiss Franc", rate: 0.9 },
  { code: "CNY", symbol: "¥", numeric: "156", name: "Chinese Yuan", rate: 7.24 },
  { code: "INR", symbol: "₹", numeric: "356", name: "Indian Rupee", rate: 83.5 },
  { code: "BRL", symbol: "R$", numeric: "986", name: "Brazilian Real", rate: 5.05 },
]

// Transaction types
const transactionTypes = [
  { value: "purchase", label: "Purchase" },
  { value: "withdrawal", label: "Cash Withdrawal" },
  { value: "refund", label: "Refund" },
  { value: "balance", label: "Balance Inquiry" },
]

// Contactless payment threshold in UYU
const CONTACTLESS_NO_PIN_THRESHOLD_UYU = 2500

export function TerminalInterface({
  onTransactionComplete,
  defaultTransaction,
  standalone = false,
  selectedCard: externalSelectedCard,
  networkConfig = DEFAULT_NETWORK_CONFIG,
}: TerminalInterfaceProps) {
  const [isTerminalOpen, setIsTerminalOpen] = useState(false)
  const [step, setStep] = useState<
    | "welcome"
    | "main-menu"
    | "transaction-type"
    | "amount"
    | "currency"
    | "confirmation"
    | "payment-method"
    | "payment-action"
    | "pin"
    | "processing"
    | "result"
    | "error"
  >("welcome")

  const [paymentMethod, setPaymentMethod] = useState<"swipe" | "chip" | "contactless">("chip")
  const [processingState, setProcessingState] = useState<
    "idle" | "reading" | "processing" | "approved" | "declined" | "error"
  >("idle")

  const [pinEntered, setPinEntered] = useState(false)
  const [pinValue, setPinValue] = useState("")
  const [amountValue, setAmountValue] = useState("")
  const [selectedCurrency, setSelectedCurrency] = useState("USD")
  const [selectedTransactionType, setSelectedTransactionType] = useState("purchase")
  const [menuIndex, setMenuIndex] = useState(0)
  const [currentTime, setCurrentTime] = useState(new Date())
  const [showKeypad, setShowKeypad] = useState(false)
  const [authCode, setAuthCode] = useState("")
  const selectedCard = externalSelectedCard
  const [pinError, setPinError] = useState(false)
  const [networkError, setNetworkError] = useState<string | null>(null)

  const [transaction, setTransaction] = useState<Transaction>(
    defaultTransaction || {
      messageType: "0200",
      processingCode: "000000",
      amount: "100.00",
      cardNumber: "4111111111111111",
      expiryDate: "1225",
      merchantId: "123456789012",
      terminalId: "12345678",
      transactionType: "purchase",
      currency: "USD",
      timestamp: new Date(),
      source: "terminal",
      entryMode: "051", // Default to EMV
      emvTags:
        "9F26:08A000000000000000,9F27:01,9F10:06010A03A0A000,9F37:04A54F5D1E,9F36:02000A,95:0500000000,9A:03230215,9C:01,9F02:06000000000100,9F03:06000000000000", // Default EMV tags
    },
  )

  // Update transaction when selected card changes
  useEffect(() => {
    if (selectedCard) {
      setTransaction((prev) => ({
        ...prev,
        cardNumber: selectedCard.number,
        expiryDate: selectedCard.expiryDate,
      }))
    }
  }, [selectedCard])

  const timeoutRef = useRef<NodeJS.Timeout | null>(null)
  const processingTimeoutRef = useRef<NodeJS.Timeout | null>(null)
  const resultTimeoutRef = useRef<NodeJS.Timeout | null>(null)
  const intervalRef = useRef<NodeJS.Timeout | null>(null)

  // Update clock
  useEffect(() => {
    intervalRef.current = setInterval(() => {
      setCurrentTime(new Date())
    }, 1000)

    return () => {
      if (intervalRef.current) {
        clearInterval(intervalRef.current)
      }
    }
  }, [])

  // Welcome screen timeout
  useEffect(() => {
    if (step === "welcome" && isTerminalOpen) {
      timeoutRef.current = setTimeout(() => {
        setStep("main-menu")
      }, 2000)
    }

    return () => {
      if (timeoutRef.current) {
        clearTimeout(timeoutRef.current)
      }
    }
  }, [step, isTerminalOpen])

  // Function to check if contactless payment is below the PIN threshold
  const isContactlessBelowPinThreshold = () => {
    if (!amountValue) return false

    const amount = Number.parseFloat(formatDisplayAmount(amountValue))

    // Convert amount to UYU for comparison
    let amountInUYU = amount
    if (selectedCurrency !== "UYU") {
      const fromRate = currencies.find((c) => c.code === selectedCurrency)?.rate || 1
      const toRate = currencies.find((c) => c.code === "UYU")?.rate || 39.5
      amountInUYU = amount * (toRate / fromRate)
    }

    console.log(`Amount in UYU: ${amountInUYU}, Threshold: ${CONTACTLESS_NO_PIN_THRESHOLD_UYU}`)
    return amountInUYU < CONTACTLESS_NO_PIN_THRESHOLD_UYU
  }

  const completeTransaction = async (isApproved: boolean) => {
    // Generate auth code once
    const newAuthCode = isApproved ? Math.random().toString(36).substring(2, 8).toUpperCase() : ""
    setAuthCode(newAuthCode)

    setProcessingState(isApproved ? "approved" : "declined")
    setStep("result")

    // Set entry mode based on payment method
    const entryMode =
      paymentMethod === "chip"
        ? "051"
        : // EMV
          paymentMethod === "contactless"
          ? "079"
          : // Contactless EMV
            "022" // Magnetic stripe (swipe)

    // Update transaction with current values and ensure all required fields
    const updatedTransaction: Transaction = {
      ...transaction,
      amount: formatDisplayAmount(amountValue),
      currency: selectedCurrency,
      transactionType: selectedTransactionType,
      timestamp: new Date(),
      authCode: newAuthCode,
      status: isApproved ? "approved" : "declined",
      responseCode: isApproved ? "00" : "05",
      source: "terminal",
      entryMode,
      // Use the selected card's information if available
      cardNumber: selectedCard?.number || transaction.cardNumber,
      expiryDate: selectedCard?.expiryDate || transaction.expiryDate,
      // Add EMV tags if using chip or contactless
      emvTags:
        paymentMethod === "chip" || paymentMethod === "contactless"
          ? "9F26:08A000000000000000,9F27:01,9F10:06010A03A0A000,9F37:04A54F5D1E,9F36:02000A,95:0500000000,9A:03230215,9C:01,9F02:06000000000100,9F03:06000000000000"
          : undefined,
      // Ensure processing code is set based on transaction type
      processingCode:
        selectedTransactionType === "purchase"
          ? "000000"
          : selectedTransactionType === "withdrawal"
            ? "010000"
            : selectedTransactionType === "refund"
              ? "200000"
              : selectedTransactionType === "balance"
                ? "310000"
                : "000000",
    }

    setTransaction(updatedTransaction)

    console.log("Terminal transaction completed:", updatedTransaction) // Debug log

    // Reset after showing result
    resultTimeoutRef.current = setTimeout(() => {
      // Always call onTransactionComplete for both approved and declined transactions
      if (onTransactionComplete) {
        console.log("Calling onTransactionComplete with:", updatedTransaction) // Debug log
        onTransactionComplete(updatedTransaction)
      }

      // Close the terminal after a delay
      setTimeout(
        () => {
          setIsTerminalOpen(false)
          // Reset states after closing
          setTimeout(() => {
            resetTerminal()
          }, 500)
        },
        isApproved ? 2000 : 3000,
      )
    }, 3000)
  }

  const handlePaymentStart = async (method: "swipe" | "chip" | "contactless") => {
    // Check if a card is selected
    if (!selectedCard) {
      alert("Please select a card from the wallet first")
      return
    }

    setPaymentMethod(method)
    setProcessingState("reading")
    setNetworkError(null)

    // Simulate reading the card
    timeoutRef.current = setTimeout(async () => {
      // For contactless, check if amount is below threshold to skip PIN
      if (method === "contactless" && isContactlessBelowPinThreshold()) {
        console.log("Contactless payment below threshold, skipping PIN")
        setStep("processing")
        setProcessingState("processing")

        if (networkConfig?.enabled) {
          await processNetworkTransaction()
        } else {
          simulateProcessing()
        }
      }
      // For chip and contactless (above threshold), we need PIN
      else if (method === "chip" || method === "contactless") {
        setStep("pin")
        setShowKeypad(true)
        setProcessingState("idle") // Reset processing state for PIN entry
      } else {
        // For swipe, we go straight to processing
        setStep("processing")
        setProcessingState("processing")

        if (networkConfig?.enabled) {
          await processNetworkTransaction()
        } else {
          simulateProcessing()
        }
      }
    }, 1500)
  }

  const processNetworkTransaction = async () => {
    if (!networkConfig?.enabled) {
      simulateProcessing()
      return
    }

    try {
      // Prepare transaction data
      const transactionData: Transaction = {
        ...transaction,
        amount: formatDisplayAmount(amountValue),
        currency: selectedCurrency,
        transactionType: selectedTransactionType,
        timestamp: new Date(),
        source: "terminal",
        entryMode: paymentMethod === "chip" ? "051" : paymentMethod === "contactless" ? "079" : "022",
        cardNumber: selectedCard?.number || transaction.cardNumber,
        expiryDate: selectedCard?.expiryDate || transaction.expiryDate,
        emvTags:
          paymentMethod === "chip" || paymentMethod === "contactless"
            ? "9F26:08A000000000000000,9F27:01,9F10:06010A03A0A000,9F37:04A54F5D1E,9F36:02000A,95:0500000000,9A:03230215,9C:01,9F02:06000000000100,9F03:06000000000000"
            : undefined,
        processingCode:
          selectedTransactionType === "purchase"
            ? "000000"
            : selectedTransactionType === "withdrawal"
              ? "010000"
              : selectedTransactionType === "refund"
                ? "200000"
                : selectedTransactionType === "balance"
                  ? "310000"
                  : "000000",
      }

      console.log("Sending terminal transaction to network:", transactionData)
      const result = await sendTransaction(transactionData, networkConfig)

      if (result.success && result.response) {
        // Extract status from response
        const approved = result.response.approved === true || result.response.status === "approved"
        const responseCode = result.response.responseCode || (approved ? "00" : "05")
        const authCode =
          result.response.authCode || (approved ? Math.random().toString(36).substring(2, 8).toUpperCase() : "")

        // Complete the transaction with the network response
        completeTransaction(approved)
      } else {
        // Handle network error
        setNetworkError(result.error || "Failed to process transaction")
        setStep("error")
        setProcessingState("error")
      }
    } catch (error: any) {
      console.error("Network transaction error:", error)
      setNetworkError(error.message || "An unexpected error occurred")
      setStep("error")
      setProcessingState("error")
    }
  }

  const handlePinEntered = async () => {
    // Validate PIN against the selected card
    if (selectedCard && pinValue === selectedCard.pin) {
      setPinEntered(true)
      setShowKeypad(false)
      setPinValue("")
      setPinError(false)
      setStep("processing")
      setProcessingState("processing")

      if (networkConfig?.enabled) {
        await processNetworkTransaction()
      } else {
        simulateProcessing()
      }
    } else {
      // Show PIN error
      setPinError(true)
      // Clear PIN after a delay
      setTimeout(() => {
        setPinValue("")
        setPinError(false)
      }, 2000)
    }
  }

  const handlePinKeyPress = (key: string) => {
    if (key === "clear") {
      setPinValue("")
    } else if (key === "backspace") {
      setPinValue((prev) => prev.slice(0, -1))
    } else if (key === "enter") {
      if (pinValue.length >= 4) {
        handlePinEntered()
      }
    } else if (pinValue.length < 4) {
      // Limit PIN to 4 digits
      setPinValue((prev) => prev + key)
    }
  }

  const handleAmountKeyPress = (key: string) => {
    if (key === "clear") {
      setAmountValue("")
    } else if (key === "backspace") {
      setAmountValue((prev) => prev.slice(0, -1))
    } else if (key === "enter") {
      if (amountValue && Number.parseFloat(amountValue) > 0) {
        setTransaction((prev) => ({
          ...prev,
          amount: (Number.parseFloat(amountValue) / 100).toFixed(2),
        }))
        setStep("currency")
        setShowKeypad(false)
      }
    } else if (key === "00") {
      setAmountValue((prev) => prev + "00")
    } else {
      setAmountValue((prev) => prev + key)
    }
  }

  const simulateProcessing = () => {
    // Simulate processing time (shorter to ensure it completes)
    timeoutRef.current = setTimeout(() => {
      // 80% chance of approval
      const isApproved = Math.random() > 0.2
      completeTransaction(isApproved)
    }, 3000)
  }

  const resetTerminal = () => {
    setStep("welcome")
    setProcessingState("idle")
    setPinEntered(false)
    setPinValue("")
    setAmountValue("")
    setShowKeypad(false)
    setMenuIndex(0)
    setAuthCode("")
    setPinError(false)
    setNetworkError(null)

    if (!defaultTransaction) {
      setTransaction({
        messageType: "0200",
        processingCode: "000000",
        amount: "100.00",
        cardNumber: selectedCard?.number || "4111111111111111",
        expiryDate: selectedCard?.expiryDate || "1225",
        merchantId: "123456789012",
        terminalId: "12345678",
        transactionType: "purchase",
        currency: "USD",
        timestamp: new Date(),
        source: "terminal",
        entryMode: "051",
        emvTags:
          "9F26:08A000000000000000,9F27:01,9F10:06010A03A0A000,9F37:04A54F5D1E,9F36:02000A,95:0500000000,9A:03230215,9C:01,9F02:06000000000100,9F03:06000000000000",
      })
    }
  }

  // Clean up timeouts
  useEffect(() => {
    return () => {
      if (timeoutRef.current) {
        clearTimeout(timeoutRef.current)
      }
      if (processingTimeoutRef.current) {
        clearTimeout(processingTimeoutRef.current)
      }
      if (resultTimeoutRef.current) {
        clearTimeout(resultTimeoutRef.current)
      }
      if (intervalRef.current) {
        clearInterval(intervalRef.current)
      }
    }
  }, [])

  // Reset state when terminal closes (but not wallet)
  useEffect(() => {
    if (!isTerminalOpen) {
      resetTerminal()
    }
  }, [isTerminalOpen])

  // Handle function key press
  const handleFunctionKey = (key: number) => {
    if (step === "main-menu") {
      if (key === 1) {
        // Sale/Purchase
        setSelectedTransactionType("purchase")
        setTransaction((prev) => ({
          ...prev,
          transactionType: "purchase",
          processingCode: "000000",
        }))
        setStep("amount")
        setShowKeypad(true)
      } else if (key === 2) {
        // Refund
        setSelectedTransactionType("refund")
        setTransaction((prev) => ({
          ...prev,
          transactionType: "refund",
          processingCode: "200000",
        }))
        setStep("amount")
        setShowKeypad(true)
      } else if (key === 3) {
        // Balance Inquiry
        setSelectedTransactionType("balance")
        setTransaction((prev) => ({
          ...prev,
          transactionType: "balance",
          processingCode: "310000",
        }))
        setStep("payment-method")
      } else if (key === 4) {
        // Cash Withdrawal
        setSelectedTransactionType("withdrawal")
        setTransaction((prev) => ({
          ...prev,
          transactionType: "withdrawal",
          processingCode: "010000",
        }))
        setStep("amount")
        setShowKeypad(true)
      }
    } else if (step === "currency") {
      const currencyOptions = currencies.map((c) => c.code)
      if (key >= 1 && key <= 4) {
        const startIdx = menuIndex * 4
        const selectedIdx = startIdx + key - 1
        if (selectedIdx < currencyOptions.length) {
          const selectedCurrency = currencyOptions[selectedIdx]
          setSelectedCurrency(selectedCurrency)
          setTransaction((prev) => ({
            ...prev,
            currency: selectedCurrency,
          }))
          setStep("confirmation")
        }
      }
    } else if (step === "confirmation") {
      if (key === 1) {
        // Confirm
        setStep("payment-method")
      } else if (key === 4) {
        // Cancel
        setStep("main-menu")
      }
    } else if (step === "error") {
      // Any key in error state returns to main menu
      setStep("main-menu")
    }
  }

  // Handle navigation keys
  const handleNavigationKey = (key: "up" | "down" | "cancel" | "enter") => {
    if (key === "cancel") {
      if (step === "welcome" || step === "main-menu") {
        setIsTerminalOpen(false)
      } else if (step === "amount" || step === "transaction-type" || step === "currency") {
        setStep("main-menu")
        setShowKeypad(false)
      } else if (step === "confirmation") {
        setStep("currency")
      } else if (step === "payment-method") {
        setStep("confirmation")
      } else if (step === "payment-action") {
        setStep("payment-method")
      } else if (step === "pin") {
        setStep("payment-method")
        setShowKeypad(false)
      } else if (step === "error") {
        setStep("main-menu")
      }
    } else if (key === "enter") {
      if (step === "welcome") {
        setStep("main-menu")
      } else if (step === "currency") {
        const currencyOptions = currencies.map((c) => c.code)
        const startIdx = menuIndex * 4
        if (startIdx < currencyOptions.length) {
          setSelectedCurrency(currencyOptions[startIdx])
          setTransaction((prev) => ({
            ...prev,
            currency: currencyOptions[startIdx],
          }))
          setStep("confirmation")
        }
      } else if (step === "error") {
        setStep("main-menu")
      }
    } else if (key === "up" || key === "down") {
      if (step === "currency") {
        const currencyOptions = currencies.map((c) => c.code)
        const maxPages = Math.ceil(currencyOptions.length / 4)
        if (key === "up") {
          setMenuIndex((prev) => (prev > 0 ? prev - 1 : maxPages - 1))
        } else {
          setMenuIndex((prev) => (prev < maxPages - 1 ? prev + 1 : 0))
        }
      }
    }
  }

  // Format amount for display
  const formatDisplayAmount = (amount: string) => {
    if (!amount) return "0.00"
    const numericValue = Number.parseInt(amount, 10) / 100
    return numericValue.toFixed(2)
  }

  // Find currency symbol
  const currencySymbol = currencies.find((c) => c.code === selectedCurrency)?.symbol || "$"

  // Payment method selection component with clickable icons
  const PaymentMethodSelection = () => (
    <div className="flex flex-col h-full">
      <div className="text-center font-bold border-b border-gray-400 pb-2 mb-4">SELECT PAYMENT METHOD</div>

      {selectedCard ? (
        <div className="bg-gray-100 p-3 rounded-lg border border-gray-300 mb-4">
          <p className="font-bold">{selectedCard.name}</p>
          <p className="text-sm">•••• {selectedCard.number.slice(-4)}</p>
        </div>
      ) : (
        <div className="bg-yellow-100 p-3 rounded-lg border border-yellow-300 mb-4 text-center">
          <p className="font-bold text-yellow-800">No Card Selected</p>
          <p className="text-sm text-yellow-700">Please select a card from the wallet</p>
        </div>
      )}

      <div className="grid grid-cols-3 gap-4 mt-4">
        <div
          className={cn(
            "flex flex-col items-center justify-center cursor-pointer hover:bg-gray-100 p-4 rounded-lg border-2 border-transparent hover:border-blue-500 transition-all",
            !selectedCard && "opacity-50 pointer-events-none",
          )}
          onClick={() => {
            setPaymentMethod("chip")
            setStep("payment-action")
          }}
        >
          <div className="bg-blue-100 p-3 rounded-full mb-2">
            <CreditCardIcon className="h-8 w-8 text-blue-600" />
          </div>
          <span className="text-sm font-medium">Chip</span>
        </div>

        <div
          className={cn(
            "flex flex-col items-center justify-center cursor-pointer hover:bg-gray-100 p-4 rounded-lg border-2 border-transparent hover:border-blue-500 transition-all",
            !selectedCard && "opacity-50 pointer-events-none",
          )}
          onClick={() => {
            setPaymentMethod("contactless")
            setStep("payment-action")
          }}
        >
          <div className="bg-green-100 p-3 rounded-full mb-2">
            <Wifi className="h-8 w-8 text-green-600" />
          </div>
          <span className="text-sm font-medium">Contactless</span>
          {isContactlessBelowPinThreshold() && <span className="text-xs text-green-600 mt-1">No PIN required</span>}
        </div>

        <div
          className={cn(
            "flex flex-col items-center justify-center cursor-pointer hover:bg-gray-100 p-4 rounded-lg border-2 border-transparent hover:border-blue-500 transition-all",
            !selectedCard && "opacity-50 pointer-events-none",
          )}
          onClick={() => {
            setPaymentMethod("swipe")
            setStep("payment-action")
          }}
        >
          <div className="bg-purple-100 p-3 rounded-full mb-2">
            <CreditCard className="h-8 w-8 text-purple-600" />
          </div>
          <span className="text-sm font-medium">Swipe</span>
        </div>
      </div>

      <div className="mt-auto">
        <Button
          variant="outline"
          className="w-full"
          onClick={() => {
            setStep("confirmation")
          }}
        >
          Back
        </Button>
      </div>
    </div>
  )

  return (
    <>
      <Dialog open={isTerminalOpen} onOpenChange={setIsTerminalOpen}>
        <DialogTrigger asChild>
          {standalone ? (
            <Button
              variant="outline"
              className="flex items-center gap-2"
              onClick={() => {
                console.log("POS Terminal button clicked")
                setIsTerminalOpen(true)
              }}
            >
              <MonitorSpeaker className="h-4 w-4" />
              <span>POS Terminal</span>
            </Button>
          ) : (
            <Button
              variant="outline"
              className="w-full mt-4 flex items-center gap-2"
              onClick={() => {
                console.log("POS Terminal button clicked")
                setIsTerminalOpen(true)
              }}
            >
              <MonitorSpeaker className="h-4 w-4" />
              <span>Open Terminal Interface</span>
            </Button>
          )}
        </DialogTrigger>
        <DialogContent
          className="sm:max-w-[400px] h-[700px] p-0 overflow-hidden bg-gray-900 rounded-lg"
          style={{ zIndex: 50000 }}
        >
          <div className="flex flex-col h-full">
            {/* Terminal Header - Hardware-like appearance */}
            <div className="bg-gray-800 p-3 flex items-center justify-between border-b border-gray-700">
              <div className="flex items-center gap-2">
                <div className="h-2 w-2 rounded-full bg-red-500"></div>
                <span className="text-gray-400 text-xs">TERMINAL ID: {transaction.terminalId}</span>
              </div>
              <div className="flex items-center gap-3">
                {networkConfig?.enabled ? (
                  <Wifi className="h-3 w-3 text-green-500" />
                ) : (
                  <WifiOff className="h-3 w-3 text-gray-500" />
                )}
                <Signal className="h-3 w-3 text-green-500" />
                <Battery className="h-3 w-3 text-green-500" />
                <span className="text-gray-400 text-xs">
                  {currentTime.toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" })}
                </span>
              </div>
            </div>

            {/* Terminal Screen */}
            <div className="bg-gray-200 flex-1 p-4 font-mono text-black relative overflow-hidden border-8 border-gray-800">
              {/* Welcome Screen */}
              {step === "welcome" && (
                <div className="flex flex-col items-center justify-center h-full text-center">
                  <div className="text-2xl font-bold mb-2">PAYMENT TERMINAL</div>
                  <div className="text-sm mb-4">Model: ISO8583-POS</div>
                  <div className="animate-pulse">Initializing...</div>
                  {networkConfig?.enabled && (
                    <div className="mt-2 text-xs text-green-700 flex items-center justify-center">
                      <Wifi className="h-3 w-3 mr-1" />
                      Network Mode Active
                    </div>
                  )}
                  <div className="mt-8 text-xs">Press any key to continue</div>
                </div>
              )}

              {/* Main Menu */}
              {step === "main-menu" && (
                <div className="flex flex-col h-full">
                  <div className="text-center font-bold border-b border-gray-400 pb-2 mb-4">MAIN MENU</div>

                  {selectedCard && (
                    <div className="bg-gray-100 p-3 rounded-lg border border-gray-300 mb-4">
                      <p className="font-bold">{selectedCard.name}</p>
                      <p className="text-sm">•••• {selectedCard.number.slice(-4)}</p>
                    </div>
                  )}

                  <div className="flex flex-col gap-3">
                    <div className="flex justify-between">
                      <span>1. Sale</span>
                      <span>2. Refund</span>
                    </div>
                    <div className="flex justify-between">
                      <span>3. Balance</span>
                      <span>4. Withdrawal</span>
                    </div>
                  </div>

                  {networkConfig?.enabled && (
                    <div className="mt-4 text-xs text-center bg-green-100 p-2 rounded-lg border border-green-300">
                      <div className="flex items-center justify-center mb-1">
                        <Wifi className="h-3 w-3 mr-1 text-green-700" />
                        <span className="text-green-700 font-medium">Network Mode Active</span>
                      </div>
                      <span className="text-green-700">
                        Transactions will be sent to {networkConfig.host}:{networkConfig.port}
                      </span>
                    </div>
                  )}

                  <div className="mt-auto text-xs text-center">
                    Press F1-F4 to select
                    <br />
                    Press CANCEL to exit
                  </div>
                </div>
              )}

              {/* Amount Entry */}
              {step === "amount" && (
                <div className="flex flex-col h-full">
                  <div className="text-center font-bold border-b border-gray-400 pb-2 mb-4">
                    ENTER AMOUNT
                    <div className="text-xs font-normal">
                      {selectedTransactionType.charAt(0).toUpperCase() + selectedTransactionType.slice(1)}
                    </div>
                  </div>
                  <div className="text-center text-2xl font-bold mb-4">
                    {currencySymbol}
                    {formatDisplayAmount(amountValue)}
                  </div>
                  <div className="mt-auto text-xs text-center">
                    Enter amount and press ENTER
                    <br />
                    Press CANCEL to go back
                  </div>
                </div>
              )}

              {/* Currency Selection */}
              {step === "currency" && (
                <div className="flex flex-col h-full">
                  <div className="text-center font-bold border-b border-gray-400 pb-2 mb-4">SELECT CURRENCY</div>
                  <div className="flex flex-col gap-3">
                    {currencies.slice(menuIndex * 4, menuIndex * 4 + 4).map((currency, idx) => (
                      <div key={currency.code} className="flex justify-between">
                        <span>
                          {idx + 1}. {currency.code}
                        </span>
                        <span>
                          {currency.symbol} {currency.name}
                        </span>
                      </div>
                    ))}
                  </div>
                  <div className="mt-auto text-xs text-center">
                    Press F1-F4 to select
                    <br />
                    Press UP/DOWN to navigate
                    <br />
                    Press CANCEL to go back
                  </div>
                </div>
              )}

              {/* Confirmation */}
              {step === "confirmation" && (
                <div className="flex flex-col h-full">
                  <div className="text-center font-bold border-b border-gray-400 pb-2 mb-4">CONFIRM TRANSACTION</div>
                  <div className="flex flex-col gap-2">
                    <div className="flex justify-between">
                      <span>Amount:</span>
                      <span className="font-bold">
                        {currencySymbol}
                        {formatDisplayAmount(amountValue)}
                      </span>
                    </div>
                    <div className="flex justify-between">
                      <span>Currency:</span>
                      <span>{selectedCurrency}</span>
                    </div>
                    <div className="flex justify-between">
                      <span>Type:</span>
                      <span className="capitalize">{selectedTransactionType}</span>
                    </div>
                    <div className="flex justify-between">
                      <span>Terminal:</span>
                      <span>{transaction.terminalId}</span>
                    </div>
                    <div className="flex justify-between">
                      <span>Date:</span>
                      <span>{currentTime.toLocaleDateString()}</span>
                    </div>

                    {networkConfig?.enabled && (
                      <div className="mt-2 text-xs text-center bg-green-100 p-2 rounded-lg border border-green-300">
                        <div className="flex items-center justify-center">
                          <Wifi className="h-3 w-3 mr-1 text-green-700" />
                          <span className="text-green-700">Will be sent to network</span>
                        </div>
                      </div>
                    )}
                  </div>
                  <div className="mt-auto text-xs text-center">
                    Press F1 to confirm
                    <br />
                    Press F4 to cancel
                  </div>
                </div>
              )}

              {/* Payment Method - New UI with clickable icons */}
              {step === "payment-method" && <PaymentMethodSelection />}

              {/* Payment Action */}
              {step === "payment-action" && (
                <div className="h-full">
                  {paymentMethod === "chip" && <ChipReader onInsert={() => handlePaymentStart("chip")} />}

                  {paymentMethod === "contactless" && (
                    <ContactlessReader onTap={() => handlePaymentStart("contactless")} />
                  )}

                  {paymentMethod === "swipe" && <CardSwipe onSwipe={() => handlePaymentStart("swipe")} />}
                </div>
              )}

              {/* PIN Entry */}
              {step === "pin" && (
                <div className="flex flex-col h-full">
                  <div className="text-center font-bold border-b border-gray-400 pb-2 mb-4">ENTER PIN</div>
                  <div className="text-center mb-2">
                    <p className="text-sm">Card: {selectedCard?.name}</p>
                  </div>
                  <div className="flex justify-center my-4">
                    <div className="flex gap-2">
                      {Array.from({ length: 4 }).map((_, i) => (
                        <div
                          key={i}
                          className={`h-4 w-4 rounded-full ${
                            i < pinValue.length ? "bg-black" : "border border-gray-400"
                          }`}
                        ></div>
                      ))}
                    </div>
                  </div>
                  {pinError && (
                    <div className="text-center text-red-600 font-bold animate-pulse my-2">INCORRECT PIN</div>
                  )}
                  <div className="mt-auto text-xs text-center">
                    Enter 4-digit PIN and press ENTER
                    <br />
                    Press CANCEL to go back
                  </div>
                </div>
              )}

              {/* Processing */}
              {step === "processing" && (
                <div className="flex flex-col items-center justify-center h-full">
                  <div className="text-center font-bold mb-4">PROCESSING TRANSACTION</div>
                  <div className="w-16 h-16 border-4 border-t-black border-gray-300 rounded-full animate-spin mb-4"></div>
                  <div className="text-sm">Please wait...</div>
                  {networkConfig?.enabled && (
                    <div className="flex items-center mt-2 text-green-700">
                      <Wifi className="h-4 w-4 mr-1" />
                      <span>Sending to network...</span>
                    </div>
                  )}
                  <div className="text-xs mt-4">Do not remove card</div>
                </div>
              )}

              {/* Result */}
              {step === "result" && (
                <div className="flex flex-col items-center justify-center h-full">
                  {processingState === "approved" ? (
                    <div className="text-center">
                      <div className="text-2xl font-bold text-green-700 mb-4">APPROVED</div>
                      <div className="mb-2">
                        Amount: {currencySymbol}
                        {formatDisplayAmount(amountValue)}
                      </div>
                      <div className="mb-2">Auth Code: {authCode}</div>
                      <div className="text-xs mt-4">Transaction completed successfully</div>
                      <div className="text-xs mt-2">Remove card</div>
                      <div className="animate-pulse text-xs mt-4">Printing receipt...</div>
                    </div>
                  ) : (
                    <div className="text-center">
                      <div className="text-2xl font-bold text-red-700 mb-4">DECLINED</div>
                      <div className="mb-2">
                        Amount: {currencySymbol}
                        {formatDisplayAmount(amountValue)}
                      </div>
                      <div className="mb-2">Error: Insufficient funds</div>
                      <div className="text-xs mt-4">Transaction failed</div>
                      <div className="text-xs mt-2">Remove card</div>
                    </div>
                  )}
                </div>
              )}

              {/* Error */}
              {step === "error" && (
                <div className="flex flex-col items-center justify-center h-full">
                  <div className="text-center">
                    <div className="text-2xl font-bold text-red-700 mb-4">NETWORK ERROR</div>
                    <div className="mb-4 p-3 bg-red-100 border border-red-300 rounded-lg max-w-[300px] mx-auto">
                      <p className="text-red-800 text-sm">{networkError || "Failed to connect to server"}</p>
                    </div>
                    <div className="flex items-center justify-center mb-2 text-red-700">
                      <WifiOff className="h-5 w-5 mr-2" />
                      <span>Connection failed</span>
                    </div>
                    <div className="text-xs mt-4">Press any key to return to main menu</div>
                  </div>
                </div>
              )}
            </div>

            {/* Terminal Keypad */}
            <div className="bg-gray-800 p-4">
              {/* Function keys */}
              <div className="grid grid-cols-4 gap-2 mb-4">
                {[1, 2, 3, 4].map((key) => (
                  <Button
                    key={`f${key}`}
                    variant="outline"
                    className="h-10 bg-blue-900 text-white hover:bg-blue-800 border-gray-700"
                    onClick={() => handleFunctionKey(key)}
                  >
                    F{key}
                  </Button>
                ))}
              </div>

              {/* Navigation keys */}
              <div className="grid grid-cols-3 gap-2 mb-4">
                <Button
                  variant="outline"
                  className="h-10 bg-gray-700 text-white hover:bg-gray-600 border-gray-600"
                  onClick={() => handleNavigationKey("up")}
                >
                  ▲
                </Button>
                <Button
                  variant="outline"
                  className="h-10 bg-red-900 text-white hover:bg-red-800 border-gray-700"
                  onClick={() => handleNavigationKey("cancel")}
                >
                  CANCEL
                </Button>
                <Button
                  variant="outline"
                  className="h-10 bg-gray-700 text-white hover:bg-gray-600 border-gray-600"
                  onClick={() => handleNavigationKey("down")}
                >
                  ▼
                </Button>
              </div>

              {/* Numeric keypad */}
              <div
                className={cn("grid grid-cols-3 gap-2", showKeypad ? "opacity-100" : "opacity-50 pointer-events-none")}
              >
                {[1, 2, 3, 4, 5, 6, 7, 8, 9, 0].map((key) => (
                  <Button
                    key={key}
                    variant="outline"
                    className={cn(
                      "h-10 bg-gray-700 text-white hover:bg-gray-600 border-gray-600",
                      key === 0 ? "col-start-2" : "",
                    )}
                    onClick={() =>
                      step === "pin" ? handlePinKeyPress(key.toString()) : handleAmountKeyPress(key.toString())
                    }
                  >
                    {key}
                  </Button>
                ))}
                <Button
                  variant="outline"
                  className="h-10 bg-gray-700 text-white hover:bg-gray-600 border-gray-600"
                  onClick={() => (step === "pin" ? handlePinKeyPress("00") : handleAmountKeyPress("00"))}
                >
                  00
                </Button>
                <Button
                  variant="outline"
                  className="h-10 bg-yellow-900 text-white hover:bg-yellow-800 border-gray-700"
                  onClick={() => (step === "pin" ? handlePinKeyPress("clear") : handleAmountKeyPress("clear"))}
                >
                  CLEAR
                </Button>
                <Button
                  variant="outline"
                  className="h-10 bg-gray-700 text-white hover:bg-gray-600 border-gray-600"
                  onClick={() => (step === "pin" ? handlePinKeyPress("backspace") : handleAmountKeyPress("backspace"))}
                >
                  ←
                </Button>
                <Button
                  variant="outline"
                  className="h-10 bg-green-900 text-white hover:bg-green-800 border-gray-700"
                  onClick={() => (step === "pin" ? handlePinKeyPress("enter") : handleAmountKeyPress("enter"))}
                >
                  ENTER
                </Button>
              </div>
            </div>
          </div>
        </DialogContent>
      </Dialog>
    </>
  )
}
