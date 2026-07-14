"use client"

import { BuildingForm } from "@/components/buildings/building-form"
import { AccessRestricted } from "@/components/buildings/access-restricted"
import { usePageHeader } from "@/hooks/use-page-header"
import { useAuthStore } from "@/store/auth-store"

export default function NewBuildingPage() {
  const role = useAuthStore((state) => state.user?.role)

  usePageHeader({
    title: "Register New Building",
    subtitle: "Enter the structural details and location parameters for the new asset.",
  })

  if (role !== "MANAGER") return <AccessRestricted />

  return <BuildingForm />
}
