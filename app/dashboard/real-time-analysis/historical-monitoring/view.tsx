"use client"

import { useEffect, useMemo, useState } from "react"
import type { EarthquakeRecord } from "../../../../lib/earthquake"
import { createEarthquakeMapPoints, getEarthquakeRecordId, getEarthquakeRiskLevel } from "../../../../lib/earthquake"
import { HistoricalControls } from "../../../../components/table-history-analysis-real-time/historical-controls"
import type { RiskLevelFilter } from "../../../../components/table-history-analysis-real-time/historical-controls"
import { HistoricalMapPanel } from "../../../../components/table-history-analysis-real-time/historical-map-panel"
import { HistoricalTable } from "../../../../components/table-history-analysis-real-time/historical-table"
import { getRecordDateKey } from "../../../../lib/historical-monitoring/utils"
import type { RiskMapPagination } from "@/lib/historical-data/table-api"

type ViewMode = "table" | "map"

export default function HistoricalMonitoring() {
  const [records, setRecords] = useState<EarthquakeRecord[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [selectedDate, setSelectedDate] = useState("")
  const [viewMode, setViewMode] = useState<ViewMode>("table")
  const [selectedEarthquake, setSelectedEarthquake] = useState<EarthquakeRecord | null>(null)
  const [selectionToken, setSelectionToken] = useState(0)
  const [rowsPerPage, setRowsPerPage] = useState(20)
  const [page, setPage] = useState(1)
  const [riskLevelFilter, setRiskLevelFilter] = useState<RiskLevelFilter>("all")
  const [pagination, setPagination] = useState<RiskMapPagination | undefined>(undefined)

  useEffect(() => {
    const controller = new AbortController()
    let isActive = true

    async function loadHistory() {
      try {
        setLoading(true)
        setError(null)

        const params = new URLSearchParams({
          page: String(page),
          limit: String(rowsPerPage),
        })

        if (selectedDate) {
          params.set("date", selectedDate)
          params.set("tanggal", selectedDate)
        }

        if (riskLevelFilter !== "all") {
          params.set("risk_level", riskLevelFilter)
        }

        const response = await fetch(`/api/realtime/history?${params.toString()}`, {
          signal: controller.signal,
          cache: "no-store",
        })

        if (!response.ok) {
          throw new Error(`Failed to load historical data (${response.status})`)
        }

        const payload = (await response.json()) as { earthquakes?: EarthquakeRecord[]; pagination?: RiskMapPagination }

        if (!isActive) {
          return
        }

        const nextRecords = payload.earthquakes ?? []
        setRecords(nextRecords)
        setPagination(payload.pagination)
        setSelectedEarthquake(nextRecords[0] ?? null)
        setSelectionToken((current) => current + 1)
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

    void loadHistory()

    return () => {
      isActive = false
      controller.abort()
    }
  }, [page, rowsPerPage, selectedDate, riskLevelFilter])

  const filteredRecords = useMemo(() => {
    let result = records

    // Filter by date
    if (selectedDate) {
      result = result.filter((record) => getRecordDateKey(record) === selectedDate)
    }

    // Filter by risk level
    if (riskLevelFilter !== "all") {
      result = result.filter((record) => getEarthquakeRiskLevel(record) === riskLevelFilter)
    }

    return result
  }, [records, selectedDate, riskLevelFilter])

  useEffect(() => {
    setPage(1)
  }, [selectedDate, riskLevelFilter])

  useEffect(() => {
    if (filteredRecords.length === 0) {
      if (selectedEarthquake !== null) {
        setSelectedEarthquake(null)
        setSelectionToken((current) => current + 1)
      }

      return
    }

    const selectedId = selectedEarthquake ? getEarthquakeRecordId(selectedEarthquake) : null
    const selectedStillVisible = selectedId
      ? filteredRecords.some((record) => getEarthquakeRecordId(record) === selectedId)
      : false

    if (!selectedStillVisible) {
      setSelectedEarthquake(filteredRecords[0])
      setSelectionToken((current) => current + 1)
    }
  }, [filteredRecords, selectedEarthquake])

  const selectedId = selectedEarthquake ? getEarthquakeRecordId(selectedEarthquake) : null
  const mapPoints = useMemo(() => createEarthquakeMapPoints(filteredRecords), [filteredRecords])
  const selectedDateLabel = selectedDate ? new Date(`${selectedDate}T00:00:00`).toLocaleDateString("id-ID") : "Semua tanggal"

  const showResetDate = Boolean(selectedDate)

  const handleSelectEarthquake = (record: EarthquakeRecord) => {
    setSelectedEarthquake(record)
    setSelectionToken((current) => current + 1)
  }

  const handleRowsPerPageChange = (value: number) => {
    setRowsPerPage(value)
    setPage(1)
  }

  return (
    <div className="flex min-h-0 w-full min-w-0 flex-1 flex-col overflow-visible font-sans text-foreground">
      <div className="flex w-full flex-col gap-4">
        <div className="flex flex-col gap-5">
          <HistoricalControls
            selectedDate={selectedDate}
            onDateChange={setSelectedDate}
            onResetDate={() => setSelectedDate("")}
            showResetDate={showResetDate}
            viewMode={viewMode}
            onViewModeChange={setViewMode}
            totalCount={pagination?.total ?? records.length}
            filteredCount={filteredRecords.length}
            selectedDateLabel={selectedDateLabel}
            riskLevelFilter={riskLevelFilter}
            onRiskLevelFilterChange={setRiskLevelFilter}
          />
        </div>
      </div>

      <div className="mt-4 min-h-0 min-w-0 flex-1 overflow-visible relative z-0">
        {loading ? (
          <div className="flex h-full items-center justify-center rounded-2xl border border-dashed border-border bg-background p-6 text-sm text-muted-foreground">
            Memuat data historical...
          </div>
        ) : error ? (
          <div className="rounded-2xl border border-rose-200 bg-rose-50 p-6 text-sm text-rose-700">{error}</div>
        ) : viewMode === "table" ? (
          <HistoricalTable
            records={filteredRecords}
            rowsPerPage={rowsPerPage}
            onRowsPerPageChange={handleRowsPerPageChange}
            page={page}
            onPageChange={setPage}
            pagination={pagination}
            serverPaginated={!(Boolean(selectedDate) || riskLevelFilter !== "all")}
          />
        ) : (
          <HistoricalMapPanel
            earthquakes={mapPoints}
            selectedEarthquake={selectedEarthquake}
            selectedId={selectedId}
            selectionToken={selectionToken}
            onSelectEarthquake={handleSelectEarthquake}
          />
        )}
      </div>
    </div>
  )
}
