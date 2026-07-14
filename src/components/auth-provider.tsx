"use client"

import * as React from "react"

import { clearAuthCookie, refreshAccessToken, setAuthCookie } from "@/lib/api-client"
import { authService } from "@/services/auth-service"
import { useAuthStore } from "@/store/auth-store"

/**
 * On a hard page reload the access token (memory-only) is gone. If a
 * persisted refresh token exists, silently mint a new access token and
 * re-fetch the user before the rest of the app renders protected data.
 */
export function AuthProvider({ children }: { children: React.ReactNode }) {
  const isHydrated = useAuthStore((state) => state.isHydrated)
  const user = useAuthStore((state) => state.user)
  const refreshToken = useAuthStore((state) => state.refreshToken)
  const setUser = useAuthStore((state) => state.setUser)
  const clear = useAuthStore((state) => state.clear)
  const [isBootstrapping, setIsBootstrapping] = React.useState(true)

  React.useEffect(() => {
    if (!isHydrated) return

    let cancelled = false

    async function bootstrap() {
      if (user) {
        setIsBootstrapping(false)
        return
      }
      if (!refreshToken) {
        clearAuthCookie()
        setIsBootstrapping(false)
        return
      }

      const accessToken = await refreshAccessToken()
      if (cancelled) return

      if (!accessToken) {
        setIsBootstrapping(false)
        return
      }

      try {
        const me = await authService.me()
        if (cancelled) return
        setUser(me)
        setAuthCookie()
      } catch {
        if (!cancelled) {
          clear()
          clearAuthCookie()
        }
      } finally {
        if (!cancelled) setIsBootstrapping(false)
      }
    }

    void bootstrap()
    return () => {
      cancelled = true
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [isHydrated])

  if (!isHydrated || isBootstrapping) {
    return (
      <div className="flex min-h-screen items-center justify-center bg-background">
        <div className="h-8 w-8 animate-spin rounded-full border-2 border-outline-variant border-t-secondary" />
      </div>
    )
  }

  return <>{children}</>
}
