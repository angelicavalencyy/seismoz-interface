"use client"

import { useMemo, type ReactNode } from "react"
import { CalendarIcon, MapPinned, RefreshCcw, Table2 } from "lucide-react"
import { format } from "date-fns"
import { Button } from "@/components/ui/button"
import { Calendar } from "@/components/ui/calendar"
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover"
import { Badge } from "@/components/ui/badge"
import { Checkbox } from "@/components/ui/checkbox"
import { cn } from "@/lib/utils"

type HistoricalDataControlsProps = {
  selectedDate: string
  onDateChange: (value: string) => void
  onResetDate: () => void
  showResetDate: boolean
  viewMode: "table" | "map"
  onViewModeChange: (mode: "table" | "map") => void
  totalCount: number
  filteredCount: number
  selectedDateLabel: string
}

export function HistoricalDataControls({
  selectedDate,
  onDateChange,
  onResetDate,
  showResetDate,
  viewMode,
  onViewModeChange,
  totalCount,
  filteredCount,
  selectedDateLabel,
}: HistoricalDataControlsProps) {
  const showTable = viewMode === "table"
  const showMap = viewMode === "map"

  const selectedCalendarDate = useMemo(() => {
    if (!selectedDate) {
      return undefined
    }

    const parsedDate = new Date(`${selectedDate}T00:00:00`)

    return Number.isNaN(parsedDate.getTime()) ? undefined : parsedDate
  }, [selectedDate])

  function ViewOption({
    checked,
    onCheckedChange,
    icon,
    title,
    description,
  }: {
    checked: boolean
    onCheckedChange: (checked: boolean) => void
    icon: ReactNode
    title: string
    description: string
  }) {
    return (
      <div
        role="button"
        tabIndex={0}
        onClick={() => onCheckedChange(true)}
        onKeyDown={(event) => {
          if (event.key === "Enter" || event.key === " ") {
            event.preventDefault()
            onCheckedChange(true)
          }
        }}
        className={cn(
          "flex min-h-[72px] min-w-[180px] cursor-pointer items-start justify-start gap-3 rounded-2xl px-4 py-3 text-left transition-colors",
          checked ? "bg-muted/30 text-foreground" : "bg-transparent text-foreground hover:bg-muted/20"
        )}
      >
        <Checkbox checked={checked} onCheckedChange={(value) => onCheckedChange(value === true)} className="mt-0.5" />
        <div className="space-y-0.5">
          <div className="flex items-center gap-2 text-sm font-medium">
            {icon}
            <span>{title}</span>
          </div>
          <p className="text-xs text-muted-foreground">{description}</p>
        </div>
      </div>
    )
  }

  const handleCalendarSelect = (dateValue: Date | undefined) => {
    if (!dateValue) {
      onDateChange("")
      return
    }

    const year = dateValue.getFullYear()
    const month = String(dateValue.getMonth() + 1).padStart(2, "0")
    const day = String(dateValue.getDate()).padStart(2, "0")

    onDateChange(`${year}-${month}-${day}`)
  }

  return (
    <div className="flex flex-col gap-5 p-0 lg:flex-row lg:items-start lg:justify-start">
      <div className="flex flex-col items-start gap-2">
        <label className="text-sm font-semibold tracking-wide text-foreground">Filter Tanggal</label>
        <div className="flex items-center gap-2">
          <Popover>
            <PopoverTrigger asChild>
              <Button
                variant="outline"
                data-empty={!selectedCalendarDate}
                className="w-[212px] justify-between text-left font-normal data-[empty=true]:text-muted-foreground"
              >
                {selectedCalendarDate ? format(selectedCalendarDate, "PPP") : <span>Pilih tanggal</span>}
                <CalendarIcon className="size-4" />
              </Button>
            </PopoverTrigger>
            <PopoverContent className="w-auto p-0" align="start">
              <Calendar
                mode="single"
                selected={selectedCalendarDate}
                onSelect={handleCalendarSelect}
                defaultMonth={selectedCalendarDate}
              />
            </PopoverContent>
          </Popover>

          {showResetDate ? (
            <Button
              type="button"
              variant="outline"
              className="border-border bg-background text-foreground hover:bg-muted"
              onClick={onResetDate}
            >
              <RefreshCcw className="size-4" />
              Reset
            </Button>
          ) : null}
        </div>
      </div>

      <div className="flex flex-col items-start gap-3">
        <label className="text-sm font-semibold tracking-wide text-foreground">Statistik</label>
        <div className="flex flex-wrap items-center gap-2 text-sm text-muted-foreground">
          <Badge variant="outline" className={cn("border border-purple-200 bg-purple-50 text-purple-700")}>
            <span>Total Data: {totalCount}</span>
          </Badge>
          <Badge variant="outline" className="border border-purple-200 bg-purple-50 text-purple-700">
            <span>Filtered: {filteredCount}</span>
          </Badge>
          <Badge variant="outline" className="border border-purple-200 bg-purple-50 text-purple-700">
            <span>Tanggal: {selectedDateLabel}</span>
          </Badge>
        </div>
      </div>

      <div className="flex flex-col items-start gap-3">
        <label className="text-sm font-semibold tracking-wide text-foreground">Tampilan</label>
        <div className="flex flex-row gap-3">
          <ViewOption
            checked={showTable}
            onCheckedChange={(checked) => checked && onViewModeChange("table")}
            title="Table View"
            description="Tabel data risk map"
            icon={<Table2 className="size-4 text-primary" />}
          />
          <ViewOption
            checked={showMap}
            onCheckedChange={(checked) => checked && onViewModeChange("map")}
            title="Map View"
            description="Peta risk map"
            icon={<MapPinned className="size-4 text-primary" />}
          />
        </div>
      </div>
    </div>
  )
}
