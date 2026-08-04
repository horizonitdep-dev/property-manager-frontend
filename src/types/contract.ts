import type { TenantType } from "@/types/tenant"

export type ContractStatus = "DRAFT" | "ACTIVE" | "EXPIRING_SOON" | "EXPIRED" | "TERMINATED"
export type StoredContractStatus = "DRAFT" | "ACTIVE" | "TERMINATED"
export type PaymentFrequency = "MONTHLY" | "QUARTERLY" | "BI_ANNUAL" | "ANNUAL" | "SINGLE_PAYMENT" | "CHEQUES"
export type ContractDocumentType = "SIGNED_CONTRACT" | "ADDENDUM" | "OTHER"

export interface ContractDocument {
  id: string
  documentType: ContractDocumentType
  fileName: string
  fileSize: number
  mimeType: string
  uploadedAt: string
  uploadedById: string
}

export interface ContractTenantSummary {
  id: string
  nameEn: string
  nameAr?: string | null
  tenantType: TenantType
}

export interface ContractPropertySummary {
  id: string
  unitNumber: string
  building: {
    id: string
    name: string
    code: string
  }
}

export interface Contract {
  id: string
  contractNumber: string
  startDate: string
  endDate: string
  annualRent: number
  monthlyRent: number
  paymentFrequency: PaymentFrequency
  numberOfCheques?: number | null
  securityDeposit?: number | null
  /** Effective, computed from dates — use for badges/filtering. */
  status: ContractStatus
  /** Raw manual state — use to prefill the edit form's status field. */
  storedStatus: StoredContractStatus
  renewedFromId?: string | null
  tenant: ContractTenantSummary
  property: ContractPropertySummary
  notes?: string | null
  createdAt: string
  updatedAt: string
}

// The backend doesn't document a slimmer list projection for contracts (unlike
// Tenant vs TenantListItem) — list and detail responses share this shape.
export type ContractListItem = Contract

export interface CreateContractDto {
  contractNumber: string
  tenantId: string
  propertyId: string
  startDate: string
  endDate: string
  annualRent: number
  monthlyRent: number
  paymentFrequency: PaymentFrequency
  numberOfCheques?: number
  securityDeposit?: number
  status?: "DRAFT" | "ACTIVE"
  notes?: string
}

export type UpdateContractDto = Partial<CreateContractDto>
export type RenewContractDto = CreateContractDto

export interface TerminateContractDto {
  reason?: string
}

export type ContractSortField = "contractNumber" | "startDate" | "endDate" | "annualRent" | "createdAt"

export interface ContractsQuery {
  page: number
  limit: number
  search?: string
  tenantId?: string
  propertyId?: string
  buildingId?: string
  status?: ContractStatus
  paymentFrequency?: PaymentFrequency
  startDateFrom?: string
  startDateTo?: string
  sortBy?: ContractSortField
  sortOrder?: "asc" | "desc"
}
