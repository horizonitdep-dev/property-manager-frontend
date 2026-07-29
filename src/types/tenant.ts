export type TenantType = "INDIVIDUAL" | "COMPANY"
export type TenantStatus = "ACTIVE" | "FORMER"
export type DocumentType = "EMIRATES_ID" | "PASSPORT" | "TRADE_LICENSE" | "POWER_OF_ATTORNEY" | "OTHER"

export interface TenantDocument {
  id: string
  documentType: DocumentType
  fileName: string
  fileSize: number
  mimeType: string
  uploadedAt: string
  uploadedById: string
}

/**
 * GET /tenants (list) shape — deliberately omits ID/licence numbers.
 * Never assume this is interchangeable with `Tenant`.
 */
export interface TenantListItem {
  id: string
  tenantType: TenantType
  nameEn: string
  nameAr?: string | null
  phone: string
  email?: string | null
  status: TenantStatus
  documentCount: number
  createdAt: string
}

/**
 * GET /tenants/:id (detail) shape — the only place ID/licence numbers
 * and document metadata are ever returned.
 */
export interface Tenant {
  id: string
  tenantType: TenantType
  nameEn: string
  nameAr?: string | null
  phone: string
  alternatePhone?: string | null
  email?: string | null
  nationality?: string | null
  emiratesIdNumber?: string | null
  emiratesIdExpiry?: string | null
  passportNumber?: string | null
  passportExpiry?: string | null
  tradeLicenseNumber?: string | null
  tradeLicenseExpiry?: string | null
  authorizedPersonNameEn?: string | null
  authorizedPersonNameAr?: string | null
  authorizedPersonOccupation?: string | null
  authorizedPersonPhone?: string | null
  status: TenantStatus
  notes?: string | null
  documents: TenantDocument[]
  createdById: string
  updatedById?: string | null
  createdAt: string
  updatedAt: string
  deletedAt?: string | null
}

export interface CreateTenantDto {
  tenantType: TenantType
  nameEn: string
  nameAr?: string
  phone: string
  alternatePhone?: string
  email?: string
  nationality?: string
  emiratesIdNumber?: string
  emiratesIdExpiry?: string
  passportNumber?: string
  passportExpiry?: string
  tradeLicenseNumber?: string
  tradeLicenseExpiry?: string
  authorizedPersonNameEn?: string
  authorizedPersonNameAr?: string
  authorizedPersonOccupation?: string
  authorizedPersonPhone?: string
  status?: TenantStatus
  notes?: string
}

export type UpdateTenantDto = Partial<CreateTenantDto>

export type TenantSortField = "nameEn" | "createdAt"

export interface TenantsQuery {
  page: number
  limit: number
  search?: string
  tenantType?: TenantType
  status?: TenantStatus
  sortBy?: TenantSortField
  sortOrder?: "asc" | "desc"
}

export interface SignedDocumentUrl {
  url: string
  expiresInSeconds: number
}
