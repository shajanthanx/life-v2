import { type ClassValue, clsx } from "clsx"
import { twMerge } from "tailwind-merge"
import { format as dateFnsFormat } from "date-fns"

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs))
}

export function formatDate(date: Date, formatStr?: string): string {
  if (formatStr) {
    return dateFnsFormat(date, formatStr)
  }
  return date.toLocaleDateString("en-US", {
    year: "numeric",
    month: "short",
    day: "numeric",
  })
}

export function formatCurrency(amount: number): string {
  // Get currency preference from localStorage, default to USD
  const savedCurrency = typeof window !== 'undefined' 
    ? localStorage.getItem('financeAppCurrency') || 'USD'
    : 'USD'
  
  // Currency to locale mapping
  const currencyToLocale: Record<string, string> = {
    'USD': 'en-US',
    'EUR': 'de-DE',
    'GBP': 'en-GB', 
    'JPY': 'ja-JP',
    'CAD': 'en-CA',
    'AUD': 'en-AU',
    'CHF': 'de-CH',
    'CNY': 'zh-CN',
    'INR': 'en-IN',
    'LKR': 'en-LK',
    'BRL': 'pt-BR'
  }
  
  const locale = currencyToLocale[savedCurrency] || 'en-US'
  
  return new Intl.NumberFormat(locale, {
    style: "currency",
    currency: savedCurrency,
  }).format(amount)
}

export function calculateStreak(records: boolean[]): number {
  let streak = 0
  for (let i = records.length - 1; i >= 0; i--) {
    if (records[i]) {
      streak++
    } else {
      break
    }
  }
  return streak
}

export function getProgressPercentage(current: number, total: number): number {
  return Math.min(100, Math.max(0, (current / total) * 100))
}
