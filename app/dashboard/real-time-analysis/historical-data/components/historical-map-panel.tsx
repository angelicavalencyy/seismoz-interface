"use client"

import dynamic from "next/dynamic"
import { Card, CardContent } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { cn } from "@/lib/utils"
import type { RiskMapGeoPoint } from "@/lib/historical-data/geojson-api"
import { getRiskMapTableKabupatenName } from "@/lib/historical-data/table-api"

const HistoricalDataMap = dynamic(() => import("./historical-data-map"), {
  ssr: false,
  loading: () => <div className="flex h-full w-full items-center justify-center">Loading Map...</div>,
})

function HistoricalDataCardItem({
  point,
  selected,
  onClick,
}: {
  point: RiskMapGeoPoint
  selected?: boolean
  onClick?: () => void
}) {
  return (
    <Card
      className={cn(
        "w-full rounded-2xl border border-slate-200 bg-white/90 shadow-sm transition-all duration-200 hover:-translate-y-0.5 hover:border-purple-300 hover:shadow-md",
        selected && "border border-purple-500 shadow-lg shadow-purple-300/20"
      )}
    >
      <CardContent className="space-y-4 p-5">
        <div className="flex items-center justify-between gap-3">
          <Badge variant="secondary" className="bg-purple-100 text-purple-700 hover:bg-purple-100">
            {point.record.risk_level ?? "Rendah"}
          </Badge>
          <span className="text-xs text-slate-500">Cluster {point.record.cluster ?? "-"}</span>
        </div>

        <div className="space-y-1">
          <h3 className="text-base font-semibold leading-tight text-slate-900">{getRiskMapTableKabupatenName(point.record)}</h3>
          <p className="text-sm text-slate-500">Luas wilayah: {point.record.luas_wilayah_km2 ?? "-"} km²</p>
        </div>

        <div className="flex flex-wrap gap-2 text-xs text-slate-600">
          <span className="rounded-full bg-slate-100 px-3 py-1 text-slate-700">Frekuensi: {point.record.frekuensi_gempa ?? "-"}</span>
          <span className="rounded-full bg-slate-100 px-3 py-1 text-slate-700">Risk Score: {point.record.risk_score ?? "-"}</span>
        </div>

        <div className="flex items-center justify-between gap-3 pt-1">
          <p className="text-xs text-slate-500">Klik untuk memusatkan peta.</p>
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

export function HistoricalDataMapPanel({
  points,
  selectedPoint,
  selectedId,
  onSelectPoint,
}: {
  points: RiskMapGeoPoint[]
  selectedPoint: RiskMapGeoPoint | null
  selectedId: string | null
  onSelectPoint: (id: string) => void
}) {
  return (
    <div className="flex h-[calc(100vh-180px)] w-full flex-row gap-4 overflow-hidden">
      <div className="mt-4 flex w-1/3 flex-col gap-4 overflow-y-auto overflow-x-hidden pr-2">
        {points.length === 0 ? (
          <div className="rounded-2xl border border-dashed border-slate-300 bg-white/80 p-6 text-sm text-slate-500">
            Tidak ada data geojson yang tersedia.
          </div>
        ) : (
          <div className="flex flex-col gap-4">
            {points.map((point) => (
              <HistoricalDataCardItem
                key={point.id}
                point={point}
                selected={selectedId === point.id}
                onClick={() => onSelectPoint(point.id)}
              />
            ))}
          </div>
        )}
      </div>

      <div className="mt-4 flex min-h-0 w-2/3 flex-col gap-4">
        <div className="w-full flex-1 overflow-hidden rounded-2xl border border-slate-200 shadow-lg">
          <HistoricalDataMap points={points} selectedPoint={selectedPoint} onSelectPoint={onSelectPoint} onZoomChange={() => undefined} />
        </div>
      </div>
    </div>
  )
}
