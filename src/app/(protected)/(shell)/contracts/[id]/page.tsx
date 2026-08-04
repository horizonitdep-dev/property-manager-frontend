"use client"

import * as React from "react"
import Link from "next/link"
import { useParams, useRouter } from "next/navigation"
import { AlertTriangle, ArrowLeft, Ban, Pencil, RefreshCw, Trash2 } from "lucide-react"

import { ContractDocumentsSection } from "@/components/contracts/contract-documents-section"
import { DeleteContractDialog } from "@/components/contracts/delete-contract-dialog"
import { TerminateContractDialog } from "@/components/contracts/terminate-contract-dialog"
import { RoleGate } from "@/components/role-gate"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { Skeleton } from "@/components/ui/skeleton"
import { useContract, usePropertyContracts } from "@/hooks/queries/use-contracts"
import { usePageHeader } from "@/hooks/use-page-header"
import {
  CONTRACT_STATUS_BADGE_CLASSNAME,
  CONTRACT_STATUS_LABELS,
  PAYMENT_FREQUENCY_LABELS,
} from "@/lib/contract-labels"
import { ROUTES } from "@/lib/constants"

function Field({ label, value }: { label: string; value: React.ReactNode }) {
  return (
    <div className="space-y-1">
      <p className="text-label-sm uppercase text-on-surface-variant">{label}</p>
      <p className="text-body-md text-on-surface">{value}</p>
    </div>
  )
}

function formatDate(value: string): string {
  const date = new Date(value)
  const day = String(date.getUTCDate()).padStart(2, "0")
  const month = String(date.getUTCMonth() + 1).padStart(2, "0")
  const year = date.getUTCFullYear()
  return `${day}-${month}-${year}`
}

function formatRent(amount: number) {
  return `AED ${Number(amount).toLocaleString(undefined, { maximumFractionDigits: 0 })}`
}

function daysRemaining(endDate: string): number {
  const end = new Date(endDate).getTime()
  const now = Date.now()
  return Math.ceil((end - now) / (1000 * 60 * 60 * 24))
}

