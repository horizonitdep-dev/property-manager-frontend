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
import { useDeleteContractDocument } from "@/hooks/queries/use-contracts"
import { getErrorMessage } from "@/lib/get-error-message"
import type { ContractDocument } from "@/types/contract"

export function DeleteDocumentDialog({
  contractId,
  document,
  onOpenChange,
}: {
  contractId: string
  document: ContractDocument | null
  onOpenChange: (open: boolean) => void
}) {
  const deleteMutation = useDeleteContractDocument(contractId)

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
