"use client"

import MapWrapper from "@/components/map-wrapper"
import { EarthquakeCardList } from "@/components/card-detail-earthquake"
import type { EarthquakeMapPoint, EarthquakeRecord } from "@/lib/earthquake"

export function HistoricalMapPanel({
  earthquakes,
  selectedEarthquake,
  selectedId,
  selectionToken,
  onSelectEarthquake,
}: {
  earthquakes: EarthquakeMapPoint[]
  selectedEarthquake: EarthquakeRecord | null
  selectedId: string | null
  selectionToken: number
  onSelectEarthquake: (record: EarthquakeRecord) => void
}) {
  return (
    <div className="flex h-[calc(100vh-180px)] w-full flex-row gap-4 overflow-hidden">
      <div className="mt-4 flex w-1/3 flex-col gap-4 overflow-y-auto overflow-x-hidden pr-2">
        <EarthquakeCardList earthquakes={earthquakes.map((point) => point.record)} selectedId={selectedId} onSelect={onSelectEarthquake} />
      </div>

      <div className="mt-4 flex min-h-0 w-2/3 flex-col gap-4">
        <div className="w-full flex-1 overflow-hidden rounded-2xl border border-slate-200 shadow-lg">
          <MapWrapper
            key={selectionToken}
            earthquakes={earthquakes}
            selectedEarthquake={selectedEarthquake}
            onSelectEarthquake={onSelectEarthquake}
            onZoomChange={() => undefined}
          />
        </div>
      </div>
    </div>
  )
}
