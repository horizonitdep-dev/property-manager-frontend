"use client"

import * as React from "react"
import Link from "next/link"
import { useParams, useRouter } from "next/navigation"
import { ArrowLeft, Lock, Pencil, ReceiptText, Trash2 } from "lucide-react"

import { DeletePaymentDialog } from "@/components/finance/delete-payment-dialog"
import { PaymentAttachmentsSection } from "@/components/finance/payment-attachments-section"
import { RoleGate } from "@/components/role-gate"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { Skeleton } from "@/components/ui/skeleton"
import { usePayment } from "@/hooks/queries/use-payments"
import { usePageHeader } from "@/hooks/use-page-header"
import { ROUTES } from "@/lib/constants"
import {
  PAYMENT_KIND_BADGE_CLASSNAME,
  PAYMENT_KIND_LABELS,
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

export default function PaymentDetailPage() {
  const params = useParams<{ id: string }>()
  const router = useRouter()
  const [confirmingDelete, setConfirmingDelete] = React.useState(false)

  const paymentQuery = usePayment(params.id)
  const payment = paymentQuery.data

  usePageHeader({
    title: payment ? formatMoney(payment.amount) : "Payment",
    subtitle: payment?.contract
      ? `${payment.contract.contractNumber} · ${payment.contract.tenant.nameEn}`
      : "Payment details",
  })

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <Button asChild variant="ghost" size="sm" className="-ml-3">
          <Link href={ROUTES.payments}>
            <ArrowLeft className="h-4 w-4" /> Back to Payments
          </Link>
        </Button>
        {payment && (
          <RoleGate allowedRoles={["MANAGER"]}>
            <div className="flex gap-2">
              <Button asChild variant="outline">
                <Link href={ROUTES.paymentEdit(payment.id)}>
                  <Pencil className="h-4 w-4" /> Edit
                </Link>
              </Button>
              <Button variant="destructive" onClick={() => setConfirmingDelete(true)}>
                <Trash2 className="h-4 w-4" /> Delete
              </Button>
            </div>
          </RoleGate>
        )}
      </div>

      {paymentQuery.isLoading ? (
        <div className="space-y-4 rounded-xl border border-outline-variant bg-surface p-8">
          <Skeleton className="h-6 w-48" />
          <Skeleton className="h-24 w-full" />
        </div>
      ) : paymentQuery.isError ? (
        <div className="rounded-xl border border-outline-variant bg-surface py-16 text-center">
          <p className="mb-3 text-body-md text-error">Failed to load this payment.</p>
          <Button variant="outline" size="sm" onClick={() => paymentQuery.refetch()}>
            Retry
          </Button>
        </div>
      ) : payment ? (
        <>
          {payment.isChequeLinked && (
            <div className="flex items-center gap-3 rounded-xl border border-warning/30 bg-warning/10 p-5">
              <Lock className="h-5 w-5 shrink-0 text-warning" />
              <p className="text-body-md text-on-surface">
                This payment was created by a cheque clearing. Its amount and date are owned by the cheque —
                manage them there.
              </p>
            </div>
          )}

          <section className="overflow-hidden rounded-xl border border-outline-variant bg-surface">
            <div className="flex items-center justify-between border-b border-outline-variant bg-surface-container-low px-6 py-4">
              <h3 className="font-display text-h2 text-on-surface">Payment</h3>
              <Badge className={PAYMENT_KIND_BADGE_CLASSNAME[payment.kind]}>
                {PAYMENT_KIND_LABELS[payment.kind]}
              </Badge>
            </div>
            <div className="grid grid-cols-1 gap-6 p-8 md:grid-cols-3">
              <Field
                label="Amount"
                value={<span className="font-mono text-data-mono">{formatMoney(payment.amount)}</span>}
              />
              <Field label="Paid On" value={formatDate(payment.paidOn)} />
              <Field label="Method" value={PAYMENT_METHOD_LABELS[payment.method]} />
              <Field label="Reference Number" value={payment.referenceNumber || "—"} />
              <Field label="Period Start" value={formatDate(payment.periodStart)} />
              <Field label="Period End" value={formatDate(payment.periodEnd)} />
            </div>
            {payment.notes && (
              <div className="border-t border-outline-variant p-8 pt-6">
                <Field label="Notes" value={<span className="whitespace-pre-wrap">{payment.notes}</span>} />
              </div>
            )}
          </section>

          {payment.contract && (
            <section className="overflow-hidden rounded-xl border border-outline-variant bg-surface">
              <div className="border-b border-outline-variant bg-surface-container-low px-6 py-4">
                <h3 className="font-display text-h2 text-on-surface">Contract &amp; Parties</h3>
              </div>
              <div className="grid grid-cols-1 gap-6 p-8 md:grid-cols-3">
                <Field
                  label="Contract"
                  value={
                    <Link
                      href={ROUTES.contractDetail(payment.contract.id)}
                      className="text-secondary hover:underline"
                    >
                      {payment.contract.contractNumber}
                    </Link>
                  }
                />
                <Field
                  label="Tenant"
                  value={
                    <Link
                      href={ROUTES.tenantDetail(payment.contract.tenant.id)}
                      className="text-secondary hover:underline"
                    >
                      {payment.contract.tenant.nameEn}
                    </Link>
                  }
                />
                <Field
                  label="Property"
                  value={
                    <Link
                      href={ROUTES.propertyDetail(payment.contract.property.id)}
                      className="text-secondary hover:underline"
                    >
                      Unit {payment.contract.property.unitNumber} — {payment.contract.property.building.name}
                    </Link>
                  }
                />
              </div>
            </section>
          )}

          {/* Only rendered when the payment actually came from a cheque. */}
          {payment.cheque && (
            <section className="overflow-hidden rounded-xl border border-outline-variant bg-surface">
              <div className="flex items-center gap-2 border-b border-outline-variant bg-surface-container-low px-6 py-4">
                <ReceiptText className="h-4 w-4 text-secondary" />
                <h3 className="font-display text-h2 text-on-surface">Linked Cheque</h3>
              </div>
              <div className="flex flex-wrap items-end justify-between gap-6 p-8">
                <div className="grid flex-1 grid-cols-1 gap-6 md:grid-cols-2">
                  <Field
                    label="Cheque Number"
                    value={<span className="font-mono text-data-mono">{payment.cheque.chequeNumber}</span>}
                  />
                  <Field label="Bank" value={payment.cheque.bankName} />
                </div>
                <Button asChild variant="outline">
                  <Link href={ROUTES.chequeDetail(payment.cheque.id)}>View cheque</Link>
                </Button>
              </div>
            </section>
          )}

          <PaymentAttachmentsSection paymentId={payment.id} />

          <DeletePaymentDialog
            payment={confirmingDelete ? payment : null}
            onOpenChange={setConfirmingDelete}
            onDeleted={() => router.push(ROUTES.payments)}
          />
        </>
      ) : null}
    </div>
  )
}
