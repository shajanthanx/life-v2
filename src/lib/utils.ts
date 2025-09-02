import { type ClassValue, clsx } from "clsx"
import { twMerge } from "tailwind-merge"

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs))
}

export function formatDate(date: Date): string {
  return date.toLocaleDateString("en-US", {
    year: "numeric",
    month: "short",
    day: "numeric",
  })
}

export function formatCurrency(amount: number): string {
  return new Intl.NumberFormat("en-US", {
    style: "currency",
    currency: "USD",
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
