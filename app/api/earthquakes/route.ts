import {
  getStaticEarthquakeRecords,
  mergeEarthquakeRecords,
  normalizeEarthquakeRecords,
} from "@/lib/earthquake"

export const dynamic = "force-dynamic"

const EARTHQUAKE_URLS = [
  "https://earthquakes-model-api.onrender.com/api/realtime/auto",
  "https://earthquakes-model-api.onrender.com/api/realtime/history",
  // "https://earthquakes-model-api.onrender.com/api/risk-map/geojson",
  "https://earthquakes-model-api.onrender.com/api/risk-map/table",
  "https://earthquakes-model-api.onrender.com/api/kmed/risk-map"
]

async function fetchEarthquakeSource(url: string) {
  const response = await fetch(url, {
    cache: "no-store",
  })

  if (!response.ok) {
    throw new Error(`Request failed with status ${response.status}`)
  }

  return response.json()
}

export async function GET() {
  try {
    const payloads = await Promise.allSettled(EARTHQUAKE_URLS.map((url) => fetchEarthquakeSource(url)))
    const earthquakes = mergeEarthquakeRecords(
      payloads
        .filter((result): result is PromiseFulfilledResult<unknown> => result.status === "fulfilled")
        .map((result) => normalizeEarthquakeRecords(result.value))
    )

    if (earthquakes.length === 0) {
      return Response.json({
        source: "fallback",
        earthquakes: getStaticEarthquakeRecords(),
      })
    }

    return Response.json({
      source: "backend",
      earthquakes,
    })
  } catch {
    return Response.json({
      source: "fallback",
      earthquakes: getStaticEarthquakeRecords(),
    })
  }
}