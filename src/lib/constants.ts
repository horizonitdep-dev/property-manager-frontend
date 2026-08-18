// `typeof process` guard so this module is safe to import outside Next (the
// design-system bundle evaluates it in a plain browser, where `process` is
// undefined). Next still inlines NEXT_PUBLIC_API_URL at build time.
export const API_BASE_URL =
  (typeof process !== "undefined" ? process.env.NEXT_PUBLIC_API_URL : undefined) ??
  "http://localhost:3000/api/v1"

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
  tenants: "/tenants",
  tenantNew: "/tenants/new",
  tenantDetail: (id: string) => `/tenants/${id}`,
  tenantEdit: (id: string) => `/tenants/${id}/edit`,
  contracts: "/contracts",
  contractNew: "/contracts/new",
  contractDetail: (id: string) => `/contracts/${id}`,
  contractEdit: (id: string) => `/contracts/${id}/edit`,
  import: "/import",

  finance: "/finance",
  payments: "/finance/payments",
  paymentNew: "/finance/payments/new",
  paymentDetail: (id: string) => `/finance/payments/${id}`,
  paymentEdit: (id: string) => `/finance/payments/${id}/edit`,
  cheques: "/finance/cheques",
  chequeNew: "/finance/cheques/new",
  chequeDetail: (id: string) => `/finance/cheques/${id}`,
  expenses: "/finance/expenses",
  expenseNew: "/finance/expenses/new",
  expenseDetail: (id: string) => `/finance/expenses/${id}`,
  expenseEdit: (id: string) => `/finance/expenses/${id}/edit`,
  reports: "/finance/reports",
  reportOutstanding: "/finance/reports/outstanding",
  reportPnl: "/finance/reports/pnl",
  reportRentRoll: "/finance/reports/rent-roll",
  reportChequesUpcoming: "/finance/reports/cheques-upcoming",
  reportAnnualTenantCount: "/finance/reports/annual-tenant-count",
} as const

export const PUBLIC_ROUTES = [ROUTES.login]

export const QUERY_KEYS = {
  me: ["auth", "me"] as const,
  buildings: (params?: unknown) => ["buildings", params] as const,
  building: (id: string) => ["buildings", id] as const,
  properties: (params?: unknown) => ["properties", params] as const,
  property: (id: string) => ["properties", id] as const,
  propertiesByBuilding: (buildingId: string) => ["properties", "byBuilding", buildingId] as const,
  tenants: (params?: unknown) => ["tenants", params] as const,
  tenant: (id: string) => ["tenants", id] as const,
  tenantDocuments: (tenantId: string) => ["tenants", tenantId, "documents"] as const,
  contracts: (params?: unknown) => ["contracts", params] as const,
  contract: (id: string) => ["contracts", id] as const,
  contractsByProperty: (propertyId: string) => ["contracts", "byProperty", propertyId] as const,
  contractsByTenant: (tenantId: string) => ["contracts", "byTenant", tenantId] as const,
  contractDocuments: (contractId: string) => ["contracts", contractId, "documents"] as const,
  importSession: (id: string) => ["import", "session", id] as const,
  pdfImportSession: (id: string) => ["import", "pdf", "session", id] as const,

  // Finance keys are namespaced so a whole sub-module can be invalidated by its
  // `all` prefix. Cross-module invalidation is encoded once in
  // @/lib/finance-invalidation — don't invalidate these ad-hoc from components.
  finance: {
    all: ["finance"] as const,
    payments: {
      all: ["finance", "payments"] as const,
      list: (params?: unknown) => ["finance", "payments", "list", params] as const,
      detail: (id: string) => ["finance", "payments", "detail", id] as const,
      byContract: (contractId: string) => ["finance", "payments", "byContract", contractId] as const,
      attachments: (paymentId: string) => ["finance", "payments", paymentId, "attachments"] as const,
    },
    cheques: {
      all: ["finance", "cheques"] as const,
      list: (params?: unknown) => ["finance", "cheques", "list", params] as const,
      detail: (id: string) => ["finance", "cheques", "detail", id] as const,
      byContract: (contractId: string) => ["finance", "cheques", "byContract", contractId] as const,
      attachments: (chequeId: string) => ["finance", "cheques", chequeId, "attachments"] as const,
    },
    expenses: {
      all: ["finance", "expenses"] as const,
      list: (params?: unknown) => ["finance", "expenses", "list", params] as const,
      detail: (id: string) => ["finance", "expenses", "detail", id] as const,
      byBuilding: (buildingId: string) => ["finance", "expenses", "byBuilding", buildingId] as const,
      byProperty: (propertyId: string) => ["finance", "expenses", "byProperty", propertyId] as const,
      attachments: (expenseId: string) => ["finance", "expenses", expenseId, "attachments"] as const,
    },
    reports: {
      all: ["finance", "reports"] as const,
      outstanding: (params?: unknown) => ["finance", "reports", "outstanding", params] as const,
      pnl: (params?: unknown) => ["finance", "reports", "pnl", params] as const,
      rentRoll: (params?: unknown) => ["finance", "reports", "rentRoll", params] as const,
      chequesUpcoming: (params?: unknown) => ["finance", "reports", "chequesUpcoming", params] as const,
      annualTenantCount: (params?: unknown) => ["finance", "reports", "annualTenantCount", params] as const,
    },
  },
}
