"use client"

import { useMemo, useState } from "react"
import { ChevronLeft, ChevronRight, ChevronsLeft, ChevronsRight, ArrowUpDown, ArrowUp, ArrowDown } from "lucide-react"
import { Card, CardContent } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { cn } from "@/lib/utils"
import type { RiskMapTableRecord } from "@/lib/historical-data/table-api"
import { formatCellValue, getRiskMapTableCluster, getRiskMapTableKabupatenName, getRiskMapTableRiskLevel } from "@/lib/historical-data/table-api"
import { Badge } from "@/components/ui/badge"
import type { RiskMapPagination } from "@/lib/historical-data/table-api"

type TableColumn = {
  key: string
  label: string
  widthClass: string
  align?: "left" | "right"
  sortable?: boolean
}

const tableColumns: TableColumn[] = [
  { key: "num", label: "No.", widthClass: "w-16", align: "right", sortable: false },
  { key: "nama_kabupaten", label: "Kabupaten", widthClass: "w-64", sortable: true },
  { key: "luas_wilayah_km2", label: "Luas Wilayah (km²)", widthClass: "w-48", align: "right", sortable: true },
  { key: "frekuensi_gempa", label: "Frekuensi Gempa", widthClass: "w-48", align: "right", sortable: true },
  { key: "mag_max", label: "Mag Maks", widthClass: "w-36", align: "right", sortable: true },
  { key: "mag_mean", label: "Rata-rata Mag", widthClass: "w-40", align: "right", sortable: true },
  { key: "depth_mean", label: "Rata-rata Kedalaman", widthClass: "w-48", align: "right", sortable: true },
  { key: "cluster", label: "Klaster", widthClass: "w-28", align: "right", sortable: true },
  { key: "risk_score", label: "Skor Risiko", widthClass: "w-36", align: "right", sortable: true },
  { key: "risk_level", label: "Status Risiko", widthClass: "w-40", sortable: true },
]

