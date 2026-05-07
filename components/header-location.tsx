
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

    useEffect(() => {
        setLiveTime(formatCurrentTime())

        const timer = window.setInterval(() => {
            setLiveTime(formatCurrentTime())
        }, 1000)

        return () => {
            window.clearInterval(timer)
        }
    }, [])

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
                        description={locationName ?? "Surabaya, Jawa Timur"}
                    />

                    <TagCard
                        icon={<MapPinned className="size-4" />}
                        title="Kabupaten / Kota"
                        description={cityName ?? "Surabaya"}
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
                        description={currentDate ?? "12 Apr 2026"}
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
