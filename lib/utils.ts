import { clsx, type ClassValue } from "clsx"
import { twMerge } from "tailwind-merge"

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs))
}

export function toDateKey(dateString: string): string {
  if (!dateString) return ""

  const date = new Date(dateString)
  if (isNaN(date.getTime())) return ""

  return date.toISOString().split("T")[0]
}