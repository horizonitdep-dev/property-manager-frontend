"use client"

import { useParams } from "next/navigation"

import { AccessRestricted } from "@/components/contracts/access-restricted"
import { ContractForm } from "@/components/contracts/contract-form"
import { Button } from "@/components/ui/button"
import { Skeleton } from "@/components/ui/skeleton"
import { useContract } from "@/hooks/queries/use-contracts"
import { usePageHeader } from "@/hooks/use-page-header"
import { useAuthStore } from "@/store/auth-store"

export default function EditContractPage() {
  const params = useParams<{ id: string }>()
  const role = useAuthStore((state) => state.user?.role)

  const contractQuery = useContract(params.id, { enabled: role === "MANAGER" })

  usePageHeader({
    title: "Edit Contract",
    subtitle: "Update this lease's terms.",
  })

  if (role !== "MANAGER") return <AccessRestricted />

  return (
    <div className="space-y-6">
      {contractQuery.isLoading ? (
        <div className="space-y-4 rounded-xl border border-outline-variant bg-surface p-8">
          <Skeleton className="h-6 w-48" />
          <Skeleton className="h-10 w-full" />
          <Skeleton className="h-10 w-full" />
          <Skeleton className="h-10 w-full" />
        </div>
      ) : contractQuery.isError ? (
        <div className="rounded-xl border border-outline-variant bg-surface py-16 text-center">
          <p className="mb-3 text-body-md text-error">Failed to load this contract.</p>
          <Button variant="outline" size="sm" onClick={() => contractQuery.refetch()}>
            Retry
          </Button>
        </div>
      ) : contractQuery.data ? (
        <ContractForm contract={contractQuery.data} />
      ) : null}
    </div>
  )
}
