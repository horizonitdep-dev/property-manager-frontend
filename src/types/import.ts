/** URL path segment — matches the backend's IMPORT_MODULE_SLUGS exactly. */
export type ImportModuleKey = "buildings" | "properties" | "tenants" | "contracts"

/** `ImportSession.module` value — the uppercase enum the backend returns. */
export type ImportModule = "BUILDINGS" | "PROPERTIES" | "TENANTS" | "CONTRACTS"

export type ImportSessionStatus = "PENDING_REVIEW" | "COMMITTED" | "FAILED" | "CANCELLED"
export type ImportRowStatus = "VALID" | "ERROR"

export interface ImportRowError {
  field: string
  message: string
}

export interface ImportRowResult {
  rowNumber: number
  // Shape depends on the session's module — mirrors the matching CreateXDto
  // exactly (the backend runs each row through the same DTO the manual create
  // form uses). For Properties/Contracts, reference fields (buildingId,
  // tenantId, propertyId) are already-resolved UUIDs on valid rows, not the
  // human text the user typed — callers that know the module cast this at
  // the point of use (see components/import/preview-step.tsx).
  data: Record<string, unknown>
  status: ImportRowStatus
  errors: ImportRowError[]
  resolvedRefs?: Record<string, string>
}

export interface ImportSession {
  id: string
  module: ImportModule
  status: ImportSessionStatus
  originalName: string
  totalRows: number
  validRows: number
  errorRows: number
  rows: ImportRowResult[]
  createdAt: string
  committedAt?: string | null
}

export interface ImportCommitResult {
  inserted: number
  module: ImportModule
}
