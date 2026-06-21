"use client"

import type { ReactNode } from "react"
import { cn } from "@/lib/utils"

type Tone = "neutral" | "green" | "yellow" | "red" | "darkRed" | "blue"

export function TableBadge({
  children,
  tone = "neutral",
}: {
  children: ReactNode
  tone?: Tone
}) {
  const toneClasses: Record<Tone, string> = {
    neutral: "border-border bg-background text-muted-foreground",
    green: "border-emerald-200 bg-emerald-50 text-emerald-700",
    yellow: "border-amber-200 bg-amber-50 text-amber-700",
    red: "border-rose-200 bg-rose-50 text-rose-700",
    darkRed: "border-red-900/40 bg-red-950 text-red-50",
    blue: "border-blue-200 bg-blue-50 text-blue-700",
  }

  return (
    <span className={cn("inline-flex h-7 items-center rounded-full border px-2.5 text-xs font-medium", toneClasses[tone])}>
      {children}
    </span>
  )
}
