"use client"

import * as React from "react"
import {
  Sidebar,
  SidebarContent,
  SidebarGroup,
  SidebarHeader,
  SidebarMenu,
  SidebarMenuButton,
  SidebarMenuItem,
  SidebarMenuSub,
  SidebarMenuSubButton,
  SidebarMenuSubItem,
  SidebarRail,
} from "@/components/ui/sidebar"

import Image from "next/image";
import Logo from "../public/images/SEISMOZ_ORI_1_1.png";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { useEffect, useState } from "react";

const data = {
  navMain: [
    {
      title: "Analisis Risiko Ancaman Gempa Waktu Nyata",
      url: "#",
      items: [
        {
          title: "Pantauan Gempa Terkini",
          url: "/dashboard/real-time-analysis/live-monitoring",
        },
        {
          title: "Riwayat Kejadian Gempa",
          url: "/dashboard/real-time-analysis/historical-monitoring",
        },
      ],
    },

    {
      title: "Pemetaan Risiko Ancaman Gempa",
      url: "#",
      items: [
        {
          title: "Peta Kerawanan Wilayah",
          url: "/dashboard/hazard-map/region-risk",
        },
        {
          title: "Data Statistik Risiko",
          url: "/dashboard/hazard-map/historical-data", 
        },
      ],
    },
  ],
}

export function AppSidebar({ ...props }: React.ComponentProps<typeof Sidebar>) {
  const pathname = usePathname();
  const [mounted, setMounted] = useState(false)

  useEffect(() => {
    setMounted(true)
  }, [])

  const activePath = mounted ? pathname : ""

  return (
    <Sidebar {...props} >
      <SidebarHeader className="border-b bg-white">
        <SidebarMenu>
          <SidebarMenuItem>
            {/* Hapus asChild dan Link agar header menjadi statis */}
            <div className="flex items-center gap-3 p-2">
              <div className="flex aspect-square size-8 items-center justify-center">
                <Image src={Logo} alt="seismoz logo" width={80} height={80} />
              </div>
              <div className="flex flex-col gap-0.5 leading-none">
                <span className="font-bold text-md">Seismoz</span>
                <span className="font-medium text-sm text-muted-foreground">v1.0.0</span>
              </div>
            </div>
          </SidebarMenuItem>
        </SidebarMenu>
      </SidebarHeader>

      <SidebarContent className="bg-white">
        <SidebarGroup>
          <SidebarMenu>
            {data.navMain.map((item) => (
              <SidebarMenuItem key={item.title}>
                {/* Judul Kategori: Pakem (Statis) */}
                <div className="px-2 py-2 text-sm font-semibold tracking-wider text-base select-none">
                  {item.title}
                </div>

                {item.items?.length ? (
                  <SidebarMenuSub className="text-xs text-base">
                    {item.items.map((subItem) => (
                      <SidebarMenuSubItem key={subItem.title}>
                        {/* Hanya di sini yang menggunakan Link dan asChild agar bisa diklik */}
                        <SidebarMenuSubButton
                          asChild
                          isActive={activePath === subItem.url}
                        >
                          <Link href={subItem.url}>
                            <span>{subItem.title}</span>
                          </Link>
                        </SidebarMenuSubButton>
                      </SidebarMenuSubItem>
                    ))}
                  </SidebarMenuSub>
                ) : null}
              </SidebarMenuItem>
            ))}
          </SidebarMenu>
        </SidebarGroup>
      </SidebarContent>
      <SidebarRail />
    </Sidebar>
  )
}