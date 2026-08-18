"use client"

import { useSearchParams } from "next/navigation"

import { AccessRestricted } from "@/components/finance/access-restricted"
import { PaymentForm } from "@/components/finance/payment-form"
import { usePageHeader } from "@/hooks/use-page-header"
import { useAuthStore } from "@/store/auth-store"

export default function NewPaymentPage() {
  const role = useAuthStore((state) => state.user?.role)
  const searchParams = useSearchParams()
  // Lets the contract detail page deep-link "Record payment" with the contract prefilled.
  const defaultContractId = searchParams.get("contractId") ?? undefined

  usePageHeader({
    title: "Record Payment",
    subtitle: "Log money received against a contract.",
  })

  if (role !== "MANAGER") return <AccessRestricted />

  return <PaymentForm defaultContractId={defaultContractId} />
}
