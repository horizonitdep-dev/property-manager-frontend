"use client"

import type { UserRole } from "@/types/auth"
import { useAuthStore } from "@/store/auth-store"

export function RoleGate({
  allowedRoles,
  children,
}: {
  allowedRoles: UserRole[]
  children: React.ReactNode
}) {
  const role = useAuthStore((state) => state.user?.role)
  if (!role || !allowedRoles.includes(role)) return null
  return <>{children}</>
}
