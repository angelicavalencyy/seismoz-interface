import { getStaticEarthquakeRecords, normalizeEarthquakeRecords } from "@/lib/earthquake"

export const dynamic = "force-dynamic"

const HISTORY_URL = "http://localhost:8000/api/realtime/history"

async function fetchHistorySource() {
  const response = await fetch(HISTORY_URL, {
    cache: "no-store",
  })

  if (!response.ok) {
    throw new Error(`Request failed with status ${response.status}`)
  }

  return response.json()
}

export async function GET() {
  try {
    const payload = await fetchHistorySource()
    const earthquakes = normalizeEarthquakeRecords(payload)

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
