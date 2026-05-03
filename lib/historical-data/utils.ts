const MONTH_LOOKUP: Record<string, string> = {
  jan: "01",
  january: "01",
  feb: "02",
  february: "02",
  mar: "03",
  march: "03",
  apr: "04",
  april: "04",
  may: "05",
  mei: "05",
  jun: "06",
  june: "06",
  jul: "07",
  july: "07",
  aug: "08",
  august: "08",
  sep: "09",
  sept: "09",
  september: "09",
  oct: "10",
  october: "10",
  nov: "11",
  november: "11",
  dec: "12",
  december: "12",
}

export function toDateKey(sourceText: string): string {
  const normalizedText = sourceText.trim()

  if (!normalizedText) {
    return ""
  }

  const isoMatch = normalizedText.match(/^(\d{4})-(\d{2})-(\d{2})/)

  if (isoMatch) {
    return `${isoMatch[1]}-${isoMatch[2]}-${isoMatch[3]}`
  }

  const dayMonthYearMatch = normalizedText.match(/^(\d{1,2})\s+([A-Za-z]+)\s+(\d{4})$/)

  if (dayMonthYearMatch) {
    const day = dayMonthYearMatch[1].padStart(2, "0")
    const month = MONTH_LOOKUP[dayMonthYearMatch[2].toLowerCase()]
    const year = dayMonthYearMatch[3]

    if (month) {
      return `${year}-${month}-${day}`
    }
  }

  const parsedDate = new Date(normalizedText)

  if (!Number.isNaN(parsedDate.getTime())) {
    return parsedDate.toISOString().slice(0, 10)
  }

  return ""
}

export function getTodayDateKey(): string {
  const now = new Date()
  const year = now.getFullYear()
  const month = String(now.getMonth() + 1).padStart(2, "0")
  const day = String(now.getDate()).padStart(2, "0")

  return `${year}-${month}-${day}`
}

export function normalizeRiskLevelLabel(value: unknown): string {
  if (value === null || value === undefined) {
    return "Tidak diketahui"
  }

  const text = String(value).trim()

  if (!text) {
    return "Tidak diketahui"
  }

  const normalized = text.toLowerCase().replace(/\s+/g, " ")

  if (normalized === "rendah" || normalized === "low" || normalized === "low risk" || normalized === "1") {
    return "Rendah"
  }

  if (
    normalized === "sedang" ||
    normalized === "medium" ||
    normalized === "moderate" ||
    normalized === "menengah" ||
    normalized === "2"
  ) {
    return "Sedang"
  }

  if (normalized === "tinggi" || normalized === "high" || normalized === "high risk" || normalized === "3") {
    return "Tinggi"
  }

  return text
}

export function formatCellValue(value: unknown): string {
  if (value === null || value === undefined || value === "") {
    return "-"
  }

  if (typeof value === "string" || typeof value === "number" || typeof value === "boolean") {
    return String(value)
  }

  if (Array.isArray(value)) {
    return value.map((item) => formatCellValue(item)).join(", ")
  }

  return JSON.stringify(value)
}
