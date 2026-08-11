import type { ImportRowResult } from "@/types/import"

/**
 * Confirmed against a real `/import/pdf/validate` response — unlike the CSV
 * flow's single session, a PDF batch returns one row array + session id per
 * module (nullable when that module had zero candidates in the batch), not
 * per-PDF-file groupings. There's no field-level confidence flag on rows —
 * `data` is plain values, same shape as the CSV flow's ImportRowResult.data.
 */
export interface PdfImportSession {
  // Unlike the other three (null when that module had zero candidates in the
  // batch), contractSessionId is always a real id — the Contracts session is
  // the batch's anchor and is always created, even with zero valid rows.
  contractSessionId: string
  buildingsSessionId: string | null
  propertiesSessionId: string | null
  tenantsSessionId: string | null
  buildingRows: ImportRowResult[]
  propertyRows: ImportRowResult[]
  tenantRows: ImportRowResult[]
  contractRows: ImportRowResult[]
  // Whole-PDF failures (e.g. a PDF that failed extraction entirely).
  failures: { fileName: string; reason: string }[]
  summary: {
    pdfsUploaded: number
    pdfsExtracted: number
    pdfsFailed: number
    candidateBuildings: number
    candidateProperties: number
    candidateContracts: number
    candidateTenants: number
  }
}

/** Confirmed against a real /import/pdf/commit response. A row-level
 * contractFailures entry means that one contract (and only that one) wasn't
 * created — the buildings/properties/tenants counts and any other contracts
 * are unaffected, since each contract commits independently. */
export interface PdfImportCommitResult {
  buildingsCreated: number
  propertiesCreated: number
  tenantsCreated: number
  contractsCreated: number
  contractIds: string[]
  contractFailures: { rowNumber: number; reason: string }[]
}
