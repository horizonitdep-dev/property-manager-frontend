"use client"

import * as React from "react"
import { useRouter } from "next/navigation"
import { zodResolver } from "@hookform/resolvers/zod"
import { useQuery } from "@tanstack/react-query"
import { FileText, Info, Wallet } from "lucide-react"
import { useForm } from "react-hook-form"
import { toast } from "sonner"

import { ContractCombobox } from "@/components/finance/contract-combobox"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Textarea } from "@/components/ui/textarea"
import { useCreateCheque, useUpdateCheque } from "@/hooks/queries/use-cheques"
import { QUERY_KEYS, ROUTES } from "@/lib/constants"
import { getErrorMessage } from "@/lib/get-error-message"
import { moneyToInputValue } from "@/lib/money"
import { chequeSchema, type ChequeFormInput, type ChequeFormValues } from "@/lib/validation/cheque"
import { contractService } from "@/services/contract-service"
import type { Cheque } from "@/types/cheque"

function toDateInputValue(value?: string | null): string {
  return value ? value.slice(0, 10) : ""
}

export function ChequeForm({
  cheque,
  defaultContractId,
}: {
  cheque?: Cheque
  defaultContractId?: string
}) {
  const router = useRouter()
  const isEdit = !!cheque

  const contractsListQuery = {
    page: 1,
    limit: 100,
    sortBy: "contractNumber" as const,
    sortOrder: "asc" as const,
  }
  const contractsQuery = useQuery({
    queryKey: QUERY_KEYS.contracts(contractsListQuery),
    queryFn: () => contractService.list(contractsListQuery),
  })
  const contracts = contractsQuery.data?.items ?? []

  const {
    register,
    handleSubmit,
    watch,
    setValue,
    formState: { errors, isSubmitting },
  } = useForm<ChequeFormInput, unknown, ChequeFormValues>({
    resolver: zodResolver(chequeSchema),
    defaultValues: {
      contractId: cheque?.contractId ?? defaultContractId ?? "",
      chequeNumber: cheque?.chequeNumber ?? "",
      bankName: cheque?.bankName ?? "",
      amount: moneyToInputValue(cheque?.amount),
      chequeDate: toDateInputValue(cheque?.chequeDate),
      receivedOn: toDateInputValue(cheque?.receivedOn),
      notes: cheque?.notes ?? "",
    },
  })

  const createMutation = useCreateCheque()
  const updateMutation = useUpdateCheque()
  const isPending = createMutation.isPending || updateMutation.isPending

  const [formError, setFormError] = React.useState<string | null>(null)

  function onSubmit(values: ChequeFormValues) {
    setFormError(null)
    const action = isEdit
      ? updateMutation.mutateAsync({
          id: cheque.id,
          dto: {
            chequeNumber: values.chequeNumber,
            bankName: values.bankName,
            amount: values.amount,
            chequeDate: values.chequeDate,
            receivedOn: values.receivedOn,
            notes: values.notes || undefined,
          },
        })
      : createMutation.mutateAsync({
          contractId: values.contractId,
          chequeNumber: values.chequeNumber,
          bankName: values.bankName,
          amount: values.amount,
          chequeDate: values.chequeDate,
          receivedOn: values.receivedOn,
          notes: values.notes || undefined,
        })

    action
      .then((saved) => {
        toast.success(isEdit ? "Cheque updated." : "Cheque recorded.")
        router.push(ROUTES.chequeDetail(saved.id))
      })
      .catch((error) => {
        setFormError(getErrorMessage(error, "Failed to save cheque."))
      })
  }

  function goBack() {
    router.push(isEdit ? ROUTES.chequeDetail(cheque.id) : ROUTES.cheques)
  }

  return (
    <form className="space-y-stack-lg" onSubmit={handleSubmit(onSubmit)} noValidate>
      {formError && (
        <p role="alert" className="rounded-lg bg-error/10 px-4 py-3 text-sm font-medium text-error">
          {formError}
        </p>
      )}

      <section className="rounded-xl border border-outline-variant bg-surface">
        <div className="flex items-center gap-2 rounded-t-xl border-b border-outline-variant bg-surface-container-low px-6 py-4">
          <Info className="h-4 w-4 text-secondary" />
          <h3 className="font-display text-h2 text-on-surface">Contract</h3>
        </div>
        <div className="p-6">
          <div className="space-y-2">
            <Label htmlFor="contractId">Contract</Label>
            <ContractCombobox
              id="contractId"
              contracts={contracts}
              value={watch("contractId")}
              onChange={(contractId) => setValue("contractId", contractId, { shouldValidate: true })}
              isLoading={contractsQuery.isLoading}
              disabled={isEdit}
            />
            {isEdit && (
              <p className="text-sm text-on-surface-variant">
                A cheque cannot be moved to another contract.
              </p>
            )}
            {errors.contractId && <p className="text-sm text-error">{errors.contractId.message}</p>}
          </div>
        </div>
      </section>

      <section className="rounded-xl border border-outline-variant bg-surface">
        <div className="flex items-center gap-2 rounded-t-xl border-b border-outline-variant bg-surface-container-low px-6 py-4">
          <Wallet className="h-4 w-4 text-secondary" />
          <h3 className="font-display text-h2 text-on-surface">Cheque Details</h3>
        </div>
        <div className="grid grid-cols-1 gap-6 p-6 md:grid-cols-2">
          <div className="space-y-2">
            <Label htmlFor="chequeNumber">Cheque Number</Label>
            <Input
              id="chequeNumber"
              placeholder="e.g. 000451"
              {...register("chequeNumber")}
              aria-invalid={!!errors.chequeNumber}
            />
            {errors.chequeNumber && <p className="text-sm text-error">{errors.chequeNumber.message}</p>}
          </div>

          <div className="space-y-2">
            <Label htmlFor="bankName">Bank Name</Label>
            <Input
              id="bankName"
              placeholder="e.g. Emirates NBD"
              {...register("bankName")}
              aria-invalid={!!errors.bankName}
            />
            {errors.bankName && <p className="text-sm text-error">{errors.bankName.message}</p>}
          </div>

          <div className="space-y-2">
            <Label htmlFor="amount">Amount (AED)</Label>
            <Input
              id="amount"
              type="number"
              min={0}
              step="0.01"
              placeholder="0.00"
              {...register("amount")}
              aria-invalid={!!errors.amount}
            />
            {errors.amount && <p className="text-sm text-error">{errors.amount.message}</p>}
          </div>

          <div className="space-y-2">
            <Label htmlFor="chequeDate">Cheque Date</Label>
            <Input
              id="chequeDate"
              type="date"
              {...register("chequeDate")}
              aria-invalid={!!errors.chequeDate}
            />
            <p className="text-sm text-on-surface-variant">The date written on the cheque.</p>
            {errors.chequeDate && <p className="text-sm text-error">{errors.chequeDate.message}</p>}
          </div>

          <div className="space-y-2">
            <Label htmlFor="receivedOn">Received On</Label>
            <Input
              id="receivedOn"
              type="date"
              {...register("receivedOn")}
              aria-invalid={!!errors.receivedOn}
            />
            {errors.receivedOn && <p className="text-sm text-error">{errors.receivedOn.message}</p>}
          </div>
        </div>
      </section>

      <section className="rounded-xl border border-outline-variant bg-surface">
        <div className="flex items-center gap-2 rounded-t-xl border-b border-outline-variant bg-surface-container-low px-6 py-4">
          <FileText className="h-4 w-4 text-secondary" />
          <h3 className="font-display text-h2 text-on-surface">Notes</h3>
        </div>
        <div className="p-6">
          <Textarea id="notes" placeholder="Add any notes about this cheque…" rows={3} {...register("notes")} />
        </div>
      </section>

      <div className="flex items-center justify-end gap-4 rounded-xl border border-outline-variant bg-surface p-6">
        <Button type="button" variant="outline" onClick={goBack}>
          Cancel
        </Button>
        <Button type="submit" disabled={isSubmitting || isPending}>
          {isPending ? "Saving…" : isEdit ? "Save Cheque" : "Record Cheque"}
        </Button>
      </div>
    </form>
  )
}
