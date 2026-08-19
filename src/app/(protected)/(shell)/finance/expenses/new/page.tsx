"use client"

import { useSearchParams } from "next/navigation"

import { AccessRestricted } from "@/components/finance/access-restricted"
import { ExpenseForm } from "@/components/finance/expense-form"
import { usePageHeader } from "@/hooks/use-page-header"
import { useAuthStore } from "@/store/auth-store"

export default function NewExpensePage() {
  const role = useAuthStore((state) => state.user?.role)
  const searchParams = useSearchParams()
  // Lets building/property detail pages deep-link "Add expense" pre-scoped.
  const defaultBuildingId = searchParams.get("buildingId") ?? undefined
  const defaultPropertyId = searchParams.get("propertyId") ?? undefined

  usePageHeader({
    title: "Record Expense",
    subtitle: "Log a cost against a building or unit.",
  })

  if (role !== "MANAGER") return <AccessRestricted />

  return <ExpenseForm defaultBuildingId={defaultBuildingId} defaultPropertyId={defaultPropertyId} />
}
