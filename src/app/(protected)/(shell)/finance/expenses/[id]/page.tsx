"use client"

import * as React from "react"
import Link from "next/link"
import { useParams, useRouter } from "next/navigation"
import { ArrowLeft, Lock, Pencil, Trash2 } from "lucide-react"

import { AttachmentsSection } from "@/components/finance/attachments-section"
import { DeleteExpenseDialog } from "@/components/finance/delete-expense-dialog"
import { RoleGate } from "@/components/role-gate"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { Skeleton } from "@/components/ui/skeleton"
import { useExpense } from "@/hooks/queries/use-expenses"
import { usePageHeader } from "@/hooks/use-page-header"
import { ROUTES } from "@/lib/constants"
import {
  EXPENSE_CATEGORY_LABELS,
  EXPENSE_SOURCE_TYPE_LABELS,
  PAYMENT_METHOD_LABELS,
} from "@/lib/finance-labels"
import { formatMoney } from "@/lib/money"

function Field({ label, value }: { label: string; value: React.ReactNode }) {
  return (
    <div className="space-y-1">
      <p className="text-label-sm uppercase text-on-surface-variant">{label}</p>
      <p className="text-body-md text-on-surface">{value}</p>
    </div>
  )
}

function formatDate(value?: string | null): string {
  if (!value) return "—"
  const date = new Date(value)
  const day = String(date.getUTCDate()).padStart(2, "0")
  const month = String(date.getUTCMonth() + 1).padStart(2, "0")
  const year = date.getUTCFullYear()
  return `${day}-${month}-${year}`
}

export default function ExpenseDetailPage() {
  const params = useParams<{ id: string }>()
  const router = useRouter()
  const [confirmingDelete, setConfirmingDelete] = React.useState(false)

  const expenseQuery = useExpense(params.id)
  const expense = expenseQuery.data

  usePageHeader({
    title: expense ? formatMoney(expense.amount) : "Expense",
    subtitle: expense ? `${expense.vendorName} · ${EXPENSE_CATEGORY_LABELS[expense.category]}` : "Expense details",
  })

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <Button asChild variant="ghost" size="sm" className="-ml-3">
          <Link href={ROUTES.expenses}>
            <ArrowLeft className="h-4 w-4" /> Back to Expenses
          </Link>
        </Button>
        {expense && (
          <RoleGate allowedRoles={["MANAGER"]}>
            <div className="flex gap-2">
              {/* Delete stays available for module-owned rows; only edit is withheld. */}
              {expense.isEditable && (
                <Button asChild variant="outline">
                  <Link href={ROUTES.expenseEdit(expense.id)}>
                    <Pencil className="h-4 w-4" /> Edit
                  </Link>
                </Button>
              )}
              <Button variant="destructive" onClick={() => setConfirmingDelete(true)}>
                <Trash2 className="h-4 w-4" /> Delete
              </Button>
            </div>
          </RoleGate>
        )}
      </div>

      {expenseQuery.isLoading ? (
        <div className="space-y-4 rounded-xl border border-outline-variant bg-surface p-8">
          <Skeleton className="h-6 w-48" />
          <Skeleton className="h-24 w-full" />
        </div>
      ) : expenseQuery.isError ? (
        <div className="rounded-xl border border-outline-variant bg-surface py-16 text-center">
          <p className="mb-3 text-body-md text-error">Failed to load this expense.</p>
          <Button variant="outline" size="sm" onClick={() => expenseQuery.refetch()}>
            Retry
          </Button>
        </div>
      ) : expense ? (
        <>
          {!expense.isEditable && (
            <div className="flex items-center gap-3 rounded-xl border border-warning/30 bg-warning/10 p-5">
              <Lock className="h-5 w-5 shrink-0 text-warning" />
              <p className="text-body-md text-on-surface">
                This expense is managed by the {EXPENSE_SOURCE_TYPE_LABELS[expense.sourceType]} module — edit it
                there. It can still be deleted from here.
              </p>
            </div>
          )}

          <section className="overflow-hidden rounded-xl border border-outline-variant bg-surface">
            <div className="flex items-center justify-between border-b border-outline-variant bg-surface-container-low px-6 py-4">
              <h3 className="font-display text-h2 text-on-surface">Expense</h3>
              <Badge variant="secondary">{EXPENSE_CATEGORY_LABELS[expense.category]}</Badge>
            </div>
            <div className="grid grid-cols-1 gap-6 p-8 md:grid-cols-3">
              <Field
                label="Amount"
                value={<span className="font-mono text-data-mono">{formatMoney(expense.amount)}</span>}
              />
              <Field label="Incurred On" value={formatDate(expense.incurredOn)} />
              <Field label="Method" value={PAYMENT_METHOD_LABELS[expense.method]} />
            </div>
          </section>

          <section className="overflow-hidden rounded-xl border border-outline-variant bg-surface">
            <div className="border-b border-outline-variant bg-surface-container-low px-6 py-4">
              <h3 className="font-display text-h2 text-on-surface">Scope</h3>
            </div>
            <div className="grid grid-cols-1 gap-6 p-8 md:grid-cols-3">
              <Field
                label="Building"
                value={
                  expense.building ? (
                    <Link
                      href={ROUTES.buildingDetail(expense.building.id)}
                      className="text-secondary hover:underline"
                    >
                      {expense.building.name}
                    </Link>
                  ) : (
                    "—"
                  )
                }
              />
              <Field
                label="Property"
                value={
                  expense.property ? (
                    <Link
                      href={ROUTES.propertyDetail(expense.property.id)}
                      className="text-secondary hover:underline"
                    >
                      Unit {expense.property.unitNumber}
                    </Link>
                  ) : (
                    "Building-wide"
                  )
                }
              />
              <Field label="Source" value={EXPENSE_SOURCE_TYPE_LABELS[expense.sourceType]} />
            </div>
          </section>

          <section className="overflow-hidden rounded-xl border border-outline-variant bg-surface">
            <div className="border-b border-outline-variant bg-surface-container-low px-6 py-4">
              <h3 className="font-display text-h2 text-on-surface">Vendor &amp; Invoice</h3>
            </div>
            <div className="grid grid-cols-1 gap-6 p-8 md:grid-cols-2">
              <Field label="Vendor" value={expense.vendorName} />
              <Field label="Invoice Number" value={expense.invoiceNumber || "—"} />
              <div className="md:col-span-2">
                <Field
                  label="Description"
                  value={<span className="whitespace-pre-wrap">{expense.description}</span>}
                />
              </div>
            </div>
            {expense.notes && (
              <div className="border-t border-outline-variant p-8 pt-6">
                <Field label="Notes" value={<span className="whitespace-pre-wrap">{expense.notes}</span>} />
              </div>
            )}
          </section>

          <AttachmentsSection
            parent="expenses"
            parentId={expense.id}
            title="Invoices &amp; Attachments"
            defaultType="INVOICE"
            uploadPrompt="Drag &amp; drop invoices here"
          />

          <DeleteExpenseDialog
            expense={confirmingDelete ? expense : null}
            onOpenChange={setConfirmingDelete}
            onDeleted={() => router.push(ROUTES.expenses)}
          />
        </>
      ) : null}
    </div>
  )
}
