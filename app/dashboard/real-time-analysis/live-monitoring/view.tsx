"use client"
import MapWrapper from "@/components/map-wrapper";

export default function LiveMonitoring() {
    return (
        <div className="flex flex-col flex-1 w-full font-sans dark:bg-black dark:border-gray-800">
            <h1 className="text-2xl font-bold text-gray-800 dark:text-gray-200">Real Time Map Analysis</h1>
            <p className="text-gray-600 dark:text-gray-400">This is the real-time map analysis page.</p>
            <div className="flex flex-col gap-4 w-full h-[calc(100vh-150px)] mt-4">
                <div className="w-full flex-1 overflow-hidden rounded-xl shadow-lg">
                    <MapWrapper />
                </div>
            </div>
        </div>
    );
}