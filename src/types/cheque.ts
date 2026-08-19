import type { FinanceAttachment, MoneyAmount } from "@/types/finance"
import type { PaymentContractSummary, PaymentKind } from "@/types/payment"

export type ChequeStatus = "HELD" | "DEPOSITED" | "CLEARED" | "BOUNCED" | "REPLACED" | "CANCELLED"

/** Slim shape used for both ends of a replacement chain. */
export interface ChequeLinkSummary {
  id: string
  chequeNumber: string
  bankName: string
  status: ChequeStatus
  amount: MoneyAmount
}

export interface ChequePaymentSummary {
  id: string
  amount: MoneyAmount
  paidOn: string
}

export interface Cheque {
  id: string
  contractId: string
  chequeNumber: string
  bankName: string
  /** String in transport — see MoneyAmount. */
  amount: MoneyAmount
  chequeDate: string
  status: ChequeStatus
  receivedOn: string
  depositedOn?: string | null
  clearedOn?: string | null
  bouncedOn?: string | null
  bounceReason?: string | null
  notes?: string | null
  replacedByChequeId?: string | null
  /** The cheque that superseded this one. */
  replacedBy?: ChequeLinkSummary | null
  /** The cheque this one was created to replace. */
  replaces?: ChequeLinkSummary | null
  /** Present only while CLEARED and its Payment is live. */
  payment?: ChequePaymentSummary | null
  contract?: PaymentContractSummary
  attachments?: FinanceAttachment[]
  createdAt: string
  updatedAt: string
  createdById: string
  updatedById?: string | null
}

export type ChequeListItem = Cheque

export interface CreateChequeDto {
  contractId: string
  chequeNumber: string
  bankName: string
  amount: number
  chequeDate: string
  receivedOn: string
  notes?: string
}

/** status is never settable — it moves only through the lifecycle endpoints. */
export type UpdateChequeDto = Partial<Omit<CreateChequeDto, "contractId">>

export interface DepositChequeDto {
  depositedOn: string
}

export interface ClearChequeDto {
  clearedOn: string
  /** Kind for the Payment this creates. Defaults to RENT server-side. */
  kind?: PaymentKind
  /** Recorded on the created Payment, not on the cheque. */
  notes?: string
}

export interface BounceChequeDto {
  bouncedOn: string
  bounceReason: string
}

/** contractId is omitted — a replacement always stays on the same contract. */
export type ReplaceChequeDto = Omit<CreateChequeDto, "contractId"> & {
  /** Recorded on the OLD cheque, explaining the replacement. */
  replacementNotes?: string
}

export interface CancelChequeDto {
  notes?: string
}

export type ChequeSortField = "chequeDate" | "receivedOn" | "amount" | "status" | "createdAt"

export interface ChequesQuery {
  page: number
  limit: number
  search?: string
  status?: ChequeStatus
  contractId?: string
  tenantId?: string
  propertyId?: string
  buildingId?: string
  chequeDateFrom?: string
  chequeDateTo?: string
  sortBy?: ChequeSortField
  sortOrder?: "asc" | "desc"
}
