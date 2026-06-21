
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
                            const res = await fetch(`https://api.bigdatacloud.net/data/reverse-geocode-client?latitude=${position.coords.latitude}&longitude=${position.coords.longitude}&localityLanguage=id`);
                            const data = await res.json();
                            const city = data.city || data.locality || "Lokasi ditemukan";
                            const prov = data.principalSubdivision || "";
                            setLiveCity(cityName ?? city);
                            setLiveLocation(locationName ?? `${city}${prov ? `, ${prov}` : ""}`);
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
