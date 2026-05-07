"use client"

import { useEffect, useMemo, useState } from "react"
import { X } from "lucide-react"
import MapWrapper from "@/components/map-wrapper"
import { EarthquakeCardList } from "@/components/card-detail-earthquake"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { Tabs, TabsList, TabsTrigger } from "@/components/ui/tabs"
import {
    createEarthquakeMapPoints,
    getEarthquakeRecordId,
    getEarthquakeRiskLevel,
    type EarthquakeRecord,
} from "@/lib/earthquake"
import { cn } from "@/lib/utils"

export default function LiveMonitoring() {
    const [earthquakes, setEarthquakes] = useState<EarthquakeRecord[]>([])
    const [loading, setLoading] = useState(true)
    const [error, setError] = useState<string | null>(null)
    const [selectedEarthquake, setSelectedEarthquake] = useState<EarthquakeRecord | null>(null)
    const [selectionToken, setSelectionToken] = useState(0)
    const [riskLevelFilter, setRiskLevelFilter] = useState<"all" | "Rendah" | "Sedang" | "Tinggi">("all")

    const riskLevelOptions: Array<{ value: "all" | "Rendah" | "Sedang" | "Tinggi"; label: string }> = [
        { value: "all", label: "Semua" },
        { value: "Rendah", label: "Rendah" },
        { value: "Sedang", label: "Sedang" },
        { value: "Tinggi", label: "Tinggi" },
    ]

    const riskLevelBadgeClassName = (level: "Rendah" | "Sedang" | "Tinggi") => {
        switch (level) {
            case "Rendah":
                return "border border-green-200 bg-green-50 text-green-700 hover:bg-green-50"
            case "Sedang":
                return "border border-yellow-200 bg-yellow-50 text-yellow-700 hover:bg-yellow-50"
            case "Tinggi":
                return "border border-red-200 bg-red-50 text-red-700 hover:bg-red-50"
        }
    }

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
    const riskLevelCounts = useMemo(() => {
        return earthquakes.reduce<Record<string, number>>((accumulator, record) => {
            const riskLevel = getEarthquakeRiskLevel(record)
            accumulator[riskLevel] = (accumulator[riskLevel] ?? 0) + 1
            return accumulator
        }, {})
    }, [earthquakes])

    const filteredEarthquakes = useMemo(() => {
        if (riskLevelFilter === "all") {
            return earthquakes
        }

        return earthquakes.filter((record) => getEarthquakeRiskLevel(record) === riskLevelFilter)
    }, [earthquakes, riskLevelFilter])

    const mapPoints = useMemo(() => createEarthquakeMapPoints(filteredEarthquakes), [filteredEarthquakes])

    useEffect(() => {
        if (filteredEarthquakes.length === 0) {
            if (selectedEarthquake !== null) {
                setSelectedEarthquake(null)
                setSelectionToken((current) => current + 1)
            }

            return
        }

        if (!selectedEarthquake || !filteredEarthquakes.includes(selectedEarthquake)) {
            setSelectedEarthquake(filteredEarthquakes[0])
            setSelectionToken((current) => current + 1)
        }
    }, [filteredEarthquakes, selectedEarthquake])

    const handleSelectEarthquake = (record: EarthquakeRecord) => {
        setSelectedEarthquake(record)
        setSelectionToken((current) => current + 1)
    }

    const hasActiveFilter = riskLevelFilter !== "all"
    const filteredCount = filteredEarthquakes.length

    return (
        <div className="flex h-auto w-full flex-1 flex-col font-sans dark:border-gray-800 dark:bg-black">
            <div className="flex flex-col gap-4 pb-2">
              <h1 className="text-2xl font-bold text-foreground">Pantauan Gempa Terkini</h1>
              {/* <p className="text-sm text-muted-foreground">Peta kerawanan wilayah menggunakan choropleth berdasarkan level dan skor risiko.</p> */}
            </div>
            <div className="flex flex-col items-start gap-3 text-sm text-muted-foreground">
                <label className="text-sm font-semibold tracking-wide text-foreground">Statistik</label>
                <div className="flex flex-wrap items-center gap-2 text-sm text-muted-foreground">
                    <Badge variant="outline" className="border border-blue-200 bg-blue-50 text-blue-700">
                        <span>Total Gempa: {earthquakes.length}</span>
                    </Badge>
                    <Badge variant="outline" className="border border-blue-200 bg-blue-50 text-blue-700">
                        <span>Hasil Filter: {filteredCount}</span>
                    </Badge>
                </div>
            </div>
            <div className="mt-3 flex flex-col gap-3">
                <div className="flex flex-col gap-2 lg:flex-col lg:items-start lg:justify-start">
                    <div className="flex flex-col gap-2">
                        <label className="text-sm font-semibold tracking-wide text-foreground">Filter Gempa Berdasarkan Risiko</label>
                        <Tabs defaultValue="all" value={riskLevelFilter} onValueChange={(value) => setRiskLevelFilter(value as "all" | "Rendah" | "Sedang" | "Tinggi")}>
                            <TabsList className="w-fit">
                                {riskLevelOptions.map((option) => (
                                    <TabsTrigger key={option.value} value={option.value}>
                                        {option.label}
                                        {option.value !== "all" && riskLevelCounts[option.value] !== undefined && (
                                            <Badge
                                                variant="outline"
                                                className={cn("ml-2 h-5 rounded-full px-2 text-[10px]", riskLevelBadgeClassName(option.value))}
                                            >
                                                {riskLevelCounts[option.value] ?? 0}
                                            </Badge>
                                        )}
                                    </TabsTrigger>
                                ))}
                            </TabsList>
                        </Tabs>
                    </div>
                </div>

                {hasActiveFilter ? (
                    <div className="flex flex-wrap items-center gap-2 text-sm text-muted-foreground">
                        <Badge variant="outline" className="border border-slate-200 bg-slate-50 text-slate-700">
                            <span>Risk Level: {riskLevelFilter}</span>
                        </Badge>
                        <Button
                            type="button"
                            variant="ghost"
                            className="h-8 gap-2 text-muted-foreground hover:text-foreground"
                            onClick={() => setRiskLevelFilter("all")}
                        >
                            <X className="size-4" />
                            Reset filter
                        </Button>
                    </div>
                ) : null}
            </div>

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
                        ) : filteredEarthquakes.length === 0 ? (
                            <div className="rounded-2xl border border-dashed border-slate-300 bg-white/80 p-6 text-sm text-slate-500">
                                Tidak ada data gempa untuk filter yang dipilih.
                            </div>
                        ) : (
                            <EarthquakeCardList
                                earthquakes={filteredEarthquakes}
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