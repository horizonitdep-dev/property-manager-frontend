"use client"

import { useQuery } from "@tanstack/react-query"
import { AlertTriangle, Building2, DoorOpen, Wallet, Wrench } from "lucide-react"

import { Skeleton } from "@/components/ui/skeleton"
import { cn } from "@/lib/utils"
import { QUERY_KEYS } from "@/lib/constants"
import { usePageHeader } from "@/hooks/use-page-header"
import { buildingService } from "@/services/building-service"
import { useAuthStore } from "@/store/auth-store"

interface KpiCardConfig {
  key: string
  icon: typeof Building2
  isReal: boolean
  gradientClassName: string
  glowClassName: string
  shadowClassName: string
  pillLabel: string
  pillClassName: string
  dotClassName: string
  sublabel: string
}

const KPI_CARDS: KpiCardConfig[] = [
  {
    key: "buildings",
    icon: Building2,
    isReal: true,
    gradientClassName: "gradient-icon-blue",
    glowClassName: "icon-glow-blue",
    shadowClassName: "shadow-blue-500/40",
    pillLabel: "Total Assets",
    pillClassName: "bg-blue-100/50 text-blue-600 border border-blue-200",
    dotClassName: "bg-blue-500",
    sublabel: "Buildings in Portfolio",
  },
  {
    key: "occupancy",
    icon: DoorOpen,
    isReal: false,
    gradientClassName: "gradient-icon-emerald",
    glowClassName: "icon-glow-emerald",
    shadowClassName: "shadow-emerald-500/40",
    pillLabel: "Occupancy",
    pillClassName: "bg-emerald-100/50 text-emerald-700 border border-emerald-200",
    dotClassName: "bg-emerald-500",
    sublabel: "Global Occupancy",
  },
  {
    key: "revenue",
    icon: Wallet,
    isReal: false,
    gradientClassName: "gradient-icon-purple",
    glowClassName: "icon-glow-purple",
    shadowClassName: "shadow-purple-500/40",
    pillLabel: "Net Profit",
    pillClassName: "bg-purple-100/50 text-purple-700 border border-purple-200",
    dotClassName: "bg-purple-500",
    sublabel: "Monthly Yield",
  },
  {
    key: "arrears",
    icon: AlertTriangle,
    isReal: false,
    gradientClassName: "gradient-icon-rose",
    glowClassName: "icon-glow-rose",
    shadowClassName: "shadow-rose-500/40",
    pillLabel: "Arrears",
    pillClassName: "bg-rose-100/50 text-rose-700 border border-rose-200",
    dotClassName: "bg-rose-500",
    sublabel: "Action Required",
  },
  {
    key: "maintenance",
    icon: Wrench,
    isReal: false,
    gradientClassName: "gradient-icon-amber",
    glowClassName: "icon-glow-amber",
    shadowClassName: "shadow-amber-500/40",
    pillLabel: "Maintenance",
    pillClassName: "bg-amber-100/50 text-amber-700 border border-amber-200",
    dotClassName: "bg-amber-500",
    sublabel: "Open Tickets",
  },
]

export default function DashboardPage() {
  const user = useAuthStore((state) => state.user)

  const buildingsQuery = useQuery({
    queryKey: QUERY_KEYS.buildings({ page: 1, limit: 1 }),
    queryFn: () => buildingService.list({ page: 1, limit: 1 }),
  })

  usePageHeader({
    title: (
      <>
        Portfolio <span className="italic text-secondary">Overview</span>
      </>
    ),
    subtitle: <>Welcome back{user?.name ? `, ${user.name}` : ""}. Here&apos;s a snapshot of your managed portfolio.</>,
  })

  return (
    <div className="grid grid-cols-1 gap-8 sm:grid-cols-2 lg:grid-cols-5">
      {KPI_CARDS.map((card, index) => {
        const Icon = card.icon
        return (
          <div key={card.key} className="infographic-card group relative overflow-hidden rounded-3xl p-8">
            {index === 0 && <div className="animated-bg-shape -right-20 -top-20" />}

            <div className="relative z-10 mb-8 flex items-start justify-between">
              <div
                className={cn(
                  "flex h-16 w-16 items-center justify-center rounded-2xl text-white shadow-2xl transition-transform group-hover:scale-110",
                  card.gradientClassName,
                  card.glowClassName,
                  card.shadowClassName
                )}
              >
                <Icon className="h-8 w-8" />
              </div>
              <span className={cn("status-badge-vibrant", card.pillClassName)}>{card.pillLabel}</span>
            </div>

            <div className="relative z-10">
              {card.isReal ? (
                buildingsQuery.isLoading ? (
                  <Skeleton className="h-12 w-20" />
                ) : (
                  <h3 className="font-display text-5xl font-black tracking-tighter text-primary">
                    {buildingsQuery.isError ? "—" : (buildingsQuery.data?.meta.total ?? 0)}
                  </h3>
                )
              ) : (
                <h3 className="font-display text-5xl font-black tracking-tighter text-primary">—</h3>
              )}
              <p className="mt-2 flex items-center gap-2 text-sm font-bold text-on-surface-variant">
                <span className={cn("h-1 w-1 rounded-full", card.dotClassName)} /> {card.sublabel}
              </p>
            </div>

            <div className="pointer-events-none absolute -bottom-6 -right-6 z-0 text-primary opacity-[0.05] transition-opacity group-hover:opacity-[0.08]">
              <Icon className="h-40 w-40" />
            </div>
          </div>
        )
      })}
    </div>
  )
}
