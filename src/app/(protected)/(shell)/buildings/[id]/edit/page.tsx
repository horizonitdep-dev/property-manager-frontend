"use client"

import { useParams } from "next/navigation"
import { useQuery } from "@tanstack/react-query"

import { AccessRestricted } from "@/components/buildings/access-restricted"
import { BuildingForm } from "@/components/buildings/building-form"
import { Button } from "@/components/ui/button"
import { Skeleton } from "@/components/ui/skeleton"
import { QUERY_KEYS } from "@/lib/constants"
import { usePageHeader } from "@/hooks/use-page-header"
import { buildingService } from "@/services/building-service"
import { useAuthStore } from "@/store/auth-store"

export default function EditBuildingPage() {
  const params = useParams<{ id: string }>()
  const role = useAuthStore((state) => state.user?.role)

  const buildingQuery = useQuery({
    queryKey: QUERY_KEYS.building(params.id),
    queryFn: () => buildingService.getById(params.id),
    enabled: role === "MANAGER",
  })

  usePageHeader({
    title: "Edit Building",
    subtitle: "Update the structural details and location parameters for this asset.",
  })

  if (role !== "MANAGER") return <AccessRestricted />

  return (
    <div className="space-y-6">
      {buildingQuery.isLoading ? (
        <div className="space-y-4 rounded-xl border border-outline-variant bg-surface p-8">
          <Skeleton className="h-6 w-48" />
          <Skeleton className="h-10 w-full" />
          <Skeleton className="h-10 w-full" />
          <Skeleton className="h-10 w-full" />
        </div>
      ) : buildingQuery.isError ? (
        <div className="rounded-xl border border-outline-variant bg-surface py-16 text-center">
          <p className="mb-3 text-body-md text-error">Failed to load this building.</p>
          <Button variant="outline" size="sm" onClick={() => buildingQuery.refetch()}>
            Retry
          </Button>
        </div>
      ) : buildingQuery.data ? (
        <BuildingForm building={buildingQuery.data} />
      ) : null}
    </div>
  )
}
