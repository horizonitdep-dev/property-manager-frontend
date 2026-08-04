import type { ContractDocumentType, ContractStatus, PaymentFrequency } from "@/types/contract"

export const CONTRACT_STATUS_LABELS: Record<ContractStatus, string> = {
  DRAFT: "Draft",
  ACTIVE: "Active",
  EXPIRING_SOON: "Expiring Soon",
  EXPIRED: "Expired",
  TERMINATED: "Terminated",
}

export const CONTRACT_STATUS_OPTIONS: { value: ContractStatus; label: string }[] = (
  Object.keys(CONTRACT_STATUS_LABELS) as ContractStatus[]
).map((value) => ({ value, label: CONTRACT_STATUS_LABELS[value] }))

export const CONTRACT_STATUS_BADGE_CLASSNAME: Record<ContractStatus, string> = {
  ACTIVE: "border-transparent bg-emerald-100 text-emerald-700",
  EXPIRING_SOON: "border-transparent bg-amber-100 text-amber-700",
  EXPIRED: "border-transparent bg-rose-100 text-rose-700",
  DRAFT: "border-transparent bg-slate-100 text-slate-600",
  TERMINATED: "border-transparent bg-slate-200 text-slate-700",
}

export const CONTRACT_FORM_STATUS_OPTIONS: { value: "DRAFT" | "ACTIVE"; label: string }[] = [
  { value: "DRAFT", label: "Draft" },
  { value: "ACTIVE", label: "Active" },
]

export const PAYMENT_FREQUENCY_LABELS: Record<PaymentFrequency, string> = {
  MONTHLY: "Monthly",
  QUARTERLY: "Quarterly",
  BI_ANNUAL: "Bi-Annual",
  ANNUAL: "Annual",
  SINGLE_PAYMENT: "Single Payment",
  CHEQUES: "Cheques",
}

export const PAYMENT_FREQUENCY_OPTIONS: { value: PaymentFrequency; label: string }[] = (
  Object.keys(PAYMENT_FREQUENCY_LABELS) as PaymentFrequency[]
).map((value) => ({ value, label: PAYMENT_FREQUENCY_LABELS[value] }))

export const CONTRACT_DOCUMENT_TYPE_LABELS: Record<ContractDocumentType, string> = {
  SIGNED_CONTRACT: "Signed Contract",
  ADDENDUM: "Addendum",
  OTHER: "Other",
}

export const CONTRACT_DOCUMENT_TYPE_OPTIONS: ContractDocumentType[] = ["SIGNED_CONTRACT", "ADDENDUM", "OTHER"]
