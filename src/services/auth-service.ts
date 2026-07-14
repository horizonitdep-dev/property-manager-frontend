import { apiClient, unwrap } from "@/lib/api-client"
import type { ApiEnvelope } from "@/types/api"
import type { LoginDto, LoginResult, User } from "@/types/auth"

export const authService = {
  async login(dto: LoginDto): Promise<LoginResult> {
    const response = await apiClient.post<ApiEnvelope<LoginResult>>("/auth/login", dto)
    return unwrap(response.data)
  },

  async logout(): Promise<void> {
    await apiClient.post("/auth/logout")
  },

  async me(): Promise<User> {
    const response = await apiClient.get<ApiEnvelope<User>>("/auth/me")
    return unwrap(response.data)
  },
}
