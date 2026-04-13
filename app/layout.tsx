import type { Metadata } from "next";
import { Geist, Geist_Mono, Inter } from "next/font/google";
import "./globals.css";
import "leaflet/dist/leaflet.css";
import { cn } from "@/lib/utils";
import { AppSidebar } from "@/components/app-sidebar";
import { SidebarProvider, SidebarInset, SidebarTrigger } from "@/components/ui/sidebar";
import { Separator } from "@/components/ui/separator";
import { HeaderLocation } from "@/components/header-location";
import HeaderRoutes from "@/components/header-routes";

const inter = Inter({ subsets: ['latin'], variable: '--font-sans' });

const geistSans = Geist({
  variable: "--font-geist-sans",
  subsets: ["latin"],
});

const geistMono = Geist_Mono({
  variable: "--font-geist-mono",
  subsets: ["latin"],
});

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html
      lang="en"
      suppressHydrationWarning // Cukup tulis seperti ini
      className={cn(
        "h-full antialiased",
        geistSans.variable,
        geistMono.variable,
        inter.variable,
        "font-sans"
      )}
    >
      <body className="min-h-dvh overflow-x-hidden bg-background"> {/* Gunakan h-full agar sidebar mentok ke bawah */}
        <SidebarProvider>
          <AppSidebar />
          <SidebarInset className="min-h-dvh min-w-0 overflow-x-hidden">
            <HeaderRoutes />
            <main className="flex min-h-0 min-w-0 flex-1 flex-col gap-8 overflow-x-hidden p-6">
              <HeaderLocation />
              {children}
            </main>
          </SidebarInset>
        </SidebarProvider>
      </body>
    </html>
  );
}
