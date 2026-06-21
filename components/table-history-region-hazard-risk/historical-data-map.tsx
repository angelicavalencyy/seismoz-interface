"use client"

import { useEffect, useRef } from "react"
import { divIcon, type Marker as LeafletMarker } from "leaflet"
import { MapContainer, Marker, TileLayer, Tooltip, useMap, useMapEvents } from "react-leaflet"
import type { RiskMapGeoPoint } from "@/lib/historical-data/geojson-api"
import { getRiskMapTableCluster, getRiskMapTableKabupatenName, getRiskMapTableRiskLevel } from "@/lib/historical-data/table-api"
import "leaflet/dist/leaflet.css"

function getRiskTone(riskLevel: string) {
  switch (riskLevel) {
    case "Ekstrem":
      return {
        halo: selectedClass("bg-red-950/25", "bg-red-950/15"),
        inner: selectedClass("bg-red-950", "bg-red-900"),
        badge: "border border-red-900/40 bg-red-950 text-red-50",
      }
    case "Tinggi":
      return {
        halo: selectedClass("bg-red-500/20", "bg-red-500/15"),
        inner: selectedClass("bg-red-700", "bg-red-500"),
        badge: "border border-red-200 bg-red-50 text-red-700",
      }
    case "Sedang":
      return {
        halo: selectedClass("bg-yellow-500/20", "bg-yellow-500/15"),
        inner: selectedClass("bg-yellow-600", "bg-yellow-500"),
        badge: "border border-yellow-200 bg-yellow-50 text-yellow-700",
      }
    default:
      return {
        halo: selectedClass("bg-green-500/20", "bg-green-500/15"),
        inner: selectedClass("bg-green-700", "bg-green-500"),
        badge: "border border-green-200 bg-green-50 text-green-700",
      }
  }
}

function selectedClass(selectedValue: string, idleValue: string) {
  return { selectedValue, idleValue }
}

function createRiskIcon(riskLevel: string, selected: boolean) {
  const tone = getRiskTone(riskLevel)

  return divIcon({
    className: "",
    html: `
      <div class="relative flex h-6 w-6 items-center justify-center">
        <span class="absolute h-10 w-10 rounded-full ${selected ? tone.halo.selectedValue : tone.halo.idleValue}"></span>
        <span class="absolute h-4 w-4 rounded-full border-2 border-white ${selected ? tone.inner.selectedValue : tone.inner.idleValue} shadow-lg"></span>
      </div>
    `,
    iconSize: [24, 24],
    iconAnchor: [12, 12],
    popupAnchor: [0, -12],
  })
}

function HistoricalDataMapSync({
  points,
  selectedPoint,
  onSelectPoint,
  onZoomChange,
}: {
  points: RiskMapGeoPoint[]
  selectedPoint: RiskMapGeoPoint | null
  onSelectPoint: (id: string) => void
  onZoomChange: (zoom: number) => void
}) {
  const map = useMap()
  const markerRefs = useRef(new Map<string, LeafletMarker>())

  useMapEvents({
    zoomend() {
      onZoomChange(map.getZoom())
    },
  })

  useEffect(() => {
    onZoomChange(map.getZoom())
  }, [map, onZoomChange])

  useEffect(() => {
    if (!selectedPoint) {
      return
    }

    const targetZoom = Math.max(map.getZoom(), 6.8)

    map.flyTo([selectedPoint.latitude, selectedPoint.longitude], targetZoom, {
      duration: 0.8,
    })

    markerRefs.current.get(selectedPoint.id)?.openTooltip()
  }, [map, selectedPoint])

  return (
    <>
      {points.map((point) => {
        const isSelected = selectedPoint?.id === point.id
        const riskLevel = getRiskMapTableRiskLevel(point.record)
        const tone = getRiskTone(riskLevel)

        return (
          <Marker
            key={point.id}
            position={[point.latitude, point.longitude]}
            icon={createRiskIcon(riskLevel, isSelected)}
            ref={(marker) => {
              if (marker) {
                markerRefs.current.set(point.id, marker)
              }
            }}
            eventHandlers={{
              click: () => onSelectPoint(point.id),
            }}
            zIndexOffset={isSelected ? 1000 : 0}
          >
            <Tooltip direction="top" offset={[0, -12]} opacity={1} className="earthquake-tooltip !border-0 !bg-transparent !p-0 !shadow-none">
              <div className="w-[240px] max-w-[240px] space-y-2 rounded-xl border border-border bg-popover p-3 text-xs text-popover-foreground shadow-lg shadow-black/5">
                <div className="flex items-start justify-between gap-2">
                  <div className="flex flex-grow items-center justify-between">
                    <p className="text-[10px] font-medium uppercase tracking-wide text-primary">Info Risk Map</p>
                    <span className={`shrink-0 rounded-full px-2.5 py-0.5 text-[10px] font-medium ${tone.badge}`}>
                      {riskLevel}
                    </span>
                  </div>
                </div>
                <h4 className="max-w-[200px] whitespace-normal break-words text-sm font-semibold leading-snug text-popover-foreground">
                  {getRiskMapTableKabupatenName(point.record)}
                </h4>
                <div className="rounded-lg border border-border bg-muted/40 p-2.5 text-[11px]">
                  <div className="flex items-start justify-between gap-3">
                    <span className="text-muted-foreground">Risk Score</span>
                    <span className="max-w-[140px] text-right font-medium leading-tight text-popover-foreground">{point.record.risk_score ?? "-"}</span>
                  </div>
                  <div className="mt-1 flex items-start justify-between gap-3">
                    <span className="text-muted-foreground">Cluster</span>
                    <span className="max-w-[140px] text-right font-medium leading-tight text-popover-foreground">{getRiskMapTableCluster(point.record) ?? "-"}</span>
                  </div>
                </div>
              </div>
            </Tooltip>
          </Marker>
        )
      })}
    </>
  )
}

export default function HistoricalDataMap({
  points,
  selectedPoint,
  onSelectPoint,
  onZoomChange,
}: {
  points: RiskMapGeoPoint[]
  selectedPoint: RiskMapGeoPoint | null
  onSelectPoint: (id: string) => void
  onZoomChange: (zoom: number) => void
}) {
  return (
    <MapContainer center={[-2.5, 118]} zoom={5.8} minZoom={4.5} maxZoom={9} zoomControl className="h-full w-full">
      <TileLayer
        url={`https://api.thunderforest.com/transport/{z}/{x}/{y}{r}.png?apikey=${process.env.NEXT_PUBLIC_THUNDERFOREST_KEY}`}
        attribution='&copy; Thunderforest &copy; OpenStreetMap contributors'
        maxZoom={22}
      />

      <HistoricalDataMapSync points={points} selectedPoint={selectedPoint} onSelectPoint={onSelectPoint} onZoomChange={onZoomChange} />
    </MapContainer>
  )
}
