import type { DocumentType, TenantStatus, TenantType } from "@/types/tenant"

export const TENANT_TYPE_LABELS: Record<TenantType, string> = {
  INDIVIDUAL: "Individual",
  COMPANY: "Company",
}

export const TENANT_TYPE_OPTIONS: { value: TenantType; label: string }[] = (
  Object.keys(TENANT_TYPE_LABELS) as TenantType[]
).map((value) => ({ value, label: TENANT_TYPE_LABELS[value] }))

export const TENANT_STATUS_LABELS: Record<TenantStatus, string> = {
  ACTIVE: "Active",
  FORMER: "Former",
}

export const TENANT_STATUS_OPTIONS: { value: TenantStatus; label: string }[] = (
  Object.keys(TENANT_STATUS_LABELS) as TenantStatus[]
).map((value) => ({ value, label: TENANT_STATUS_LABELS[value] }))

export const TENANT_STATUS_BADGE_CLASSNAME: Record<TenantStatus, string> = {
  ACTIVE: "border-transparent bg-emerald-100 text-emerald-700",
  FORMER: "border-transparent bg-slate-200 text-slate-700",
}

export const DOCUMENT_TYPE_LABELS: Record<DocumentType, string> = {
  EMIRATES_ID: "Emirates ID",
  PASSPORT: "Passport",
  TRADE_LICENSE: "Trade License",
  POWER_OF_ATTORNEY: "Power of Attorney",
  OTHER: "Other",
}

// Which document types are offered per tenant type when uploading (OTHER always available).
export const DOCUMENT_TYPES_BY_TENANT_TYPE: Record<TenantType, DocumentType[]> = {
  INDIVIDUAL: ["EMIRATES_ID", "PASSPORT", "OTHER"],
  COMPANY: ["TRADE_LICENSE", "POWER_OF_ATTORNEY", "OTHER"],
}
