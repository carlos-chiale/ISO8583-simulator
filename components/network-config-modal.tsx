"use client"

import { useState } from "react"
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription } from "@/components/ui/dialog"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Switch } from "@/components/ui/switch"
import { Network, Wifi, WifiOff, Loader2 } from "lucide-react"
import { Badge } from "@/components/ui/badge"

export interface NetworkConfig {
  enabled: boolean
  host: string
  port: string
  timeout: number
  useSSL: boolean
}

interface NetworkConfigModalProps {
  isOpen: boolean
  onClose: () => void
  config: NetworkConfig
  onSave: (config: NetworkConfig) => void
}

export function NetworkConfigModal({ isOpen, onClose, config, onSave }: NetworkConfigModalProps) {
  const [localConfig, setLocalConfig] = useState<NetworkConfig>({ ...config })
  const [isTesting, setIsTesting] = useState(false)
  const [testResult, setTestResult] = useState<{ success: boolean; message: string } | null>(null)

  const handleChange = (field: keyof NetworkConfig, value: any) => {
    setLocalConfig((prev) => ({ ...prev, [field]: value }))
  }

  const handleSave = () => {
    onSave(localConfig)
    onClose()
  }

  const testConnection = async () => {
    if (!localConfig.enabled) {
      setTestResult({
        success: false,
        message: "Network mode is disabled. Enable it to test the connection.",
      })
      return
    }

    setIsTesting(true)
    setTestResult(null)

    try {
      const protocol = localConfig.useSSL ? "https" : "http"
      const url = `${protocol}://${localConfig.host}:${localConfig.port}/health`

      const controller = new AbortController()
      const timeoutId = setTimeout(() => controller.abort(), localConfig.timeout)

      const response = await fetch(url, {
        method: "GET",
        signal: controller.signal,
      })

      clearTimeout(timeoutId)

      if (response.ok) {
        setTestResult({
          success: true,
          message: `Connection successful! Server responded with status ${response.status}.`,
        })
      } else {
        setTestResult({
          success: false,
          message: `Server responded with status ${response.status}: ${response.statusText}`,
        })
      }
    } catch (error: any) {
      if (error.name === "AbortError") {
        setTestResult({
          success: false,
          message: `Connection timed out after ${localConfig.timeout}ms.`,
        })
      } else {
        setTestResult({
          success: false,
          message: `Connection failed: ${error.message || "Unknown error"}`,
        })
      }
    } finally {
      setIsTesting(false)
    }
  }

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="sm:max-w-[500px]">
        <DialogHeader>
          <DialogTitle className="flex items-center">
            <Network className="h-5 w-5 mr-2" />
            Network Configuration
          </DialogTitle>
          <DialogDescription>
            Configure network settings for sending ISO 8583 transactions to a real server.
          </DialogDescription>
        </DialogHeader>

        <div className="space-y-4 py-4">
          <div className="flex items-center justify-between space-x-2">
            <div className="flex flex-col space-y-1">
              <Label htmlFor="network-enabled" className="font-medium">
                Enable Network Mode
              </Label>
              <span className="text-sm text-gray-500">
                When enabled, transactions will be sent to the configured server
              </span>
            </div>
            <Switch
              id="network-enabled"
              checked={localConfig.enabled}
              onCheckedChange={(checked) => handleChange("enabled", checked)}
            />
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label htmlFor="host">Host/IP Address</Label>
              <Input
                id="host"
                value={localConfig.host}
                onChange={(e) => handleChange("host", e.target.value)}
                placeholder="localhost or 192.168.1.100"
                disabled={!localConfig.enabled}
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="port">Port</Label>
              <Input
                id="port"
                value={localConfig.port}
                onChange={(e) => handleChange("port", e.target.value)}
                placeholder="8080"
                disabled={!localConfig.enabled}
              />
            </div>
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label htmlFor="timeout">Timeout (ms)</Label>
              <Input
                id="timeout"
                type="number"
                value={localConfig.timeout}
                onChange={(e) => handleChange("timeout", Number.parseInt(e.target.value) || 5000)}
                placeholder="5000"
                disabled={!localConfig.enabled}
              />
            </div>
            <div className="flex items-center space-x-2 pt-8">
              <Switch
                id="ssl"
                checked={localConfig.useSSL}
                onCheckedChange={(checked) => handleChange("useSSL", checked)}
                disabled={!localConfig.enabled}
              />
              <Label htmlFor="ssl" className={!localConfig.enabled ? "text-gray-500" : ""}>
                Use SSL/HTTPS
              </Label>
            </div>
          </div>

          {testResult && (
            <div
              className={`p-3 rounded-md ${
                testResult.success ? "bg-green-50 border border-green-200" : "bg-red-50 border border-red-200"
              }`}
            >
              <div className="flex items-center">
                {testResult.success ? (
                  <Wifi className="h-4 w-4 text-green-600 mr-2" />
                ) : (
                  <WifiOff className="h-4 w-4 text-red-600 mr-2" />
                )}
                <span className={testResult.success ? "text-green-700" : "text-red-700"}>{testResult.message}</span>
              </div>
            </div>
          )}

          <div className="flex justify-between pt-4">
            <Button variant="outline" onClick={testConnection} disabled={isTesting || !localConfig.enabled}>
              {isTesting ? (
                <>
                  <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                  Testing...
                </>
              ) : (
                <>
                  <Network className="h-4 w-4 mr-2" />
                  Test Connection
                </>
              )}
            </Button>
            <div className="space-x-2">
              <Button variant="outline" onClick={onClose}>
                Cancel
              </Button>
              <Button onClick={handleSave}>Save Configuration</Button>
            </div>
          </div>

          <div className="pt-2">
            <div className="flex items-center space-x-2">
              <Badge variant={localConfig.enabled ? "success" : "outline"} className="text-xs">
                {localConfig.enabled ? "Network Mode" : "Simulation Mode"}
              </Badge>
              <span className="text-sm text-gray-500">
                {localConfig.enabled
                  ? `Transactions will be sent to ${localConfig.useSSL ? "https" : "http"}://${localConfig.host}:${
                      localConfig.port
                    }`
                  : "Transactions will be simulated locally"}
              </span>
            </div>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  )
}
