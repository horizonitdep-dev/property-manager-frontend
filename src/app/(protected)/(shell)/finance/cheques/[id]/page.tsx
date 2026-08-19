"use client"

import * as React from "react"
import Link from "next/link"
import { useParams, useRouter } from "next/navigation"
import { ArrowLeft, Ban, ArrowLeftRight, ArrowUpCircle, CheckCircle2, Trash2, XCircle } from "lucide-react"

import { AttachmentsSection } from "@/components/finance/attachments-section"
import {
  BounceChequeDialog,
  CancelChequeDialog,
  ClearChequeDialog,
  DepositChequeDialog,
} from "@/components/finance/cheque-action-dialogs"
import { ChequeLifecycleTimeline } from "@/components/finance/cheque-lifecycle-timeline"
import { DeleteChequeDialog } from "@/components/finance/delete-cheque-dialog"
import { ReplaceChequeDialog } from "@/components/finance/replace-cheque-dialog"
import { RoleGate } from "@/components/role-gate"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { Skeleton } from "@/components/ui/skeleton"
import { useCheque } from "@/hooks/queries/use-cheques"
import { usePageHeader } from "@/hooks/use-page-header"
import { ROUTES } from "@/lib/constants"
import { CHEQUE_STATUS_BADGE_CLASSNAME, CHEQUE_STATUS_LABELS } from "@/lib/finance-labels"
import { formatMoney } from "@/lib/money"
import type { ChequeLinkSummary } from "@/types/cheque"

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
  return `${day}-${month}-${date.getUTCFullYear()}`
}

function LinkedChequeCard({ label, cheque }: { label: string; cheque: ChequeLinkSummary }) {
  return (
    <div className="rounded-lg border border-outline-variant bg-surface-container-low p-4">
      <p className="text-label-sm uppercase text-on-surface-variant">{label}</p>
      <Link
        href={ROUTES.chequeDetail(cheque.id)}
        className="mt-1 block font-mono text-data-mono text-secondary hover:underline"
      >
        {cheque.chequeNumber}
      </Link>
      <p className="mt-1 text-body-md text-on-surface">{formatMoney(cheque.amount)}</p>
      <Badge className={`mt-2 ${CHEQUE_STATUS_BADGE_CLASSNAME[cheque.status]}`}>
        {CHEQUE_STATUS_LABELS[cheque.status]}
      </Badge>
    </div>
  )
}