export function HistoricalDataTable({
  records,
  rowsPerPage,
  onRowsPerPageChange,
  page,
  onPageChange,
  pagination,
  serverPaginated = false,
  emptyStateMessage = "Tidak ada data yang tersedia.",
}: {
  records: RiskMapTableRecord[]
  rowsPerPage: number
  onRowsPerPageChange: (value: number) => void
  page: number
  onPageChange: (value: number) => void
  pagination?: RiskMapPagination
  serverPaginated?: boolean
  emptyStateMessage?: string
}) {
  const [sortConfig, setSortConfig] = useState<{ key: string; direction: "asc" | "desc" } | null>(null)

  const handleSort = (key: string) => {
    let direction: "asc" | "desc" = "asc"
    if (sortConfig && sortConfig.key === key && sortConfig.direction === "asc") {
      direction = "desc"
    }
    setSortConfig({ key, direction })
  }

  const sortedRecords = useMemo(() => {
    let sortableRecords = [...records]
    if (sortConfig !== null) {
      sortableRecords.sort((a, b) => {
        let aValue = a[sortConfig.key as keyof RiskMapTableRecord]
        let bValue = b[sortConfig.key as keyof RiskMapTableRecord]

        if (sortConfig.key === "nama_kabupaten") {
          aValue = getRiskMapTableKabupatenName(a)
          bValue = getRiskMapTableKabupatenName(b)
        } else if (sortConfig.key === "cluster") {
          aValue = getRiskMapTableCluster(a) ?? ""
          bValue = getRiskMapTableCluster(b) ?? ""
        } else if (sortConfig.key === "risk_level") {
          aValue = getRiskMapTableRiskLevel(a)
          bValue = getRiskMapTableRiskLevel(b)
        }
        
        if (aValue === undefined || aValue === null) return 1
        if (bValue === undefined || bValue === null) return -1
        
        if (aValue < bValue) {
          return sortConfig.direction === "asc" ? -1 : 1
        }
        if (aValue > bValue) {
          return sortConfig.direction === "asc" ? 1 : -1
        }
        return 0
      })
    }
    return sortableRecords
  }, [records, sortConfig])

  const totalPages = serverPaginated
    ? Math.max(1, pagination?.totalPages ?? page + (pagination?.hasNextPage ? 1 : 0))
    : Math.max(1, Math.ceil(sortedRecords.length / rowsPerPage))
  const currentPage = Math.min(page, totalPages)
  
  const pagedRecords = useMemo(() => {
    if (serverPaginated) {
      return sortedRecords
    }

    const start = (currentPage - 1) * rowsPerPage
    return sortedRecords.slice(start, start + rowsPerPage)
  }, [currentPage, serverPaginated, sortedRecords, rowsPerPage])

  const totalRowsLabel =
    serverPaginated && typeof pagination?.total === "number"
      ? `${pagination.total} row(s) total.`
      : serverPaginated
        ? `${sortedRecords.length} row(s) loaded.`
        : `${sortedRecords.length} row(s) total.`
  const disableNextPage = serverPaginated ? !pagination?.hasNextPage : currentPage === totalPages

  return (
    <Card className="flex h-full min-h-0 w-full max-w-full min-w-0 flex-col overflow-hidden border-border bg-card shadow-sm">
      <CardContent className="flex min-h-0 min-w-0 flex-1 flex-col p-0">
        <div className="min-h-0 min-w-0 flex-1 overflow-x-auto overflow-y-auto">
          <div className="h-full w-full max-w-full min-w-0">
            <table className="min-w-[1400px] w-full table-fixed border-separate border-spacing-0">
              <colgroup>
                {tableColumns.map((column) => (
                  <col key={column.key} className={column.widthClass} />
                ))}
              </colgroup>
              <thead className="sticky top-0 z-10 bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/80">
                <tr className="border-b border-border">
                  {tableColumns.map((column) => (
                    <th
                      key={column.key}
                      className={cn(
                        "border-b border-border px-4 py-3 text-left text-xs font-semibold uppercase tracking-wide text-muted-foreground",
                        column.align === "right" && "text-right"
                      )}
                    >
                      {column.sortable ? (
                        <Button
                          variant="ghost"
                          onClick={() => handleSort(column.key)}
                          className={cn(
                            "h-8 px-2 flex items-center gap-1 hover:bg-muted/50 data-[state=open]:bg-accent",
                            column.align === "right" ? "ml-auto" : "-ml-2"
                          )}
                        >
                          <span>{column.label}</span>
                          {sortConfig?.key === column.key ? (
                            sortConfig.direction === "asc" ? (
                              <ArrowUp className="h-3.5 w-3.5" />
                            ) : (
                              <ArrowDown className="h-3.5 w-3.5" />
                            )
                          ) : (
                            <ArrowUpDown className="h-3.5 w-3.5 opacity-50" />
                          )}
                        </Button>
                      ) : (
                        column.label
                      )}
                    </th>
                  ))}
                </tr>
              </thead>
              <tbody className="divide-y divide-border">
                {pagedRecords.length === 0 ? (
                  <tr>
                    <td
                      colSpan={Math.max(tableColumns.length, 1)}
                      className="border-b border-border px-4 py-10 text-center text-sm text-muted-foreground"
                    >
                      {emptyStateMessage}
                    </td>
                  </tr>
                ) : (
                  pagedRecords.map((record, index) => {
                    const rowKey = record.id_kabupaten ?? `${currentPage}-${index}-${getRiskMapTableKabupatenName(record)}`
                    const riskLevel = getRiskMapTableRiskLevel(record)
                    const severity = riskLevel === "Ekstrem" ? "darkRed" : riskLevel === "Tinggi" ? "red" : riskLevel === "Sedang" ? "yellow" : "green"

                    return (
                      <tr key={rowKey} className="transition-colors hover:bg-muted/50">
                        {tableColumns.map((column) => {
                          const value =
                            column.key === "num"
                              ? (currentPage - 1) * rowsPerPage + index + 1
                              : column.key === "cluster"
                                ? getRiskMapTableCluster(record)
                                : column.key === "nama_kabupaten"
                                  ? getRiskMapTableKabupatenName(record)
                                  : record[column.key as keyof RiskMapTableRecord]

                          if (column.key === "risk_level") {
                            return (
                              <td key={column.key} className="border-b border-border px-4 py-4 align-top text-sm text-foreground">
                                <Badge
                                  variant="outline"
                                  className={cn(
                                    "border px-3 py-1 text-xs font-medium",
                                    severity === "darkRed" && "border-red-600 bg-red-600 text-white",
                                    severity === "red" && "border-red-200 bg-red-50 text-red-700",
                                    severity === "yellow" && "border-yellow-200 bg-yellow-50 text-yellow-700",
                                    severity === "green" && "border-green-200 bg-green-50 text-green-700"
                                  )}
                                >
                                  {formatCellValue(value)}
                                </Badge>
                              </td>
                            )
                          }

                          if (
                            column.key === "num" ||
                            column.key === "luas_wilayah_km2" ||
                            column.key === "frekuensi_gempa" ||
                            column.key === "mag_max" ||
                            column.key === "mag_mean" ||
                            column.key === "depth_mean" ||
                            column.key === "cluster" ||
                            column.key === "risk_score"
                          ) {
                            return (
                              <td
                                key={column.key}
                                className={cn(
                                  "border-b border-border px-4 py-4 align-top text-sm text-foreground",
                                  column.align === "right" && "text-right"
                                )}
                              >
                                <span className="font-medium text-foreground">{formatCellValue(value)}</span>
                              </td>
                            )
                          }

                          return (
                            <td key={column.key} className="border-b border-border px-4 py-4 align-top text-sm text-foreground">
                              <div className="whitespace-normal break-words leading-relaxed text-muted-foreground">
                                {formatCellValue(value)}
                              </div>
                            </td>
                          )
                        })}
                      </tr>
                    )
                  })
                )}
              </tbody>
            </table>
          </div>
        </div>

        <div className="flex flex-col gap-3 border-t border-border px-4 py-3 text-sm text-muted-foreground sm:flex-row sm:items-center sm:justify-between">
          <div>{totalRowsLabel}</div>
          <div className="flex flex-wrap items-center gap-4">
            <div className="flex items-center gap-2">
              <span className="text-sm font-medium text-foreground">Rows per page</span>
              <Input
                type="number"
                min={20}
                max={20}
                value={rowsPerPage}
                onChange={(event) => onRowsPerPageChange(Math.max(20, Number.parseInt(event.target.value || "20", 10)))}
                className="h-9 w-20 bg-background text-sm"
                disabled={serverPaginated}
              />
            </div>
            <div className="text-sm font-medium text-foreground">
              Page {currentPage} of {totalPages}
            </div>
            <div className="flex items-center gap-1">
              <Button variant="outline" size="icon-sm" onClick={() => onPageChange(1)} disabled={currentPage === 1}>
                <ChevronsLeft className="size-4" />
              </Button>
              <Button variant="outline" size="icon-sm" onClick={() => onPageChange(Math.max(1, currentPage - 1))} disabled={currentPage === 1}>
                <ChevronLeft className="size-4" />
              </Button>
              <Button variant="outline" size="icon-sm" onClick={() => onPageChange(currentPage + 1)} disabled={disableNextPage}>
                <ChevronRight className="size-4" />
              </Button>
              <Button variant="outline" size="icon-sm" onClick={() => onPageChange(totalPages)} disabled={disableNextPage || pagination?.totalPages === null}>
                <ChevronsRight className="size-4" />
              </Button>
            </div>
          </div>
        </div>
      </CardContent>
    </Card>
  )
}
