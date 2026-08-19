"use client"

import Link from "next/link"
import { useParams } from "next/navigation"

import { AccessRestricted } from "@/components/finance/access-restricted"
import { ExpenseForm } from "@/components/finance/expense-form"
import { Button } from "@/components/ui/button"
import { Skeleton } from "@/components/ui/skeleton"
import { useExpense } from "@/hooks/queries/use-expenses"
import { usePageHeader } from "@/hooks/use-page-header"
import { ROUTES } from "@/lib/constants"
import { EXPENSE_SOURCE_TYPE_LABELS } from "@/lib/finance-labels"
import { useAuthStore } from "@/store/auth-store"

export default function EditExpensePage() {
  const params = useParams<{ id: string }>()
  const role = useAuthStore((state) => state.user?.role)

  const expenseQuery = useExpense(params.id, { enabled: role === "MANAGER" })
  const expense = expenseQuery.data

  usePageHeader({
    title: "Edit Expense",
    subtitle: expense ? `${expense.vendorName} · ${expense.building?.name ?? ""}` : "Update this expense record.",
  })

  if (role !== "MANAGER") return <AccessRestricted />

  if (expenseQuery.isLoading) {
    return (
      <div className="space-y-4 rounded-xl border border-outline-variant bg-surface p-8">
        <Skeleton className="h-6 w-48" />
        <Skeleton className="h-10 w-full" />
        <Skeleton className="h-10 w-full" />
      </div>
    )
  }

  if (expenseQuery.isError || !expense) {
    return (
      <div className="rounded-xl border border-outline-variant bg-surface py-16 text-center">
        <p className="mb-3 text-body-md text-error">Failed to load this expense.</p>
        <Button variant="outline" size="sm" onClick={() => expenseQuery.refetch()}>
          Retry
        </Button>
      </div>
    )
  }

  // The backend refuses updates to non-GENERAL rows outright, so don't render a
  // form that can only fail.
  if (!expense.isEditable) {
    return (
      <div className="flex flex-col items-center justify-center gap-4 rounded-xl border border-outline-variant bg-surface py-24 text-center">
        <h2 className="font-display text-h2 text-on-surface">This expense can&rsquo;t be edited here</h2>
        <p className="max-w-md text-body-md text-on-surface-variant">
          It was created by the {EXPENSE_SOURCE_TYPE_LABELS[expense.sourceType]} module, which owns its details.
          Edit it there instead.
        </p>
        <Button asChild variant="outline">
          <Link href={ROUTES.expenseDetail(expense.id)}>Back to expense</Link>
        </Button>
      </div>
    )
  }

  return <ExpenseForm expense={expense} />
}
