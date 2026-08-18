import type { FinanceAttachment, MoneyAmount, PaymentMethod } from "@/types/finance"

export type PaymentKind = "RENT" | "SECURITY_DEPOSIT" | "LATE_FEE" | "REFUND" | "OTHER"

export interface PaymentTenantSummary {
  id: string
  nameEn: string
  nameAr?: string | null
}

export interface PaymentPropertySummary {
  id: string
  unitNumber: string
  building: {
    id: string
    name: string
    code: string
  }
}

/** Read-only lease summary echoed on payment responses so lists need one request. */
export interface PaymentContractSummary {
  id: string
  contractNumber: string
  tenant: PaymentTenantSummary
  property: PaymentPropertySummary
}

export interface PaymentChequeSummary {
  id: string
  chequeNumber: string
  bankName: string
}

export interface Payment {
  id: string
  contractId: string
  kind: PaymentKind
  /** String in transport — see MoneyAmount. */
  amount: MoneyAmount
  paidOn: string
  method: PaymentMethod
  periodStart?: string | null
  periodEnd?: string | null
  /** Set only when the payment was produced by a cheque clearing. */
  chequeId?: string | null
  referenceNumber?: string | null
  notes?: string | null
  /**
   * True when a cheque clearing created this payment. Such payments reject
   * amount/paidOn/kind/method edits with a 409 — the cheque is the source of
   * truth. Drives the read-only banner on the edit form.
   */
  isChequeLinked: boolean
  contract?: PaymentContractSummary
  cheque?: PaymentChequeSummary | null
  attachments?: FinanceAttachment[]
  createdAt: string
  updatedAt: string
  createdById: string
  updatedById?: string | null
}

export type PaymentListItem = Payment

export interface CreatePaymentDto {
  contractId: string
  kind?: PaymentKind
  amount: number
  paidOn: string
  method: PaymentMethod
  periodStart?: string
  periodEnd?: string
  referenceNumber?: string
  notes?: string
}

/**
 * contractId is not editable — moving a payment between contracts would rewrite
 * two contracts' cash history. Soft-delete and re-enter instead.
 */
export type UpdatePaymentDto = Partial<Omit<CreatePaymentDto, "contractId">>

export type PaymentSortField = "paidOn" | "amount" | "createdAt"

export interface PaymentsQuery {
  page: number
  limit: number
  search?: string
  contractId?: string
  tenantId?: string
  propertyId?: string
  buildingId?: string
  method?: PaymentMethod
  kind?: PaymentKind
  paidOnFrom?: string
  paidOnTo?: string
  linkedToCheque?: boolean
  sortBy?: PaymentSortField
  sortOrder?: "asc" | "desc"
}
