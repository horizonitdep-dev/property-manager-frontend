import { ROUTES } from "@/lib/constants"

export interface SelectModule {
  key: string
  label: string
  description: string
  iconSrc: string
  href: string
  enabled: boolean
  /** Icon-container shadow tint from design/menu select/code.html */
  shadowClassName: string
}

// Matches design/menu select/code.html's 12-card grid exactly (copy + order).
export const SELECT_MODULES: SelectModule[] = [
  {
    key: "dashboard",
    label: "Dashboard",
    description: "Live performance tracking and analytical snapshots.",
    iconSrc: "/icons/dashboard.png",
    href: ROUTES.dashboard,
    enabled: true,
    shadowClassName: "shadow-secondary/10",
  },
  {
    key: "buildings",
    label: "Buildings",
    description: "Structural management and facilities operation.",
    iconSrc: "/icons/buildings.png",
    href: ROUTES.buildings,
    enabled: true,
    shadowClassName: "shadow-orange-600/10",
  },
  {
    key: "properties",
    label: "Properties",
    description: "Portfolio inventory and high-level asset overview.",
    iconSrc: "/icons/properties.png",
    href: ROUTES.properties,
    enabled: true,
    shadowClassName: "shadow-emerald-600/10",
  },
  {
    key: "tenants",
    label: "Tenants",
    description: "Resident profiles and CRM communication tools.",
    iconSrc: "/icons/tenants.png",
    href: ROUTES.tenants,
    enabled: true,
    shadowClassName: "shadow-indigo-600/10",
  },
  {
    key: "contracts",
    label: "Contracts",
    description: "Lease management and legal documentation.",
    iconSrc: "/icons/contracts.png",
    href: "#",
    enabled: false,
    shadowClassName: "shadow-rose-600/10",
  },
  {
    key: "finance",
    label: "Finance",
    description: "Collections, disbursements, and financial audits.",
    iconSrc: "/icons/finance.png",
    href: "#",
    enabled: false,
    shadowClassName: "shadow-cyan-600/10",
  },
  {
    key: "maintenance",
    label: "Maintenance",
    description: "Work order flow and technical request tracking.",
    iconSrc: "/icons/maintenance.png",
    href: "#",
    enabled: false,
    shadowClassName: "shadow-slate-700/10",
  },
  {
    key: "contracting",
    label: "Contracting",
    description: "Vendor management and large scale projects.",
    iconSrc: "/icons/contracting.png",
    href: "#",
    enabled: false,
    shadowClassName: "shadow-fuchsia-700/10",
  },
  {
    key: "staff",
    label: "Staff",
    description: "Team management and RBAC permissions.",
    iconSrc: "/icons/staff.png",
    href: "#",
    enabled: false,
    shadowClassName: "shadow-teal-700/10",
  },
  {
    key: "reports",
    label: "Reports",
    description: "Comprehensive data exports and BI analysis.",
    iconSrc: "/icons/reports.png",
    href: "#",
    enabled: false,
    shadowClassName: "shadow-blue-600/10",
  },
  {
    key: "profit-loss",
    label: "Profit & Loss",
    description: "Revenue analysis and expense management.",
    iconSrc: "/icons/profit-loss.png",
    href: "#",
    enabled: false,
    shadowClassName: "shadow-orange-600/10",
  },
  {
    key: "settings",
    label: "Settings",
    description: "General system configuration and preferences.",
    iconSrc: "/icons/settings.png",
    href: "#",
    enabled: false,
    shadowClassName: "shadow-slate-400/10",
  },
]
