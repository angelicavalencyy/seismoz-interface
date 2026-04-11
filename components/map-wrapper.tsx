"use client";

import dynamic from "next/dynamic";

const MapRealTime = dynamic(() => import("./map-real-time"), {
  ssr: false,
  loading: () => (
    <div className="h-full w-full flex items-center justify-center">
      Loading Map...
    </div>
  ),
});

export default function MapWrapper() {
  return <MapRealTime />;
}