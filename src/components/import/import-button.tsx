"use client"

import * as React from "react"
import { Upload } from "lucide-react"

import { ImportWizard } from "@/components/import/import-wizard"
import { RoleGate } from "@/components/role-gate"
import { Button } from "@/components/ui/button"
import type { ImportModuleKey } from "@/types/import"

export function ImportButton({ module }: { module: ImportModuleKey }) {
  const [open, setOpen] = React.useState(false)

  return (
    <RoleGate allowedRoles={["MANAGER"]}>
      <Button type="button" variant="outline" onClick={() => setOpen(true)}>
        <Upload className="h-4 w-4" /> Import
      </Button>
      <ImportWizard preselectedModule={module} open={open} onOpenChange={setOpen} />
    </RoleGate>
  )
}
