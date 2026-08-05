import { Building, Building2, ShieldCheck, Users, type LucideIcon } from "lucide-react"

import { ROUTES } from "@/lib/constants"
import type { ImportModuleKey } from "@/types/import"

export interface ImportModuleConfig {
  key: ImportModuleKey
  label: string
  /** Lowercase singular form — "Properties" -> "property", not a naive `s`-strip. */
  singularLabel: string
  description: string
  icon: LucideIcon
  accentClassName: string
  listRoute: string
  dependencyNote?: string
}

// Dependency order matters — Properties need Buildings, Contracts need both
// Tenants and Properties. Keep this array's order as the canonical sequence.
export const IMPORT_MODULES: ImportModuleConfig[] = [
  {
    key: "buildings",
    label: "Buildings",
    singularLabel: "building",
    description: "Register multiple buildings in one file.",
    icon: Building,
    accentClassName: "text-slate-800",
    listRoute: ROUTES.buildings,
  },
  {
    key: "properties",
    label: "Properties",
    singularLabel: "property",
    description: "Bulk-add property units to existing buildings.",
    icon: Building2,
    accentClassName: "text-blue-600",
    listRoute: ROUTES.properties,
    dependencyNote: "Make sure the referenced Buildings are already imported.",
  },
  {
    key: "tenants",
    label: "Tenants",
    singularLabel: "tenant",
    description: "Bulk-onboard individual and company tenants.",
    icon: Users,
    accentClassName: "text-sky-600",
    listRoute: ROUTES.tenants,
  },
  {
    key: "contracts",
    label: "Contracts",
    singularLabel: "contract",
    description: "Bulk-create lease contracts linking tenants to units.",
    icon: ShieldCheck,
    accentClassName: "text-amber-700",
    listRoute: ROUTES.contracts,
    dependencyNote: "Make sure the referenced Tenants and Properties are already imported.",
  },
]

export function getImportModuleConfig(key: ImportModuleKey): ImportModuleConfig {
  const config = IMPORT_MODULES.find((module) => module.key === key)
  if (!config) throw new Error(`Unknown import module: ${key}`)
  return config
}
