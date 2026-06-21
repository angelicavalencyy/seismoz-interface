// components/header-routes.tsx
"use client";

import { useEffect, useState } from "react";
import { usePathname } from "next/navigation";
import { Info, Clock, Database, Layers, Hash } from "lucide-react";
import { SidebarTrigger } from "@/components/ui/sidebar";
import { Separator } from "@/components/ui/separator";
import {
  Breadcrumb,
  BreadcrumbItem,
  BreadcrumbLink,
  BreadcrumbList,
  BreadcrumbPage,
  BreadcrumbSeparator,
} from "@/components/ui/breadcrumb";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from "@/components/ui/tooltip";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { breadcrumbMap } from "@/lib/breadcrumb-route";

interface TrainStatus {
  model_version: string | null;
  cluster: number | null;
  trained_at: string | null;
  model_hash: string | null;
  total_data_trained: number | null;
  total_earthquakes_trained: number | null;
}

function formatTrainedAt(isoDate: string | null): string {
  if (!isoDate) return "Belum tersedia";
  try {
    const date = new Date(isoDate);
    return date.toLocaleDateString("id-ID", {
      day: "2-digit",
      month: "short",
      year: "numeric",
      hour: "2-digit",
      minute: "2-digit",
      timeZoneName: "short",
    });
  } catch {
    return isoDate;
  }
}

export default function HeaderRoutes() {
  const pathname = usePathname();
  const crumb = breadcrumbMap[pathname];

  const [trainStatus, setTrainStatus] = useState<TrainStatus | null>(null);

  useEffect(() => {
    let isActive = true;

    async function fetchStatus() {
      try {
        const response = await fetch("/api/realtime/train-status", {
          cache: "no-store",
        });
        if (!response.ok) return;
        const data = (await response.json()) as TrainStatus;
        if (isActive) setTrainStatus(data);
      } catch {
        // Silently fail — the header will show fallback text
      }
    }

    void fetchStatus();

    return () => {
      isActive = false;
    };
  }, []);

  const modelVersion = trainStatus?.model_version ?? "—";
  const clusterCount = trainStatus?.cluster ?? "—";
  const trainedAt = formatTrainedAt(trainStatus?.trained_at ?? null);
  const totalData = trainStatus?.total_data_trained ?? "—";
  const totalEarthquakes = trainStatus?.total_earthquakes_trained ?? "—";
  const modelHash = trainStatus?.model_hash
    ? trainStatus.model_hash.substring(0, 12) + "…"
    : "—";

  return (
    <header className="flex h-18 shrink-0 items-center justify-between gap-2 border-b px-4">
      <div className="flex items-center gap-2">
        <SidebarTrigger />
        <Separator
          orientation="vertical"
          className="mr-2 data-vertical:h-4 data-vertical:self-auto"
        />
        <Breadcrumb>
          <BreadcrumbList>
            {crumb ? (
              <>
                <BreadcrumbItem className="hidden md:block">
                  <BreadcrumbLink href="#">{crumb.parent}</BreadcrumbLink>
                </BreadcrumbItem>
                <BreadcrumbSeparator className="hidden md:block" />
                <BreadcrumbItem className="flex items-center gap-2">
                  <BreadcrumbPage>{crumb.title}</BreadcrumbPage>
                  
                  {/* Info Dialog Trigger */}
                  {crumb.description && (
                    <Dialog>
                      <DialogTrigger asChild>
                        <Button variant="ghost" size="icon-sm" className="h-6 w-6 text-muted-foreground hover:text-foreground">
                          <Info className="h-4 w-4" />
                        </Button>
                      </DialogTrigger>
                      <DialogContent className="sm:max-w-md">
                        <DialogHeader>
                          <DialogTitle>{crumb.title}</DialogTitle>
                          <DialogDescription className="pt-3 leading-relaxed">
                            {crumb.description}
                          </DialogDescription>
                        </DialogHeader>
                      </DialogContent>
                    </Dialog>
                  )}
                </BreadcrumbItem>
              </>
            ) : (
              <BreadcrumbItem>
                <BreadcrumbPage>Dashboard</BreadcrumbPage>
              </BreadcrumbItem>
            )}
          </BreadcrumbList>
        </Breadcrumb>
      </div>

      {/* Model Info Indicators */}
      <TooltipProvider delayDuration={200}>
        <div className="flex items-center gap-2">
          {/* Model Version */}
          {/* <Tooltip>
            <TooltipTrigger asChild>
              <Badge variant="secondary" className="flex items-center gap-1.5 px-2.5 py-1 text-xs font-normal text-muted-foreground">
                <Layers className="h-3.5 w-3.5" />
                <span className="font-medium text-foreground">{modelVersion}</span>
              </Badge>
            </TooltipTrigger>
            <TooltipContent>
              <p>Versi Model &middot; {clusterCount} Cluster</p>
            </TooltipContent>
          </Tooltip> */}

          {/* Total Data Trained */}
          <Tooltip>
            <TooltipTrigger asChild>
              <Badge variant="secondary" className="flex items-center gap-1.5 px-2.5 py-1 text-xs font-normal text-muted-foreground">
                <Database className="h-3.5 w-3.5" />
                <span className="font-medium text-foreground">{totalData} wilayah</span>
              </Badge>
            </TooltipTrigger>
            <TooltipContent>
              <p>Total data wilayah di-training &middot; {typeof totalEarthquakes === "number" ? totalEarthquakes.toLocaleString("id-ID") : totalEarthquakes} kejadian gempa</p>
            </TooltipContent>
          </Tooltip>

          {/* Model Hash */}
          {/* <Tooltip>
            <TooltipTrigger asChild>
              <Badge variant="secondary" className="hidden xl:flex items-center gap-1.5 px-2.5 py-1 text-xs font-normal text-muted-foreground">
                <Hash className="h-3.5 w-3.5" />
                <span className="font-mono font-medium text-foreground">{modelHash}</span>
              </Badge>
            </TooltipTrigger>
            <TooltipContent>
              <p>Model Hash: {trainStatus?.model_hash ?? "—"}</p>
            </TooltipContent>
          </Tooltip> */}

          {/* Last Trained */}
          {/* <Badge variant="secondary" className="flex items-center gap-1.5 px-2.5 py-1 text-xs font-normal text-muted-foreground">
            <Clock className="h-3.5 w-3.5" />
            Model Diperbarui: <span className="font-medium text-foreground">{trainedAt}</span>
          </Badge> */}

        </div>
      </TooltipProvider>
    </header>
  );
}