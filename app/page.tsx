"use client"
import LiveMonitoring from "@/app/dashboard/real-time-analysis/live-monitoring/page";
import HistoricalMonitoring from "@/app/dashboard/real-time-analysis/historical-monitoring/page";
import RegionRiskMap from "@/app/dashboard/hazard-map/region-risk/page"
import HistoricalData from "@/app/dashboard/hazard-map/historical-data/page";


export default function Page() {
  return (
    <>
      <LiveMonitoring />
      <HistoricalMonitoring />
      <RegionRiskMap />
      <HistoricalData />
    </>
  );
}
