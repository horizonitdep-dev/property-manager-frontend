export type UserRole = "MANAGER" | "SECRETARY"

export interface User {
  id: string
  email: string
  name: string
  role: UserRole
}

export interface LoginDto {
  email: string
  password: string
}

export interface LoginResult {
  user: User
  accessToken: string
  refreshToken: string
}

export interface RefreshResult {
  accessToken: string
  refreshToken: string
}
