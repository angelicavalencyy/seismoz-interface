import { clusteredData } from "@/lib/data-gempa-statis"

export interface EarthquakeRecord {
  id?: string
  created_at?: string
  tanggal?: string
  jam?: string
  koordinat?: string
  latitude?: number
  longitude?: number
  magnitude?: number | string
  depth?: number | string
  wilayah?: string
  cluster?: number
  risk_level?: string
  Tanggal?: string
  Jam?: string
  DateTime?: string
  Coordinates?: string
  Koordinat?: string
  Lintang?: string
  Bujur?: string
  Magnitude?: string
  Kedalaman?: string
  Wilayah?: string
  Dirasakan?: string
}

export interface EarthquakeMapPoint {
  id: string
  latitude: number
  longitude: number
  record: EarthquakeRecord
}

type EarthquakeFeedPayload = {
  Infogempa?: {
    gempa?: EarthquakeRecord | EarthquakeRecord[]
  }
  data?: EarthquakeRecord[] | EarthquakeRecord
  results?: EarthquakeRecord[] | EarthquakeRecord
  features?: Array<{
    properties?: EarthquakeRecord
    [key: string]: unknown
  }>
}

export function getStaticEarthquakeRecords(): EarthquakeRecord[] {
  return clusteredData.flatMap((entry) => entry?.Infogempa?.gempa ?? [])
}

export function normalizeEarthquakeRecords(payload: unknown): EarthquakeRecord[] {
  if (!payload || typeof payload !== "object") {
    return []
  }

  const feed = payload as EarthquakeFeedPayload

  if (Array.isArray(payload)) {
    return payload.filter((item): item is EarthquakeRecord => Boolean(item) && typeof item === "object")
  }

  const gempa = feed.Infogempa?.gempa

  if (Array.isArray(gempa)) {
    return gempa
  }

  if (gempa && typeof gempa === "object") {
    return [gempa]
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

  if (Array.isArray(feed.features)) {
    return feed.features.flatMap((feature) => (feature.properties ? [feature.properties] : []))
  }

  return []
}

export function mergeEarthquakeRecords(records: EarthquakeRecord[][]): EarthquakeRecord[] {
  const merged = records.flat()
  const seen = new Set<string>()

  return merged.filter((record) => {
    const key =
      record.id ??
      record.DateTime ??
      record.created_at ??
      `${record.tanggal ?? record.Tanggal ?? ""}-${record.jam ?? record.Jam ?? ""}-${record.wilayah ?? record.Wilayah ?? ""}`

    if (seen.has(key)) {
      return false
    }

    seen.add(key)
    return true
  })
}

export function getEarthquakeLocation(record: EarthquakeRecord): string {
  return record.koordinat ?? record.Koordinat ?? record.Coordinates ?? "Tidak tersedia"
}

export function getEarthquakeRecordId(record: EarthquakeRecord, index?: number): string {
  return [
    record.id,
    record.DateTime,
    record.tanggal,
    record.Tanggal,
    record.jam,
    record.Jam,
    record.wilayah,
    record.Wilayah,
    record.koordinat ?? record.Koordinat ?? record.Coordinates,
    record.latitude,
    record.longitude,
    record.magnitude,
    record.Magnitude,
    record.depth,
    record.Kedalaman,
    record.cluster,
    record.risk_level,
    index,
  ]
    .map((value) => (value === undefined || value === null ? "" : String(value).trim()))
    .filter((value) => value.length > 0)
    .join("|")
}

export function parseEarthquakeCoordinates(record: EarthquakeRecord): { latitude: number; longitude: number } | null {
  if (typeof record.latitude === "number" && typeof record.longitude === "number") {
    return { latitude: record.latitude, longitude: record.longitude }
  }

  const rawCoordinates = record.koordinat ?? record.Koordinat ?? record.Coordinates

  if (!rawCoordinates) {
    return null
  }

  const [latitudeText, longitudeText] = rawCoordinates
    .split(",")
    .map((part) => part.trim())

  const latitude = Number.parseFloat(latitudeText)
  const longitude = Number.parseFloat(longitudeText)

  if (Number.isNaN(latitude) || Number.isNaN(longitude)) {
    return null
  }

  return { latitude, longitude }
}

export function createEarthquakeMapPoints(records: EarthquakeRecord[]): EarthquakeMapPoint[] {
  return records.flatMap((record, index) => {
    const coordinates = parseEarthquakeCoordinates(record)

    if (!coordinates) {
      return []
    }

    return [
      {
        id: getEarthquakeRecordId(record, index),
        latitude: coordinates.latitude,
        longitude: coordinates.longitude,
        record,
      },
    ]
  })
}