export default function ChequeDetailPage() {
  const params = useParams<{ id: string }>()
  const router = useRouter()

  const [action, setAction] = React.useState<
    "deposit" | "clear" | "bounce" | "replace" | "cancel" | "delete" | null
  >(null)

  const chequeQuery = useCheque(params.id)
  const cheque = chequeQuery.data

  usePageHeader({
    title: cheque ? `Cheque ${cheque.chequeNumber}` : "Cheque",
    subtitle: cheque?.contract
      ? `${cheque.contract.contractNumber} · ${cheque.contract.tenant.nameEn}`
      : "Cheque details",
  })

  // Which transitions the current status allows (spec §7.4). The server is the
  // real gate — this only decides which buttons are worth offering.
  const status = cheque?.status
  const canDeposit = status === "HELD"
  const canCancel = status === "HELD"
  const canEdit = status === "HELD"
  const canDelete = status === "HELD" || status === "CANCELLED"
  const canClear = status === "DEPOSITED"
  const canBounce = status === "DEPOSITED"
  const canReplace = status === "BOUNCED" && !cheque?.replacedByChequeId

  return (
    <div className="space-y-6">
      <div className="flex flex-wrap items-center justify-between gap-3">
        <Button asChild variant="ghost" size="sm" className="-ml-3">
          <Link href={ROUTES.cheques}>
            <ArrowLeft className="h-4 w-4" /> Back to Cheques
          </Link>
        </Button>
        {cheque && (
          <RoleGate allowedRoles={["MANAGER"]}>
            <div className="flex flex-wrap gap-2">
              {canEdit && (
                <Button asChild variant="outline">
                  <Link href={ROUTES.chequeEdit(cheque.id)}>Edit metadata</Link>
                </Button>
              )}
              {canDeposit && (
                <Button onClick={() => setAction("deposit")}>
                  <ArrowUpCircle className="h-4 w-4" /> Deposit
                </Button>
              )}
              {canClear && (
                <Button onClick={() => setAction("clear")}>
                  <CheckCircle2 className="h-4 w-4" /> Clear
                </Button>
              )}
              {canBounce && (
                <Button variant="outline" onClick={() => setAction("bounce")}>
                  <XCircle className="h-4 w-4 text-error" /> Bounce
                </Button>
              )}
              {canReplace && (
                <Button onClick={() => setAction("replace")}>
                  <ArrowLeftRight className="h-4 w-4" /> Replace
                </Button>
              )}
              {canCancel && (
                <Button variant="outline" onClick={() => setAction("cancel")}>
                  <Ban className="h-4 w-4 text-warning" /> Cancel
                </Button>
              )}
              {canDelete && (
                <Button variant="destructive" onClick={() => setAction("delete")}>
                  <Trash2 className="h-4 w-4" /> Delete
                </Button>
              )}
            </div>
          </RoleGate>
        )}
      </div>

      {chequeQuery.isLoading ? (
        <div className="space-y-4 rounded-xl border border-outline-variant bg-surface p-8">
          <Skeleton className="h-6 w-48" />
          <Skeleton className="h-24 w-full" />
        </div>
      ) : chequeQuery.isError ? (
        <div className="rounded-xl border border-outline-variant bg-surface py-16 text-center">
          <p className="mb-3 text-body-md text-error">Failed to load this cheque.</p>
          <Button variant="outline" size="sm" onClick={() => chequeQuery.refetch()}>
            Retry
          </Button>
        </div>
      ) : cheque ? (
        <div className="grid grid-cols-1 gap-6 lg:grid-cols-3">
          <div className="space-y-6 lg:col-span-2">
            <section className="overflow-hidden rounded-xl border border-outline-variant bg-surface">
              <div className="flex items-center justify-between border-b border-outline-variant bg-surface-container-low px-6 py-4">
                <h3 className="font-display text-h2 text-on-surface">Cheque Details</h3>
                <div className="flex items-center gap-2">
                  <Badge className={CHEQUE_STATUS_BADGE_CLASSNAME[cheque.status]}>
                    {CHEQUE_STATUS_LABELS[cheque.status]}
                  </Badge>
                  {cheque.status === "BOUNCED" && !cheque.replacedByChequeId && (
                    <span className="h-2 w-2 rounded-full bg-warning" aria-label="Needs attention" />
                  )}
                </div>
              </div>
              <div className="grid grid-cols-1 gap-6 p-8 md:grid-cols-2">
                <Field label="Bank" value={cheque.bankName} />
                <Field
                  label="Cheque Number"
                  value={<span className="font-mono text-data-mono">{cheque.chequeNumber}</span>}
                />
                <Field
                  label="Amount"
                  value={<span className="font-mono text-data-mono">{formatMoney(cheque.amount)}</span>}
                />
                <Field label="Cheque Date" value={formatDate(cheque.chequeDate)} />
              </div>
              {cheque.notes && (
                <div className="border-t border-outline-variant p-8 pt-6">
                  <Field label="Notes" value={<span className="whitespace-pre-wrap">{cheque.notes}</span>} />
                </div>
              )}
            </section>

            <section className="overflow-hidden rounded-xl border border-outline-variant bg-surface">
              <div className="border-b border-outline-variant bg-surface-container-low px-6 py-4">
                <h3 className="font-display text-h2 text-on-surface">Lifecycle</h3>
              </div>
              <div className="p-8">
                <ChequeLifecycleTimeline cheque={cheque} />
              </div>
            </section>

            {cheque.contract && (
              <section className="overflow-hidden rounded-xl border border-outline-variant bg-surface">
                <div className="border-b border-outline-variant bg-surface-container-low px-6 py-4">
                  <h3 className="font-display text-h2 text-on-surface">Contract &amp; Parties</h3>
                </div>
                <div className="grid grid-cols-1 gap-6 p-8 md:grid-cols-3">
                  <Field
                    label="Contract"
                    value={
                      <Link
                        href={ROUTES.contractDetail(cheque.contract.id)}
                        className="text-secondary hover:underline"
                      >
                        {cheque.contract.contractNumber}
                      </Link>
                    }
                  />
                  <Field
                    label="Tenant"
                    value={
                      <Link
                        href={ROUTES.tenantDetail(cheque.contract.tenant.id)}
                        className="text-secondary hover:underline"
                      >
                        {cheque.contract.tenant.nameEn}
                      </Link>
                    }
                  />
                  <Field
                    label="Property"
                    value={
                      <Link
                        href={ROUTES.propertyDetail(cheque.contract.property.id)}
                        className="text-secondary hover:underline"
                      >
                        Unit {cheque.contract.property.unitNumber} — {cheque.contract.property.building.name}
                      </Link>
                    }
                  />
                </div>
              </section>
            )}

            <AttachmentsSection
              parent="cheques"
              parentId={cheque.id}
              title="Cheque Images"
              defaultType="CHEQUE_IMAGE"
              uploadPrompt="Drag &amp; drop cheque images here"
            />
          </div>

          <div className="space-y-6">
            {cheque.payment && (
              <section className="overflow-hidden rounded-xl border border-outline-variant bg-surface">
                <div className="border-b border-outline-variant bg-surface-container-low px-6 py-4">
                  <h3 className="font-display text-h2 text-on-surface">Linked Payment</h3>
                </div>
                <div className="space-y-4 p-6">
                  <Field
                    label="Amount"
                    value={<span className="font-mono text-data-mono">{formatMoney(cheque.payment.amount)}</span>}
                  />
                  <Field label="Paid On" value={formatDate(cheque.payment.paidOn)} />
                  <Button asChild variant="outline" className="w-full">
                    <Link href={ROUTES.paymentDetail(cheque.payment.id)}>View payment</Link>
                  </Button>
                </div>
              </section>
            )}

            {(cheque.replaces || cheque.replacedBy) && (
              <section className="overflow-hidden rounded-xl border border-outline-variant bg-surface">
                <div className="border-b border-outline-variant bg-surface-container-low px-6 py-4">
                  <h3 className="font-display text-h2 text-on-surface">Replacement Chain</h3>
                </div>
                <div className="space-y-3 p-6">
                  {cheque.replaces && <LinkedChequeCard label="Replaces" cheque={cheque.replaces} />}
                  {cheque.replacedBy && <LinkedChequeCard label="Replaced by" cheque={cheque.replacedBy} />}
                </div>
              </section>
            )}
          </div>
        </div>
      ) : null}

      {/* Every dialog reads from the same `action` state, so only one is ever open. */}
      <DepositChequeDialog
        cheque={action === "deposit" ? (cheque ?? null) : null}
        onOpenChange={(open) => !open && setAction(null)}
      />
      <ClearChequeDialog
        cheque={action === "clear" ? (cheque ?? null) : null}
        onOpenChange={(open) => !open && setAction(null)}
      />
      <BounceChequeDialog
        cheque={action === "bounce" ? (cheque ?? null) : null}
        onOpenChange={(open) => !open && setAction(null)}
      />
      <ReplaceChequeDialog
        cheque={action === "replace" ? (cheque ?? null) : null}
        onOpenChange={(open) => !open && setAction(null)}
      />
      <CancelChequeDialog
        cheque={action === "cancel" ? (cheque ?? null) : null}
        onOpenChange={(open) => !open && setAction(null)}
      />
      <DeleteChequeDialog
        cheque={action === "delete" ? (cheque ?? null) : null}
        onOpenChange={(open) => !open && setAction(null)}
        onDeleted={() => router.push(ROUTES.cheques)}
      />
    </div>
  )
}
