"use client"

import { useEffect, useMemo, useState } from "react"
import { Search, X } from "lucide-react"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Tabs, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { HistoricalDataTable } from "@/components/table-history-region-hazard-risk/historical-table"
import { cn } from "@/lib/utils"
import {
  getRiskMapTableKabupatenName,
  getRiskMapTableRiskLevel,
  type RiskMapPagination,
  type RiskMapTableRecord,
} from "@/lib/historical-data/table-api"

type RiskLevelFilter = "all" | "Rendah" | "Sedang" | "Tinggi" | "Ekstrem"
type RiskLevel = Exclude<RiskLevelFilter, "all">

export default function HistoricalData() {
  const [records, setRecords] = useState<RiskMapTableRecord[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [searchQuery, setSearchQuery] = useState("")
  const [selectedRiskLevel, setSelectedRiskLevel] = useState<RiskLevelFilter>("all")
  const [rowsPerPage, setRowsPerPage] = useState(20)
  const [page, setPage] = useState(1)
  const [pagination, setPagination] = useState<RiskMapPagination | undefined>(undefined)

  const [globalRiskLevelCounts, setGlobalRiskLevelCounts] = useState<Record<string, number>>({})
  const [globalTotal, setGlobalTotal] = useState<number>(0)
  const [globalFeatures, setGlobalFeatures] = useState<any[]>([])
  const [isAutocompleteOpen, setIsAutocompleteOpen] = useState(false)

  useEffect(() => {
    async function loadGlobalStats() {
      try {
        const response = await fetch("/api/risk-map/geojson", { cache: "no-store" })
        if (!response.ok) return
        const payload = await response.json()
        const features: any[] = payload.features || []

        setGlobalTotal(features.length)
        setGlobalFeatures(features)

        const counts = features.reduce((acc: Record<string, number>, feature: any) => {
          const riskLevel = feature.properties?.risk_level || "Rendah"
          acc[riskLevel] = (acc[riskLevel] ?? 0) + 1
          return acc
        }, {} as Record<string, number>)

        setGlobalRiskLevelCounts(counts)
      } catch (e) {
        console.error("Failed to load global stats", e)
      }
    }
    loadGlobalStats()
  }, [])

  const isLocalSearch = searchQuery.trim().length > 0

  const displayRecords = useMemo(() => {
    if (isLocalSearch) {
      const normalizedQuery = searchQuery.trim().toLowerCase()
      return globalFeatures
        .map((f) => f.properties as RiskMapTableRecord)
        .filter(Boolean)
        .filter((record) => {
          const kabupatenName = getRiskMapTableKabupatenName(record).toLowerCase()
          const riskLevel = getRiskMapTableRiskLevel(record)
          const matchesSearch = kabupatenName.includes(normalizedQuery)
          const matchesRiskLevel = selectedRiskLevel === "all" || riskLevel === selectedRiskLevel

          return matchesSearch && matchesRiskLevel
        })
    }

    return records.filter((record) => {
      const riskLevel = getRiskMapTableRiskLevel(record)
      return selectedRiskLevel === "all" || riskLevel === selectedRiskLevel
    })
  }, [globalFeatures, isLocalSearch, records, searchQuery, selectedRiskLevel])

  const regionNames = useMemo(() => {
    const names = new Set<string>()
    globalFeatures.forEach((f) => {
      const name = f.properties?.nama_kabupaten || f.properties?.Nama_Kabupaten || f.properties?.id_kabupaten
      if (name) {
        names.add(name)
      }
    })
    return Array.from(names).sort()
  }, [globalFeatures])

  const searchSuggestions = useMemo(() => {
    if (!searchQuery.trim()) return []
    const lowerQuery = searchQuery.trim().toLowerCase()
    return regionNames.filter((name) => name.toLowerCase().includes(lowerQuery)).slice(0, 10)
  }, [regionNames, searchQuery])

  useEffect(() => {
    const controller = new AbortController()
    let isActive = true

    async function loadHistoricalData() {
      try {
        setLoading(true)
        setError(null)

        const params = new URLSearchParams({
          page: String(page),
          limit: String(rowsPerPage),
        })

        if (searchQuery.trim()) {
          params.set("search", searchQuery.trim())
          params.set("wilayah", searchQuery.trim())
        }

        if (selectedRiskLevel !== "all") {
          params.set("risk_level", selectedRiskLevel)
        }

        const response = await fetch(`/api/risk-map/table?${params.toString()}`, {
          signal: controller.signal,
        })

        if (!response.ok) {
          throw new Error(`Failed to load risk map table data (${response.status})`)
        }

        const payload = (await response.json()) as { records?: RiskMapTableRecord[]; pagination?: RiskMapPagination }

        if (!isActive) {
          return
        }

        setRecords(payload.records ?? [])
        setPagination(payload.pagination)
      } catch (fetchError) {
        if (fetchError instanceof DOMException && fetchError.name === "AbortError") {
          return
        }

        if (!isActive) {
          return
        }

        setError("Gagal memuat data statistik risiko dari API.")
      } finally {
        if (isActive) {
          setLoading(false)
        }
      }
    }

    void loadHistoricalData()

    return () => {
      isActive = false
      controller.abort()
    }
  }, [page, rowsPerPage, searchQuery, selectedRiskLevel])

  useEffect(() => {
    setPage(1)
  }, [searchQuery, selectedRiskLevel])

  const handleRowsPerPageChange = (value: number) => {
    setRowsPerPage(value)
    setPage(1)
  }

  const activeRiskLevelLabel = selectedRiskLevel === "all" ? "Semua" : selectedRiskLevel
  const hasActiveFilters = searchQuery.trim().length > 0 || selectedRiskLevel !== "all"

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

  return (
    <div className="flex min-h-0 w-full min-w-0 flex-1 flex-col overflow-visible font-sans text-foreground">
      <div className="flex flex-col gap-4">
        <div className="flex flex-col xl:flex-row xl:flex-wrap xl:items-end xl:justify-start xl:gap-0">
          <div className="flex flex-col items-start gap-3">
            <div className="flex flex-col gap-2">
              <h1 className="text-2xl font-bold text-foreground">Data Pemetaan Wilayah Risiko Ancaman Gempa</h1>
              {/* <p className="text-sm text-muted-foreground">Peta kerawanan wilayah menggunakan choropleth berdasarkan level dan skor risiko.</p> */}
            </div>
            <label className="text-sm font-semibold tracking-wide text-foreground">Statistik Historis Gempa November 2001 - Februari 2026</label>
            <div className="flex flex-wrap items-center gap-2 text-sm text-muted-foreground">
              <Badge variant="outline" className={cn("border border-blue-200 bg-blue-50 text-blue-700")}>
                <span>Total Data: {pagination?.total ?? globalTotal}</span>
              </Badge>
            </div>
            <div className="flex flex-col gap-2">
              <label className="text-sm font-semibold tracking-wide text-foreground">Filter Risk Level</label>
              <Tabs defaultValue="all" value={selectedRiskLevel} onValueChange={(value) => setSelectedRiskLevel(value as RiskLevelFilter)}>
                <TabsList className="h-auto w-full flex-nowrap overflow-x-auto justify-start gap-1 sm:w-fit pb-1">
                  {riskLevelOptions.map((option) => (
                    <TabsTrigger key={option.value} value={option.value} className="min-w-0 flex-1 sm:flex-none">
                      {option.label}
                      {option.value !== "all" && globalRiskLevelCounts[option.value] !== undefined && (
                        <Badge
                          variant="outline"
                          className={cn("ml-2 h-5 rounded-full px-2 text-[10px]", riskLevelBadgeClassName(option.value))}
                        >
                          {globalRiskLevelCounts[option.value] ?? 0}
                        </Badge>
                      )}
                    </TabsTrigger>
                  ))}
                </TabsList>
              </Tabs>
            </div>
          </div>

          <div className="flex w-full flex-col gap-2 xl:max-w-md">
            <label className="text-sm font-semibold tracking-wide text-foreground">Pencarian Kabupaten / Kota</label>
            <div className="relative">
              <Search className="pointer-events-none absolute left-3 top-1/2 size-4 -translate-y-1/2 text-muted-foreground" />
              <Input
                value={searchQuery}
                onChange={(event) => {
                  setSearchQuery(event.target.value)
                  setIsAutocompleteOpen(true)
                }}
                onFocus={() => setIsAutocompleteOpen(true)}
                onBlur={() => {
                  setTimeout(() => setIsAutocompleteOpen(false), 200)
                }}
                placeholder="Cari kabupaten atau kota"
                className="h-10 rounded-md border-border bg-background pl-10 pr-12 text-sm"
              />
              {searchQuery ? (
                <Button
                  type="button"
                  variant="ghost"
                  size="icon-sm"
                  onClick={() => {
                    setSearchQuery("")
                    setIsAutocompleteOpen(false)
                  }}
                  className="absolute right-1 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground"
                  aria-label="Hapus pencarian"
                >
                  <X className="size-4" />
                </Button>
              ) : null}

              {isAutocompleteOpen && searchSuggestions.length > 0 && (
                <div className="absolute top-[calc(100%+4px)] left-0 z-50 max-h-60 w-full overflow-y-auto rounded-md border border-border bg-popover text-popover-foreground shadow-md">
                  <ul className="flex flex-col py-1">
                    {searchSuggestions.map((suggestion) => (
                      <li
                        key={suggestion}
                        className="cursor-pointer px-3 py-2 text-sm hover:bg-muted"
                        onMouseDown={(e) => {
                          // Gunakan onMouseDown sebagai ganti onClick karena onBlur input akan berjalan lebih dulu.
                          e.preventDefault()
                          setSearchQuery(suggestion)
                          setIsAutocompleteOpen(false)
                        }}
                      >
                        {suggestion}
                      </li>
                    ))}
                  </ul>
                </div>
              )}
            </div>
          </div>

        </div>

        {hasActiveFilters ? (
          <div className="flex flex-wrap items-center gap-2 text-sm text-muted-foreground">
            <Badge variant="outline" className="border border-slate-200 bg-slate-50 text-slate-700">
              <span>Pencarian: {searchQuery.trim() || "-"}</span>
            </Badge>
            <Badge variant="outline" className="border border-slate-200 bg-slate-50 text-slate-700">
              <span>Risk Level: {activeRiskLevelLabel}</span>
            </Badge>
          </div>
        ) : null}
      </div>

      <div className="mt-4 min-h-0 min-w-0 flex-1 overflow-visible">
        {loading ? (
          <div className="flex h-full items-center justify-center rounded-2xl border border-dashed border-border bg-background p-6 text-sm text-muted-foreground">
            Memuat data historical risiko...
          </div>
        ) : error ? (
          <div className="rounded-2xl border border-rose-200 bg-rose-50 p-6 text-sm text-rose-700">{error}</div>
        ) : (
          <HistoricalDataTable
            records={displayRecords}
            rowsPerPage={rowsPerPage}
            onRowsPerPageChange={handleRowsPerPageChange}
            page={page}
            onPageChange={setPage}
            pagination={isLocalSearch ? undefined : pagination}
            serverPaginated={!isLocalSearch}
            emptyStateMessage={
              hasActiveFilters ? "Tidak ada data yang cocok dengan pencarian atau filter risk level." : "Tidak ada data yang tersedia."
            }
          />
        )}
      </div>
    </div>
  )
}