export default function ContractDetailPage() {
  const params = useParams<{ id: string }>()
  const router = useRouter()
  const [confirmingDelete, setConfirmingDelete] = React.useState(false)
  const [confirmingTerminate, setConfirmingTerminate] = React.useState(false)

  const contractQuery = useContract(params.id)
  const contract = contractQuery.data

  const propertyContractsQuery = usePropertyContracts(contract?.property.id ?? "", { enabled: !!contract })
  const renewals = (propertyContractsQuery.data ?? []).filter((c) => c.renewedFromId === contract?.id)

  usePageHeader({
    title: contract?.contractNumber ?? "Contract",
    subtitle: contract ? `${contract.tenant.nameEn} · Unit ${contract.property.unitNumber}` : "Contract details",
  })

  const canRenew = contract?.status === "EXPIRING_SOON" || contract?.status === "EXPIRED"
  const canTerminate = contract?.status === "ACTIVE" || contract?.status === "EXPIRING_SOON"
  const remaining = contract ? daysRemaining(contract.endDate) : 0

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <Button asChild variant="ghost" size="sm" className="-ml-3">
          <Link href={ROUTES.contracts}>
            <ArrowLeft className="h-4 w-4" /> Back to Contracts
          </Link>
        </Button>
        {contract && (
          <RoleGate allowedRoles={["MANAGER"]}>
            <div className="flex gap-2">
              <Button asChild variant="outline">
                <Link href={ROUTES.contractEdit(contract.id)}>
                  <Pencil className="h-4 w-4" /> Edit
                </Link>
              </Button>
              {canRenew && (
                <Button asChild variant="outline">
                  <Link href={`${ROUTES.contractNew}?renewFromId=${contract.id}`}>
                    <RefreshCw className="h-4 w-4" /> Renew
                  </Link>
                </Button>
              )}
              {canTerminate && (
                <Button variant="outline" onClick={() => setConfirmingTerminate(true)}>
                  <Ban className="h-4 w-4" /> Terminate
                </Button>
              )}
              <Button variant="destructive" onClick={() => setConfirmingDelete(true)}>
                <Trash2 className="h-4 w-4" /> Delete
              </Button>
            </div>
          </RoleGate>
        )}
      </div>

      {contractQuery.isLoading ? (
        <div className="space-y-4 rounded-xl border border-outline-variant bg-surface p-8">
          <Skeleton className="h-6 w-48" />
          <Skeleton className="h-24 w-full" />
        </div>
      ) : contractQuery.isError ? (
        <div className="rounded-xl border border-outline-variant bg-surface py-16 text-center">
          <p className="mb-3 text-body-md text-error">Failed to load this contract.</p>
          <Button variant="outline" size="sm" onClick={() => contractQuery.refetch()}>
            Retry
          </Button>
        </div>
      ) : contract ? (
        <>
          {contract.status === "EXPIRING_SOON" && (
            <div className="flex items-center justify-between gap-4 rounded-xl border border-warning/30 bg-warning/10 p-5">
              <div className="flex items-center gap-3">
                <AlertTriangle className="h-5 w-5 shrink-0 text-warning" />
                <p className="text-body-md text-on-surface">
                  This lease expires in {Math.max(remaining, 0)} day{remaining === 1 ? "" : "s"}. Renew it to keep
                  the property occupied without a gap.
                </p>
              </div>
              <RoleGate allowedRoles={["MANAGER"]}>
                <Button asChild size="sm">
                  <Link href={`${ROUTES.contractNew}?renewFromId=${contract.id}`}>
                    <RefreshCw className="h-4 w-4" /> Renew
                  </Link>
                </Button>
              </RoleGate>
            </div>
          )}

          <section className="overflow-hidden rounded-xl border border-outline-variant bg-surface">
            <div className="flex items-center justify-between border-b border-outline-variant bg-surface-container-low px-6 py-4">
              <h3 className="font-display text-h2 text-on-surface">Parties</h3>
              <Badge className={CONTRACT_STATUS_BADGE_CLASSNAME[contract.status]}>
                {CONTRACT_STATUS_LABELS[contract.status]}
              </Badge>
            </div>
            <div className="grid grid-cols-1 gap-6 p-8 md:grid-cols-2">
              <Field
                label="Tenant"
                value={
                  <Link href={ROUTES.tenantDetail(contract.tenant.id)} className="text-secondary hover:underline">
                    {contract.tenant.nameEn}
                  </Link>
                }
              />
              <Field
                label="Property"
                value={
                  <Link href={ROUTES.propertyDetail(contract.property.id)} className="text-secondary hover:underline">
                    Unit {contract.property.unitNumber} — {contract.property.building.name}
                  </Link>
                }
              />
            </div>
          </section>

          <section className="overflow-hidden rounded-xl border border-outline-variant bg-surface">
            <div className="border-b border-outline-variant bg-surface-container-low px-6 py-4">
              <h3 className="font-display text-h2 text-on-surface">Term</h3>
            </div>
            <div className="grid grid-cols-1 gap-6 p-8 md:grid-cols-3">
              <Field label="Start Date" value={formatDate(contract.startDate)} />
              <Field label="End Date" value={formatDate(contract.endDate)} />
              <Field
                label="Time Remaining"
                value={
                  contract.status === "TERMINATED"
                    ? "Terminated"
                    : remaining >= 0
                      ? `${remaining} day${remaining === 1 ? "" : "s"} left`
                      : `Expired ${Math.abs(remaining)} day${Math.abs(remaining) === 1 ? "" : "s"} ago`
                }
              />
            </div>
          </section>

          <section className="overflow-hidden rounded-xl border border-outline-variant bg-surface">
            <div className="border-b border-outline-variant bg-surface-container-low px-6 py-4">
              <h3 className="font-display text-h2 text-on-surface">Financials — Agreed Terms Only</h3>
              <p className="mt-1 text-sm text-on-surface-variant">
                Rent tracking, payments, and collections live in the Finance module.
              </p>
            </div>
            <div className="grid grid-cols-1 gap-6 p-8 md:grid-cols-3">
              <Field label="Annual Rent" value={formatRent(contract.annualRent)} />
              <Field label="Monthly Rent" value={formatRent(contract.monthlyRent)} />
              <Field label="Payment Frequency" value={PAYMENT_FREQUENCY_LABELS[contract.paymentFrequency]} />
              {contract.paymentFrequency === "CHEQUES" && (
                <Field label="Number of Cheques" value={contract.numberOfCheques ?? "—"} />
              )}
              <Field
                label="Security Deposit"
                value={contract.securityDeposit != null ? formatRent(contract.securityDeposit) : "—"}
              />
            </div>
            {contract.notes && (
              <div className="border-t border-outline-variant p-8 pt-6">
                <Field label="Notes" value={<span className="whitespace-pre-wrap">{contract.notes}</span>} />
              </div>
            )}
          </section>

          {(contract.renewedFromId || renewals.length > 0) && (
            <section className="overflow-hidden rounded-xl border border-outline-variant bg-surface">
              <div className="border-b border-outline-variant bg-surface-container-low px-6 py-4">
                <h3 className="font-display text-h2 text-on-surface">Renewal Lineage</h3>
              </div>
              <div className="space-y-3 p-6">
                {contract.renewedFromId && (
                  <p className="text-body-md text-on-surface">
                    Renewed from{" "}
                    <Link href={ROUTES.contractDetail(contract.renewedFromId)} className="text-secondary hover:underline">
                      this contract
                    </Link>
                  </p>
                )}
                {renewals.map((renewal) => (
                  <p key={renewal.id} className="text-body-md text-on-surface">
                    Renewed as{" "}
                    <Link href={ROUTES.contractDetail(renewal.id)} className="text-secondary hover:underline">
                      {renewal.contractNumber}
                    </Link>
                  </p>
                ))}
              </div>
            </section>
          )}

          <ContractDocumentsSection contractId={contract.id} />

          <DeleteContractDialog
            contract={confirmingDelete ? contract : null}
            onOpenChange={setConfirmingDelete}
            onDeleted={() => router.push(ROUTES.contracts)}
          />
          <TerminateContractDialog
            contract={confirmingTerminate ? contract : null}
            onOpenChange={setConfirmingTerminate}
          />
        </>
      ) : null}
    </div>
  )
}
