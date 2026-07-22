export const API_BASE_URL = process.env.NEXT_PUBLIC_API_URL ?? "http://localhost:3000/api/v1"

/**
 * Backend confirmed to return accessToken/refreshToken in the login response body
 * (not a Set-Cookie session). See HorizonPM_Frontend_Sprint_Guide.md section 3.
 */
export const AUTH_MODE = "body-token" as const

// Non-httpOnly marker cookie so middleware can gate routes without holding the
// real access token (which lives only in memory). It carries no privileges by
// itself — the API always re-validates the bearer token on every request.
export const AUTH_COOKIE_NAME = "hz_auth"

export const ROUTES = {
  login: "/login",
  select: "/select",
  dashboard: "/dashboard",
  buildings: "/buildings",
  buildingNew: "/buildings/new",
  buildingDetail: (id: string) => `/buildings/${id}`,
  buildingEdit: (id: string) => `/buildings/${id}/edit`,
  properties: "/properties",
  propertyNew: "/properties/new",
  propertyDetail: (id: string) => `/properties/${id}`,
  propertyEdit: (id: string) => `/properties/${id}/edit`,
} as const

export const PUBLIC_ROUTES = [ROUTES.login]

export const QUERY_KEYS = {
  me: ["auth", "me"] as const,
  buildings: (params?: unknown) => ["buildings", params] as const,
  building: (id: string) => ["buildings", id] as const,
  properties: (params?: unknown) => ["properties", params] as const,
  property: (id: string) => ["properties", id] as const,
  propertiesByBuilding: (buildingId: string) => ["properties", "byBuilding", buildingId] as const,
}
