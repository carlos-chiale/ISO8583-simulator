"use client";
import { useState, useEffect } from "react";
import { TerminalInterface } from "@/components/terminal-interface";
import {
  CardSelectionDialog,
  type CardOption,
  cardOptions,
} from "@/components/card-selection-dialog";
import { Button } from "@/components/ui/button";
import { Wallet, Github } from "lucide-react";
import type { NetworkConfig } from "@/lib/network-service";

interface HeaderProps {
  onTerminalTransaction?: (transaction: any) => void;
  networkConfig?: NetworkConfig;
}

export function Header({ onTerminalTransaction, networkConfig }: HeaderProps) {
  const [isWalletOpen, setIsWalletOpen] = useState(false);
  const [isNetworkConfigOpen, setIsNetworkConfigOpen] = useState(false);
  const [selectedCard, setSelectedCard] = useState<CardOption | null>(null);

  // Set default card on first load
  useEffect(() => {
    if (!selectedCard && cardOptions.length > 0) {
      setSelectedCard(cardOptions[0]);
    }
  }, [selectedCard]);

  const handleSelectCard = (card: CardOption) => {
    setSelectedCard(card);
    setIsWalletOpen(false);
  };

  const handleWalletClose = () => {
    setIsWalletOpen(false);
  };

  return (
    <>
      {/* Blur overlay when wallet is open */}
      {isWalletOpen && (
        <div className="fixed inset-0 bg-black bg-opacity-20 backdrop-blur-sm z-40" />
      )}

      <header className="bg-white border-b sticky top-0 z-10">
        <div className="container mx-auto px-4 py-3 flex flex-col gap-2 sm:flex-row sm:items-center sm:justify-between">
          <div className="flex items-center">
            <span className="font-bold text-base leading-tight sm:text-lg">
              ISO 8583 Transaction Simulator
            </span>
          </div>

          <div className="flex items-center gap-2 flex-wrap">
            <Button
              variant="outline"
              className="flex items-center gap-2 relative h-9 px-2 sm:px-3"
              onClick={() => setIsWalletOpen(true)}
            >
              {selectedCard ? (
                <>
                  <div
                    className={`w-5 h-3 rounded-sm mr-1 bg-gradient-to-br ${selectedCard.color}`}
                    aria-hidden="true"
                  ></div>
                  <span className="text-sm sm:text-base">
                    {selectedCard.name.split(" ")[0]}
                  </span>
                  <span className="hidden md:inline text-xs text-gray-500">
                    •••• {selectedCard.number.slice(-4)}
                  </span>
                </>
              ) : (
                <>
                  <Wallet className="h-4 w-4" />
                  <span className="hidden sm:inline">Wallet</span>
                </>
              )}
            </Button>
            <TerminalInterface
              standalone={true}
              onTransactionComplete={onTerminalTransaction}
              selectedCard={selectedCard}
              networkConfig={networkConfig}
            />
            <Button asChild variant="outline" className="h-9 px-2 sm:px-3">
              <a
                href="https://github.com/carlos-chiale/ISO8583-simulator"
                target="_blank"
                rel="noopener noreferrer"
                aria-label="Open GitHub repository"
                className="flex items-center gap-2"
              >
                <Github className="h-4 w-4" aria-hidden="true" />
                <span className="hidden sm:inline">Check out the code!!</span>
              </a>
            </Button>
          </div>
        </div>
      </header>

      {/* Card Selection Dialog */}
      <CardSelectionDialog
        isOpen={isWalletOpen}
        onClose={handleWalletClose}
        onSelectCard={handleSelectCard}
        selectedCardId={selectedCard?.id}
      />
    </>
  );
}
