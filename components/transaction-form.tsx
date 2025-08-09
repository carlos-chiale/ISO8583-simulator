"use client"

import type React from "react"

import { useState } from "react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Checkbox } from "@/components/ui/checkbox"
import { Loader2 } from "lucide-react"
import type { Transaction } from "@/lib/types"
import { CreditCard, Building, Calendar } from "lucide-react"

// Add currency options with Uruguayan Pesos as second option
const currencies = [
  { code: "USD", symbol: "$", numeric: "840", name: "US Dollar" },
  { code: "UYU", symbol: "$U", numeric: "858", name: "Uruguayan Peso" },
  { code: "EUR", symbol: "€", numeric: "978", name: "Euro" },
  { code: "GBP", symbol: "£", numeric: "826", name: "British Pound" },
  { code: "JPY", symbol: "¥", numeric: "392", name: "Japanese Yen" },
  { code: "CAD", symbol: "C$", numeric: "124", name: "Canadian Dollar" },
  { code: "AUD", symbol: "A$", numeric: "036", name: "Australian Dollar" },
  { code: "CHF", symbol: "Fr", numeric: "756", name: "Swiss Franc" },
  { code: "CNY", symbol: "¥", numeric: "156", name: "Chinese Yuan" },
  { code: "INR", symbol: "₹", numeric: "356", name: "Indian Rupee" },
  { code: "BRL", symbol: "R$", numeric: "986", name: "Brazilian Real" },
]

// Entry mode options
const entryModes = [
  { value: "021", label: "Manual Entry" },
  { value: "022", label: "Magnetic Stripe" },
  { value: "051", label: "Integrated Circuit Card (ICC/EMV)" },
  { value: "071", label: "Contactless" },
  { value: "079", label: "Contactless EMV" },
  { value: "080", label: "Fallback to Magnetic Stripe" },
]

// Default EMV tags
const DEFAULT_EMV_TAGS =
  "9F26:08A000000000000000,9F27:01,9F10:06010A03A0A000,9F37:04A54F5D1E,9F36:02000A,95:0500000000,9A:03230215,9C:01,9F02:06000000000100,9F03:06000000000000"

interface TransactionFormProps {
  onSubmit: (transaction: Transaction) => void
  isProcessing?: boolean
}

