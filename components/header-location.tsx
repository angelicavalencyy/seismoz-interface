
import {
    Item,
    ItemContent,
    ItemDescription,
    ItemMedia,
    ItemTitle,
} from "@/components/ui/item"
import { Calendar, Clock, MapPin } from "lucide-react"

export function HeaderLocation() {
    return (
        <div className="w-full grid grid-cols-2 gap-x-6 gap-y-8">

            {/* titik lokasi User*/}
            <div className="flex grid grid-cols-1 gap-y-2">
                <h5 className="text-sm font-bold text-gray-800">Dimana</h5>
                <div className="flex grid grid-cols-2 gap-x-6">
                    <Item variant="outline">
                        <ItemMedia variant="icon">
                            <MapPin />
                        </ItemMedia>
                        <ItemContent>
                            <ItemTitle>Kamu berada di sini</ItemTitle>
                            <ItemDescription>
                                Surabaya
                            </ItemDescription>
                        </ItemContent>
                    </Item>
                    <Item variant="outline">
                        <ItemMedia variant="icon">
                            <MapPin />
                        </ItemMedia>
                        <ItemContent>
                            <ItemTitle>Kabupaten/Kota</ItemTitle>
                            <ItemDescription>
                                Surabaya
                            </ItemDescription>
                        </ItemContent>
                    </Item>
                </div>
            </div>

            <div className="flex grid grid-cols-1 gap-y-2">
                <h5 className="text-sm font-bold text-gray-800">Kapan</h5>
                <div className="flex grid grid-cols-2 gap-x-6">
                    <Item variant="outline">
                        <ItemMedia variant="icon">
                            <Calendar />
                        </ItemMedia>
                        <ItemContent>
                            <ItemTitle>Tanggal</ItemTitle>
                            <ItemDescription>
                                12 September 2024
                            </ItemDescription>
                        </ItemContent>
                    </Item>
                    <Item variant="outline">
                        <ItemMedia variant="icon">
                            <Clock />
                        </ItemMedia>
                        <ItemContent>
                            <ItemTitle>Waktu</ItemTitle>
                            <ItemDescription>
                                09:00 AM
                            </ItemDescription>
                        </ItemContent>
                    </Item>
                </div>
            </div>
        </div>
    )
}
