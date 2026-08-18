"use client"

import { keepPreviousData, useMutation, useQuery, useQueryClient } from "@tanstack/react-query"

import { QUERY_KEYS } from "@/lib/constants"
import { invalidateFinance } from "@/lib/finance-invalidation"
import { paymentAttachmentService } from "@/services/payment-attachment-service"
import { paymentService } from "@/services/payment-service"
import type { FinanceAttachmentType } from "@/types/finance"
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

export function usePaymentAttachments(paymentId: string, options?: { enabled?: boolean }) {
  return useQuery({
    queryKey: QUERY_KEYS.finance.payments.attachments(paymentId),
    queryFn: () => paymentAttachmentService.list(paymentId),
    enabled: options?.enabled ?? !!paymentId,
  })
}

export function useUploadPaymentAttachment(paymentId: string) {
  const queryClient = useQueryClient()
  return useMutation({
    mutationFn: ({
      file,
      type,
      onUploadProgress,
    }: {
      file: File
      type?: FinanceAttachmentType
      onUploadProgress?: (percent: number) => void
    }) => paymentAttachmentService.upload(paymentId, file, type, onUploadProgress),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: QUERY_KEYS.finance.payments.attachments(paymentId) })
      queryClient.invalidateQueries({ queryKey: QUERY_KEYS.finance.payments.detail(paymentId) })
    },
  })
}

export function useDeletePaymentAttachment(paymentId: string) {
  const queryClient = useQueryClient()
  return useMutation({
    mutationFn: (attachmentId: string) => paymentAttachmentService.remove(paymentId, attachmentId),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: QUERY_KEYS.finance.payments.attachments(paymentId) })
      queryClient.invalidateQueries({ queryKey: QUERY_KEYS.finance.payments.detail(paymentId) })
    },
  })
}
