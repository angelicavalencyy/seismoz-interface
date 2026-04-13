"use client"

import type { ReactNode } from "react"
import { cn } from "@/lib/utils"

type Tone = "neutral" | "green" | "yellow" | "red" | "purple"

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
    purple: "border-purple-200 bg-purple-50 text-purple-700",
  }

  return (
    <span className={cn("inline-flex h-7 items-center rounded-full border px-2.5 text-xs font-medium", toneClasses[tone])}>
      {children}
    </span>
  )
}
