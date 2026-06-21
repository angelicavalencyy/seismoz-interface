import { getStaticEarthquakeRecords, normalizeEarthquakeRecords } from "@/lib/earthquake"

export const dynamic = "force-dynamic"

const AUTO_URL = "https://earthquakes-model-api.onrender.com/api/realtime/auto"

async function fetchAutoSource() {
  const response = await fetch(AUTO_URL, {
    cache: "no-store",
  })

  if (!response.ok) {
    throw new Error(`Request failed with status ${response.status}`)
  }

  return response.json()
}

export async function GET() {
  try {
    const payload = await fetchAutoSource()
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
