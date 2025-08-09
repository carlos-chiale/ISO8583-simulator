"use client"

import type React from "react"

import { useState, useEffect } from "react"
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog"
import { Button } from "@/components/ui/button"
import { Card, CardContent } from "@/components/ui/card"
import { Wallet, ChevronLeft, ChevronRight, Check } from "lucide-react"
import { cn } from "@/lib/utils"

export interface CardOption {
  id: string
  name: string
  type: "credit" | "debit"
  network: "visa" | "mastercard" | "amex" | "discover"
  number: string
  expiryDate: string
  pin: string
  color: string
  cardholderName: string
}

interface CardSelectionDialogProps {
  isOpen: boolean
  onClose: () => void
  onSelectCard: (card: CardOption) => void
  selectedCardId?: string
}

// Predefined card options with different PINs
export const cardOptions: CardOption[] = [
  {
    id: "visa-credit",
    name: "VISA Credit",
    type: "credit",
    network: "visa",
    number: "4111111111111111",
    expiryDate: "1225",
    pin: "1234",
    color: "from-blue-500 to-blue-700",
    cardholderName: "JOHN SMITH",
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
    cardholderName: "SARAH JOHNSON",
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
    cardholderName: "MICHAEL BROWN",
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
    cardholderName: "EMMA WILSON",
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
    cardholderName: "DAVID MILLER",
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
    cardholderName: "JENNIFER DAVIS",
  },
]

