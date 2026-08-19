"use client"

import { keepPreviousData, useMutation, useQuery, useQueryClient } from "@tanstack/react-query"

import { QUERY_KEYS } from "@/lib/constants"
import { invalidateFinance } from "@/lib/finance-invalidation"
import { paymentService } from "@/services/payment-service"
import type { CreatePaymentDto, PaymentsQuery, UpdatePaymentDto } from "@/types/payment"

export function usePayments(query: PaymentsQuery) {
  return useQuery({
    queryKey: QUERY_KEYS.finance.payments.list(query),
    queryFn: () => paymentService.list(query),
    placeholderData: keepPreviousData,
  })
}

export function usePayment(id: string, options?: { enabled?: boolean }) {
  return useQuery({
    queryKey: QUERY_KEYS.finance.payments.detail(id),
    queryFn: () => paymentService.getById(id),
    enabled: options?.enabled ?? !!id,
  })
}

export function useContractPayments(contractId: string, options?: { enabled?: boolean }) {
  return useQuery({
    queryKey: QUERY_KEYS.finance.payments.byContract(contractId),
    queryFn: () => paymentService.listByContract(contractId),
    enabled: options?.enabled ?? !!contractId,
  })
}

export function useCreatePayment() {
  const queryClient = useQueryClient()
  return useMutation({
    mutationFn: (dto: CreatePaymentDto) => paymentService.create(dto),
    onSuccess: (payment) =>
      invalidateFinance(queryClient, "payment.create", {
        paymentId: payment.id,
        contractId: payment.contractId,
      }),
  })
}

export function useUpdatePayment() {
  const queryClient = useQueryClient()
  return useMutation({
    mutationFn: ({ id, dto }: { id: string; dto: UpdatePaymentDto }) => paymentService.update(id, dto),
    onSuccess: (payment) =>
      invalidateFinance(queryClient, "payment.update", {
        paymentId: payment.id,
        contractId: payment.contractId,
      }),
  })
}

export function useDeletePayment() {
  const queryClient = useQueryClient()
  return useMutation({
    // contractId is passed in by the caller: the delete response has no body, so
    // the contract-scoped list can't be invalidated from the result.
    mutationFn: ({ id }: { id: string; contractId?: string }) => paymentService.remove(id),
    onSuccess: (_data, variables) =>
      invalidateFinance(queryClient, "payment.delete", {
        paymentId: variables.id,
        contractId: variables.contractId,
      }),
  })
}

// Attachments are shared across payments/cheques/expenses — see
// @/hooks/queries/use-finance-attachments.
