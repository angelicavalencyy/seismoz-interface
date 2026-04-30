"use client"

import { useEffect, useMemo, useState } from "react"
import { Search, X } from "lucide-react"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { HistoricalDataTable } from "@/components/table-history-region-hazard-risk/historical-table"
import { cn } from "@/lib/utils"
import { normalizeRiskMapGeojsonFeatures } from "@/lib/historical-data/geojson-api"
import {
  getRiskMapTableKabupatenName,
  getRiskMapTableRiskLevel,
  type RiskMapTableRecord,
} from "@/lib/historical-data/table-api"

export default function HistoricalData() {
  const [records, setRecords] = useState<RiskMapTableRecord[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [searchQuery, setSearchQuery] = useState("")
  const [selectedRiskLevel, setSelectedRiskLevel] = useState<"all" | "Tinggi" | "Sedang" | "Rendah">("all")
  const [rowsPerPage, setRowsPerPage] = useState(10)
  const [page, setPage] = useState(1)

  const riskLevelCounts = useMemo(() => {
    return records.reduce<Record<string, number>>((accumulator, record) => {
      const riskLevel = getRiskMapTableRiskLevel(record)
      accumulator[riskLevel] = (accumulator[riskLevel] ?? 0) + 1
      return accumulator
    }, {})
  }, [records])

  const filteredRecords = useMemo(() => {
    const normalizedQuery = searchQuery.trim().toLowerCase()

    return records.filter((record) => {
      const kabupatenName = getRiskMapTableKabupatenName(record).toLowerCase()
      const riskLevel = getRiskMapTableRiskLevel(record)
      const matchesSearch = !normalizedQuery || kabupatenName.includes(normalizedQuery)
      const matchesRiskLevel = selectedRiskLevel === "all" || riskLevel === selectedRiskLevel

      return matchesSearch && matchesRiskLevel
    })
  }, [records, searchQuery, selectedRiskLevel])

  useEffect(() => {
    const controller = new AbortController()
    let isActive = true

    async function loadHistoricalData() {
      try {
        setLoading(true)
        setError(null)

        const geojsonResponse = await fetch("/api/risk-map/geojson", {
          signal: controller.signal,
          cache: "no-store",
        })

        if (!geojsonResponse.ok) {
          throw new Error(`Failed to load historical geojson data (${geojsonResponse.status})`)
        }

        const geojsonPayload = await geojsonResponse.json()

        if (!isActive) {
          return
        }

        const normalizedFeatures = normalizeRiskMapGeojsonFeatures(geojsonPayload)
        const normalizedRecords = normalizedFeatures.flatMap((feature) => (feature.properties ? [feature.properties] : []))

        setRecords(normalizedRecords)
        setPage(1)
      } catch (fetchError) {
        if (fetchError instanceof DOMException && fetchError.name === "AbortError") {
          return
        }

        if (!isActive) {
          return
        }

        setError("Gagal memuat data historical geojson dari API.")
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
  }, [])

  useEffect(() => {
    setPage(1)
  }, [searchQuery, selectedRiskLevel])

  const handleRowsPerPageChange = (value: number) => {
    setRowsPerPage(value)
    setPage(1)
  }

  const activeRiskLevelLabel = selectedRiskLevel === "all" ? "Semua" : selectedRiskLevel
  const hasActiveFilters = searchQuery.trim().length > 0 || selectedRiskLevel !== "all"

  const riskLevelOptions: Array<{ value: "all" | "Tinggi" | "Sedang" | "Rendah"; label: string }> = [
    { value: "all", label: "Semua" },
    { value: "Tinggi", label: "Tinggi" },
    { value: "Sedang", label: "Sedang" },
    { value: "Rendah", label: "Rendah" },
  ]

  return (
    <div className="flex min-h-0 w-full min-w-0 flex-1 flex-col overflow-visible font-sans text-foreground">
      <div className="flex flex-col gap-4">
        <div className="flex flex-col gap-4 xl:flex-row xl:flex-wrap xl:items-end xl:justify-between">
          <div className="flex flex-col items-start gap-3">
            <label className="text-sm font-semibold tracking-wide text-foreground">Statistik</label>
            <div className="flex flex-wrap items-center gap-2 text-sm text-muted-foreground">
              <Badge variant="outline" className={cn("border border-purple-200 bg-purple-50 text-purple-700")}> 
                <span>Total Data: {records.length}</span>
              </Badge>
              {Object.entries(riskLevelCounts).map(([riskLevel, count]) => (
                <Badge key={riskLevel} variant="outline" className="border border-purple-200 bg-purple-50 text-purple-700">
                  <span>
                    {riskLevel}: {count}
                  </span>
                </Badge>
              ))}
              <Badge variant="outline" className="border border-purple-200 bg-purple-50 text-purple-700">
                <span>Hasil Filter: {filteredRecords.length}</span>
              </Badge>
            </div>
          </div>

          <div className="flex w-full flex-col gap-2 xl:max-w-md">
            <label className="text-sm font-semibold tracking-wide text-foreground">Pencarian Kabupaten / Kota</label>
            <div className="relative">
              <Search className="pointer-events-none absolute left-3 top-1/2 size-4 -translate-y-1/2 text-muted-foreground" />
              <Input
                value={searchQuery}
                onChange={(event) => setSearchQuery(event.target.value)}
                placeholder="Cari kabupaten atau kota"
                className="h-11 rounded-full border-border bg-background pl-10 pr-12 text-sm"
              />
              {searchQuery ? (
                <Button
                  type="button"
                  variant="ghost"
                  size="icon-sm"
                  onClick={() => setSearchQuery("")}
                  className="absolute right-1 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground"
                  aria-label="Hapus pencarian"
                >
                  <X className="size-4" />
                </Button>
              ) : null}
            </div>
          </div>

          <div className="flex flex-col gap-2">
            <label className="text-sm font-semibold tracking-wide text-foreground">Filter Risk Level</label>
            <div className="flex flex-wrap gap-2">
              {riskLevelOptions.map((option) => {
                const isActive = selectedRiskLevel === option.value

                return (
                  <Button
                    key={option.value}
                    type="button"
                    variant="outline"
                    onClick={() => setSelectedRiskLevel(option.value)}
                    className={cn(
                      "rounded-full px-4 py-2 text-sm font-medium transition-colors",
                      isActive
                        ? "border-primary bg-primary text-primary-foreground hover:bg-primary hover:text-primary-foreground"
                        : "border-border bg-background text-foreground hover:bg-muted"
                    )}
                  >
                    {option.label}
                  </Button>
                )
              })}
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
            records={filteredRecords}
            rowsPerPage={rowsPerPage}
            onRowsPerPageChange={handleRowsPerPageChange}
            page={page}
            onPageChange={setPage}
            emptyStateMessage={
              hasActiveFilters ? "Tidak ada data yang cocok dengan pencarian atau filter risk level." : "Tidak ada data yang tersedia."
            }
          />
        )}
      </div>
    </div>
  )
}
