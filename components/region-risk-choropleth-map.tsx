"use client"

import { useEffect, useMemo, useRef } from "react"
import { geoJSON as createGeoJsonLayer } from "leaflet"
import { GeoJSON, MapContainer, TileLayer, useMap } from "react-leaflet"
import type { FeatureCollection, Geometry, Feature } from "geojson"
import type { RiskMapGeojsonFeature } from "@/lib/historical-data/geojson-api"
import {
  getRiskMapGeojsonFeatureName,
  getRiskMapGeojsonFeatureRiskLevel,
  getRiskMapGeojsonFeatureRiskScore,
} from "@/lib/historical-data/geojson-api"
import {
  formatCellValue,
  getRiskMapTableCluster,
  getRiskMapTableRiskLevel,
  type RiskMapTableRecord,
} from "@/lib/historical-data/table-api"
import "leaflet/dist/leaflet.css"

type RegionRiskChoroplethMapProps = {
  features: RiskMapGeojsonFeature[]
  activeRiskLevel?: "all" | "Rendah" | "Sedang" | "Tinggi" | "Ekstrem"
}

function getFillColor(feature: RiskMapGeojsonFeature): string {
  const riskLevel = getRiskMapGeojsonFeatureRiskLevel(feature)
  const riskScore = getRiskMapGeojsonFeatureRiskScore(feature)

  if (riskLevel === "Ekstrem") {
    return "#dc2626"
  }

  if (riskLevel === "Tinggi") {
    return "#ef4444"
  }

  if (riskLevel === "Sedang") {
    return "#f59e0b"
  }

  if (riskLevel === "Rendah") {
    return "#22c55e"
  }

  if (riskScore === null) {
    return "#60a5fa"
  }

  if (riskScore >= 0.72) {
    return "#dc2626"
  }

  if (riskScore >= 0.58) {
    return "#ef4444"
  }

  if (riskScore >= 0.48) {
    return "#f59e0b"
  }

  return "#22c55e"
}

function buildRegionRiskTooltipHtml(feature: RiskMapGeojsonFeature): string {
  const title = getRiskMapGeojsonFeatureName(feature).replace(/([a-z])([A-Z])/g, '$1 $2')
  const riskLevel = getRiskMapTableRiskLevel((feature.properties ?? {}) as RiskMapTableRecord)
  const record = (feature.properties ?? {}) as RiskMapTableRecord

  const severity = riskLevel === "Ekstrem" ? "dark-red" : riskLevel === "Tinggi" ? "red" : riskLevel === "Sedang" ? "yellow" : "green"
  const badgeClassName =
    severity === "dark-red"
      ? "border border-red-600 bg-red-600 text-white"
      : severity === "red"
      ? "border border-red-200 bg-red-50 text-red-700"
      : severity === "yellow"
        ? "border border-yellow-200 bg-yellow-50 text-yellow-700"
        : "border border-green-200 bg-green-50 text-green-700"

  const luasWilayah = record.luas_wilayah_km2 ?? record.Luas_Wilayah_Km2
  const frekuensi = record.frekuensi_gempa ?? record.Frekuensi_Gempa
  const magMean = record.mag_mean ?? record.Mag_Mean
  const magMax = record.mag_max ?? record.Mag_Max
  const depthMean = record.depth_mean ?? record.Depth_Mean
  const cluster = getRiskMapTableCluster(record)

  return `
    <div class="w-[260px] max-w-[260px] space-y-2 rounded-xl border border-border bg-popover p-3 text-xs text-popover-foreground shadow-lg shadow-black/5 relative z-0">
      <div class="mb-4 text-xs font-semibold uppercase tracking-wider text-foreground">Gempa November 2001 - Februari 2026</div>  
      <div class="flex items-start justify-between gap-2">
        <p class="text-[10px] font-medium uppercase tracking-wide text-primary">Region Risk</p>
        <span class="shrink-0 rounded-full px-2.5 py-0.5 text-[10px] font-medium ${badgeClassName}">
          Risiko Ancaman ${riskLevel}
        </span>
      </div>

      <h4 class="max-w-[220px] whitespace-normal break-words text-sm font-semibold leading-snug text-popover-foreground">${title}</h4>

      <div class="rounded-lg border border-border bg-muted/40 p-2.5 text-[11px]">
        <div class="flex items-start justify-between gap-3">
          <span class="text-muted-foreground">Luas wilayah</span>
          <span class="max-w-[140px] text-right font-medium leading-tight text-popover-foreground">${formatCellValue(luasWilayah)} km²</span>
        </div>
        <div class="mt-1 flex items-start justify-between gap-3">
          <span class="text-muted-foreground">Jumlah kejadian</span>
          <span class="max-w-[140px] text-right font-medium leading-tight text-popover-foreground">${formatCellValue(frekuensi)}</span>
        </div>
      </div>

      <div class="rounded-lg border border-dashed border-border/80 bg-background/70 p-2.5 text-[11px]">
        <div class="flex items-start justify-between gap-3">
          <span class="text-muted-foreground">Magnitudo rata-rata</span>
          <span class="max-w-[140px] text-right font-medium leading-tight text-popover-foreground">${formatCellValue(magMean)}</span>
        </div>
        <div class="mt-1 flex items-start justify-between gap-3">
          <span class="text-muted-foreground">Magnitudo maksimal</span>
          <span class="max-w-[140px] text-right font-medium leading-tight text-popover-foreground">${formatCellValue(magMax)}</span>
        </div>
        <div class="mt-1 flex items-start justify-between gap-3">
          <span class="text-muted-foreground">Kedalaman rata-rata</span>
          <span class="max-w-[140px] text-right font-medium leading-tight text-popover-foreground">${formatCellValue(depthMean)}</span>
        </div>
        <div class="mt-1 flex items-start justify-between gap-3">
          <span class="text-muted-foreground">Cluster</span>
          <span class="max-w-[140px] text-right font-medium leading-tight text-popover-foreground">${formatCellValue(cluster)}</span>
        </div>
      </div>
    </div>
  `.trim()
}

