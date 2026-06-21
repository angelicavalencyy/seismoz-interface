"use client"

import { useEffect, useMemo, useState } from "react"
import dynamic from "next/dynamic"
import { Badge } from "@/components/ui/badge"
import { Tabs, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { normalizeRiskMapGeojsonFeatures, type RiskMapGeojsonFeature } from "@/lib/historical-data/geojson-api"
import { getRiskMapGeojsonFeatureRiskLevel, getRiskMapGeojsonFeatureRiskScore } from "@/lib/historical-data/geojson-api"
import { cn } from "@/lib/utils"

const RegionRiskChoroplethMap = dynamic(() => import("@/components/region-risk-choropleth-map"), {
    ssr: false,
    loading: () => <div className="flex h-full w-full items-center justify-center text-sm text-muted-foreground">Memuat peta...</div>,
})

type RiskLevelFilter = "all" | "Rendah" | "Sedang" | "Tinggi" | "Ekstrem"
type RiskLevel = Exclude<RiskLevelFilter, "all">

export default function RegionRiskMap() {
    const [features, setFeatures] = useState<RiskMapGeojsonFeature[]>([])
    const [loading, setLoading] = useState(true)
    const [error, setError] = useState<string | null>(null)
    const [selectedRiskLevel, setSelectedRiskLevel] = useState<RiskLevelFilter>("all")

    const riskLevelOptions: Array<{ value: RiskLevelFilter; label: string }> = [
        { value: "all", label: "Semua" },
        { value: "Rendah", label: "Rendah" },
        { value: "Sedang", label: "Sedang" },
        { value: "Tinggi", label: "Tinggi" },
        { value: "Ekstrem", label: "Ekstrem" },
    ]

    const riskLevelBadgeClassName = (level: RiskLevel) => {
        switch (level) {
            case "Rendah":
                return "border border-green-200 bg-green-50 text-green-700 hover:bg-green-50"
            case "Sedang":
                return "border border-yellow-200 bg-yellow-50 text-yellow-700 hover:bg-yellow-50"
            case "Tinggi":
                return "border border-red-200 bg-red-50 text-red-700 hover:bg-red-50"
            case "Ekstrem":
                return "border border-red-600 bg-red-600 text-white hover:bg-red-700"
        }
    }

    useEffect(() => {
        const controller = new AbortController()
        let isActive = true

        async function loadRegionRiskGeojson() {
            try {
                setLoading(true)
                setError(null)

                const response = await fetch("/api/risk-map/geojson", {
                    signal: controller.signal,
                    cache: "no-store",
                })

                if (!response.ok) {
                    throw new Error(`Failed to load region risk geojson (${response.status})`)
                }

                const payload = await response.json()

                if (!isActive) {
                    return
                }

                setFeatures(normalizeRiskMapGeojsonFeatures(payload))
            } catch (fetchError) {
                if (fetchError instanceof DOMException && fetchError.name === "AbortError") {
                    return
                }

                if (!isActive) {
                    return
                }

                setError("Gagal memuat geojson region-risk dari API.")
            } finally {
                if (isActive) {
                    setLoading(false)
                }
            }
        }

        void loadRegionRiskGeojson()

        return () => {
            isActive = false
            controller.abort()
        }
    }, [])

    const riskLevelCounts = useMemo(() => {
        return features.reduce<Record<string, number>>((accumulator, feature) => {
            const riskLevel = getRiskMapGeojsonFeatureRiskLevel(feature)
            accumulator[riskLevel] = (accumulator[riskLevel] ?? 0) + 1
            return accumulator
        }, {})
    }, [features])

    const filteredFeatures = useMemo(() => {
        if (selectedRiskLevel === "all") {
            return features
        }

        return features.filter((feature) => getRiskMapGeojsonFeatureRiskLevel(feature) === selectedRiskLevel)
    }, [features, selectedRiskLevel])

    const riskScoreSummary = useMemo(() => {
        const scores = features
            .map((feature) => getRiskMapGeojsonFeatureRiskScore(feature))
            .filter((value): value is number => typeof value === "number")

        if (scores.length === 0) {
            return null
        }

        const maxScore = Math.max(...scores)
        const avgScore = scores.reduce((sum, score) => sum + score, 0) / scores.length

        return { maxScore, avgScore }
    }, [features])

    return (
        <div className="flex min-h-0 w-full min-w-0 flex-1 flex-col gap-4 font-sans text-foreground">
            <div className="flex flex-col gap-2">
                <h1 className="text-2xl font-bold text-foreground">Peta Kerawanan Wilayah</h1>
                {/* <p className="text-sm text-muted-foreground">Peta kerawanan wilayah menggunakan choropleth berdasarkan level dan skor risiko.</p> */}
            </div>

            <div className="flex flex-col gap-4  ">
                <label className="text-sm font-semibold tracking-wide text-foreground">Statistik</label>
                <div className="flex flex-wrap items-center gap-2 text-sm text-muted-foreground">
                    <Badge variant="outline" className="border border-blue-200 bg-blue-50 text-blue-700">
                        <span>Total Wilayah: {features.length}</span>
                    </Badge>
                    <Badge variant="outline" className="border border-blue-200 bg-blue-50 text-blue-700">
                        <span>Hasil Filter: {filteredFeatures.length}</span>
                    </Badge>
                </div>
                <div className="  flex flex-wrap items-center gap-2 text-sm text-muted-foreground">
                    {Object.entries(riskLevelCounts).map(([riskLevel, count]) => (
                        <Badge key={riskLevel} variant="outline" className="border border-blue-200 bg-blue-50 text-blue-700">
                            <span>
                                {riskLevel}: {count}
                            </span>
                        </Badge>
                    ))}
                    {riskScoreSummary ? (
                        <Badge variant="outline" className="border border-blue-200 bg-blue-50 text-blue-700">
                            <span>Skor Rata-rata: {riskScoreSummary.avgScore.toFixed(3)}</span>
                        </Badge>
                    ) : null}
                </div>
            </div>

            <div className="   flex flex-col gap-2">
                <label className="text-sm font-semibold tracking-wide text-foreground">Filter Risk Level</label>
                <Tabs defaultValue="all" value={selectedRiskLevel} onValueChange={(value) => setSelectedRiskLevel(value as RiskLevelFilter)}>
                    <TabsList className="h-auto w-full flex-nowrap overflow-x-auto justify-start gap-1 sm:w-fit pb-1">
                        {riskLevelOptions.map((option) => (
                            <TabsTrigger key={option.value} value={option.value} className="min-w-0 flex-1 sm:flex-none">
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

            <div className="relative z-0 grid min-h-0 flex-1 gap-4 xl:grid-cols-[minmax(0,1fr)_280px]">
                <div className="min-h-[56vh] overflow-hidden rounded-2xl border border-border bg-card shadow-sm sm:min-h-[68vh]">
                    {loading ? (
                        <div className="flex h-full items-center justify-center p-6 text-sm text-muted-foreground">Memuat peta region-risk...</div>
                    ) : error ? (
                        <div className="flex h-full items-center justify-center p-6 text-sm text-rose-700">{error}</div>
                    ) : (
                        <RegionRiskChoroplethMap features={features} activeRiskLevel={selectedRiskLevel} />
                    )}
                </div>

                <div className="flex flex-col gap-3 rounded-2xl border border-border bg-card p-4 shadow-sm">
                    <div>
                        <h2 className="text-sm font-semibold text-foreground">Legenda</h2>
                        <p className="text-xs text-muted-foreground">Skema warna choropleth</p>
                    </div>

                    <div className="space-y-2 text-sm text-foreground">
                        <div className="flex items-center gap-2 rounded-xl border border-green-200 bg-green-50 px-3 py-2 text-green-700">
                            <span className="h-3 w-3 rounded-full bg-green-500" />
                            Rendah
                        </div>
                        <div className="flex items-center gap-2 rounded-xl border border-yellow-200 bg-yellow-50 px-3 py-2 text-yellow-700">
                            <span className="h-3 w-3 rounded-full bg-yellow-500" />
                            Sedang
                        </div>
                        <div className="flex items-center gap-2 rounded-xl border border-red-200 bg-red-50 px-3 py-2 text-red-700">
                            <span className="h-3 w-3 rounded-full bg-red-500" />
                            Tinggi
                        </div>
                        <div className="flex items-center gap-2 rounded-xl border border-red-600 bg-red-600 px-3 py-2 text-white">
                            <span className="h-3 w-3 rounded-full bg-red-800 ring-1 ring-red-300/70" />
                            Ekstrem
                        </div>
                    </div>

                    <div className="mt-2 rounded-xl border border-dashed border-border bg-muted/30 p-3 text-xs text-muted-foreground">
                        Arahkan kursor ke wilayah untuk melihat nama, level risiko, dan skor risikonya.
                    </div>

                    {riskScoreSummary ? (
                        <div className="rounded-xl border border-border bg-background p-3 text-sm text-foreground">
                            <div className="font-medium">Ringkasan Skor</div>
                            <div className="mt-1 text-sm text-muted-foreground">Rata-rata: {riskScoreSummary.avgScore.toFixed(3)}</div>
                            <div className="text-sm text-muted-foreground">Tertinggi: {riskScoreSummary.maxScore.toFixed(3)}</div>
                        </div>
                    ) : null}
                </div>
            </div>
        </div>
    )
}
