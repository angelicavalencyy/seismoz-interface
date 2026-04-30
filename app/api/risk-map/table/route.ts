import { normalizeRiskMapTableRecords } from "@/lib/historical-data/table-api"

export const dynamic = "force-dynamic"

const TABLE_URL = "http://localhost:8000/api/risk-map/table"

async function fetchRiskMapTableSource() {
  const response = await fetch(TABLE_URL, {
    cache: "no-store",
  })

  if (!response.ok) {
    throw new Error(`Request failed with status ${response.status}`)
  }

  return response.json()
}

export async function GET() {
  try {
    const payload = await fetchRiskMapTableSource()
    const records = normalizeRiskMapTableRecords(payload)

    return Response.json({
      source: "backend",
      records,
    })
  } catch {
    return Response.json({
      source: "fallback",
      records: [],
    })
  }
}
