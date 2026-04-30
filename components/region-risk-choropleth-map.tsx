"use client"

import { useEffect, useMemo } from "react"
import { geoJSON as createGeoJsonLayer } from "leaflet"
import { GeoJSON, MapContainer, TileLayer, useMap } from "react-leaflet"
import type { FeatureCollection, Geometry, Feature } from "geojson"
import type { RiskMapGeojsonFeature } from "@/lib/historical-data/geojson-api"
import {
  getRiskMapGeojsonFeatureName,
  getRiskMapGeojsonFeatureRiskLevel,
  getRiskMapGeojsonFeatureRiskScore,
} from "@/lib/historical-data/geojson-api"
import "leaflet/dist/leaflet.css"

type RegionRiskChoroplethMapProps = {
  features: RiskMapGeojsonFeature[]
}

function getFillColor(feature: RiskMapGeojsonFeature): string {
  const riskLevel = getRiskMapGeojsonFeatureRiskLevel(feature)
  const riskScore = getRiskMapGeojsonFeatureRiskScore(feature)

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

  if (riskScore >= 0.58) {
    return "#ef4444"
  }

  if (riskScore >= 0.48) {
    return "#f59e0b"
  }

  return "#22c55e"
}

function RegionRiskLayer({ features }: { features: RiskMapGeojsonFeature[] }) {
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
      style={(feature) => ({
        fillColor: feature ? getFillColor(feature as unknown as RiskMapGeojsonFeature) : "#60a5fa",
        weight: 1.2,
        opacity: 1,
        color: "#ffffff",
        dashArray: "2",
        fillOpacity: 0.72,
      })}
      onEachFeature={(feature, layer) => {
        const riskFeature = feature as unknown as RiskMapGeojsonFeature
        const title = getRiskMapGeojsonFeatureName(riskFeature)
        const riskLevel = getRiskMapGeojsonFeatureRiskLevel(riskFeature)
        const riskScore = getRiskMapGeojsonFeatureRiskScore(riskFeature)

        layer.bindTooltip(
          `
            <div style="min-width: 180px;">
              <div style="font-size: 11px; font-weight: 600; letter-spacing: .04em; text-transform: uppercase; color: #2563eb; margin-bottom: 4px;">Region Risk</div>
              <div style="font-size: 14px; font-weight: 700; margin-bottom: 4px; color: #0f172a;">${title}</div>
              <div style="font-size: 12px; color: #334155;">Risk Level: ${riskLevel}</div>
              <div style="font-size: 12px; color: #334155;">Risk Score: ${riskScore ?? "-"}</div>
            </div>
          `,
          {
            sticky: true,
            direction: "top",
            opacity: 1,
            className: "region-risk-tooltip",
          }
        )
      }}
    />
  )
}

export default function RegionRiskChoroplethMap({ features }: RegionRiskChoroplethMapProps) {
  return (
    <MapContainer center={[-2.5, 118]} zoom={5.2} minZoom={4.2} maxZoom={9} zoomControl className="h-full w-full">
      <TileLayer
        url={`https://api.thunderforest.com/transport/{z}/{x}/{y}{r}.png?apikey=${process.env.NEXT_PUBLIC_THUNDERFOREST_KEY}`}
        attribution='&copy; Thunderforest &copy; OpenStreetMap contributors'
        maxZoom={22}
      />

      <RegionRiskLayer features={features} />
    </MapContainer>
  )
}