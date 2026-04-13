"use client"

import { useEffect, useMemo, useRef } from "react"
import { divIcon, type Marker as LeafletMarker } from "leaflet"
import { MapContainer, Marker, TileLayer, Tooltip, useMap, useMapEvents } from "react-leaflet"
import { getEarthquakeLocation, type EarthquakeMapPoint, type EarthquakeRecord } from "@/lib/earthquake"
import "leaflet/dist/leaflet.css"

function createPurpleIcon(selected: boolean) {
    return divIcon({
        className: "",
        html: `
      <div class="relative flex h-6 w-6 items-center justify-center">
        <span class="absolute h-10 w-10 rounded-full ${selected ? "bg-purple-500/20" : "bg-purple-500/15"}"></span>
        <span class="absolute h-4 w-4 rounded-full border-2 border-white ${selected ? "bg-purple-700" : "bg-purple-500"} shadow-lg"></span>
      </div>
    `,
        iconSize: [24, 24],
        iconAnchor: [12, 12],
        popupAnchor: [0, -12],
    })
}

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
        if (!selectedPoint) {
            return
        }

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

                return (
                    <Marker
                        key={point.id}
                        position={[point.latitude, point.longitude]}
                        icon={createPurpleIcon(isSelected)}
                        ref={(marker) => {
                            if (marker) {
                                markerRefs.current.set(point.id, marker)
                            }
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
                            <div className="w-[240px] max-w-[240px] space-y-2 rounded-xl border border-border bg-popover p-3 text-xs text-popover-foreground shadow-lg shadow-black/5">
                                <div className="flex items-start justify-between gap-2">
                                    <div className="flex flex-grow items-center justify-between">
                                        <p className="text-[10px] font-medium uppercase tracking-wide text-primary">Info Gempa</p>
                                        <span className="shrink-0 rounded-full bg-primary/10 px-2.5 py-0.5 text-[10px] font-medium text-primary">
                                            Risiko Ancaman {point.record.risk_level ?? "Rendah"}
                                        </span>
                                    </div>
                                </div>
                                <h4 className="max-w-[200px] whitespace-normal break-words text-sm font-semibold leading-snug text-popover-foreground">
                                    {point.record.Wilayah}
                                </h4>

                                <h4 className="line-clamp-2 break-words text-sm font-medium leading-snug text-popover-foreground">
                                    Magnitudo: {point.record.Magnitude} SR
                                </h4>
                                <h4 className="line-clamp-2 break-words text-sm font-medium leading-snug text-popover-foreground">
                                    Kedalaman: {point.record.Magnitude} km
                                </h4>

                                <div className="rounded-lg border border-border bg-muted/40 p-2.5 text-[11px]">
                                    <div className="flex items-start justify-between gap-3">
                                        <span className="text-muted-foreground">Tanggal</span>
                                        <span className="max-w-[140px] text-right font-medium leading-tight text-popover-foreground">{point.record.Tanggal}</span>
                                    </div>
                                    <div className="mt-1 flex items-start justify-between gap-3">
                                        <span className="text-muted-foreground">Waktu</span>
                                        <span className="max-w-[140px] text-right font-medium leading-tight text-popover-foreground">{point.record.Jam}</span>
                                    </div>
                                </div>

                                <div className="rounded-lg border border-dashed border-border/80 bg-background/70 p-2.5 text-[11px]">
                                    <div className="flex items-start justify-between gap-3">
                                        <span className="text-muted-foreground">Lokasi</span>
                                        <span className="max-w-[140px] break-words text-right font-medium leading-tight text-popover-foreground">
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
        if (!selectedEarthquake) {
            return null
        }

        return earthquakes.find((point) => point.record === selectedEarthquake) ?? null
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
                attribution='&copy; Thunderforest &copy; OpenStreetMap contributors'
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
