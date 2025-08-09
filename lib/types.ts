export interface Transaction {
  messageType: string
  processingCode: string
  amount: string
  cardNumber: string
  expiryDate: string
  merchantId: string
  terminalId: string
  transactionType: string
  timestamp: Date
  currency: string
  status?: "approved" | "declined"
  responseCode?: string
  authCode?: string
  source?: "form" | "terminal"
  entryMode?: string
  emvTags?: string
}
