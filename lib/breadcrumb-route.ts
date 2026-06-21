// route
export const breadcrumbMap: Record<string, { parent: string; title: string; description: string }> = {
  "/dashboard/real-time-analysis/live-monitoring": {
    parent: "Analisis Risiko Ancaman Gempa Waktu Nyata",
    title: "Pantauan Gempa Terkini",
    description: "Pantauan data gempa bumi terbaru secara langsung (real-time) dari BMKG. Setiap kejadian gempa otomatis diprediksi masuk ke dalam kategori tingkat risiko tertentu (Tinggi/Sedang/Rendah) berdasarkan model Machine Learning yang telah dilatih dengan data historis."
  },
  "/dashboard/real-time-analysis/historical-monitoring": {
    parent: "Analisis Risiko Ancaman Gempa Waktu Nyata",
    title: "Riwayat Kejadian Gempa",
    description: "Tabel rekapitulasi riwayat gempa bumi yang telah terjadi dan tercatat oleh sistem. Setiap kejadian dilengkapi dengan hasil klasifikasi tingkat risikonya berdasarkan algoritma K-Medoids dari berbagai daerah."
  },
  "/dashboard/hazard-map/region-risk": {
    parent: "Pemetaan Risiko Ancaman Gempa",
    title: "Peta Kerawanan Wilayah",
    description: "Visualisasi peta tingkat kerawanan wilayah (Region Risk) menggunakan warna yang berbeda. Risiko statis untuk tiap daerah ditentukan oleh model K-Medoids berdasarkan data historis tingkat kerusakan, jumlah korban, dan frekuensi gempa di kabupaten/kota"
  },
  "/dashboard/hazard-map/historical-data": {
    parent: "Pemetaan Risiko Ancaman Gempa",
    title: "Data Statistik Risiko",
    description: "Statistik risiko ancaman gempa per kabupaten/kota mencakup nilai indeks risiko (0–100) hasil perhitungan algoritma K-Medoids, luasan wilayah terdampak, dan frekuensi kejadian gempa dalam periode waktu tahun 2001-2026."
  },
};