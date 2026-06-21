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
  GID_2?: string
  korban_total?: number | string
  rumah_rusak_total?: number | string
  fasum_rusak_total?: number | string
  cluster_label?: number | string
  has_risk_data?: boolean
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

export type RiskMapPagination = {
  page: number
  limit: number
  offset: number
  total: number | null
  totalPages: number | null
  hasNextPage: boolean
  hasPreviousPage: boolean
}

type PaginationPayload = RiskMapTablePayload & {
  count?: number
  total?: number
  total_count?: number
  totalCount?: number
  page?: number
  current_page?: number
  limit?: number
  page_size?: number
  per_page?: number
  offset?: number
  next?: unknown
  previous?: unknown
  total_pages?: number
  totalPages?: number
  pagination?: Partial<PaginationPayload>
  meta?: Partial<PaginationPayload>
}

function toPositiveInteger(value: unknown): number | null {
  const parsed = typeof value === "number" ? value : Number.parseInt(String(value ?? ""), 10)

  return Number.isFinite(parsed) && parsed > 0 ? parsed : null
}

function toNonNegativeInteger(value: unknown): number | null {
  const parsed = typeof value === "number" ? value : Number.parseInt(String(value ?? ""), 10)

  return Number.isFinite(parsed) && parsed >= 0 ? parsed : null
}

function getPaginationSource(payload: unknown): Partial<PaginationPayload> {
  if (!payload || typeof payload !== "object") {
    return {}
  }

  const feed = payload as PaginationPayload

  return feed.pagination ?? feed.meta ?? feed
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

export function normalizeRiskMapPagination(
  payload: unknown,
  fallback: { page: number; limit: number; recordCount: number }
): RiskMapPagination {
  const source = getPaginationSource(payload)
  const page = toPositiveInteger(source.page ?? source.current_page) ?? fallback.page
  const limit = toPositiveInteger(source.limit ?? source.page_size ?? source.per_page) ?? fallback.limit
  const offset = toNonNegativeInteger(source.offset) ?? (page - 1) * limit
  const total =
    toNonNegativeInteger(source.total ?? source.total_count ?? source.totalCount ?? source.count) ??
    (fallback.recordCount < limit ? offset + fallback.recordCount : null)
  const totalPages =
    toPositiveInteger(source.total_pages ?? source.totalPages) ??
    (typeof total === "number" ? Math.max(1, Math.ceil(total / limit)) : null)

  return {
    page,
    limit,
    offset,
    total,
    totalPages,
    hasNextPage: typeof source.next !== "undefined" ? Boolean(source.next) : totalPages !== null ? page < totalPages : fallback.recordCount >= limit,
    hasPreviousPage: typeof source.previous !== "undefined" ? Boolean(source.previous) : page > 1,
  }
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
  const rawName = record.nama_kabupaten ??
    record.Nama_Kabupaten ??
    record.id_kabupaten ??
    record.ID_Kabupaten ??
    "Tidak tersedia"

  if (rawName === "Tidak tersedia") return rawName;

  return rawName.replace(/([a-z])([A-Z])/g, '$1 $2').trim();
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
