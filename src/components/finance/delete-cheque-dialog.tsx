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
import { useDeleteCheque } from "@/hooks/queries/use-cheques"
import { getErrorMessage } from "@/lib/get-error-message"
import { formatMoney } from "@/lib/money"
import type { Cheque, ChequeListItem } from "@/types/cheque"

export function DeleteChequeDialog({
  cheque,
  onOpenChange,
  onDeleted,
}: {
  cheque: Cheque | ChequeListItem | null
  onOpenChange: (open: boolean) => void
  onDeleted?: () => void
}) {
  const deleteMutation = useDeleteCheque()

  function handleDelete() {
    if (!cheque) return
    deleteMutation.mutate(
      { id: cheque.id, contractId: cheque.contractId },
      {
        onSuccess: () => {
          toast.success(`Cheque ${cheque.chequeNumber} was deleted.`)
          onOpenChange(false)
          onDeleted?.()
        },
        onError: (error) => {
          toast.error(getErrorMessage(error, "Failed to delete cheque."))
        },
      }
    )
  }

  return (
    <Dialog open={!!cheque} onOpenChange={onOpenChange}>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>Delete cheque</DialogTitle>
          <DialogDescription>
            This will permanently delete cheque{" "}
            <span className="font-semibold text-on-surface">{cheque?.chequeNumber}</span> for{" "}
            {formatMoney(cheque?.amount)}. This action cannot be undone.
          </DialogDescription>
        </DialogHeader>
        <DialogFooter>
          <Button variant="outline" onClick={() => onOpenChange(false)} disabled={deleteMutation.isPending}>
            Cancel
          </Button>
          <Button variant="destructive" onClick={handleDelete} disabled={deleteMutation.isPending}>
            {deleteMutation.isPending ? "Deleting…" : "Delete cheque"}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  )
}