export function TransactionForm({ onSubmit, isProcessing = false }: TransactionFormProps) {
  const [formData, setFormData] = useState<Transaction>({
    messageType: "0200",
    processingCode: "000000",
    amount: "100.00",
    cardNumber: "4111111111111111",
    expiryDate: "1225",
    merchantId: "123456789012",
    terminalId: "12345678",
    transactionType: "purchase",
    currency: "USD", // Default currency
    timestamp: new Date(),
    entryMode: "051", // Default to EMV
    emvTags: DEFAULT_EMV_TAGS, // Default EMV tags
  })

  const [includeEmvTags, setIncludeEmvTags] = useState(true)

  const handleChange = (field: keyof Transaction, value: string) => {
    setFormData((prev) => ({ ...prev, [field]: value }))
  }

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault()

    // Prepare transaction data
    const transactionData = {
      ...formData,
      source: "form",
      // Only include EMV tags if the checkbox is checked
      emvTags: includeEmvTags ? formData.emvTags : undefined,
    }

    onSubmit(transactionData)
  }

  // Find the current currency symbol
  const currencySymbol = currencies.find((c) => c.code === formData.currency)?.symbol || "$"

  return (
    <div>
      <form onSubmit={handleSubmit} className="space-y-6">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <div className="space-y-2">
            <Label htmlFor="transactionType">Transaction Type</Label>
            <Select
              value={formData.transactionType}
              onValueChange={(value) => handleChange("transactionType", value)}
              disabled={isProcessing}
            >
              <SelectTrigger id="transactionType">
                <SelectValue placeholder="Select transaction type" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="purchase">Purchase</SelectItem>
                <SelectItem value="withdrawal">Cash Withdrawal</SelectItem>
                <SelectItem value="refund">Refund</SelectItem>
                <SelectItem value="balance">Balance Inquiry</SelectItem>
              </SelectContent>
            </Select>
          </div>

          <div className="space-y-2">
            <Label htmlFor="currency">Currency</Label>
            <Select
              value={formData.currency}
              onValueChange={(value) => handleChange("currency", value)}
              disabled={isProcessing}
            >
              <SelectTrigger id="currency">
                <SelectValue placeholder="Select currency" />
              </SelectTrigger>
              <SelectContent>
                {currencies.map((currency) => (
                  <SelectItem key={currency.code} value={currency.code}>
                    {currency.code} - {currency.name} ({currency.symbol})
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          <div className="space-y-2">
            <Label htmlFor="amount">Amount</Label>
            <div className="relative">
              <div className="absolute left-3 top-3 h-4 w-4 text-gray-500">{currencySymbol}</div>
              <Input
                id="amount"
                type="text"
                value={formData.amount}
                onChange={(e) => handleChange("amount", e.target.value)}
                className="pl-10"
                placeholder="100.00"
                disabled={isProcessing}
              />
            </div>
          </div>

          <div className="space-y-2">
            <Label htmlFor="cardNumber">Card Number</Label>
            <div className="relative">
              <CreditCard className="absolute left-3 top-3 h-4 w-4 text-gray-500" />
              <Input
                id="cardNumber"
                type="text"
                value={formData.cardNumber}
                onChange={(e) => handleChange("cardNumber", e.target.value)}
                className="pl-10"
                placeholder="4111111111111111"
                disabled={isProcessing}
              />
            </div>
          </div>

          <div className="space-y-2">
            <Label htmlFor="expiryDate">Expiry Date (MMYY)</Label>
            <div className="relative">
              <Calendar className="absolute left-3 top-3 h-4 w-4 text-gray-500" />
              <Input
                id="expiryDate"
                type="text"
                value={formData.expiryDate}
                onChange={(e) => handleChange("expiryDate", e.target.value)}
                className="pl-10"
                placeholder="1225"
                maxLength={4}
                disabled={isProcessing}
              />
            </div>
          </div>

          <div className="space-y-2">
            <Label htmlFor="merchantId">Merchant ID</Label>
            <div className="relative">
              <Building className="absolute left-3 top-3 h-4 w-4 text-gray-500" />
              <Input
                id="merchantId"
                type="text"
                value={formData.merchantId}
                onChange={(e) => handleChange("merchantId", e.target.value)}
                className="pl-10"
                placeholder="123456789012"
                disabled={isProcessing}
              />
            </div>
          </div>

          <div className="space-y-2">
            <Label htmlFor="terminalId">Terminal ID</Label>
            <Input
              id="terminalId"
              type="text"
              value={formData.terminalId}
              onChange={(e) => handleChange("terminalId", e.target.value)}
              placeholder="12345678"
              disabled={isProcessing}
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="entryMode">Entry Mode</Label>
            <Select
              value={formData.entryMode || "051"}
              onValueChange={(value) => handleChange("entryMode", value)}
              disabled={isProcessing}
            >
              <SelectTrigger id="entryMode">
                <SelectValue placeholder="Select entry mode" />
              </SelectTrigger>
              <SelectContent>
                {entryModes.map((mode) => (
                  <SelectItem key={mode.value} value={mode.value}>
                    {mode.label} ({mode.value})
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
        </div>

        <div className="space-y-2">
          <Label htmlFor="processingCode">Processing Code</Label>
          <Select
            value={formData.processingCode}
            onValueChange={(value) => handleChange("processingCode", value)}
            disabled={isProcessing}
          >
            <SelectTrigger id="processingCode">
              <SelectValue placeholder="Select processing code" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="000000">Purchase (000000)</SelectItem>
              <SelectItem value="010000">Cash Withdrawal (010000)</SelectItem>
              <SelectItem value="200000">Refund (200000)</SelectItem>
              <SelectItem value="310000">Balance Inquiry (310000)</SelectItem>
            </SelectContent>
          </Select>
        </div>

        <div className="space-y-2">
          <div className="flex items-center space-x-2 mb-2">
            <Checkbox
              id="includeEmvTags"
              checked={includeEmvTags}
              onCheckedChange={(checked) => setIncludeEmvTags(checked === true)}
              disabled={isProcessing}
            />
            <Label htmlFor="includeEmvTags" className="cursor-pointer">
              Include EMV Tags
            </Label>
          </div>

          <Input
            id="emvTags"
            type="text"
            value={formData.emvTags || ""}
            onChange={(e) => handleChange("emvTags", e.target.value)}
            placeholder="9F26:08A000000000000000,9F27:01,9F10:06010A03A0A000..."
            className="font-mono text-xs"
            disabled={!includeEmvTags || isProcessing}
          />
          <p className="text-xs text-gray-500">Format: Tag:Value,Tag:Value (e.g., 9F26:08A000000000000000)</p>
        </div>

        <Button type="submit" className="w-full" disabled={isProcessing}>
          {isProcessing ? (
            <>
              <Loader2 className="mr-2 h-4 w-4 animate-spin" />
              Processing...
            </>
          ) : (
            "Send Transaction"
          )}
        </Button>
      </form>
    </div>
  )
}
