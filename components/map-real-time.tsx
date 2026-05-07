"use client"

import { useEffect, useMemo, useRef } from "react"
import { divIcon, type Marker as LeafletMarker } from "leaflet"
import { MapContainer, Marker, TileLayer, Tooltip, useMap, useMapEvents } from "react-leaflet"
import {
    getEarthquakeLocation,
    getEarthquakeWilayah,
    getEarthquakeMagnitude,
    getEarthquakeDepth,
    getEarthquakeTanggal,
    getEarthquakeJam,
    getEarthquakeRiskLevel,
    type EarthquakeMapPoint,
    type EarthquakeRecord,
} from "@/lib/earthquake"
import { AlertTriangle, Activity, Sparkles } from "lucide-react"
import "leaflet/dist/leaflet.css"

//
//  Badge Color
//
const getRiskBadgeClass = (level: string) => {
    switch (level.toLowerCase()) {
        case "rendah":
            return "border border-green-200 bg-green-50 text-green-700 hover:bg-green-50"
        case "sedang":
            return "border border-yellow-200 bg-yellow-50 text-yellow-700 hover:bg-yellow-50"
        case "tinggi":
            return "border border-red-200 bg-red-50 text-red-700 hover:bg-red-50"
        default:
            return "border border-gray-200 bg-gray-50 text-gray-700 hover:bg-gray-50"
    }
}

//
//  Icon (shadcn / lucide)
//
const getRiskIcon = (level: string) => {
    switch (level.toLowerCase()) {
        case "tinggi":
            return <AlertTriangle className="h-3 w-3" />
        case "sedang":
            return <Activity className="h-3 w-3" />
        default:
            return <Sparkles className="h-3 w-3" />
    }
}

//
//  Marker Icon
//
function createRiskLevelIcon(riskLevel: string, selected: boolean) {
    const tone = riskLevel === "Tinggi" ? "red" : riskLevel === "Sedang" ? "yellow" : "green"

    const haloClass =
        tone === "red"
            ? "bg-red-500/20"
            : tone === "yellow"
            ? "bg-yellow-500/20"
            : "bg-green-500/20"

    const innerClass =
        tone === "red"
            ? "bg-red-500"
            : tone === "yellow"
            ? "bg-yellow-500"
            : "bg-green-500"

    const ringClass =
        tone === "red"
            ? "border-red-400"
            : tone === "yellow"
            ? "border-yellow-400"
            : "border-green-400"

    return divIcon({
        className: "",
        html: `
            <div class="relative flex h-6 w-6 items-center justify-center">
                <span class="absolute h-10 w-10 rounded-full ${
                    selected ? haloClass : haloClass.replace("/20", "/15")
                }"></span>
                <span class="absolute h-5 w-5 rounded-full border-2 border-white ${
                    selected ? ringClass : innerClass
                } shadow-lg"></span>
                <span class="absolute h-2.5 w-2.5 rounded-full border border-white/90 ${innerClass}"></span>
            </div>
        `,
        iconSize: [24, 24],
        iconAnchor: [12, 12],
        popupAnchor: [0, -12],
    })
}

