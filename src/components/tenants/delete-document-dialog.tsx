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
import { useDeleteDocument } from "@/hooks/queries/use-tenants"
import { getErrorMessage } from "@/lib/get-error-message"
import type { TenantDocument } from "@/types/tenant"

export function DeleteDocumentDialog({
  tenantId,
  document,
  onOpenChange,
}: {
  tenantId: string
  document: TenantDocument | null
  onOpenChange: (open: boolean) => void
}) {
  const deleteMutation = useDeleteDocument(tenantId)

  function handleDelete() {
    if (!document) return
    deleteMutation.mutate(document.id, {
      onSuccess: () => {
        toast.success(`${document.fileName} was deleted.`)
        onOpenChange(false)
      },
      onError: (error) => {
        toast.error(getErrorMessage(error, "Failed to delete document."))
      },
    })
  }

  return (
    <Dialog open={!!document} onOpenChange={onOpenChange}>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>Delete document</DialogTitle>
          <DialogDescription>
            This will permanently delete{" "}
            <span className="font-semibold text-on-surface">{document?.fileName}</span>. This action cannot be
            undone.
          </DialogDescription>
        </DialogHeader>
        <DialogFooter>
          <Button variant="outline" onClick={() => onOpenChange(false)} disabled={deleteMutation.isPending}>
            Cancel
          </Button>
          <Button variant="destructive" onClick={handleDelete} disabled={deleteMutation.isPending}>
            {deleteMutation.isPending ? "Deleting…" : "Delete document"}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  )
}
