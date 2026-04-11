// route
export const breadcrumbMap: Record<string, { parent: string; title: string }> = {
  "/dashboard/real-time-analysis/live-monitoring": {
    parent: "Analisis Risiko Ancaman Gempa Waktu Nyata",
    title: "Pantauan Gempa Terkini",
  },
  "/dashboard/real-time-analysis/historical-monitoring": {
    parent: "Analisis Risiko Ancaman Gempa Waktu Nyata",
    title: "Riwayat Kejadian Gempa",
  },
  "/dashboard/hazard-map/region-risk": {
    parent: "Pemetaan Risiko Ancaman Gempa",
    title: "Peta Kerawanan Wilayah",
  },
  "/dashboard/hazard-map/historical-data": {
    parent: "Pemetaan Risiko Ancaman Gempa",
    title: "Data Statistik Risiko",
  },
};