//
//  Map Sync
//
function MapSync({
    points,
    selectedPoint,
    onSelectPoint,
    onZoomChange,
}: {
    points: EarthquakeMapPoint[]
    selectedPoint: EarthquakeMapPoint | null
    onSelectPoint: (record: EarthquakeRecord) => void
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
        if (!selectedPoint) return

        const targetZoom = Math.max(map.getZoom(), 7.8)

        map.flyTo([selectedPoint.latitude, selectedPoint.longitude], targetZoom, {
            duration: 0.8,
        })

        markerRefs.current.get(selectedPoint.id)?.openTooltip()
    }, [map, selectedPoint])

    return (
        <>
            {points.map((point) => {
                const isSelected = selectedPoint?.id === point.id
                const riskLevel = getEarthquakeRiskLevel(point.record)

                return (
                    <Marker
                        key={point.id}
                        position={[point.latitude, point.longitude]}
                        icon={createRiskLevelIcon(riskLevel, isSelected)}
                        ref={(marker) => {
                            if (marker) markerRefs.current.set(point.id, marker)
                        }}
                        eventHandlers={{
                            click: () => onSelectPoint(point.record),
                        }}
                        zIndexOffset={isSelected ? 1000 : 0}
                    >
                        <Tooltip
                            direction="top"
                            offset={[0, -12]}
                            opacity={1}
                            className="earthquake-tooltip !border-0 !bg-transparent !p-0 !shadow-none"
                        >
                            <div className="w-[240px] space-y-2 rounded-xl border border-border bg-popover p-3 text-xs shadow-lg shadow-black/5">

                                {/* HEADER */}
                                <div className="flex items-center justify-between">
                                    <p className="text-[10px] font-semibold uppercase tracking-wide text-primary">
                                        Info Gempa
                                    </p>

                                    <span
                                        className={`flex items-center gap-1 rounded-full px-2 py-0.5 text-[10px] font-medium ${getRiskBadgeClass(
                                            riskLevel
                                        )}`}
                                    >
                                        {getRiskIcon(riskLevel)}
                                        Risiko Ancaman {riskLevel}
                                    </span>
                                </div>

                                {/* WILAYAH */}
                                <h4 className="text-sm font-semibold leading-snug max-w-[200px] whitespace-normal break-words text-popover-foreground">
                                    {getEarthquakeWilayah(point.record)}
                                </h4>

                                {/* DETAIL */}
                                <p className="text-sm">
                                    Magnitudo: {getEarthquakeMagnitude(point.record)} SR
                                </p>

                                <p className="text-sm">
                                    Kedalaman: {getEarthquakeDepth(point.record)}
                                </p>

                                {/* TANGGAL */}
                                <div className="rounded-lg border border-border bg-muted/40 p-2 text-[11px]">
                                    <div className="flex justify-between">
                                        <span className="text-muted-foreground">Tanggal</span>
                                        <span className="font-medium">
                                            {getEarthquakeTanggal(point.record)}
                                        </span>
                                    </div>
                                    <div className="mt-1 flex justify-between">
                                        <span className="text-muted-foreground">Waktu</span>
                                        <span className="font-medium">
                                            {getEarthquakeJam(point.record)}
                                        </span>
                                    </div>
                                </div>

                                {/* LOKASI */}
                                <div className="rounded-lg border border-dashed border-border/80 bg-background/70 p-2 text-[11px]">
                                    <div className="flex justify-between">
                                        <span className="text-muted-foreground">Lokasi</span>
                                        <span className="text-right font-medium">
                                            {getEarthquakeLocation(point.record)}
                                        </span>
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

//
// 🎯 MAIN MAP
//
export default function MapRealTime({
    earthquakes,
    selectedEarthquake,
    onSelectEarthquake,
    onZoomChange,
}: {
    earthquakes: EarthquakeMapPoint[]
    selectedEarthquake: EarthquakeRecord | null
    onSelectEarthquake: (record: EarthquakeRecord) => void
    onZoomChange: (zoom: number) => void
}) {
    const selectedPoint = useMemo(() => {
        if (!selectedEarthquake) return null
        return earthquakes.find((p) => p.record === selectedEarthquake) ?? null
    }, [earthquakes, selectedEarthquake])

    return (
        <MapContainer
            center={[-2.5, 118]}
            zoom={5.8}
            minZoom={4.5}
            maxZoom={9}
            zoomControl
            className="h-full w-full"
        >
            <TileLayer
                url={`https://api.thunderforest.com/transport/{z}/{x}/{y}{r}.png?apikey=${process.env.NEXT_PUBLIC_THUNDERFOREST_KEY}`}
                attribution="&copy; Thunderforest &copy; OpenStreetMap contributors"
                maxZoom={22}
            />

            <MapSync
                points={earthquakes}
                selectedPoint={selectedPoint}
                onSelectPoint={onSelectEarthquake}
                onZoomChange={onZoomChange}
            />
        </MapContainer>
    )
}