function RegionRiskAutoLocate({ enabled }: { enabled: boolean }) {
  const map = useMap()
  const hasLocated = useRef(false)

  useEffect(() => {
    if (!enabled || hasLocated.current) {
      return
    }

    if (typeof navigator === "undefined" || !navigator.geolocation) {
      return
    }

    hasLocated.current = true

    navigator.geolocation.getCurrentPosition(
      (position) => {
        const { latitude, longitude } = position.coords
        map.flyTo([latitude, longitude], Math.max(map.getZoom(), 8), {
          duration: 0.8,
        })
      },
      () => undefined,
      {
        enableHighAccuracy: false,
        timeout: 2500,
        maximumAge: 60_000,
      }
    )
  }, [enabled, map])

  return null
}

function RegionRiskLayer({
  features,
  activeRiskLevel,
}: {
  features: RiskMapGeojsonFeature[]
  activeRiskLevel: "all" | "Rendah" | "Sedang" | "Tinggi" | "Ekstrem"
}) {
  const map = useMap()

  const collection = useMemo<FeatureCollection<Geometry, RiskMapGeojsonFeature>>(
    () => ({
      type: "FeatureCollection",
      features: features.map((feature) => feature as unknown as Feature<Geometry, RiskMapGeojsonFeature>),
    }),
    [features]
  )

  useEffect(() => {
    if (features.length === 0) {
      return
    }

    const layer = createGeoJsonLayer(collection as never)
    const bounds = layer.getBounds()

    if (bounds.isValid()) {
      map.fitBounds(bounds.pad(0.08), {
        animate: true,
      })
    }
  }, [collection, features.length, map])

  if (features.length === 0) {
    return null
  }

  return (
    <GeoJSON
      data={collection as never}
      style={(feature) => {
        const riskFeature = feature as unknown as RiskMapGeojsonFeature
        const featureRiskLevel = getRiskMapGeojsonFeatureRiskLevel(riskFeature)
        const isActive = activeRiskLevel === "all" || featureRiskLevel === activeRiskLevel

        return {
          fillColor: feature ? getFillColor(riskFeature) : "#60a5fa",
          weight: isActive ? 1.6 : 1.0,
          opacity: isActive ? 1 : 0.35,
          color: "#ffffff",
          dashArray: "2",
          fillOpacity: isActive ? 0.78 : 0.12,
        }
      }}
      onEachFeature={(feature, layer) => {
        const riskFeature = feature as unknown as RiskMapGeojsonFeature

        layer.on("click", () => {
          // Zoom directly to selected polygon bounds
          // eslint-disable-next-line @typescript-eslint/no-explicit-any
          const maybeBounds = (layer as any).getBounds?.()

          if (maybeBounds?.isValid?.()) {
            map.fitBounds(maybeBounds.pad(0.08), {
              animate: true,
            })
          }
        })

        layer.bindTooltip(
          buildRegionRiskTooltipHtml(riskFeature),
          {
            sticky: true,
            direction: "top",
            opacity: 1,
            className: "earthquake-tooltip !border-0 !bg-transparent !p-0 !shadow-none",
          }
        )
      }}
    />
  )
}

export default function RegionRiskChoroplethMap({
  features,
  activeRiskLevel = "all",
}: RegionRiskChoroplethMapProps) {
  return (
    <MapContainer center={[-2.5, 118]} zoom={5.2} minZoom={4.2} maxZoom={9} zoomControl className="h-full w-full">
      <TileLayer
        url={`https://api.thunderforest.com/transport/{z}/{x}/{y}{r}.png?apikey=${process.env.NEXT_PUBLIC_THUNDERFOREST_KEY}`}
        attribution='&copy; Thunderforest &copy; OpenStreetMap contributors'
        maxZoom={22}
      />

      <RegionRiskAutoLocate enabled={true} />
      <RegionRiskLayer features={features} activeRiskLevel={activeRiskLevel} />
    </MapContainer>
  )
}
