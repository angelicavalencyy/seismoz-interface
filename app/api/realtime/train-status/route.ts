export const dynamic = "force-dynamic"

const TRAIN_STATUS_URL = "https://earthquakes-model-api.onrender.com/api/realtime/train-status"

export async function GET() {
  try {
    const response = await fetch(TRAIN_STATUS_URL, {
      cache: "no-store",
    })

    if (!response.ok) {
      throw new Error(`Request failed with status ${response.status}`)
    }

    const data = await response.json()

    return Response.json(data)
  } catch {
    return Response.json(
      {
        model_version: null,
        cluster: null,
        trained_at: null,
        model_hash: null,
        total_data_trained: null,
        total_earthquakes_trained: null,
      },
      { status: 200 }
    )
  }
}
