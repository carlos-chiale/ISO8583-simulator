import type { Transaction } from "./types"

// Add currency code mapping to the formatIso8583Message function
export function formatIso8583Message(transaction: Transaction): { formatted: string; wire: string } {
  // This is a simplified implementation of ISO 8583 message formatting
  // In a real implementation, this would be much more complex with proper binary encoding

  // Get the numeric currency code
  const currencyCode = getCurrencyNumericCode(transaction.currency)

  const fields: Record<string, string> = {
    // Message Type Indicator (MTI)
    "0": transaction.messageType,

    // Primary Bitmap would be here in a real implementation

    // Processing Code
    "3": transaction.processingCode,

    // Amount
    "4": transaction.amount.replace(".", "").padStart(12, "0"),

    // Transmission Date & Time
    "7": formatDateTime(transaction.timestamp),

    // System Trace Audit Number
    "11": Math.floor(Math.random() * 1000000)
      .toString()
      .padStart(6, "0"),

    // Local Transaction Time
    "12": formatTime(transaction.timestamp),

    // Local Transaction Date
    "13": formatDate(transaction.timestamp),

    // Expiration Date
    "14": transaction.expiryDate,

    // Point of Service Entry Mode
    "22": transaction.entryMode || "051", // Default to EMV

    // Card Sequence Number
    "23": "001",

    // Point of Service Condition Code
    "25": "00", // Normal transaction

    // Acquiring Institution ID
    "32": "12345678",

    // Primary Account Number (PAN)
    "2": transaction.cardNumber,

    // Terminal ID
    "41": transaction.terminalId.padEnd(8, " "),

    // Merchant ID
    "42": transaction.merchantId.padEnd(15, " "),

    // Additional Data
    "48": "Additional transaction data",

    // Currency Code
    "49": currencyCode, // Use the selected currency code

    // PIN Data
    "52": "ENCRYPTED_PIN_BLOCK",

    // Security Related Control Information
    "53": "0100000000000000",

    // Additional Amounts
    "54": "000000000000000C",

    // ICC Data (EMV Tags)
    "55": transaction.emvTags || "",

    // Reserved for National Use
    "59": "",

    // Reserved for Private Use
    "62": "",

    // Message Authentication Code
    "64": "MAC_WOULD_BE_HERE",
  }

  // Format the message for display
  let message = `ISO8583 Message:
MTI: ${fields["0"]}
`

  // Add all fields to the message
  Object.entries(fields)
    .filter(([key]) => key !== "0") // Skip MTI as it's already added
    .forEach(([key, value]) => {
      if (value) {
        // Special handling for EMV tags (field 55)
        if (key === "55" && value) {
          message += `Field ${key.padStart(3, "0")} (EMV Tags): ${value}\n`
        } else {
          message += `Field ${key.padStart(3, "0")}: ${value}\n`
        }
      }
    })

  // Generate wire format
  const wire = generateWireFormat(transaction)

  return {
    formatted: message,
    wire: wire,
  }
}

// Add a function to get the numeric currency code
function getCurrencyNumericCode(currencyCode: string): string {
  const currencies: Record<string, string> = {
    USD: "840",
    EUR: "978",
    GBP: "826",
    JPY: "392",
    CAD: "124",
    AUD: "036",
    CHF: "756",
    CNY: "156",
    INR: "356",
    BRL: "986",
    UYU: "858",
  }

  return currencies[currencyCode] || "840" // Default to USD if not found
}

// Update the generateWireFormat function to include the currency code
export function generateWireFormat(transaction: Transaction): string {
  // This is a simplified implementation of the ISO 8583 wire format
  // In a real implementation, this would involve proper binary encoding

  // Get the numeric currency code
  const currencyCode = getCurrencyNumericCode(transaction.currency)

  // Start with the MTI
  let wireFormat = transaction.messageType

  // Add a primary bitmap (simplified)
  wireFormat += "2210a23002000e80060000000000000010"

  // Add processing code
  wireFormat += transaction.processingCode

  // Add amount (12 digits)
  wireFormat += transaction.amount.replace(".", "").padStart(12, "0")

  // Add system trace number (6 digits)
  wireFormat += Math.floor(Math.random() * 1000000)
    .toString()
    .padStart(6, "0")

  // Add transaction time (MMDDhhmmss)
  const now = transaction.timestamp
  const month = (now.getMonth() + 1).toString().padStart(2, "0")
  const day = now.getDate().toString().padStart(2, "0")
  const hours = now.getHours().toString().padStart(2, "0")
  const minutes = now.getMinutes().toString().padStart(2, "0")
  const seconds = now.getSeconds().toString().padStart(2, "0")
  wireFormat += `${month}${day}${hours}${minutes}${seconds}`

  // Add card number (PAN)
  wireFormat += transaction.cardNumber

  // Add terminal ID
  wireFormat += transaction.terminalId

  // Add merchant ID
  wireFormat += transaction.merchantId

  // Add entry mode
  const entryMode = transaction.entryMode || "051" // Default to EMV

  // Add currency code and additional data (simplified)
  wireFormat += `0130303153${entryMode}324330303030303030303030303018238203233433030${currencyCode}374130303030303030333130313039353035303038303030383030303941303332333131303735463241303230313730354633343031303039463032303630303030303030313230303039463130303730363031304130334130413830333946314130323031353239463236303830333444363437433938373034374334394632373031383039463334303331453033303039463336303230303830394633373034424645363137444100`

  // Add a checksum (simplified)
  wireFormat += "9080000000000000000"

  return wireFormat
}

function formatDateTime(date: Date): string {
  const month = (date.getMonth() + 1).toString().padStart(2, "0")
  const day = date.getDate().toString().padStart(2, "0")
  const hour = date.getHours().toString().padStart(2, "0")
  const minute = date.getMinutes().toString().padStart(2, "0")
  const second = date.getSeconds().toString().padStart(2, "0")

  return `${month}${day}${hour}${minute}${second}`
}

function formatTime(date: Date): string {
  const hour = date.getHours().toString().padStart(2, "0")
  const minute = date.getMinutes().toString().padStart(2, "0")
  const second = date.getSeconds().toString().padStart(2, "0")

  return `${hour}${minute}${second}`
}

function formatDate(date: Date): string {
  const month = (date.getMonth() + 1).toString().padStart(2, "0")
  const day = date.getDate().toString().padStart(2, "0")

  return `${month}${day}`
}
