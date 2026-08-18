import {
  BadgeCheck,
  BarChart3,
  Building,
  Building2,
  LayoutDashboard,
  Settings,
  ShieldCheck,
  Users,
  Wallet,
  Wrench,
  type LucideIcon,
} from "lucide-react"

import { ROUTES } from "@/lib/constants"

export interface NavModule {
  key: string
  label: string
  description: string
  icon: LucideIcon
  href: string
  enabled: boolean
  /** Resting-state icon color from the design; active state always forces white. */
  accentClassName?: string
}

// Exact module order + icons + resting accent colors from
// ClaudeCode_Rebuild_Prompt.md ("Page title + module nav row" section).
export const NAV_MODULES: NavModule[] = [
  {
    key: "overview",
    label: "Overview",
    description: "Live performance tracking and analytical snapshots.",
    icon: LayoutDashboard,
    href: ROUTES.dashboard,
    enabled: true,
  },
  {
    key: "buildings",
    label: "Buildings",
    description: "Structural management and facilities operation.",
    icon: Building,
    href: ROUTES.buildings,
    enabled: true,
    accentClassName: "text-slate-800",
  },
  {
    key: "properties",
    label: "Properties",
    description: "Portfolio inventory and high-level asset overview.",
    icon: Building2,
    href: ROUTES.properties,
    enabled: true,
    accentClassName: "text-blue-600",
  },
  {
    key: "tenants",
    label: "Tenants",
    description: "Resident profiles and CRM communication tools.",
    icon: Users,
    href: ROUTES.tenants,
    enabled: true,
    accentClassName: "text-sky-600",
  },
  {
    key: "contracts",
    label: "Contracts",
    description: "Lease management and legal documentation.",
    icon: ShieldCheck,
    href: ROUTES.contracts,
    enabled: true,
    accentClassName: "text-amber-700",
  },
  {
    key: "finance",
    label: "Finance",
    description: "Collections, disbursements, and financial audits.",
    icon: Wallet,
    // Points at Payments until the /finance overview lands — there is no
    // /finance route yet, so ROUTES.finance would 404.
    href: ROUTES.payments,
    enabled: true,
    accentClassName: "text-emerald-600",
  },
  {
    key: "services",
    label: "Services",
    description: "Work orders, vendor management, and technical requests.",
    icon: Wrench,
    href: "#",
    enabled: false,
    accentClassName: "text-amber-600",
  },
  {
    key: "staffing",
    label: "Staffing",
    description: "Team management and RBAC permissions.",
    icon: BadgeCheck,
    href: "#",
    enabled: false,
    accentClassName: "text-purple-600",
  },
  {
    key: "reports",
    label: "Reports",
    description: "Comprehensive data exports and BI analysis.",
    icon: BarChart3,
    href: "#",
    enabled: false,
    accentClassName: "text-rose-600",
  },
  {
    key: "settings",
    label: "Settings",
    description: "General system configuration and preferences.",
    icon: Settings,
    href: "#",
    enabled: false,
    accentClassName: "text-slate-400",
  },
]
