"use client"

import { useMemo, type ReactNode } from "react"
import { CalendarIcon, MapPinned, RefreshCcw, Table2, Filter } from "lucide-react"
import { format } from "date-fns"
import { Badge } from "../ui/badge"
import { Button } from "@/components/ui/button"
import { Checkbox } from "@/components/ui/checkbox"
import { Calendar } from "../ui/calendar"
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { cn } from "@/lib/utils"

type ViewMode = "table" | "map"

export type RiskLevelFilter = "all" | "Rendah" | "Sedang" | "Tinggi" | "Ekstrem"

const RISK_LEVEL_OPTIONS: { value: RiskLevelFilter; label: string; color: string }[] = [
    { value: "all", label: "Semua Level", color: "text-muted-foreground" },
    { value: "Rendah", label: "Rendah", color: "text-emerald-600" },
    { value: "Sedang", label: "Sedang", color: "text-amber-600" },
    { value: "Tinggi", label: "Tinggi", color: "text-rose-600" },
    { value: "Ekstrem", label: "Ekstrem", color: "text-red-950" },
]

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

export function HistoricalControls({
    selectedDate,
    onDateChange,
    onResetDate,
    showResetDate,
    viewMode,
    onViewModeChange,
    totalCount,
    filteredCount,
    selectedDateLabel,
    riskLevelFilter,
    onRiskLevelFilterChange,
}: {
    selectedDate: string
    onDateChange: (value: string) => void
    onResetDate: () => void
    showResetDate: boolean
    viewMode: ViewMode
    onViewModeChange: (mode: ViewMode) => void
    totalCount: number
    filteredCount: number
    selectedDateLabel: string
    riskLevelFilter: RiskLevelFilter
    onRiskLevelFilterChange: (value: RiskLevelFilter) => void
}) {
    const showTable = viewMode === "table"
    const showMap = viewMode === "map"

    const selectedCalendarDate = useMemo(() => {
        if (!selectedDate) {
            return undefined
        }

        const parsedDate = new Date(`${selectedDate}T00:00:00`)

        return Number.isNaN(parsedDate.getTime()) ? undefined : parsedDate
    }, [selectedDate])

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

    const activeRiskLabel = RISK_LEVEL_OPTIONS.find((opt) => opt.value === riskLevelFilter)?.label ?? "Semua Level"

    return (
        <div className="flex flex-col gap-5 p-0 lg:items-start lg:justify-start">
            <div className="flex flex-col lg:flex-row items-start lg:items-center justify-start gap-6 lg:gap-12">
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
                            <Button type="button" variant="outline" className="border-border bg-background text-foreground hover:bg-muted" onClick={onResetDate}>
                                <RefreshCcw className="size-4" />
                                Reset
                            </Button>
                        ) : null}
                    </div>
                </div>

                {/* Risk Level Filter */}
                <div className="flex flex-col items-start gap-2">
                    <label className="text-sm font-semibold tracking-wide text-foreground">Filter Level Risiko</label>
                    <Select value={riskLevelFilter} onValueChange={(val) => onRiskLevelFilterChange(val as RiskLevelFilter)}>
                        <SelectTrigger className="w-[200px]">
                            <div className="flex items-center gap-2">
                                <Filter className="size-4 text-muted-foreground" />
                                <SelectValue placeholder="Pilih level risiko">{activeRiskLabel}</SelectValue>
                            </div>
                        </SelectTrigger>
                        <SelectContent>
                            {RISK_LEVEL_OPTIONS.map((option) => (
                                <SelectItem key={option.value} value={option.value}>
                                    <span className={cn("font-medium", option.color)}>{option.label}</span>
                                </SelectItem>
                            ))}
                        </SelectContent>
                    </Select>
                </div>

                <div className="flex flex-col items-start gap-3">
                    <label className="text-sm font-semibold tracking-wide text-foreground">Statistik</label>
                    <div className="flex flex-wrap items-center gap-2 text-sm text-muted-foreground">
                        <Badge variant="outline" className="border border-blue-200 bg-blue-50 text-blue-700">
                            <span>Total Data: {totalCount}</span>
                        </Badge>
                        <Badge variant="outline" className="border border-blue-200 bg-blue-50 text-blue-700">
                            <span>Selektif Data: {filteredCount}</span>
                        </Badge>
                        <Badge variant="outline" className="border border-blue-200 bg-blue-50 text-blue-700">
                            <span>Tanggal: {selectedDateLabel}</span>
                        </Badge>
                        {riskLevelFilter !== "all" && (
                            <Badge variant="outline" className="border border-red-900/40 bg-red-950 text-red-50">
                                <span>Level: {riskLevelFilter}</span>
                            </Badge>
                        )}
                    </div>
                </div>
            </div>

            <div className="flex flex-col items-start justify-between gap-4">
                <label className="text-sm font-semibold tracking-wide text-foreground">Tampilan</label>

                <div className="flex flex-col sm:flex-row gap-4 lg:gap-12 w-full">
                    <ViewOption
                        checked={showTable}
                        onCheckedChange={(checked) => checked && onViewModeChange("table")}
                        title="Table View"
                        description="Tabel data risiko ancaman gempa bumi"
                        icon={<Table2 className="size-4 text-primary" />}
                    />
                    <ViewOption
                        checked={showMap}
                        onCheckedChange={(checked) => checked && onViewModeChange("map")}
                        icon={<MapPinned className="size-4 text-primary" />}
                        title="Map View"
                        description="Peta risiko ancaman gempa bumi berdasarkan wilayah"
                    />
                </div>
            </div>

        </div>
    )
}
