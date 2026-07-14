
"use client"

import { useEffect, useState } from "react"
import { Card, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Calendar, Clock, MapPinned, LocateFixed } from "lucide-react"

function TagCard({
    icon,
    title,
    description,
}: {
    icon: React.ReactNode
    title: string
    description: string
}) {
    return (
        <Card className="h-full rounded-lg border border-slate-100 bg-white">
            <CardHeader className="flex h-full flex-col items-start gap-2 p-4">
                <div className="flex gap-3">
                    <div className="flex shrink-0 items-center justify-center text-blue-600">
                        {icon}
                    </div>
                    <CardTitle className="w-full text-sm font-semibold text-slate-900">{title}</CardTitle>
                </div>
                    <CardDescription className="text-sm text-slate-600">{description}</CardDescription>
            </CardHeader>
        </Card>
    )
}

export function HeaderLocation({
    locationName,
    cityName,
    currentDate,
    currentTime,
    zoom = 5.8,
}: {
    locationName?: string
    cityName?: string
    currentDate?: string
    currentTime?: string
    zoom?: number
}) {
    const formatCurrentTime = () => {
        const now = new Date()
        const timeText = new Intl.DateTimeFormat("id-ID", {
            hour: "2-digit",
            minute: "2-digit",
            second: "2-digit",
            hour12: false,
            timeZone: "Asia/Jakarta",
        }).format(now)

        return `${timeText} WIB`
    }

    const [liveTime, setLiveTime] = useState(currentTime ?? "10:09:20 WIB")
    const [liveDate, setLiveDate] = useState(currentDate ?? "Mencari tanggal...")
    const [liveLocation, setLiveLocation] = useState(locationName ?? "Mencari lokasi...")
    const [liveCity, setLiveCity] = useState(cityName ?? "Mencari kota...")

    useEffect(() => {
        setLiveTime(formatCurrentTime())

        const now = new Date()
        const dateText = new Intl.DateTimeFormat("id-ID", {
            day: "2-digit",
            month: "short",
            year: "numeric",
        }).format(now)
        setLiveDate(currentDate ?? dateText)

        const timer = window.setInterval(() => {
            setLiveTime(formatCurrentTime())
        }, 1000)

        if (!locationName || !cityName) {
            if (navigator.geolocation) {
                navigator.geolocation.getCurrentPosition(
                    async (position) => {
                        try {
                            const [nomRes, bdcRes] = await Promise.all([
                                fetch(`https://nominatim.openstreetmap.org/reverse?format=json&lat=${position.coords.latitude}&lon=${position.coords.longitude}&zoom=18&addressdetails=1&accept-language=id`),
                                fetch(`https://api.bigdatacloud.net/data/reverse-geocode-client?latitude=${position.coords.latitude}&longitude=${position.coords.longitude}&localityLanguage=id`)
                            ]);
                            
                            const nomData = await nomRes.json();
                            const bdcData = await bdcRes.json();
                            
                            const address = nomData.address || {};
                            const parts = (nomData.display_name || "").split(",").map((s: string) => s.trim());
                            
                            // 1. Ekstrak Desa dari Nominatim (sumber paling akurat untuk tingkat desa/jalan)
                            let desa = address.village || address.suburb || address.hamlet || address.neighbourhood || parts[0] || "";
                            
                            // 2. Ekstrak Kecamatan dari BigDataCloud (sumber paling akurat untuk kecamatan / adminLevel 6)
                            let kecamatan = "";
                            if (bdcData.localityInfo && Array.isArray(bdcData.localityInfo.administrative)) {
                                // eslint-disable-next-line @typescript-eslint/no-explicit-any
                                const kecLevel = bdcData.localityInfo.administrative.find((level: any) => level.adminLevel === 6);
                                if (kecLevel) kecamatan = kecLevel.name;
                            }
                            // Terkadang BDC tidak punya adminLevel 6, tapi menyimpan nama kecamatan di property locality
                            if (!kecamatan && bdcData.locality) {
                                const bdcLocalityClean = bdcData.locality.replace(/^(Kecamatan|Kec\.?)\s+/i, "");
                                const desaClean = desa.replace(/^(Desa|Ds\.?)\s+/i, "");
                                // Pastikan locality ini bukan merupakan nama desa yang sama
                                if (bdcLocalityClean.toLowerCase() !== desaClean.toLowerCase()) {
                                    kecamatan = bdcData.locality;
                                }
                            }
                            // Fallback kecamatan ke Nominatim jika BDC gagal
                            if (!kecamatan) {
                                kecamatan = address.county || address.city_district || address.municipality || address.town || "";
                                if (!kecamatan && parts.length > 2) kecamatan = parts[1];
                            }

                            // 3. Ekstrak Kabupaten/Kota (gabungan BigDataCloud & Nominatim)
                            let kabKotaRaw = "";
                            if (bdcData.localityInfo && Array.isArray(bdcData.localityInfo.administrative)) {
                                // eslint-disable-next-line @typescript-eslint/no-explicit-any
                                const kabLevel = bdcData.localityInfo.administrative.find((level: any) => 
                                    level.adminLevel === 5 ||
                                    (level.description && (level.description.toLowerCase().includes("kabupaten") || level.description.toLowerCase().includes("kota"))) ||
                                    level.name.toLowerCase().includes("kabupaten") || 
                                    level.name.toLowerCase().startsWith("kota")
                                );
                                if (kabLevel) kabKotaRaw = kabLevel.name;
                            }
                            if (!kabKotaRaw) {
                                kabKotaRaw = address.state_district || address.city || address.county || "";
                            }
                            if (!kabKotaRaw) {
                                kabKotaRaw = parts.find((p: string) => p.toLowerCase().includes("kabupaten") || p.toLowerCase().startsWith("kota")) || parts[2] || "";
                            }
                            
                            if (kecamatan === kabKotaRaw) kecamatan = parts[1] !== kabKotaRaw ? parts[1] : ""; // Hindari duplikasi
                            let kabKotaName = kabKotaRaw.replace(/^(Kabupaten|Kota)\s+/i, "");

                            // 4. Bangun string Titik Aktif yang presisi
                            const cleanDesa = desa.replace(/^(Desa|Ds\.?)\s+/i, "");
                            const cleanKec = kecamatan.replace(/^(Kecamatan|Kec\.?)\s+/i, "");
                            
                            let mostAccurateLocation = "";
                            if (cleanDesa && cleanKec) {
                                mostAccurateLocation = `Ds. ${cleanDesa}, Kec. ${cleanKec}`;
                            } else if (cleanDesa) {
                                mostAccurateLocation = `Ds. ${cleanDesa}`;
                            } else if (cleanKec) {
                                mostAccurateLocation = `Kec. ${cleanKec}`;
                            } else {
                                mostAccurateLocation = nomData.name || bdcData.locality || "Lokasi ditemukan";
                            }
                            
                            const prov = address.state || address.region || bdcData.principalSubdivision || "";
                            const displayCity = kabKotaName || cleanKec || mostAccurateLocation;
                            
                            setLiveCity(cityName ?? displayCity);
                            setLiveLocation(locationName ?? `${mostAccurateLocation}${prov ? `, ${prov}` : ""}`);
                        } catch (e) {
                            const fallback = `${position.coords.latitude.toFixed(2)}, ${position.coords.longitude.toFixed(2)}`;
                            setLiveCity(cityName ?? fallback);
                            setLiveLocation(locationName ?? fallback);
                        }
                    },
                    () => {
                        setLiveCity(cityName ?? "Akses lokasi ditolak");
                        setLiveLocation(locationName ?? "Akses lokasi ditolak");
                    }
                );
            } else {
                setLiveCity(cityName ?? "Geolokasi tidak didukung");
                setLiveLocation(locationName ?? "Geolokasi tidak didukung");
            }
        }

        return () => {
            window.clearInterval(timer)
        }
    }, [cityName, locationName, currentDate])

    return (
        <div className="grid w-full grid-cols-1 gap-5 xl:grid-cols-2">
            <div className="flex flex-col gap-5">
                <div>
                    <h5 className="text-sm font-semibold text-slate-900">Lokasi Saat Ini</h5>
                    <p className="text-xs text-slate-500">Sinkron dengan titik gempa aktif dan skala peta</p>
                </div>
                <div className="grid gap-3 sm:grid-cols-2">
                    <TagCard
                        icon={<LocateFixed className="size-4" />}
                        title="Titik aktif"
                        description={liveLocation}
                    />

                    <TagCard
                        icon={<MapPinned className="size-4" />}
                        title="Kabupaten / Kota"
                        description={liveCity}
                    />
                </div>
            </div>

            <div className="flex flex-col gap-5">
                <div>
                    <h5 className="text-sm font-semibold text-slate-900">Waktu Saat Ini</h5>
                    <p className="text-xs text-slate-500">Sinkron dengan zona waktu Indonesia bagian barat</p>
                </div>
                <div className="grid gap-3 sm:grid-cols-2">
                    <TagCard
                        icon={<Calendar className="size-4" />}
                        title="Tanggal"
                        description={liveDate}
                    />

                    <TagCard
                        icon={<Clock className="size-4" />}
                        title="Waktu"
                        description={liveTime}
                    />
                </div>
            </div>
        </div>
    )
}
