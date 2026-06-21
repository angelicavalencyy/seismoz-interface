import { normalizeRiskLevelLabel, toDateKey } from "./utils"
import type { RiskMapTableRecord } from "./table-api"

export type RiskMapGeojsonFeature = {
  id?: string | number
  type?: string
  geometry?: {
    type?: string
    coordinates?: unknown
  }
  properties?: RiskMapTableRecord
  [key: string]: unknown
}

type RiskMapGeojsonPayload = {
  type?: string
  features?: RiskMapGeojsonFeature[]
  data?: RiskMapGeojsonFeature[] | RiskMapGeojsonFeature
  results?: RiskMapGeojsonFeature[] | RiskMapGeojsonFeature
  geojson?: {
    type?: string
    features?: RiskMapGeojsonFeature[]
  }
}

export type RiskMapGeoPoint = {
  id: string
  latitude: number
  longitude: number
  feature: RiskMapGeojsonFeature
  record: RiskMapTableRecord
}

function flattenCoordinatePairs(value: unknown, points: Array<[number, number]> = []): Array<[number, number]> {
  if (!Array.isArray(value)) {
    return points
  }

  if (value.length === 2 && typeof value[0] === "number" && typeof value[1] === "number") {
    points.push([value[0], value[1]])
    return points
  }

  for (const item of value) {
    flattenCoordinatePairs(item, points)
  }

  return points
}

function getCentroidFromCoordinates(coordinates: unknown): { latitude: number; longitude: number } | null {
  const pairs = flattenCoordinatePairs(coordinates)

  if (pairs.length === 0) {
    return null
  }

  const [longitudeTotal, latitudeTotal] = pairs.reduce(
    (accumulator, [longitude, latitude]) => [accumulator[0] + longitude, accumulator[1] + latitude],
    [0, 0]
  )

  return {
    latitude: latitudeTotal / pairs.length,
    longitude: longitudeTotal / pairs.length,
  }
}

export function normalizeRiskMapGeojsonFeatures(payload: unknown): RiskMapGeojsonFeature[] {
  if (!payload || typeof payload !== "object") {
    return []
  }

  const feed = payload as RiskMapGeojsonPayload

  if (Array.isArray(payload)) {
    return payload.filter((item): item is RiskMapGeojsonFeature => Boolean(item) && typeof item === "object")
  }

  if (Array.isArray(feed.features)) {
    return feed.features
  }

  if (feed.geojson?.features && Array.isArray(feed.geojson.features)) {
    return feed.geojson.features
  }

  if (Array.isArray(feed.data)) {
    return feed.data
  }

  if (Array.isArray(feed.results)) {
    return feed.results
  }

  return []
}

export function getRiskMapGeojsonFeatureDateKey(feature: RiskMapGeojsonFeature): string {
  const record = feature.properties
  const sourceText =
    record?.created_at?.trim() ||
    record?.tanggal?.trim() ||
    record?.DateTime?.trim() ||
    record?.Tanggal?.trim() ||
    ""

  return toDateKey(sourceText)
}

export function getRiskMapGeojsonFeatureName(feature: RiskMapGeojsonFeature): string {
  const record = feature.properties

  return (
    record?.nama_kabupaten ??
    record?.Nama_Kabupaten ??
    record?.id_kabupaten ??
    record?.ID_Kabupaten ??
    "Tidak tersedia"
  )
}

export function getRiskMapGeojsonFeatureRiskLevel(feature: RiskMapGeojsonFeature): string {
  const record = feature.properties

  return normalizeRiskLevelLabel(record?.risk_level ?? record?.Risk_Level)
}

export function getRiskMapGeojsonFeatureRiskScore(feature: RiskMapGeojsonFeature): number | null {
  const record = feature.properties
  const rawScore = record?.risk_score ?? record?.Risk_Score

  if (typeof rawScore === "number") {
    return rawScore
  }

  if (typeof rawScore === "string") {
    const parsedScore = Number.parseFloat(rawScore)

    return Number.isNaN(parsedScore) ? null : parsedScore
  }

  return null
}

export function createRiskMapGeoPoints(features: RiskMapGeojsonFeature[]): RiskMapGeoPoint[] {
  return features.flatMap((feature, index) => {
    const record = feature.properties

    if (!record) {
      return []
    }

    const geometry = feature.geometry
    const directPoint = getCentroidFromCoordinates(geometry?.coordinates)

    if (!directPoint) {
      return []
    }

    const id = String(feature.id ?? record.id_kabupaten ?? record.nama_kabupaten ?? index)

    return [
      {
        id,
        latitude: directPoint.latitude,
        longitude: directPoint.longitude,
        feature,
        record,
      },
    ]
  })
}
