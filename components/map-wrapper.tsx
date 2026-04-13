"use client";

import dynamic from "next/dynamic";
import type { EarthquakeMapPoint, EarthquakeRecord } from "@/lib/earthquake";

const MapRealTime = dynamic(() => import("./map-real-time"), {
  ssr: false,
  loading: () => (
    <div className="h-full w-full flex items-center justify-center">
      Loading Map...
    </div>
  ),
});

export default function MapWrapper({
  earthquakes,
  selectedEarthquake,
  onSelectEarthquake,
  onZoomChange,
}: {
  earthquakes: EarthquakeMapPoint[]
  selectedEarthquake: EarthquakeRecord | null
  onSelectEarthquake: (record: EarthquakeRecord) => void
  onZoomChange: (zoom: number) => void
}) {
  return (
    <MapRealTime
      earthquakes={earthquakes}
      selectedEarthquake={selectedEarthquake}
      onSelectEarthquake={onSelectEarthquake}
      onZoomChange={onZoomChange}
    />
  );
}