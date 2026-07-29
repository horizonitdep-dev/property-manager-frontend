"use client"

import { AccessRestricted } from "@/components/tenants/access-restricted"
import { TenantForm } from "@/components/tenants/tenant-form"
import { usePageHeader } from "@/hooks/use-page-header"
import { useAuthStore } from "@/store/auth-store"

export default function NewTenantPage() {
  const role = useAuthStore((state) => state.user?.role)

  usePageHeader({
    title: "Register New Tenant",
    subtitle: "Onboard a new individual or company tenant.",
  })

  if (role !== "MANAGER") return <AccessRestricted />

  return <TenantForm />
}
