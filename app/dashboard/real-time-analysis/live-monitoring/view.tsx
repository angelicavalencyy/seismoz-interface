"use client"

import { useEffect, useMemo, useState } from "react"
import MapWrapper from "@/components/map-wrapper"
import { EarthquakeCardList } from "@/components/card-detail-earthquake"
import { createEarthquakeMapPoints, getEarthquakeLocation, getEarthquakeRecordId, type EarthquakeRecord } from "@/lib/earthquake"

export default function LiveMonitoring() {
    const [earthquakes, setEarthquakes] = useState<EarthquakeRecord[]>([])
    const [loading, setLoading] = useState(true)
    const [error, setError] = useState<string | null>(null)
    const [selectedEarthquake, setSelectedEarthquake] = useState<EarthquakeRecord | null>(null)
    const [selectionToken, setSelectionToken] = useState(0)

    useEffect(() => {
        const controller = new AbortController()
        let isActive = true

        async function loadEarthquakes() {
            try {
                setLoading(true)
                setError(null)

                const response = await fetch("/api/realtime/auto", {
                    signal: controller.signal,
                    cache: "no-store",
                })

                if (!response.ok) {
                    throw new Error(`Failed to load earthquake data (${response.status})`)
                }

                const payload = (await response.json()) as { earthquakes?: EarthquakeRecord[] }

                if (!isActive) {
                    return
                }

                const records = payload.earthquakes ?? []
                setEarthquakes(records)
                setSelectedEarthquake(records[0] ?? null)
                setSelectionToken((current) => current + 1)
            } catch (error) {
                if (error instanceof DOMException && error.name === "AbortError") {
                    return
                }

                if (!isActive) {
                    return
                }

                setError("Gagal memuat data gempa dari API.")
            } finally {
                if (isActive) {
                    setLoading(false)
                }
            }
        }

        void loadEarthquakes()

        return () => {
            isActive = false
            controller.abort()
        }
    }, [])

    const selectedId = selectedEarthquake ? getEarthquakeRecordId(selectedEarthquake) : null
    const mapPoints = useMemo(() => createEarthquakeMapPoints(earthquakes), [earthquakes])

    const handleSelectEarthquake = (record: EarthquakeRecord) => {
        setSelectedEarthquake(record)
        setSelectionToken((current) => current + 1)
    }

    return (
        <div className="flex h-auto w-full flex-1 flex-col font-sans dark:border-gray-800 dark:bg-black">
            <h1 className="text-2xl font-bold text-gray-800 dark:text-gray-200">Real Time Map Analysis</h1>

            <div className="mt-4 space-y-4">
                <div className="flex h-[calc(100vh-180px)] w-full flex-row gap-4">
                    <div className="mt-4 flex w-1/3 flex-col gap-4 overflow-y-auto pr-2">
                        {loading ? (
                            <div className="rounded-2xl border border-dashed border-slate-300 bg-white/80 p-6 text-sm text-slate-500">
                                Memuat data gempa...
                            </div>
                        ) : error ? (
                            <div className="rounded-2xl border border-rose-200 bg-rose-50 p-6 text-sm text-rose-700">
                                {error}
                            </div>
                        ) : (
                            <EarthquakeCardList
                                earthquakes={earthquakes}
                                selectedId={selectedId}
                                onSelect={handleSelectEarthquake}
                            />
                        )}
                    </div>

                    <div className="mt-4 flex min-h-0 w-2/3 flex-col gap-4">
                        <div className="w-full flex-1 overflow-hidden rounded-2xl border border-slate-200 shadow-lg">
                            <MapWrapper
                                key={selectionToken}
                                earthquakes={mapPoints}
                                selectedEarthquake={selectedEarthquake}
                                onSelectEarthquake={handleSelectEarthquake}
                                onZoomChange={() => undefined}
                            />
                        </div>
                    </div>
                </div>
            </div>
        </div>
    )
}