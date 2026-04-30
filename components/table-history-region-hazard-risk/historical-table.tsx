"use client"

import { useMemo } from "react"
import { ChevronLeft, ChevronRight, ChevronsLeft, ChevronsRight } from "lucide-react"
import { Card, CardContent } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { cn } from "@/lib/utils"
import type { RiskMapTableRecord } from "@/lib/historical-data/table-api"
import { formatCellValue, getRiskMapTableKabupatenName, getRiskMapTableRiskLevel } from "@/lib/historical-data/table-api"
import { Badge } from "@/components/ui/badge"

type TableColumn = {
  key: string
  label: string
  widthClass: string
  align?: "left" | "right"
}

const tableColumns: TableColumn[] = [
  { key: "num", label: "Num", widthClass: "w-16", align: "right" },
  { key: "nama_kabupaten", label: "Kabupaten", widthClass: "w-[260px]" },
  { key: "luas_wilayah_km2", label: "Luas Wilayah (km²)", widthClass: "w-40", align: "right" },
  { key: "frekuensi_gempa", label: "Frekuensi Gempa", widthClass: "w-36", align: "right" },
  { key: "mag_max", label: "Mag Max", widthClass: "w-28", align: "right" },
  { key: "mag_mean", label: "Mag Mean", widthClass: "w-28", align: "right" },
  { key: "depth_mean", label: "Depth Mean", widthClass: "w-32", align: "right" },
  { key: "cluster", label: "Cluster", widthClass: "w-24", align: "right" },
  { key: "risk_score", label: "Risk Score", widthClass: "w-28", align: "right" },
  { key: "risk_level", label: "Risk Level", widthClass: "w-32" },
]

export function HistoricalDataTable({
  records,
  rowsPerPage,
  onRowsPerPageChange,
  page,
  onPageChange,
  emptyStateMessage = "Tidak ada data yang tersedia.",
}: {
  records: RiskMapTableRecord[]
  rowsPerPage: number
  onRowsPerPageChange: (value: number) => void
  page: number
  onPageChange: (value: number) => void
  emptyStateMessage?: string
}) {
  const totalPages = Math.max(1, Math.ceil(records.length / rowsPerPage))
  const currentPage = Math.min(page, totalPages)
  const pagedRecords = useMemo(() => {
    const start = (currentPage - 1) * rowsPerPage
    return records.slice(start, start + rowsPerPage)
  }, [currentPage, records, rowsPerPage])

  return (
    <Card className="flex h-full min-h-0 w-full max-w-full min-w-0 flex-col overflow-hidden border-border bg-card shadow-sm">
      <CardContent className="flex min-h-0 min-w-0 flex-1 flex-col p-0">
        <div className="min-h-0 min-w-0 flex-1 overflow-x-auto overflow-y-auto">
          <div className="h-full w-full max-w-full min-w-0">
            <table className="min-w-[1280px] w-full table-fixed border-separate border-spacing-0">
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
                      {column.label}
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
                    const severity = riskLevel === "Tinggi" ? "red" : riskLevel === "Sedang" ? "yellow" : "green"

                    return (
                      <tr key={rowKey} className="transition-colors hover:bg-muted/50">
                        {tableColumns.map((column) => {
                          const value =
                            column.key === "num"
                              ? (currentPage - 1) * rowsPerPage + index + 1
                              : record[column.key as keyof RiskMapTableRecord]

                          if (column.key === "risk_level") {
                            return (
                              <td key={column.key} className="border-b border-border px-4 py-4 align-top text-sm text-foreground">
                                <Badge
                                  variant="outline"
                                  className={cn(
                                    "border px-3 py-1 text-xs font-medium",
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
          <div>{records.length} row(s) total.</div>
          <div className="flex flex-wrap items-center gap-4">
            <div className="flex items-center gap-2">
              <span className="text-sm font-medium text-foreground">Rows per page</span>
              <Input
                type="number"
                min={5}
                max={25}
                value={rowsPerPage}
                onChange={(event) => onRowsPerPageChange(Math.max(5, Number.parseInt(event.target.value || "10", 10)))}
                className="h-9 w-20 bg-background text-sm"
              />
            </div>
            <div className="text-sm font-medium text-foreground">
              Page {currentPage} of {totalPages}
            </div>
            <div className="flex items-center gap-1">
              <Button variant="outline" size="icon-sm" onClick={() => onPageChange(1)} disabled={currentPage === 1}>
                <ChevronsLeft className="size-4" />
              </Button>
              <Button
                variant="outline"
                size="icon-sm"
                onClick={() => onPageChange(Math.max(1, currentPage - 1))}
                disabled={currentPage === 1}
              >
                <ChevronLeft className="size-4" />
              </Button>
              <Button
                variant="outline"
                size="icon-sm"
                onClick={() => onPageChange(Math.min(totalPages, currentPage + 1))}
                disabled={currentPage === totalPages}
              >
                <ChevronRight className="size-4" />
              </Button>
              <Button variant="outline" size="icon-sm" onClick={() => onPageChange(totalPages)} disabled={currentPage === totalPages}>
                <ChevronsRight className="size-4" />
              </Button>
            </div>
          </div>
        </div>
      </CardContent>
    </Card>
  )
}
