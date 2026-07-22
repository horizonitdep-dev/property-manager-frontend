"use client"

import { useSearchParams } from "next/navigation"

import { AccessRestricted } from "@/components/properties/access-restricted"
import { PropertyForm } from "@/components/properties/property-form"
import { usePageHeader } from "@/hooks/use-page-header"
import { useAuthStore } from "@/store/auth-store"

export default function NewPropertyPage() {
  const role = useAuthStore((state) => state.user?.role)
  const searchParams = useSearchParams()
  const defaultBuildingId = searchParams.get("buildingId") ?? undefined

  usePageHeader({
    title: "Register New Property Unit",
    subtitle: "Create a new entry in your property portfolio database.",
  })

  if (role !== "MANAGER") return <AccessRestricted />

  return <PropertyForm defaultBuildingId={defaultBuildingId} />
}
