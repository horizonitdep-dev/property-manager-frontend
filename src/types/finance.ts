// Shared Finance types. Payments, cheques and expenses all attach files through
// the same endpoint shape and share PaymentMethod, so those live here rather
// than being duplicated per sub-module.

export type PaymentMethod =
  | "CASH"
  | "BANK_TRANSFER"
  | "CHEQUE"
  | "CARD"
  | "ONLINE"
  | "COURT_TRANSFER"
  | "OTHER"

export type FinanceAttachmentType =
  | "RECEIPT"
  | "INVOICE"
  | "CHEQUE_IMAGE"
  | "BANK_STATEMENT"
  | "OTHER"

export interface FinanceAttachment {
  id: string
  type: FinanceAttachmentType
  fileName: string
  fileSize: number
  mimeType: string
  uploadedAt: string
  uploadedById: string
}

export interface SignedAttachmentUrl {
  url: string
  expiresInSeconds: number
}

/**
 * Money arrives from the API as a STRING — Decimal(12,2) cannot round-trip
 * through a JSON double. Never parseFloat these for arithmetic; use the helpers
 * in @/lib/money.
 */
export type MoneyAmount = string
