"use client"

import * as React from "react"
import { Info, Upload } from "lucide-react"

import { AccessRestricted } from "@/components/import/access-restricted"
import { ImportWizard } from "@/components/import/import-wizard"
import { Button } from "@/components/ui/button"
import { usePageHeader } from "@/hooks/use-page-header"
import { IMPORT_MODULES } from "@/lib/import-labels"
import { cn } from "@/lib/utils"
import { useAuthStore } from "@/store/auth-store"
import type { ImportModuleKey } from "@/types/import"

export default function ImportCenterPage() {
  const role = useAuthStore((state) => state.user?.role)
  const [activeModule, setActiveModule] = React.useState<ImportModuleKey | null>(null)

  usePageHeader({
    title: "Import Center",
    subtitle: "Bulk-import data from a CSV or Excel file, module by module.",
  })

  if (role !== "MANAGER") return <AccessRestricted />

  return (
    <div className="space-y-6">
      <div className="flex items-start gap-3 rounded-xl border border-secondary/20 bg-secondary/5 p-5">
        <Info className="mt-0.5 h-5 w-5 shrink-0 text-secondary" />
        <p className="text-body-md text-on-surface">
          Import in order — Properties need their Buildings to exist first, Contracts need Tenants and
          Properties.
        </p>
      </div>

      <div className="grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-4">
        {IMPORT_MODULES.map((module, index) => {
          const Icon = module.icon
          return (
            <div
              key={module.key}
              className="flex flex-col items-start gap-4 rounded-xl border border-outline-variant bg-surface p-6"
            >
              <div className="flex items-center gap-2 text-xs font-bold uppercase tracking-widest text-on-surface-variant">
                Step {index + 1}
              </div>
              <div className={cn("flex h-12 w-12 items-center justify-center rounded-xl bg-surface-container-high", module.accentClassName)}>
                <Icon className="h-6 w-6" />
              </div>
              <div>
                <h3 className="font-display text-h2 text-on-surface">{module.label}</h3>
                <p className="mt-1 text-sm text-on-surface-variant">{module.description}</p>
              </div>
              <Button type="button" variant="outline" className="mt-auto w-full" onClick={() => setActiveModule(module.key)}>
                <Upload className="h-4 w-4" /> Import {module.label}
              </Button>
            </div>
          )
        })}
      </div>

      <ImportWizard
        module={activeModule ?? "buildings"}
        open={activeModule !== null}
        onOpenChange={(open) => !open && setActiveModule(null)}
      />
    </div>
  )
}
