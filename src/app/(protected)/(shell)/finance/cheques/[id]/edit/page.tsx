"use client"

import Link from "next/link"
import { useParams } from "next/navigation"

import { AccessRestricted } from "@/components/finance/access-restricted"
import { ChequeForm } from "@/components/finance/cheque-form"
import { Button } from "@/components/ui/button"
import { Skeleton } from "@/components/ui/skeleton"
import { useCheque } from "@/hooks/queries/use-cheques"
import { usePageHeader } from "@/hooks/use-page-header"
import { ROUTES } from "@/lib/constants"
import { CHEQUE_STATUS_LABELS } from "@/lib/finance-labels"
import { useAuthStore } from "@/store/auth-store"

export default function EditChequePage() {
  const params = useParams<{ id: string }>()
  const role = useAuthStore((state) => state.user?.role)

  const chequeQuery = useCheque(params.id, { enabled: role === "MANAGER" })
  const cheque = chequeQuery.data

  usePageHeader({
    title: "Edit Cheque",
    subtitle: cheque ? `${cheque.bankName} · ${cheque.chequeNumber}` : "Update this cheque's details.",
  })

  if (role !== "MANAGER") return <AccessRestricted />

  if (chequeQuery.isLoading) {
    return (
      <div className="space-y-4 rounded-xl border border-outline-variant bg-surface p-8">
        <Skeleton className="h-6 w-48" />
        <Skeleton className="h-10 w-full" />
        <Skeleton className="h-10 w-full" />
      </div>
    )
  }

  if (chequeQuery.isError || !cheque) {
    return (
      <div className="rounded-xl border border-outline-variant bg-surface py-16 text-center">
        <p className="mb-3 text-body-md text-error">Failed to load this cheque.</p>
        <Button variant="outline" size="sm" onClick={() => chequeQuery.refetch()}>
          Retry
        </Button>
      </div>
    )
  }

  // Once banked, the cheque's details are evidence — the lifecycle actions are
  // the only way it changes.
  if (cheque.status !== "HELD") {
    return (
      <div className="flex flex-col items-center justify-center gap-4 rounded-xl border border-outline-variant bg-surface py-24 text-center">
        <h2 className="font-display text-h2 text-on-surface">This cheque can&rsquo;t be edited</h2>
        <p className="max-w-md text-body-md text-on-surface-variant">
          Only cheques still on hold can have their details changed. This one is{" "}
          {CHEQUE_STATUS_LABELS[cheque.status].toLowerCase()} — use the lifecycle actions instead.
        </p>
        <Button asChild variant="outline">
          <Link href={ROUTES.chequeDetail(cheque.id)}>Back to cheque</Link>
        </Button>
      </div>
    )
  }

  return <ChequeForm cheque={cheque} />
}
