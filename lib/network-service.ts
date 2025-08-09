import type { Transaction } from "./types"

export interface NetworkConfig {
  enabled: boolean
  host: string
  port: string
  timeout: number
  useSSL: boolean
}

export const DEFAULT_NETWORK_CONFIG: NetworkConfig = {
  enabled: false,
  host: "localhost",
  port: "8080",
  timeout: 5000,
  useSSL: false,
}

export async function sendTransaction(
  transaction: Transaction,
  config: NetworkConfig,
): Promise<{ success: boolean; response?: any; error?: string }> {
  try {
    if (!config.enabled) {
      throw new Error("Network mode is not enabled")
    }

    const protocol = config.useSSL ? "https" : "http"
    const url = `${protocol}://${config.host}:${config.port}/iso8583`

    const controller = new AbortController()
    const timeoutId = setTimeout(() => controller.abort(), config.timeout)

    const response = await fetch(url, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        transaction,
        timestamp: new Date().toISOString(),
      }),
      signal: controller.signal,
    })

    clearTimeout(timeoutId)

    if (!response.ok) {
      throw new Error(`HTTP error ${response.status}: ${response.statusText}`)
    }

    const data = await response.json()
    return {
      success: true,
      response: data,
    }
  } catch (error: any) {
    if (error.name === "AbortError") {
      return {
        success: false,
        error: `Request timed out after ${config.timeout}ms`,
      }
    }
    return {
      success: false,
      error: error.message || "Failed to send transaction",
    }
  }
}

// Helper function to parse network response into ISO8583 format
export function parseNetworkResponse(
  response: any,
  originalTransaction: Transaction,
): { formatted: string; wire: string } {
  try {
    // If the server returns a properly formatted ISO8583 response, use it
    if (response.formatted && response.wire) {
      return {
        formatted: response.formatted,
        wire: response.wire,
      }
    }

    // Otherwise, try to construct a response from the data
    const approved = response.approved === true || response.status === "approved"
    const responseCode = response.responseCode || (approved ? "00" : "05")
    const responseMessage = response.responseMessage || (approved ? "APPROVED" : "DECLINED")
    const authCode = response.authCode || (approved ? generateRandomAuthCode() : "")

    // Create a formatted response
    const formatted = `ISO8583 Response:
MTI: 0210
Field 039 (Response Code): ${responseCode}
Field 044 (Response Message): ${responseMessage}
Field 038 (Auth Code): ${authCode}
${response.additionalFields || ""}
`

    // Create a wire format (simplified)
    const wire = `0210${originalTransaction.messageType.substring(4, 40)}${responseCode}00${authCode || "      "}${
      originalTransaction.messageType.substring(60) || ""
    }`

    return {
      formatted,
      wire,
    }
  } catch (error) {
    // If parsing fails, return a generic error response
    return {
      formatted: `ISO8583 Response:
MTI: 0210
Field 039 (Response Code): 96
Field 044 (Response Message): SYSTEM ERROR
`,
      wire: `0210${originalTransaction.messageType.substring(4, 40)}9600      ${
        originalTransaction.messageType.substring(60) || ""
      }`,
    }
  }
}

function generateRandomAuthCode(): string {
  return Math.random().toString(36).substring(2, 8).toUpperCase()
}
