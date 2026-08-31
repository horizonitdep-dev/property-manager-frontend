import type { ImportRowResult } from "@/types/import"
import type { PdfImportSession } from "@/types/import-pdf"

/**
 * Mirrors the backend's GreenBatchPreview. Unlike the DMT flow (which fans out
 * into four sessions), one Green Contract upload is exactly one session, so
 * there is a single `sessionId` and commit takes only that.
 */
export interface GreenContractImportSession {
  sessionId: string
  /** PDFs that failed extraction entirely — the rest of the batch still processes. */
  failures: { fileName: string; reason: string }[]
  summary: {
    pdfsUploaded: number
    pdfsExtracted: number
    pdfsFailed: number
    candidateBuildings: number
    candidateProperties: number
    candidateTenants: number
    candidateContracts: number
    /** Rows refused because the unit already has a contract on file. */
    blockedContracts: number
  }
  buildingRows: ImportRowResult[]
  propertyRows: ImportRowResult[]
  tenantRows: ImportRowResult[]
  contractRows: ImportRowResult[]
}

export interface GreenContractCommitResult {
  buildingsCreated: number
  propertiesCreated: number
  tenantsCreated: number
  contractsCreated: number
  contractIds: string[]
  contractFailures: { rowNumber: number; reason: string }[]
}

/**
 * The two sessions carry identical row arrays and summary fields — only the
 * session id differs (Green has one, DMT has four). Adapting lets the Green
 * flow render the existing PdfPreviewStep unchanged instead of duplicating it.
 * Blocked rows already arrive as ERROR rows whose message explains the block,
 * so they display correctly with no special handling.
 */
export function toPreviewSession(session: GreenContractImportSession): PdfImportSession {
  return {
    contractSessionId: session.sessionId,
    buildingsSessionId: null,
    propertiesSessionId: null,
    tenantsSessionId: null,
    buildingRows: session.buildingRows,
    propertyRows: session.propertyRows,
    tenantRows: session.tenantRows,
    contractRows: session.contractRows,
    failures: session.failures,
    summary: session.summary,
  }
}
