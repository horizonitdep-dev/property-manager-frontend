"use client"

import { useSearchParams } from "next/navigation"

import { AccessRestricted } from "@/components/finance/access-restricted"
import { ChequeForm } from "@/components/finance/cheque-form"
import { usePageHeader } from "@/hooks/use-page-header"
import { useAuthStore } from "@/store/auth-store"

export default function NewChequePage() {
  const role = useAuthStore((state) => state.user?.role)
  const searchParams = useSearchParams()
  const defaultContractId = searchParams.get("contractId") ?? undefined

  usePageHeader({
    title: "Record Cheque",
    subtitle: "New cheques start as Held until they are deposited.",
  })

  if (role !== "MANAGER") return <AccessRestricted />

  return <ChequeForm defaultContractId={defaultContractId} />
}
