"use client"

import * as React from "react"
import { useRouter } from "next/navigation"
import { zodResolver } from "@hookform/resolvers/zod"
import { useForm } from "react-hook-form"
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
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Textarea } from "@/components/ui/textarea"
import { useReplaceCheque } from "@/hooks/queries/use-cheques"
import { ROUTES } from "@/lib/constants"
import { getErrorMessage } from "@/lib/get-error-message"
import { moneyToInputValue } from "@/lib/money"
import {
  replaceChequeSchema,
  type ReplaceChequeFormInput,
  type ReplaceChequeFormValues,
} from "@/lib/validation/cheque"
import type { Cheque } from "@/types/cheque"

function today() {
  return new Date().toISOString().slice(0, 10)
}

export function ReplaceChequeDialog({
  cheque,
  onOpenChange,
}: {
  cheque: Cheque | null
  onOpenChange: (open: boolean) => void
}) {
  const router = useRouter()
  const mutation = useReplaceCheque()
  const [formError, setFormError] = React.useState<string | null>(null)

  const {
    register,
    handleSubmit,
    reset,
    formState: { errors },
  } = useForm<ReplaceChequeFormInput, unknown, ReplaceChequeFormValues>({
    resolver: zodResolver(replaceChequeSchema),
  })

  // Prefill from the bounced cheque — the amount usually carries over, though it
  // may legitimately differ (partial settlement, or the tenant covering charges).
  React.useEffect(() => {
    if (cheque) {
      reset({
        chequeNumber: "",
        bankName: cheque.bankName,
        amount: moneyToInputValue(cheque.amount),
        chequeDate: today(),
        receivedOn: today(),
        notes: "",
        replacementNotes: "",
      })
      setFormError(null)
    }
  }, [cheque, reset])

  function onSubmit(values: ReplaceChequeFormValues) {
    if (!cheque) return
    setFormError(null)
    mutation.mutate(
      {
        id: cheque.id,
        dto: {
          chequeNumber: values.chequeNumber,
          bankName: values.bankName,
          amount: values.amount,
          chequeDate: values.chequeDate,
          receivedOn: values.receivedOn,
          notes: values.notes || undefined,
          replacementNotes: values.replacementNotes || undefined,
        },
      },
      {
        onSuccess: (replacement) => {
          toast.success(`Replacement cheque ${replacement.chequeNumber} created.`)
          onOpenChange(false)
          router.push(ROUTES.chequeDetail(replacement.id))
        },
        onError: (err) => setFormError(getErrorMessage(err, "Failed to replace cheque.")),
      }
    )
  }

  return (
    <Dialog open={!!cheque} onOpenChange={onOpenChange}>
      <DialogContent className="max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle>Replace cheque</DialogTitle>
          <DialogDescription>
            Create a replacement for bounced cheque {cheque?.chequeNumber}. It stays on the same contract, and
            the old cheque is marked as replaced.
          </DialogDescription>
        </DialogHeader>

        <form className="space-y-4 py-2" onSubmit={handleSubmit(onSubmit)} noValidate>
          <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
            <div className="space-y-2">
              <Label htmlFor="replaceChequeNumber">Cheque Number</Label>
              <Input
                id="replaceChequeNumber"
                placeholder="e.g. 000452"
                {...register("chequeNumber")}
                aria-invalid={!!errors.chequeNumber}
              />
              {errors.chequeNumber && <p className="text-sm text-error">{errors.chequeNumber.message}</p>}
            </div>

            <div className="space-y-2">
              <Label htmlFor="replaceBankName">Bank Name</Label>
              <Input id="replaceBankName" {...register("bankName")} aria-invalid={!!errors.bankName} />
              {errors.bankName && <p className="text-sm text-error">{errors.bankName.message}</p>}
            </div>

            <div className="space-y-2">
              <Label htmlFor="replaceAmount">Amount (AED)</Label>
              <Input
                id="replaceAmount"
                type="number"
                min={0}
                step="0.01"
                {...register("amount")}
                aria-invalid={!!errors.amount}
              />
              {errors.amount && <p className="text-sm text-error">{errors.amount.message}</p>}
            </div>

            <div className="space-y-2">
              <Label htmlFor="replaceChequeDate">Cheque Date</Label>
              <Input
                id="replaceChequeDate"
                type="date"
                {...register("chequeDate")}
                aria-invalid={!!errors.chequeDate}
              />
              {errors.chequeDate && <p className="text-sm text-error">{errors.chequeDate.message}</p>}
            </div>

            <div className="space-y-2">
              <Label htmlFor="replaceReceivedOn">Received On</Label>
              <Input
                id="replaceReceivedOn"
                type="date"
                {...register("receivedOn")}
                aria-invalid={!!errors.receivedOn}
              />
              {errors.receivedOn && <p className="text-sm text-error">{errors.receivedOn.message}</p>}
            </div>
          </div>

          <div className="space-y-2">
            <Label htmlFor="replacementNotes">Note on the old cheque (optional)</Label>
            <Textarea
              id="replacementNotes"
              rows={2}
              placeholder="Why it was replaced…"
              {...register("replacementNotes")}
            />
          </div>

          {formError && (
            <p role="alert" className="rounded-lg bg-error/10 px-4 py-3 text-sm font-medium text-error">
              {formError}
            </p>
          )}

          <DialogFooter>
            <Button type="button" variant="outline" onClick={() => onOpenChange(false)} disabled={mutation.isPending}>
              Cancel
            </Button>
            <Button type="submit" disabled={mutation.isPending}>
              {mutation.isPending ? "Creating…" : "Create replacement"}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  )
}
