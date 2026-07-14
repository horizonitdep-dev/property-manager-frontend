"use client"

import { useRouter } from "next/navigation"

import { clearAuthCookie } from "@/lib/api-client"
import { ROUTES } from "@/lib/constants"
import { authService } from "@/services/auth-service"
import { useAuthStore } from "@/store/auth-store"

export function useLogout() {
  const router = useRouter()
  const clear = useAuthStore((state) => state.clear)

  return async function logout() {
    try {
      await authService.logout()
    } catch {
      // Best-effort: client-side session is cleared regardless of server response.
    } finally {
      clear()
      clearAuthCookie()
      router.push(ROUTES.login)
    }
  }
}
