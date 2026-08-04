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
import { useDeleteContract } from "@/hooks/queries/use-contracts"
import { getErrorMessage } from "@/lib/get-error-message"
import type { Contract, ContractListItem } from "@/types/contract"

export function DeleteContractDialog({
  contract,
  onOpenChange,
  onDeleted,
}: {
  contract: Contract | ContractListItem | null
  onOpenChange: (open: boolean) => void
  onDeleted?: () => void
}) {
  const deleteMutation = useDeleteContract()

  function handleDelete() {
    if (!contract) return
    deleteMutation.mutate(contract.id, {
      onSuccess: () => {
        toast.success(`Contract ${contract.contractNumber} was deleted.`)
        onOpenChange(false)
        onDeleted?.()
      },
      onError: (error) => {
        toast.error(getErrorMessage(error, "Failed to delete contract."))
      },
    })
  }

  return (
    <Dialog open={!!contract} onOpenChange={onOpenChange}>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>Delete contract</DialogTitle>
          <DialogDescription>
            This will permanently delete contract{" "}
            <span className="font-semibold text-on-surface">{contract?.contractNumber}</span>. This action cannot
            be undone.
          </DialogDescription>
        </DialogHeader>
        <DialogFooter>
          <Button variant="outline" onClick={() => onOpenChange(false)} disabled={deleteMutation.isPending}>
            Cancel
          </Button>
          <Button variant="destructive" onClick={handleDelete} disabled={deleteMutation.isPending}>
            {deleteMutation.isPending ? "Deleting…" : "Delete contract"}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  )
}
