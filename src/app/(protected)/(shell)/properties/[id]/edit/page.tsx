"use client"

import { useParams } from "next/navigation"

import { AccessRestricted } from "@/components/properties/access-restricted"
import { PropertyForm } from "@/components/properties/property-form"
import { Button } from "@/components/ui/button"
import { Skeleton } from "@/components/ui/skeleton"
import { useProperty } from "@/hooks/queries/use-properties"
import { usePageHeader } from "@/hooks/use-page-header"
import { useAuthStore } from "@/store/auth-store"

export default function EditPropertyPage() {
  const params = useParams<{ id: string }>()
  const role = useAuthStore((state) => state.user?.role)

  const propertyQuery = useProperty(params.id, { enabled: role === "MANAGER" })

  usePageHeader({
    title: "Edit Property Unit",
    subtitle: "Update the unit details and financial parameters for this asset.",
  })

  if (role !== "MANAGER") return <AccessRestricted />

  return (
    <div className="space-y-6">
      {propertyQuery.isLoading ? (
        <div className="space-y-4 rounded-xl border border-outline-variant bg-surface p-8">
          <Skeleton className="h-6 w-48" />
          <Skeleton className="h-10 w-full" />
          <Skeleton className="h-10 w-full" />
          <Skeleton className="h-10 w-full" />
        </div>
      ) : propertyQuery.isError ? (
        <div className="rounded-xl border border-outline-variant bg-surface py-16 text-center">
          <p className="mb-3 text-body-md text-error">Failed to load this property unit.</p>
          <Button variant="outline" size="sm" onClick={() => propertyQuery.refetch()}>
            Retry
          </Button>
        </div>
      ) : propertyQuery.data ? (
        <PropertyForm property={propertyQuery.data} />
      ) : null}
    </div>
  )
}
