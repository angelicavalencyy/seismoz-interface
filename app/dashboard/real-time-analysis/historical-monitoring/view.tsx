"use client"

import { useEffect, useMemo, useState } from "react"
import type { EarthquakeRecord } from "../../../../lib/earthquake"
import { createEarthquakeMapPoints, getEarthquakeRecordId } from "../../../../lib/earthquake"
import { HistoricalControls } from "../../../../components/table-history-analysis-real-time/historical-controls"
import { HistoricalMapPanel } from "../../../../components/table-history-analysis-real-time/historical-map-panel"
import { HistoricalTable } from "../../../../components/table-history-analysis-real-time/historical-table"
import { getRecordDateKey, getTodayDateKey } from "../../../../lib/historical-monitoring/utils"

type ViewMode = "table" | "map"

export default function HistoricalMonitoring() {
  const todayDateKey = getTodayDateKey()
  const [records, setRecords] = useState<EarthquakeRecord[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [selectedDate, setSelectedDate] = useState(todayDateKey)
  const [viewMode, setViewMode] = useState<ViewMode>("table")
  const [selectedEarthquake, setSelectedEarthquake] = useState<EarthquakeRecord | null>(null)
  const [selectionToken, setSelectionToken] = useState(0)
  const [rowsPerPage, setRowsPerPage] = useState(10)
  const [page, setPage] = useState(1)

  useEffect(() => {
    const controller = new AbortController()
    let isActive = true

    async function loadHistory() {
      try {
        setLoading(true)
        setError(null)

        const response = await fetch("/api/realtime/history", {
          signal: controller.signal,
          cache: "no-store",
        })

        if (!response.ok) {
          throw new Error(`Failed to load historical data (${response.status})`)
        }

        const payload = (await response.json()) as { earthquakes?: EarthquakeRecord[] }

        if (!isActive) {
          return
        }

        const nextRecords = payload.earthquakes ?? []
        setRecords(nextRecords)
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
  }, [])

  const filteredRecords = useMemo(() => {
    if (!selectedDate) {
      return records
    }

    return records.filter((record) => getRecordDateKey(record) === selectedDate)
  }, [records, selectedDate])

  useEffect(() => {
    setPage(1)
  }, [selectedDate])

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

  const showResetDate = selectedDate !== todayDateKey

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
            onResetDate={() => setSelectedDate(todayDateKey)}
            showResetDate={showResetDate}
            viewMode={viewMode}
            onViewModeChange={setViewMode}
            totalCount={records.length}
            filteredCount={filteredRecords.length}
            selectedDateLabel={selectedDateLabel}
          />
        </div>
      </div>

      <div className="mt-4 min-h-0 min-w-0 flex-1 overflow-visible">
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
