"use client"

import dynamic from 'next/dynamic';

// Import komponen Map secara dinamis
const MapWithNoSSR = dynamic(() => import('@/components/map-real-time'), {
    ssr: false,
    loading: () => <div className="h-full w-full bg-muted animate-pulse flex items-center justify-center">Loading Map...</div>
});


export default function RegionRiskMap() {
    return (
        <div className="flex flex-col flex-1 items-start justify-start font-sans dark:bg-black  dark:border-gray-800">
            <h1 className="text-2xl font-bold text-gray-800 dark:text-gray-200">Regional Risk Map</h1>
            <p className="text-gray-600 dark:text-gray-400">This is the real-time map analysis page.</p>
            <div className="flex flex-col gap-4 h-[calc(100vh-150px)] overflow-hidden rounded-xl shadow-lg">

                {/* Container Peta */}
                <MapWithNoSSR />
            </div>
        </div>
    );
}