"use client"

import * as React from "react"
import { Info, Upload } from "lucide-react"

import { AccessRestricted } from "@/components/import/access-restricted"
import { ImportWizard } from "@/components/import/import-wizard"
import { Button } from "@/components/ui/button"
import { usePageHeader } from "@/hooks/use-page-header"
import { useAuthStore } from "@/store/auth-store"

export default function ImportCenterPage() {
  const role = useAuthStore((state) => state.user?.role)
  const [open, setOpen] = React.useState(false)

  usePageHeader({
    title: "Import Center",
    subtitle: "Bulk-import data via DMT PDFs or a CSV/Excel template.",
  })

  if (role !== "MANAGER") return <AccessRestricted />

  return (
    <div className="space-y-6">
      <div className="flex items-start gap-3 rounded-xl border border-secondary/20 bg-secondary/5 p-5">
        <Info className="mt-0.5 h-5 w-5 shrink-0 text-secondary" />
        <p className="text-body-md text-on-surface">
          Import in order — Properties need their Buildings to exist first, Contracts need Tenants and
          Properties. This doesn&apos;t apply to DMT PDF imports, which can create across all four modules
          in one batch.
        </p>
      </div>

      <div className="flex max-w-md flex-col items-start gap-4 rounded-xl border border-outline-variant bg-surface p-6">
        <div className="flex h-12 w-12 items-center justify-center rounded-xl bg-surface-container-high text-secondary">
          <Upload className="h-6 w-6" />
        </div>
        <div>
          <h3 className="font-display text-h2 text-on-surface">Import</h3>
          <p className="mt-1 text-sm text-on-surface-variant">
            Import data via DMT PDFs or a CSV/Excel template.
          </p>
        </div>
        <Button type="button" className="w-full" onClick={() => setOpen(true)}>
          <Upload className="h-4 w-4" /> Import
        </Button>
      </div>

      <ImportWizard open={open} onOpenChange={setOpen} />
    </div>
  )
}
