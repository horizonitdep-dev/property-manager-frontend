"use client"

import { keepPreviousData, useMutation, useQuery, useQueryClient } from "@tanstack/react-query"

import { QUERY_KEYS } from "@/lib/constants"
import { invalidateFinance } from "@/lib/finance-invalidation"
import { chequeService } from "@/services/cheque-service"
import type {
  BounceChequeDto,
  CancelChequeDto,
  ChequesQuery,
  ClearChequeDto,
  CreateChequeDto,
  DepositChequeDto,
  ReplaceChequeDto,
  UpdateChequeDto,
} from "@/types/cheque"

export function useCheques(query: ChequesQuery) {
  return useQuery({
    queryKey: QUERY_KEYS.finance.cheques.list(query),
    queryFn: () => chequeService.list(query),
    placeholderData: keepPreviousData,
  })
}

export function useCheque(id: string, options?: { enabled?: boolean }) {
  return useQuery({
    queryKey: QUERY_KEYS.finance.cheques.detail(id),
    queryFn: () => chequeService.getById(id),
    enabled: options?.enabled ?? !!id,
  })
}

export function useContractCheques(contractId: string, options?: { enabled?: boolean }) {
  return useQuery({
    queryKey: QUERY_KEYS.finance.cheques.byContract(contractId),
    queryFn: () => chequeService.listByContract(contractId),
    enabled: options?.enabled ?? !!contractId,
  })
}

export function useCreateCheque() {
  const queryClient = useQueryClient()
  return useMutation({
    mutationFn: (dto: CreateChequeDto) => chequeService.create(dto),
    onSuccess: (cheque) =>
      invalidateFinance(queryClient, "cheque.create", {
        chequeId: cheque.id,
        contractId: cheque.contractId,
      }),
  })
}

export function useUpdateCheque() {
  const queryClient = useQueryClient()
  return useMutation({
    mutationFn: ({ id, dto }: { id: string; dto: UpdateChequeDto }) => chequeService.update(id, dto),
    onSuccess: (cheque) =>
      invalidateFinance(queryClient, "cheque.update", {
        chequeId: cheque.id,
        contractId: cheque.contractId,
      }),
  })
}

// ── lifecycle ─────────────────────────────────────────────────────────────
// No optimistic updates anywhere here: these move money and can create a
// Payment, so the badge only changes after the server confirms (spec §7.4).

export function useDepositCheque() {
  const queryClient = useQueryClient()
  return useMutation({
    mutationFn: ({ id, dto }: { id: string; dto: DepositChequeDto }) => chequeService.deposit(id, dto),
    onSuccess: (cheque) =>
      invalidateFinance(queryClient, "cheque.deposit", {
        chequeId: cheque.id,
        contractId: cheque.contractId,
      }),
  })
}

export function useClearCheque() {
  const queryClient = useQueryClient()
  return useMutation({
    mutationFn: ({ id, dto }: { id: string; dto: ClearChequeDto }) => chequeService.clear(id, dto),
    onSuccess: (cheque) =>
      invalidateFinance(queryClient, "cheque.clear", {
        chequeId: cheque.id,
        contractId: cheque.contractId,
      }),
  })
}

export function useBounceCheque() {
  const queryClient = useQueryClient()
  return useMutation({
    mutationFn: ({ id, dto }: { id: string; dto: BounceChequeDto }) => chequeService.bounce(id, dto),
    onSuccess: (cheque) =>
      invalidateFinance(queryClient, "cheque.bounce", {
        chequeId: cheque.id,
        contractId: cheque.contractId,
      }),
  })
}

export function useReplaceCheque() {
  const queryClient = useQueryClient()
  return useMutation({
    // Returns the NEW cheque; `replaces` points back at the one just superseded.
    mutationFn: ({ id, dto }: { id: string; dto: ReplaceChequeDto }) => chequeService.replace(id, dto),
    onSuccess: (replacement) =>
      invalidateFinance(queryClient, "cheque.replace", {
        chequeId: replacement.replaces?.id,
        replacementChequeId: replacement.id,
        contractId: replacement.contractId,
      }),
  })
}

export function useCancelCheque() {
  const queryClient = useQueryClient()
  return useMutation({
    mutationFn: ({ id, dto }: { id: string; dto: CancelChequeDto }) => chequeService.cancel(id, dto),
    onSuccess: (cheque) =>
      invalidateFinance(queryClient, "cheque.cancel", {
        chequeId: cheque.id,
        contractId: cheque.contractId,
      }),
  })
}

export function useDeleteCheque() {
  const queryClient = useQueryClient()
  return useMutation({
    mutationFn: ({ id }: { id: string; contractId?: string }) => chequeService.remove(id),
    onSuccess: (_data, variables) =>
      invalidateFinance(queryClient, "cheque.delete", {
        chequeId: variables.id,
        contractId: variables.contractId,
      }),
  })
}
