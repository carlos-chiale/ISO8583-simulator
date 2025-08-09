"use client"

import { useState, useEffect } from "react"
import { Iso8583Simulator } from "@/components/iso8583-simulator"
import { Header } from "@/components/header"
import { NetworkStatus } from "@/components/network-status"
import { NetworkConfigModal } from "@/components/network-config-modal"
import type { Transaction } from "@/lib/types"
import { DEFAULT_NETWORK_CONFIG, type NetworkConfig } from "@/lib/network-service"

export default function Home() {
  const [headerTerminalTransaction, setHeaderTerminalTransaction] = useState<Transaction | null>(null)
  const [isNetworkConfigOpen, setIsNetworkConfigOpen] = useState(false)
  const [networkConfig, setNetworkConfig] = useState<NetworkConfig>(DEFAULT_NETWORK_CONFIG)

  // Load network config from localStorage on initial load
  useEffect(() => {
    const savedConfig = localStorage.getItem("iso8583-network-config")
    if (savedConfig) {
      try {
        const parsedConfig = JSON.parse(savedConfig)
        setNetworkConfig(parsedConfig)
      } catch (e) {
        console.error("Failed to parse saved network config:", e)
      }
    }
  }, [])

  const handleHeaderTerminalTransaction = (transaction: Transaction) => {
    setHeaderTerminalTransaction(transaction)
  }

  const handleSaveNetworkConfig = (config: NetworkConfig) => {
    setNetworkConfig(config)
    // Save to localStorage
    localStorage.setItem("iso8583-network-config", JSON.stringify(config))
  }

  return (
    <div className="min-h-screen flex flex-col">
      <Header onTerminalTransaction={handleHeaderTerminalTransaction} networkConfig={networkConfig} />
      <main className="container mx-auto py-6 px-4 flex-1">
        <div className="flex justify-between items-center mb-6">
          <h1 className="text-3xl font-bold">ISO 8583 Transaction Simulator</h1>
          <NetworkStatus config={networkConfig} onConfigureClick={() => setIsNetworkConfigOpen(true)} />
        </div>
        <p className="text-gray-600 mb-8">
          Simulate financial transactions from Point of Sale (POS) terminals using the ISO 8583 message format.
          {networkConfig.enabled && (
            <span className="ml-1 text-green-600">
              Transactions will be sent to{" "}
              <code className="bg-gray-100 px-1 py-0.5 rounded">
                {networkConfig.useSSL ? "https" : "http"}://{networkConfig.host}:{networkConfig.port}
              </code>
            </span>
          )}
        </p>
        <Iso8583Simulator headerTerminalTransaction={headerTerminalTransaction} networkConfig={networkConfig} />
      </main>

      <NetworkConfigModal
        isOpen={isNetworkConfigOpen}
        onClose={() => setIsNetworkConfigOpen(false)}
        config={networkConfig}
        onSave={handleSaveNetworkConfig}
      />
    </div>
  )
}
