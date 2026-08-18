"use client"

import { useParams } from "next/navigation"

import { AccessRestricted } from "@/components/finance/access-restricted"
import { PaymentForm } from "@/components/finance/payment-form"
import { Button } from "@/components/ui/button"
import { Skeleton } from "@/components/ui/skeleton"
import { usePayment } from "@/hooks/queries/use-payments"
import { usePageHeader } from "@/hooks/use-page-header"
import { useAuthStore } from "@/store/auth-store"

export default function EditPaymentPage() {
  const params = useParams<{ id: string }>()
  const role = useAuthStore((state) => state.user?.role)

  const paymentQuery = usePayment(params.id, { enabled: role === "MANAGER" })
  const payment = paymentQuery.data

  usePageHeader({
    title: "Edit Payment",
    subtitle: payment?.contract
      ? `${payment.contract.contractNumber} · ${payment.contract.tenant.nameEn}`
      : "Update this payment record.",
  })

  if (role !== "MANAGER") return <AccessRestricted />

  if (paymentQuery.isLoading) {
    return (
      <div className="space-y-4 rounded-xl border border-outline-variant bg-surface p-8">
        <Skeleton className="h-6 w-48" />
        <Skeleton className="h-10 w-full" />
        <Skeleton className="h-10 w-full" />
      </div>
    )
  }

  if (paymentQuery.isError || !payment) {
    return (
      <div className="rounded-xl border border-outline-variant bg-surface py-16 text-center">
        <p className="mb-3 text-body-md text-error">Failed to load this payment.</p>
        <Button variant="outline" size="sm" onClick={() => paymentQuery.refetch()}>
          Retry
        </Button>
      </div>
    )
  }

  return <PaymentForm payment={payment} />
}
