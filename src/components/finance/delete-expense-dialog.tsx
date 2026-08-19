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
import { useDeleteExpense } from "@/hooks/queries/use-expenses"
import { getErrorMessage } from "@/lib/get-error-message"
import { formatMoney } from "@/lib/money"
import type { Expense, ExpenseListItem } from "@/types/expense"

export function DeleteExpenseDialog({
  expense,
  onOpenChange,
  onDeleted,
}: {
  expense: Expense | ExpenseListItem | null
  onOpenChange: (open: boolean) => void
  onDeleted?: () => void
}) {
  const deleteMutation = useDeleteExpense()

  function handleDelete() {
    if (!expense) return
    deleteMutation.mutate(
      { id: expense.id, buildingId: expense.buildingId, propertyId: expense.propertyId ?? undefined },
      {
        onSuccess: () => {
          toast.success("Expense was deleted.")
          onOpenChange(false)
          onDeleted?.()
        },
        onError: (error) => {
          toast.error(getErrorMessage(error, "Failed to delete expense."))
        },
      }
    )
  }

  return (
    <Dialog open={!!expense} onOpenChange={onOpenChange}>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>Delete expense</DialogTitle>
          <DialogDescription>
            This will permanently delete the{" "}
            <span className="font-semibold text-on-surface">{formatMoney(expense?.amount)}</span> expense
            {expense?.vendorName ? ` from ${expense.vendorName}` : ""}. This action cannot be undone.
          </DialogDescription>
        </DialogHeader>
        <DialogFooter>
          <Button variant="outline" onClick={() => onOpenChange(false)} disabled={deleteMutation.isPending}>
            Cancel
          </Button>
          <Button variant="destructive" onClick={handleDelete} disabled={deleteMutation.isPending}>
            {deleteMutation.isPending ? "Deleting…" : "Delete expense"}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  )
}
