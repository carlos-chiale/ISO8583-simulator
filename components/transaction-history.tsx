"use client";

import type { Transaction } from "@/lib/types";
import { Badge } from "@/components/ui/badge";
import { ScrollArea } from "@/components/ui/scroll-area";
import { formatCurrency, formatDateTime } from "@/lib/utils";
import { MonitorSpeaker, FileText } from "lucide-react";

interface TransactionHistoryProps {
  transactions: Transaction[];
  onSelectTransaction?: (transaction: Transaction) => void;
}

export function TransactionHistory({
  transactions,
  onSelectTransaction,
}: TransactionHistoryProps) {
  if (transactions.length === 0) {
    return (
      <div className="text-center py-12 text-gray-500">
        <p>No transactions yet. Create a new transaction to see it here.</p>
      </div>
    );
  }

  const handleTransactionClick = (transaction: Transaction) => {
    if (onSelectTransaction) {
      onSelectTransaction(transaction);
    }
  };

  return (
    <ScrollArea className="h-[400px]">
      <div className="space-y-4">
        {transactions.map((transaction, index) => (
          <div
            key={index}
            className="border rounded-lg p-4 hover:bg-gray-50 cursor-pointer transition-colors"
            onClick={() => handleTransactionClick(transaction)}
          >
            <div className="flex justify-between items-start mb-2">
              <div className="flex items-center gap-2">
                <h3 className="font-medium">
                  {transaction.transactionType.charAt(0).toUpperCase() +
                    transaction.transactionType.slice(1)}
                </h3>
                {transaction.source === "terminal" ? (
                  <MonitorSpeaker
                    className="h-4 w-4 text-blue-600"
                    aria-label="POS Terminal Transaction"
                  />
                ) : (
                  <FileText
                    className="h-4 w-4 text-green-600"
                    aria-label="Form Transaction"
                  />
                )}
              </div>
              <div className="flex flex-col items-end gap-1">
                <Badge
                  variant={
                    transaction.status === "approved"
                      ? "success"
                      : "destructive"
                  }
                >
                  {transaction.status === "approved" ? "Approved" : "Declined"}
                </Badge>
                <p className="text-xs text-gray-500">
                  {formatDateTime(transaction.timestamp)}
                </p>
              </div>
            </div>
            <div className="grid grid-cols-2 gap-2 text-sm">
              <div>
                <p className="text-gray-500">Amount</p>
                <p className="font-medium">
                  {formatCurrency(
                    Number.parseFloat(transaction.amount),
                    transaction.currency
                  )}
                </p>
              </div>
              <div>
                <p className="text-gray-500">Card</p>
                <p>•••• {transaction.cardNumber.slice(-4)}</p>
              </div>
              <div>
                <p className="text-gray-500">Terminal ID</p>
                <p>{transaction.terminalId}</p>
              </div>
              <div>
                <p className="text-gray-500">Response Code</p>
                <p>{transaction.responseCode || "N/A"}</p>
              </div>
              {transaction.authCode && (
                <div>
                  <p className="text-gray-500">Auth Code</p>
                  <p className="font-mono">{transaction.authCode}</p>
                </div>
              )}
              <div>
                <p className="text-gray-500">Currency</p>
                <p>{transaction.currency}</p>
              </div>
              <div>
                <p className="text-gray-500">Source</p>
                <p>
                  {transaction.source === "terminal" ? "POS Terminal" : "Form"}
                </p>
              </div>
              {transaction.entryMode && (
                <div>
                  <p className="text-gray-500">Entry Mode</p>
                  <p>{transaction.entryMode}</p>
                </div>
              )}
            </div>
          </div>
        ))}
      </div>
    </ScrollArea>
  );
}
