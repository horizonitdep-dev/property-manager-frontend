"use client"

import { keepPreviousData, useMutation, useQuery, useQueryClient } from "@tanstack/react-query"

import { QUERY_KEYS } from "@/lib/constants"
import { invalidateFinance } from "@/lib/finance-invalidation"
import { expenseService } from "@/services/expense-service"
import type { CreateExpenseDto, ExpensesQuery, UpdateExpenseDto } from "@/types/expense"

export function useExpenses(query: ExpensesQuery) {
  return useQuery({
    queryKey: QUERY_KEYS.finance.expenses.list(query),
    queryFn: () => expenseService.list(query),
    placeholderData: keepPreviousData,
  })
}

export function useExpense(id: string, options?: { enabled?: boolean }) {
  return useQuery({
    queryKey: QUERY_KEYS.finance.expenses.detail(id),
    queryFn: () => expenseService.getById(id),
    enabled: options?.enabled ?? !!id,
  })
}

export function useBuildingExpenses(buildingId: string, options?: { enabled?: boolean }) {
  return useQuery({
    queryKey: QUERY_KEYS.finance.expenses.byBuilding(buildingId),
    queryFn: () => expenseService.listByBuilding(buildingId),
    enabled: options?.enabled ?? !!buildingId,
  })
}

export function usePropertyExpenses(propertyId: string, options?: { enabled?: boolean }) {
  return useQuery({
    queryKey: QUERY_KEYS.finance.expenses.byProperty(propertyId),
    queryFn: () => expenseService.listByProperty(propertyId),
    enabled: options?.enabled ?? !!propertyId,
  })
}

export function useCreateExpense() {
  const queryClient = useQueryClient()
  return useMutation({
    mutationFn: (dto: CreateExpenseDto) => expenseService.create(dto),
    onSuccess: (expense) =>
      invalidateFinance(queryClient, "expense.create", {
        expenseId: expense.id,
        buildingId: expense.buildingId,
        propertyId: expense.propertyId ?? undefined,
      }),
  })
}

export function useUpdateExpense() {
  const queryClient = useQueryClient()
  return useMutation({
    mutationFn: ({ id, dto }: { id: string; dto: UpdateExpenseDto }) => expenseService.update(id, dto),
    onSuccess: (expense) =>
      invalidateFinance(queryClient, "expense.update", {
        expenseId: expense.id,
        buildingId: expense.buildingId,
        propertyId: expense.propertyId ?? undefined,
      }),
  })
}

export function useDeleteExpense() {
  const queryClient = useQueryClient()
  return useMutation({
    // Scope ids come from the caller — the delete response has no body.
    mutationFn: ({ id }: { id: string; buildingId?: string; propertyId?: string }) =>
      expenseService.remove(id),
    onSuccess: (_data, variables) =>
      invalidateFinance(queryClient, "expense.delete", {
        expenseId: variables.id,
        buildingId: variables.buildingId,
        propertyId: variables.propertyId,
      }),
  })
}
