import axios, { type AxiosError, type InternalAxiosRequestConfig } from "axios"

import { API_BASE_URL, AUTH_COOKIE_NAME } from "@/lib/constants"
import { useAuthStore } from "@/store/auth-store"
import type { ApiEnvelope } from "@/types/api"
import type { RefreshResult } from "@/types/auth"

export const apiClient = axios.create({
  baseURL: API_BASE_URL,
  withCredentials: true,
})

apiClient.interceptors.request.use((config) => {
  const { accessToken } = useAuthStore.getState()
  if (accessToken) {
    config.headers.Authorization = `Bearer ${accessToken}`
  }
  return config
})

function setAuthCookie() {
  document.cookie = `${AUTH_COOKIE_NAME}=1; path=/; max-age=${60 * 60 * 24 * 30}; samesite=lax`
}

export function clearAuthCookie() {
  document.cookie = `${AUTH_COOKIE_NAME}=; path=/; max-age=0; samesite=lax`
}

let refreshPromise: Promise<string | null> | null = null

async function refreshAccessToken(): Promise<string | null> {
  const { refreshToken, setTokens, clear } = useAuthStore.getState()
  if (!refreshToken) {
    clear()
    clearAuthCookie()
    return null
  }

  try {
    const response = await axios.post<ApiEnvelope<RefreshResult>>(
      `${API_BASE_URL}/auth/refresh`,
      { refreshToken },
      { withCredentials: true }
    )
    const { accessToken, refreshToken: nextRefreshToken } = response.data.data
    setTokens({ accessToken, refreshToken: nextRefreshToken })
    setAuthCookie()
    return accessToken
  } catch {
    clear()
    clearAuthCookie()
    return null
  }
}

apiClient.interceptors.response.use(
  (response) => response,
  async (error: AxiosError) => {
    const originalRequest = error.config as (InternalAxiosRequestConfig & { _retry?: boolean }) | undefined

    if (error.response?.status !== 401 || !originalRequest || originalRequest._retry) {
      throw error
    }
    if (originalRequest.url?.includes("/auth/refresh") || originalRequest.url?.includes("/auth/login")) {
      throw error
    }

    originalRequest._retry = true
    refreshPromise ??= refreshAccessToken().finally(() => {
      refreshPromise = null
    })

    const accessToken = await refreshPromise
    if (!accessToken) {
      throw error
    }

    originalRequest.headers = originalRequest.headers ?? {}
    originalRequest.headers.Authorization = `Bearer ${accessToken}`
    return apiClient(originalRequest)
  }
)

export function unwrap<T>(envelope: ApiEnvelope<T>): T {
  return envelope.data
}

export { setAuthCookie, refreshAccessToken }
