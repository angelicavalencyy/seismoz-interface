"use client"

import { useEffect, useMemo, useState } from "react"
import { HistoricalDataControls } from "@/components/table-history-region-hazard-risk/historical-controls"
import { HistoricalDataMapPanel } from "@/components/table-history-region-hazard-risk/historical-map-panel"
import { HistoricalDataTable } from "@/components/table-history-region-hazard-risk/historical-table"
import {
  createRiskMapGeoPoints,
  getRiskMapGeojsonFeatureDateKey,
  normalizeRiskMapGeojsonFeatures,
  type RiskMapGeoPoint,
} from "@/lib/historical-data/geojson-api"
import {
  getRiskMapTableRecordDateKey,
  type RiskMapPagination,
  normalizeRiskMapTableRecords,
  type RiskMapTableRecord,
} from "@/lib/historical-data/table-api"

export default function HistoricalData() {
  const [records, setRecords] = useState<RiskMapTableRecord[]>([])
  const [geojsonPoints, setGeojsonPoints] = useState<RiskMapGeoPoint[]>([])
  const [selectedPointId, setSelectedPointId] = useState<string | null>(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [selectedDate, setSelectedDate] = useState("")
  const [viewMode, setViewMode] = useState<"table" | "map">("table")
  const [rowsPerPage, setRowsPerPage] = useState(20)
  const [page, setPage] = useState(1)
  const [pagination, setPagination] = useState<RiskMapPagination | undefined>(undefined)

  useEffect(() => {
    const controller = new AbortController()
    let isActive = true

    async function loadHistoricalData() {
      try {
        setLoading(true)
        setError(null)

        const tableParams = new URLSearchParams({
          page: String(page),
          limit: String(rowsPerPage),
        })

        if (selectedDate) {
          tableParams.set("date", selectedDate)
          tableParams.set("tanggal", selectedDate)
        }

        const [tableResponse, geojsonResponse] = await Promise.all([
          fetch(`/api/risk-map/table?${tableParams.toString()}`, {
            signal: controller.signal,
            cache: "no-store",
          }),
          fetch("/api/risk-map/geojson", {
            signal: controller.signal,
            cache: "no-store",
          }),
        ])

        if (!tableResponse.ok) {
          throw new Error(`Failed to load historical table data (${tableResponse.status})`)
        }

        if (!geojsonResponse.ok) {
          throw new Error(`Failed to load historical geojson data (${geojsonResponse.status})`)
        }

        const tablePayload = await tableResponse.json()
        const geojsonPayload = await geojsonResponse.json()

        if (!isActive) {
          return
        }

        setRecords(normalizeRiskMapTableRecords(tablePayload))
        setPagination(tablePayload.pagination)
        const normalizedFeatures = normalizeRiskMapGeojsonFeatures(geojsonPayload)
        const points = createRiskMapGeoPoints(normalizedFeatures)
        setGeojsonPoints(points)
        setSelectedPointId(points[0]?.id ?? null)
      } catch (fetchError) {
        if (fetchError instanceof DOMException && fetchError.name === "AbortError") {
          return
        }

        if (!isActive) {
          return
        }

        setError("Gagal memuat data historical dari API.")
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
  }, [page, rowsPerPage, selectedDate])

  const filteredRecords = useMemo(() => {
    if (!selectedDate) {
      return records
    }

    return records.filter((record) => getRiskMapTableRecordDateKey(record) === selectedDate)
  }, [records, selectedDate])

  const filteredGeoPoints = useMemo(() => {
    if (!selectedDate) {
      return geojsonPoints
    }

    return geojsonPoints.filter((point) => getRiskMapGeojsonFeatureDateKey(point.feature) === selectedDate)
  }, [geojsonPoints, selectedDate])

  useEffect(() => {
    setPage(1)
  }, [selectedDate])

  useEffect(() => {
    if (filteredGeoPoints.length === 0) {
      setSelectedPointId(null)
      return
    }

    if (!selectedPointId || !filteredGeoPoints.some((point) => point.id === selectedPointId)) {
      setSelectedPointId(filteredGeoPoints[0].id)
    }
  }, [filteredGeoPoints, selectedPointId])

  const selectedPoint = filteredGeoPoints.find((point) => point.id === selectedPointId) ?? null
  const selectedDateLabel = selectedDate ? new Date(`${selectedDate}T00:00:00`).toLocaleDateString("id-ID") : "Semua tanggal"
  const showResetDate = Boolean(selectedDate)

  const handleRowsPerPageChange = (value: number) => {
    setRowsPerPage(value)
    setPage(1)
  }

  return (
    <div className="flex min-h-0 w-full min-w-0 flex-1 flex-col overflow-visible font-sans text-foreground">
      <div className="flex w-full flex-col gap-4">
        <HistoricalDataControls
          selectedDate={selectedDate}
          onDateChange={setSelectedDate}
          onResetDate={() => setSelectedDate("")}
          showResetDate={showResetDate}
          viewMode={viewMode}
          onViewModeChange={setViewMode}
          totalCount={pagination?.total ?? records.length}
          filteredCount={Boolean(selectedDate) ? filteredRecords.length : (pagination?.total ?? records.length)}
          selectedDateLabel={selectedDateLabel}
        />
      </div>

      <div className="mt-4 min-h-0 min-w-0 flex-1 overflow-visible relative z-0">
        {loading ? (
          <div className="flex h-full items-center justify-center rounded-2xl border border-dashed border-border bg-background p-6 text-sm text-muted-foreground">
            Memuat data historical data...
          </div>
        ) : error ? (
          <div className="rounded-2xl border border-rose-200 bg-rose-50 p-6 text-sm text-rose-700">{error}</div>
        ) : viewMode === "table" ? (
          <HistoricalDataTable
            records={filteredRecords}
            rowsPerPage={rowsPerPage}
            onRowsPerPageChange={handleRowsPerPageChange}
            page={page}
            onPageChange={setPage}
            pagination={pagination}
            serverPaginated={!Boolean(selectedDate)}
          />
        ) : (
          <HistoricalDataMapPanel
            points={filteredGeoPoints}
            selectedPoint={selectedPoint}
            selectedId={selectedPointId}
            onSelectPoint={setSelectedPointId}
          />
        )}
      </div>
    </div>
  )
}
