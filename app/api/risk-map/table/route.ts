import { normalizeRiskMapPagination, normalizeRiskMapTableRecords } from "@/lib/historical-data/table-api"
import type { NextRequest } from "next/server"

export const dynamic = "force-dynamic"

const TABLE_URL = "https://earthquakes-model-api.onrender.com/api/risk-map/table"

function getPositiveInteger(value: string | null, fallback: number) {
  const parsed = Number.parseInt(value ?? "", 10)

  return Number.isFinite(parsed) && parsed > 0 ? parsed : fallback
}

function buildBackendUrl(request: NextRequest) {
  const requestParams = request.nextUrl.searchParams
  const page = getPositiveInteger(requestParams.get("page"), 1)
  const limit = getPositiveInteger(requestParams.get("limit"), 20)
  const offset = (page - 1) * limit
  const url = new URL(TABLE_URL)

  url.searchParams.set("page", String(page))
  url.searchParams.set("limit", String(limit))
  url.searchParams.set("offset", String(offset))

  for (const key of ["search", "wilayah", "region", "risk_level", "date", "tanggal"]) {
    const value = requestParams.get(key)

    if (value) {
      url.searchParams.set(key, value)
    }
  }

  return { url, page, limit }
}

async function fetchRiskMapTableSource(request: NextRequest) {
  const { url, page, limit } = buildBackendUrl(request)
  const response = await fetch(url, {
    cache: "no-store",
  })

  if (!response.ok) {
    throw new Error(`Request failed with status ${response.status}`)
  }

  return { payload: await response.json(), page, limit }
}

export async function GET(request: NextRequest) {
  try {
    const { payload, page, limit } = await fetchRiskMapTableSource(request)
    const records = normalizeRiskMapTableRecords(payload)
    const pagination = normalizeRiskMapPagination(payload, {
      page,
      limit,
      recordCount: records.length,
    })

    return Response.json({
      source: "backend",
      records,
      pagination,
    })
  } catch {
    return Response.json({
      source: "fallback",
      records: [],
      pagination: {
        page: 1,
        limit: 20,
        offset: 0,
        total: 0,
        totalPages: 1,
        hasNextPage: false,
        hasPreviousPage: false,
      },
    })
  }
}
