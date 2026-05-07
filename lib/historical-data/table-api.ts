import { formatCellValue, normalizeRiskLevelLabel, toDateKey } from "./utils"

export interface RiskMapTableRecord {
  id_kabupaten?: string
  nama_kabupaten?: string
  luas_wilayah_km2?: number | string
  frekuensi_gempa?: number | string
  mag_max?: number | string
  mag_mean?: number | string
  depth_mean?: number | string
  cluster?: number | string
  risk_score?: number | string
  risk_level?: string
  created_at?: string
  tanggal?: string
  jam?: string
  DateTime?: string
  Tanggal?: string
  Jam?: string
  Nama_Kabupaten?: string
  ID_Kabupaten?: string
  Luas_Wilayah_Km2?: number | string
  Frekuensi_Gempa?: number | string
  Mag_Max?: number | string
  Mag_Mean?: number | string
  Depth_Mean?: number | string
  Cluster?: number | string
  Risk_Score?: number | string
  Risk_Level?: string
}

type RiskMapTablePayload = {
  data?: RiskMapTableRecord[] | RiskMapTableRecord
  results?: RiskMapTableRecord[] | RiskMapTableRecord
  table?: RiskMapTableRecord[] | RiskMapTableRecord
  records?: RiskMapTableRecord[] | RiskMapTableRecord
  features?: Array<{
    properties?: RiskMapTableRecord
    [key: string]: unknown
  }>
}

export function normalizeRiskMapTableRecords(payload: unknown): RiskMapTableRecord[] {
  if (!payload || typeof payload !== "object") {
    return []
  }

  const feed = payload as RiskMapTablePayload

  if (Array.isArray(payload)) {
    return payload.filter((item): item is RiskMapTableRecord => Boolean(item) && typeof item === "object")
  }

  if (Array.isArray(feed.data)) {
    return feed.data
  }

  if (feed.data && typeof feed.data === "object") {
    return [feed.data]
  }

  if (Array.isArray(feed.results)) {
    return feed.results
  }

  if (feed.results && typeof feed.results === "object") {
    return [feed.results]
  }

  if (Array.isArray(feed.table)) {
    return feed.table
  }

  if (feed.table && typeof feed.table === "object") {
    return [feed.table]
  }

  if (Array.isArray(feed.records)) {
    return feed.records
  }

  if (feed.records && typeof feed.records === "object") {
    return [feed.records]
  }

  if (Array.isArray(feed.features)) {
    return feed.features.flatMap((feature) => (feature.properties ? [feature.properties] : []))
  }

  return []
}

export function getRiskMapTableRecordDateKey(record: RiskMapTableRecord): string {
  const sourceText =
    record.created_at?.trim() ||
    record.tanggal?.trim() ||
    record.DateTime?.trim() ||
    record.Tanggal?.trim() ||
    ""

  return toDateKey(sourceText)
}

export function getRiskMapTableKabupatenName(record: RiskMapTableRecord): string {
  return (
    record.nama_kabupaten ??
    record.Nama_Kabupaten ??
    record.id_kabupaten ??
    record.ID_Kabupaten ??
    "Tidak tersedia"
  )
}

export function getRiskMapTableRiskLevel(record: RiskMapTableRecord): string {
  return normalizeRiskLevelLabel(record.risk_level ?? record.Risk_Level)
}

export function getRiskMapTableCluster(record: RiskMapTableRecord): number | string | null {
  const value = record.cluster ?? record.Cluster

  if (value === undefined || value === null) {
    return null
  }

  if (typeof value === "string" && value.trim().length === 0) {
    return null
  }

  return value
}

export { formatCellValue }