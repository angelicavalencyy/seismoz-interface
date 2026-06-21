import { normalizeRiskMapGeojsonFeatures } from "@/lib/historical-data/geojson-api"

export const dynamic = "force-dynamic"

const GEOJSON_URL = "https://earthquakes-model-api.onrender.com/api/kmed/risk-map"

async function fetchRiskMapGeojsonSource() {
  const response = await fetch(GEOJSON_URL, {
    cache: "no-store",
  })

  if (!response.ok) {
    throw new Error(`Request failed with status ${response.status}`)
  }

  return response.json()
}

export async function GET() {
  try {
    const payload = await fetchRiskMapGeojsonSource()
    const features = normalizeRiskMapGeojsonFeatures(payload)

    return Response.json({
      source: "backend",
      features,
    })
  } catch {
    return Response.json({
      source: "fallback",
      features: [],
    })
  }
}