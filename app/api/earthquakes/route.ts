import {
  getStaticEarthquakeRecords,
  mergeEarthquakeRecords,
  normalizeEarthquakeRecords,
} from "@/lib/earthquake"

export const dynamic = "force-dynamic"

const EARTHQUAKE_URLS = [
  "http://localhost:8000/api/realtime/auto",
  "http://localhost:8000/api/realtime/history",
  "http://localhost:8000/api/risk-map/geojson",
  "http://localhost:8000/api/risk-map/table",
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