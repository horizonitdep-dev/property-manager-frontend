"use client"

import { useSearchParams } from "next/navigation"

import { AccessRestricted } from "@/components/contracts/access-restricted"
import { ContractForm } from "@/components/contracts/contract-form"
import { Skeleton } from "@/components/ui/skeleton"
import { useContract } from "@/hooks/queries/use-contracts"
import { usePageHeader } from "@/hooks/use-page-header"
import { useAuthStore } from "@/store/auth-store"

export default function NewContractPage() {
  const role = useAuthStore((state) => state.user?.role)
  const searchParams = useSearchParams()
  const renewFromId = searchParams.get("renewFromId") ?? undefined
  const defaultTenantId = searchParams.get("tenantId") ?? undefined
  const defaultPropertyId = searchParams.get("propertyId") ?? undefined

  const renewFromQuery = useContract(renewFromId ?? "", { enabled: !!renewFromId && role === "MANAGER" })

  usePageHeader({
    title: renewFromId ? "Renew Contract" : "Register New Contract",
    subtitle: renewFromId
      ? "Create a new lease linked to the expiring contract."
      : "Create a new lease linking a tenant to a property.",
  })

  if (role !== "MANAGER") return <AccessRestricted />

  if (renewFromId) {
    if (renewFromQuery.isLoading) {
      return (
        <div className="space-y-4 rounded-xl border border-outline-variant bg-surface p-8">
          <Skeleton className="h-6 w-48" />
          <Skeleton className="h-10 w-full" />
          <Skeleton className="h-10 w-full" />
        </div>
      )
    }
    if (renewFromQuery.isError || !renewFromQuery.data) {
      return (
        <div className="rounded-xl border border-outline-variant bg-surface py-16 text-center">
          <p className="text-body-md text-error">Failed to load the source contract to renew.</p>
        </div>
      )
    }
    return <ContractForm renewFrom={renewFromQuery.data} />
  }

  return <ContractForm defaultTenantId={defaultTenantId} defaultPropertyId={defaultPropertyId} />
}
