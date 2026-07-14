import { create } from "zustand"
import { persist } from "zustand/middleware"

import type { User } from "@/types/auth"

interface AuthState {
  user: User | null
  accessToken: string | null
  refreshToken: string | null
  isHydrated: boolean
  setSession: (session: { user: User; accessToken: string; refreshToken: string }) => void
  setTokens: (tokens: { accessToken: string; refreshToken: string }) => void
  setUser: (user: User) => void
  setHydrated: (isHydrated: boolean) => void
  clear: () => void
}

// The access token is intentionally excluded from persistence — it lives in
// memory only. The refresh token is persisted so a hard page reload can
// silently mint a new access token instead of forcing a re-login.
export const useAuthStore = create<AuthState>()(
  persist(
    (set) => ({
      user: null,
      accessToken: null,
      refreshToken: null,
      isHydrated: false,
      setSession: ({ user, accessToken, refreshToken }) => set({ user, accessToken, refreshToken }),
      setTokens: ({ accessToken, refreshToken }) => set({ accessToken, refreshToken }),
      setUser: (user) => set({ user }),
      setHydrated: (isHydrated) => set({ isHydrated }),
      clear: () => set({ user: null, accessToken: null, refreshToken: null }),
    }),
    {
      name: "horizon-auth",
      partialize: (state) => ({ refreshToken: state.refreshToken }),
      onRehydrateStorage: () => (state) => {
        state?.setHydrated(true)
      },
    }
  )
)
