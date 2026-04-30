"use client"

import { Card, CardContent } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { cn } from "@/lib/utils"
import { getEarthquakeLocation, getEarthquakeRecordId, type EarthquakeRecord } from "@/lib/earthquake"
import {
  Activity,
  Calendar,
  AlertTriangle,
  MapPin,
  Clock,
  Sparkles,
} from "lucide-react"

export function EarthquakeCardItem({
  data,
  selected = false,
  onClick,
}: {
  data: EarthquakeRecord
  selected?: boolean
  onClick?: () => void
}) {
  const severityLabel: "Rendah" | "Sedang" | "Tinggi" =
    data.risk_level === "Rendah" || data.risk_level === "Sedang" || data.risk_level === "Tinggi"
      ? data.risk_level
      : "Rendah"

  const availabilityStyles: Record<
    "Rendah" | "Sedang" | "Tinggi",
    {
      label: string
      dots: string[]
      badgeClassName: string
      icon: typeof Sparkles
      iconClassName: string
    }
  > = {
    Rendah: {
      label: "Rendah",
      dots: ["bg-green-500", "bg-green-400", "bg-gray-300"],
      badgeClassName: "border border-green-200 bg-green-50 text-green-700 hover:bg-green-50",
      icon: Sparkles,
      iconClassName: "text-green-600",
    },
    Sedang: {
      label: "Sedang",
      dots: ["bg-yellow-500", "bg-yellow-400", "bg-gray-300"],
      badgeClassName: "border border-yellow-200 bg-yellow-50 text-yellow-700 hover:bg-yellow-50",
      icon: Activity,
      iconClassName: "text-yellow-600",
    },
    Tinggi: {
      label: "Tinggi",
      dots: ["bg-red-500", "bg-red-400", "bg-gray-300"],
      badgeClassName: "border border-red-200 bg-red-50 text-red-700 hover:bg-red-50",
      icon: AlertTriangle,
      iconClassName: "text-red-600",
    },
  } as const

  const availability = availabilityStyles[severityLabel]
  const wilayah = data.Wilayah ?? data.wilayah ?? "Tidak tersedia"
  const tanggal = data.Tanggal ?? data.tanggal ?? data.DateTime ?? data.created_at ?? "Tidak tersedia"
  const jam = data.Jam ?? data.jam ?? "-"

  return (
    <Card
      className={cn(
        "w-full rounded-2xl border border-slate-200 bg-white/90 shadow-sm transition-all duration-200 hover:-translate-y-0.5 hover:border-purple-300 hover:shadow-md",
        selected && "border border-purple-500 shadow-lg shadow-purple-300/20"
      )}
    >
      <CardContent className="space-y-4 p-5">
        <div className="flex items-center justify-between gap-3">
          <Badge variant="secondary" className={cn(availability.badgeClassName, "gap-1") }>
            <availability.icon className={cn("size-3", availability.iconClassName)} />
            Risiko Ancaman {availability.label}
          </Badge>
        </div>

        <div className="space-y-1">
          <h3 className="text-base font-semibold leading-tight text-slate-900">
            {wilayah}
          </h3>
          <div className="flex items-start gap-2 text-sm text-slate-500">
            <MapPin className="mt-0.5 size-4 shrink-0 text-purple-500" />
            <span className="line-clamp-2 break-words">{getEarthquakeLocation(data)}</span>
          </div>
        </div>

        <div className="flex flex-wrap gap-2 text-xs text-slate-600">
          <span className="rounded-full bg-slate-100 px-3 py-1 text-slate-700">
            <Calendar className="mr-1 inline-block size-3" />
            {tanggal}
          </span>
          <span className="rounded-full bg-slate-100 px-3 py-1 text-slate-700">
            <Clock className="mr-1 inline-block size-3" />
            {jam}
          </span>
        </div>

        <div className="flex items-center justify-between gap-3 pt-1">
          <p className="text-xs text-slate-500">Klik untuk memusatkan peta dan membuka tooltip.</p>
          <Button
            size="sm"
            variant="outline"
            className="border-purple-200 bg-white text-purple-700 hover:bg-purple-50 hover:text-purple-800"
            onClick={onClick}
          >
            Lihat detail
          </Button>
        </div>
      </CardContent>
    </Card>
  )
}

export function EarthquakeCardList({
  earthquakes,
  selectedId,
  onSelect,
}: {
  earthquakes: EarthquakeRecord[]
  selectedId?: string | null
  onSelect: (record: EarthquakeRecord) => void
}) {
  if (earthquakes.length === 0) {
    return (
      <div className="rounded-2xl border border-dashed border-slate-300 bg-white/80 p-6 text-sm text-slate-500">
        Tidak ada data gempa yang tersedia.
      </div>
    )
  }

  return (
    <div className="flex flex-col gap-4">
      {earthquakes.map((item, index) => (
        <EarthquakeCardItem
          key={getEarthquakeRecordId(item, index)}
          data={item}
          selected={selectedId === getEarthquakeRecordId(item)}
          onClick={() => onSelect(item)}
        />
      ))}
    </div>
  )
}