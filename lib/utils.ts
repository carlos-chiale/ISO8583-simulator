import { clsx, type ClassValue } from "clsx"
import { twMerge } from "tailwind-merge"
import { cva } from "class-variance-authority"

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs))
}

// Update the formatCurrency function to support different currencies
export function formatCurrency(amount: number, currencyCode = "USD"): string {
  const currencyMap: Record<string, { locale: string; currency: string }> = {
    USD: { locale: "en-US", currency: "USD" },
    EUR: { locale: "de-DE", currency: "EUR" },
    GBP: { locale: "en-GB", currency: "GBP" },
    JPY: { locale: "ja-JP", currency: "JPY" },
    CAD: { locale: "en-CA", currency: "CAD" },
    AUD: { locale: "en-AU", currency: "AUD" },
    CHF: { locale: "de-CH", currency: "CHF" },
    CNY: { locale: "zh-CN", currency: "CNY" },
    INR: { locale: "en-IN", currency: "INR" },
    BRL: { locale: "pt-BR", currency: "BRL" },
    UYU: { locale: "es-UY", currency: "UYU" },
  }

  const { locale, currency } = currencyMap[currencyCode] || currencyMap["USD"]

  return new Intl.NumberFormat(locale, {
    style: "currency",
    currency: currency,
  }).format(amount)
}

export function formatDateTime(date: Date): string {
  return new Intl.DateTimeFormat("en-US", {
    year: "numeric",
    month: "short",
    day: "numeric",
    hour: "numeric",
    minute: "numeric",
    second: "numeric",
    hour12: true,
  }).format(date)
}

export const badgeVariants = cva(
  "inline-flex items-center rounded-full border px-2.5 py-0.5 text-xs font-semibold transition-colors focus:outline-none focus:ring-2 focus:ring-ring focus:ring-offset-2",
  {
    variants: {
      variant: {
        default: "border-transparent bg-primary text-primary-foreground hover:bg-primary/80",
        secondary: "border-transparent bg-secondary text-secondary-foreground hover:bg-secondary/80",
        destructive: "border-transparent bg-destructive text-destructive-foreground hover:bg-destructive/80",
        outline: "text-foreground",
        success: "border-transparent bg-green-100 text-green-800 hover:bg-green-200/80",
      },
    },
    defaultVariants: {
      variant: "default",
    },
  },
)
