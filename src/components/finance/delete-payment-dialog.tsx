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
import { useDeletePayment } from "@/hooks/queries/use-payments"
import { getErrorMessage } from "@/lib/get-error-message"
import { formatMoney } from "@/lib/money"
import type { Payment, PaymentListItem } from "@/types/payment"

export function DeletePaymentDialog({
  payment,
  onOpenChange,
  onDeleted,
}: {
  payment: Payment | PaymentListItem | null
  onOpenChange: (open: boolean) => void
  onDeleted?: () => void
}) {
  const deleteMutation = useDeletePayment()

  function handleDelete() {
    if (!payment) return
    deleteMutation.mutate(
      { id: payment.id, contractId: payment.contractId },
      {
        onSuccess: () => {
          toast.success("Payment was deleted.")
          onOpenChange(false)
          onDeleted?.()
        },
        onError: (error) => {
          toast.error(getErrorMessage(error, "Failed to delete payment."))
        },
      }
    )
  }

  return (
    <Dialog open={!!payment} onOpenChange={onOpenChange}>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>Delete payment</DialogTitle>
          <DialogDescription>
            This will permanently delete the{" "}
            <span className="font-semibold text-on-surface">{formatMoney(payment?.amount)}</span> payment
            {payment?.contract ? ` on contract ${payment.contract.contractNumber}` : ""}. This action cannot be
            undone.
            {/* Deleting the payment does not roll the cheque back to DEPOSITED — the
                cheque keeps its own status and stays the source of truth. */}
            {payment?.cheque && (
              <span className="mt-2 block text-warning">
                This payment came from cheque {payment.cheque.chequeNumber} — deleting it does not change the
                cheque&rsquo;s status.
              </span>
            )}
          </DialogDescription>
        </DialogHeader>
        <DialogFooter>
          <Button variant="outline" onClick={() => onOpenChange(false)} disabled={deleteMutation.isPending}>
            Cancel
          </Button>
          <Button variant="destructive" onClick={handleDelete} disabled={deleteMutation.isPending}>
            {deleteMutation.isPending ? "Deleting…" : "Delete payment"}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  )
}
