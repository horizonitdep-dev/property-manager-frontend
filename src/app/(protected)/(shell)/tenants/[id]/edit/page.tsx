"use client"

import { useParams } from "next/navigation"

import { AccessRestricted } from "@/components/tenants/access-restricted"
import { TenantForm } from "@/components/tenants/tenant-form"
import { Button } from "@/components/ui/button"
import { Skeleton } from "@/components/ui/skeleton"
import { useTenant } from "@/hooks/queries/use-tenants"
import { usePageHeader } from "@/hooks/use-page-header"
import { useAuthStore } from "@/store/auth-store"

export default function EditTenantPage() {
  const params = useParams<{ id: string }>()
  const role = useAuthStore((state) => state.user?.role)

  const tenantQuery = useTenant(params.id, { enabled: role === "MANAGER" })

  usePageHeader({
    title: "Edit Tenant",
    subtitle: "Update this tenant's details.",
  })

  if (role !== "MANAGER") return <AccessRestricted />

  return (
    <div className="space-y-6">
      {tenantQuery.isLoading ? (
        <div className="space-y-4 rounded-xl border border-outline-variant bg-surface p-8">
          <Skeleton className="h-6 w-48" />
          <Skeleton className="h-10 w-full" />
          <Skeleton className="h-10 w-full" />
          <Skeleton className="h-10 w-full" />
        </div>
      ) : tenantQuery.isError ? (
        <div className="rounded-xl border border-outline-variant bg-surface py-16 text-center">
          <p className="mb-3 text-body-md text-error">Failed to load this tenant.</p>
          <Button variant="outline" size="sm" onClick={() => tenantQuery.refetch()}>
            Retry
          </Button>
        </div>
      ) : tenantQuery.data ? (
        <TenantForm tenant={tenantQuery.data} />
      ) : null}
    </div>
  )
}
