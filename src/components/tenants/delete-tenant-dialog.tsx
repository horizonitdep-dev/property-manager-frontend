"use client"

import { toast } from "sonner"

import { Button } from "@/components/ui/button"
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog"
import { useDeleteTenant } from "@/hooks/queries/use-tenants"
import { getErrorMessage } from "@/lib/get-error-message"
import type { Tenant, TenantListItem } from "@/types/tenant"

export function DeleteTenantDialog({
  tenant,
  onOpenChange,
  onDeleted,
}: {
  tenant: Tenant | TenantListItem | null
  onOpenChange: (open: boolean) => void
  onDeleted?: () => void
}) {
  const deleteMutation = useDeleteTenant()

  function handleDelete() {
    if (!tenant) return
    deleteMutation.mutate(tenant.id, {
      onSuccess: () => {
        toast.success(`${tenant.nameEn} was deleted.`)
        onOpenChange(false)
        onDeleted?.()
      },
      onError: (error) => {
        toast.error(getErrorMessage(error, "Failed to delete tenant."))
      },
    })
  }

  return (
    <Dialog open={!!tenant} onOpenChange={onOpenChange}>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>Delete tenant</DialogTitle>
          <DialogDescription>
            This will permanently delete <span className="font-semibold text-on-surface">{tenant?.nameEn}</span>.
            This action cannot be undone.
          </DialogDescription>
        </DialogHeader>
        <DialogFooter>
          <Button variant="outline" onClick={() => onOpenChange(false)} disabled={deleteMutation.isPending}>
            Cancel
          </Button>
          <Button variant="destructive" onClick={handleDelete} disabled={deleteMutation.isPending}>
            {deleteMutation.isPending ? "Deleting…" : "Delete tenant"}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  )
}
