"use client"

import { useState } from "react"
import { Button } from "@/components/ui/button"
import { cn } from "@/lib/utils"
import { CreditCard, Wallet } from "lucide-react"

export interface CardOption {
  id: string
  name: string
  type: "credit" | "debit"
  network: "visa" | "mastercard" | "amex" | "discover"
  number: string
  expiryDate: string
  pin: string
  color: string
}

interface CardSelectionProps {
  onSelectCard: (card: CardOption) => void
  selectedCardId?: string
}

// Predefined card options with different PINs
const cardOptions: CardOption[] = [
  {
    id: "visa-credit",
    name: "VISA Credit",
    type: "credit",
    network: "visa",
    number: "4111111111111111",
    expiryDate: "1225",
    pin: "1234",
    color: "from-blue-500 to-blue-700",
  },
  {
    id: "visa-debit",
    name: "VISA Debit",
    type: "debit",
    network: "visa",
    number: "4000123456789010",
    expiryDate: "0326",
    pin: "5678",
    color: "from-blue-400 to-green-600",
  },
  {
    id: "mastercard-credit",
    name: "Mastercard Credit",
    type: "credit",
    network: "mastercard",
    number: "5555555555554444",
    expiryDate: "0924",
    pin: "9012",
    color: "from-red-500 to-orange-500",
  },
  {
    id: "mastercard-debit",
    name: "Mastercard Debit",
    type: "debit",
    network: "mastercard",
    number: "5200828282828210",
    expiryDate: "0725",
    pin: "3456",
    color: "from-red-400 to-yellow-500",
  },
  {
    id: "amex",
    name: "American Express",
    type: "credit",
    network: "amex",
    number: "378282246310005",
    expiryDate: "0926",
    pin: "7890",
    color: "from-blue-600 to-blue-900",
  },
  {
    id: "discover",
    name: "Discover",
    type: "credit",
    network: "discover",
    number: "6011111111111117",
    expiryDate: "0427",
    pin: "4321",
    color: "from-orange-500 to-orange-700",
  },
]

export function CardSelection({ onSelectCard, selectedCardId }: CardSelectionProps) {
  const [hoveredCardId, setHoveredCardId] = useState<string | null>(null)

  return (
    <div className="absolute left-0 top-0 bottom-0 w-16 bg-gray-800 border-r border-gray-700 flex flex-col items-center py-4 overflow-auto">
      <div className="mb-4">
        <Wallet className="h-6 w-6 text-gray-400" />
      </div>
      <div className="space-y-4">
        {cardOptions.map((card) => (
          <div
            key={card.id}
            className="relative"
            onMouseEnter={() => setHoveredCardId(card.id)}
            onMouseLeave={() => setHoveredCardId(null)}
          >
            <Button
              variant="ghost"
              className={cn(
                "h-12 w-12 p-0 rounded-md overflow-hidden",
                selectedCardId === card.id && "ring-2 ring-white",
              )}
              onClick={() => onSelectCard(card)}
            >
              <div className={`w-full h-full bg-gradient-to-br ${card.color} flex items-center justify-center`}>
                <CreditCard className="h-6 w-6 text-white" />
              </div>
            </Button>

            {/* Card info tooltip */}
            {hoveredCardId === card.id && (
              <div className="absolute left-16 top-0 z-50 bg-gray-900 text-white rounded-md p-3 shadow-lg w-48">
                <p className="font-bold text-sm">{card.name}</p>
                <p className="text-xs text-gray-300 mt-1">{card.type.charAt(0).toUpperCase() + card.type.slice(1)}</p>
                <p className="text-xs mt-1">•••• {card.number.slice(-4)}</p>
                <p className="text-xs mt-1">
                  Expires: {card.expiryDate.slice(0, 2)}/{card.expiryDate.slice(2)}
                </p>
                <p className="text-xs mt-1 bg-gray-800 p-1 rounded">PIN: {card.pin}</p>
              </div>
            )}
          </div>
        ))}
      </div>
    </div>
  )
}

// Export the card options for use in other components
export { cardOptions }