export function CardSelectionDialog({ isOpen, onClose, onSelectCard, selectedCardId }: CardSelectionDialogProps) {
  const [currentCardIndex, setCurrentCardIndex] = useState(0)
  const [showCardDetails, setShowCardDetails] = useState(false)

  const currentCard = cardOptions[currentCardIndex]

  // Find the index of the selected card
  const selectedCardIndex = selectedCardId ? cardOptions.findIndex((card) => card.id === selectedCardId) : 0

  // When opening the dialog, show the selected card if there is one
  useEffect(() => {
    if (isOpen) {
      if (selectedCardId) {
        const index = cardOptions.findIndex((card) => card.id === selectedCardId)
        if (index !== -1) {
          setCurrentCardIndex(index)
        }
      }
      setShowCardDetails(false)
    }
  }, [isOpen, selectedCardId])

  const handlePrevCard = (e: React.MouseEvent) => {
    e.preventDefault()
    e.stopPropagation()
    setCurrentCardIndex((prev) => (prev > 0 ? prev - 1 : cardOptions.length - 1))
  }

  const handleNextCard = (e: React.MouseEvent) => {
    e.preventDefault()
    e.stopPropagation()
    setCurrentCardIndex((prev) => (prev < cardOptions.length - 1 ? prev + 1 : 0))
  }

  const handleSelectCard = (e: React.MouseEvent) => {
    e.preventDefault()
    e.stopPropagation()
    onSelectCard(currentCard)
    onClose()
  }

  const toggleCardDetails = (e: React.MouseEvent) => {
    e.preventDefault()
    e.stopPropagation()
    setShowCardDetails((prev) => !prev)
  }

  // Format card number with spaces
  const formatCardNumber = (number: string) => {
    if (currentCard.network === "amex") {
      return `${number.slice(0, 4)} ${number.slice(4, 10)} ${number.slice(10)}`
    }
    return `${number.slice(0, 4)} ${number.slice(4, 8)} ${number.slice(8, 12)} ${number.slice(12, 16)}`
  }

  // Get network logo
  const getNetworkLogo = () => {
    switch (currentCard.network) {
      case "visa":
        return <div className="text-white font-bold italic text-xl">VISA</div>
      case "mastercard":
        return (
          <div className="flex">
            <div className="w-6 h-6 bg-red-500 rounded-full opacity-80 -mr-2"></div>
            <div className="w-6 h-6 bg-yellow-500 rounded-full opacity-80"></div>
          </div>
        )
      case "amex":
        return <div className="text-white font-bold text-sm">AMERICAN EXPRESS</div>
      case "discover":
        return <div className="text-white font-bold text-sm">DISCOVER</div>
      default:
        return null
    }
  }

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="sm:max-w-[425px]">
        <DialogHeader>
          <DialogTitle className="flex items-center">
            <Wallet className="h-5 w-5 mr-2" />
            Card Wallet
          </DialogTitle>
        </DialogHeader>

        <div className="py-4">
          {/* Card carousel indicators */}
          <div className="flex justify-center mb-4">
            {cardOptions.map((card, index) => (
              <button
                key={card.id}
                className={cn(
                  "w-2.5 h-2.5 mx-1 rounded-full transition-all",
                  index === currentCardIndex ? "bg-primary scale-125" : "bg-gray-300",
                  card.id === selectedCardId && "ring-2 ring-green-500 ring-offset-1",
                )}
                onClick={() => setCurrentCardIndex(index)}
                aria-label={`Go to card ${index + 1}`}
              />
            ))}
          </div>

          <div className="relative mb-6">
            {/* Selected card indicator */}
            {currentCard.id === selectedCardId && (
              <div className="absolute -top-2 -right-2 z-10 bg-green-500 text-white rounded-full p-1 shadow-lg">
                <Check className="h-4 w-4" />
              </div>
            )}

            {/* Card */}
            <div
              className={cn(
                "w-full h-56 rounded-xl overflow-hidden shadow-lg relative transition-all",
                currentCard.id === selectedCardId && "ring-4 ring-green-500",
              )}
            >
              <div className={`absolute inset-0 bg-gradient-to-br ${currentCard.color}`}></div>

              <div className="absolute inset-0 p-6 flex flex-col justify-between">
                {/* Card Chip and Network */}
                <div className="flex justify-between items-start">
                  <div className="w-12 h-10 bg-yellow-300 rounded-md bg-opacity-80"></div>
                  {getNetworkLogo()}
                </div>

                {/* Card Number */}
                <div className="mt-4">
                  {showCardDetails ? (
                    <div className="text-white font-mono text-xl tracking-wider">
                      {formatCardNumber(currentCard.number)}
                    </div>
                  ) : (
                    <div className="text-white font-mono text-xl tracking-wider">
                      •••• •••• •••• {currentCard.number.slice(-4)}
                    </div>
                  )}
                </div>

                {/* Card Details */}
                <div className="flex justify-between items-end">
                  <div>
                    <div className="text-white text-xs opacity-80">CARD HOLDER</div>
                    <div className="text-white font-medium">{currentCard.cardholderName}</div>
                  </div>
                  <div>
                    <div className="text-white text-xs opacity-80">EXPIRES</div>
                    <div className="text-white font-medium">
                      {currentCard.expiryDate.slice(0, 2)}/{currentCard.expiryDate.slice(2)}
                    </div>
                  </div>
                </div>
              </div>
            </div>

            {/* Navigation Buttons */}
            <Button
              variant="outline"
              size="icon"
              className="absolute left-2 top-1/2 transform -translate-y-1/2 bg-white bg-opacity-90 hover:bg-opacity-100 shadow-lg"
              onClick={handlePrevCard}
            >
              <ChevronLeft className="h-4 w-4" />
            </Button>

            <Button
              variant="outline"
              size="icon"
              className="absolute right-2 top-1/2 transform -translate-y-1/2 bg-white bg-opacity-90 hover:bg-opacity-100 shadow-lg"
              onClick={handleNextCard}
            >
              <ChevronRight className="h-4 w-4" />
            </Button>
          </div>

          {/* Selected card summary */}
          {selectedCardId && (
            <div className="mb-4 p-3 bg-green-50 border border-green-200 rounded-lg">
              <div className="flex items-center">
                <div className="mr-2">
                  <Check className="h-4 w-4 text-green-600" />
                </div>
                <div>
                  <p className="text-sm font-medium">Currently Selected:</p>
                  <p className="text-sm text-gray-600">
                    {cardOptions.find((card) => card.id === selectedCardId)?.name || "No card"}
                    (•••• {cardOptions.find((card) => card.id === selectedCardId)?.number.slice(-4) || "****"})
                  </p>
                </div>
              </div>
            </div>
          )}

          {/* Card Details */}
          <Card className="mb-6">
            <CardContent className="p-4">
              <div className="grid grid-cols-2 gap-2 text-sm">
                <div>
                  <p className="text-gray-500">Card Type</p>
                  <p className="font-medium capitalize">{currentCard.type}</p>
                </div>
                <div>
                  <p className="text-gray-500">Network</p>
                  <p className="font-medium capitalize">{currentCard.network}</p>
                </div>
                <div>
                  <p className="text-gray-500">PIN</p>
                  <p className="font-mono font-medium">{showCardDetails ? currentCard.pin : "••••"}</p>
                </div>
                <div>
                  <p className="text-gray-500">Expiry</p>
                  <p className="font-medium">
                    {currentCard.expiryDate.slice(0, 2)}/{currentCard.expiryDate.slice(2)}
                  </p>
                </div>
              </div>
            </CardContent>
          </Card>

          <div className="flex gap-2">
            <Button variant="outline" className="flex-1" onClick={toggleCardDetails}>
              {showCardDetails ? "Hide Details" : "Show Details"}
            </Button>
            <Button
              className={cn(
                "flex-1",
                selectedCardId === currentCard.id
                  ? "bg-green-600 hover:bg-green-700"
                  : "bg-primary hover:bg-primary/90",
              )}
              onClick={handleSelectCard}
            >
              {selectedCardId === currentCard.id ? "Selected" : "Select Card"}
            </Button>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  )
}
