export type UserRole = "MANAGER" | "SECRETARY"

export interface User {
  id: string
  email: string
  /** Matches the backend's User.fullName — the API has never sent `name`. */
  fullName: string
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
