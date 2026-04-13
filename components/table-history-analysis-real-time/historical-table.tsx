"use client"

import { useMemo } from "react"
import { ChevronLeft, ChevronRight, ChevronsLeft, ChevronsRight } from "lucide-react"
import { Card, CardContent } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { cn } from "@/lib/utils"
import type { EarthquakeRecord } from "@/lib/earthquake"
import { formatCellValue } from "@/lib/historical-monitoring/utils"
import { TableBadge } from "./table-badge"

type TableColumn = {
  key: string
  label: string
  widthClass: string
  align?: "left" | "right"
}

const tableColumns: TableColumn[] = [
  { key: "num", label: "Num", widthClass: "w-16", align: "right" },
  { key: "tanggal", label: "Tanggal", widthClass: "w-32" },
  { key: "jam", label: "Jam", widthClass: "w-28" },
  { key: "wilayah", label: "Wilayah", widthClass: "w-[320px]" },
  { key: "koordinat", label: "Koordinat", widthClass: "w-40" },
  { key: "latitude", label: "Latitude", widthClass: "w-28" },
  { key: "longitude", label: "Longitude", widthClass: "w-28" },
  { key: "magnitude", label: "Magnitudo", widthClass: "w-28" },
  { key: "depth", label: "Depth", widthClass: "w-28" },
  { key: "risk_level", label: "Status", widthClass: "w-28" },
  { key: "risk_score", label: "Score", widthClass: "w-24" },
  { key: "cluster", label: "Cluster", widthClass: "w-24" },
]

export function HistoricalTable({
  records,
  rowsPerPage,
  onRowsPerPageChange,
  page,
  onPageChange,
}: {
  records: EarthquakeRecord[]
  rowsPerPage: number
  onRowsPerPageChange: (value: number) => void
  page: number
  onPageChange: (value: number) => void
}) {
  const totalPages = Math.max(1, Math.ceil(records.length / rowsPerPage))
  const currentPage = Math.min(page, totalPages)
  const pagedRecords = useMemo(() => {
    const start = (currentPage - 1) * rowsPerPage
    return records.slice(start, start + rowsPerPage)
  }, [currentPage, records, rowsPerPage])

  return (
    <div className="flex w-full min-w-0 flex-col overflow-hidden border border-gray-200 rounded-lg  bg-card shadow-sm">
      <div className="flex min-h-0 min-w-0 flex-1 flex-col p-0">
        <div className="min-h-0 min-w-0 flex-1 overflow-x-auto overflow-y-auto">
          <div className="h-full w-full max-w-full min-w-0">
            <table className="min-w-[1300px] w-full table-fixed border-separate border-spacing-0">
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
                        "border-b border-border px-4 py-3 text-left text-xs font-semibold tracking-wide text-muted-foreground",
                        column.align === "right" && "text-right",
                        column.key === "wilayah" && "w-[520px] min-w-[520px]"
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
                    <td colSpan={Math.max(tableColumns.length, 1)} className="border-b border-border px-4 py-10 text-center text-sm text-muted-foreground">
                      Tidak ada data untuk tanggal yang dipilih.
                    </td>
                  </tr>
                ) : (
                  pagedRecords.map((record, index) => {
                    const rowKey = record.id ?? `${currentPage}-${index}-${record.tanggal ?? ""}-${record.jam ?? ""}-${record.wilayah ?? ""}-${record.magnitude ?? ""}`
                    const severity = record.risk_level === "Tinggi" ? "red" : record.risk_level === "Sedang" ? "yellow" : "green"

                    return (
                      <tr key={rowKey} className="transition-colors hover:bg-muted/50">
                        {tableColumns.map((column) => {
                          const value =
                            column.key === "num"
                              ? (currentPage - 1) * rowsPerPage + index + 1
                              : record[column.key as keyof EarthquakeRecord]

                          if (column.key === "risk_level") {
                            return (
                              <td key={column.key} className="border-b border-border px-4 py-4 align-top text-sm text-foreground">
                                <TableBadge tone={severity}>{formatCellValue(value)}</TableBadge>
                              </td>
                            )
                          }

                          if (column.key === "num" || column.key === "latitude" || column.key === "longitude" || column.key === "magnitude" || column.key === "depth" || column.key === "cluster") {
                            return (
                              <td key={column.key} className={cn("border-b border-border px-4 py-4 align-top text-sm text-foreground", column.align === "right" && "text-right")}>
                                <span className="font-medium text-foreground">{formatCellValue(value)}</span>
                              </td>
                            )
                          }

                          return (
                            <td
                              key={column.key}
                              className={cn(
                                "border-b border-border px-4 py-4 align-top text-sm text-foreground",
                                column.key === "wilayah" && "w-[520px] min-w-[520px]"
                              )}
                            >
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
              <Button variant="outline" size="icon-sm" onClick={() => onPageChange(Math.max(1, currentPage - 1))} disabled={currentPage === 1}>
                <ChevronLeft className="size-4" />
              </Button>
              <Button variant="outline" size="icon-sm" onClick={() => onPageChange(Math.min(totalPages, currentPage + 1))} disabled={currentPage === totalPages}>
                <ChevronRight className="size-4" />
              </Button>
              <Button variant="outline" size="icon-sm" onClick={() => onPageChange(totalPages)} disabled={currentPage === totalPages}>
                <ChevronsRight className="size-4" />
              </Button>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}
