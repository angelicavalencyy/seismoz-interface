"use client"

import dynamic from "next/dynamic"
import { Card, CardContent } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { cn } from "@/lib/utils"
import type { RiskMapGeoPoint } from "@/lib/historical-data/geojson-api"
import { getRiskMapTableCluster, getRiskMapTableKabupatenName, getRiskMapTableRiskLevel } from "@/lib/historical-data/table-api"

const HistoricalDataMap = dynamic(() => import("@/components/table-history-region-hazard-risk/historical-data-map"), {
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
  const riskLevel = getRiskMapTableRiskLevel(point.record)
  const riskBadgeClassName =
    riskLevel === "Ekstrem"
      ? "border border-red-900/40 bg-red-950 text-red-50 hover:bg-red-950"
      : riskLevel === "Tinggi"
        ? "border border-red-200 bg-red-50 text-red-700 hover:bg-red-50"
        : riskLevel === "Sedang"
          ? "border border-yellow-200 bg-yellow-50 text-yellow-700 hover:bg-yellow-50"
          : "border border-green-200 bg-green-50 text-green-700 hover:bg-green-50"

  return (
    <Card
      className={cn(
        "w-full rounded-2xl border border-slate-200 bg-white/90 shadow-sm transition-all duration-200 hover:-translate-y-0.5 hover:border-purple-300 hover:shadow-md",
        selected && "border border-purple-500 shadow-lg shadow-purple-300/20"
      )}
    >
      <CardContent className="space-y-4 p-5">
        <div className="flex items-center justify-between gap-3">
          <Badge variant="secondary" className={riskBadgeClassName}>
            {riskLevel}
          </Badge>
          <span className="text-xs text-slate-500">Cluster {getRiskMapTableCluster(point.record) ?? "-"}</span>
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
            className="border-blue-200 bg-white text-blue-700 hover:bg-blue-50 hover:text-blue-800"
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
    <div className="flex min-h-[680px] w-full flex-col gap-4 overflow-hidden lg:h-[calc(100vh-180px)] lg:min-h-0 lg:flex-row">
      <div className="mt-4 flex max-h-[420px] w-full flex-col gap-4 overflow-y-auto overflow-x-hidden pr-2 lg:max-h-none lg:w-1/3">
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

      <div className="mt-4 flex min-h-[420px] w-full flex-col gap-4 lg:min-h-0 lg:w-2/3">
        <div className="w-full flex-1 overflow-hidden rounded-2xl border border-slate-200 shadow-lg">
          <HistoricalDataMap points={points} selectedPoint={selectedPoint} onSelectPoint={onSelectPoint} onZoomChange={() => undefined} />
        </div>
      </div>
    </div>
  )
}
