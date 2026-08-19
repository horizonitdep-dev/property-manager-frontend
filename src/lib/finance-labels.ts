import type { ExpenseCategory, ExpenseSourceType } from "@/types/expense"
import type { FinanceAttachmentType, PaymentMethod } from "@/types/finance"
import type { PaymentKind } from "@/types/payment"

export const PAYMENT_KIND_LABELS: Record<PaymentKind, string> = {
  RENT: "Rent",
  SECURITY_DEPOSIT: "Security Deposit",
  LATE_FEE: "Late Fee",
  REFUND: "Refund",
  OTHER: "Other",
}

export const PAYMENT_KIND_OPTIONS: { value: PaymentKind; label: string }[] = (
  Object.keys(PAYMENT_KIND_LABELS) as PaymentKind[]
).map((value) => ({ value, label: PAYMENT_KIND_LABELS[value] }))

// A REFUND is money going out; it's stored positive and reports subtract it, so
// the badge is the only place the direction is visible in a list.
export const PAYMENT_KIND_BADGE_CLASSNAME: Record<PaymentKind, string> = {
  RENT: "border-transparent bg-emerald-100 text-emerald-700",
  SECURITY_DEPOSIT: "border-transparent bg-blue-100 text-blue-700",
  LATE_FEE: "border-transparent bg-amber-100 text-amber-700",
  REFUND: "border-transparent bg-rose-100 text-rose-700",
  OTHER: "border-transparent bg-slate-200 text-slate-700",
}

export const PAYMENT_METHOD_LABELS: Record<PaymentMethod, string> = {
  CASH: "Cash",
  BANK_TRANSFER: "Bank Transfer",
  CHEQUE: "Cheque",
  CARD: "Card",
  ONLINE: "Online",
  COURT_TRANSFER: "Court Transfer",
  OTHER: "Other",
}

export const PAYMENT_METHOD_OPTIONS: { value: PaymentMethod; label: string }[] = (
  Object.keys(PAYMENT_METHOD_LABELS) as PaymentMethod[]
).map((value) => ({ value, label: PAYMENT_METHOD_LABELS[value] }))

export const EXPENSE_CATEGORY_LABELS: Record<ExpenseCategory, string> = {
  MAINTENANCE: "Maintenance",
  UTILITY: "Utility",
  INSURANCE: "Insurance",
  GOV_FEE: "Government Fee",
  MUNICIPALITY_FEE: "Municipality Fee",
  CLEANING: "Cleaning",
  SECURITY: "Security",
  MANAGEMENT: "Management",
  LEGAL: "Legal",
  SALARY: "Salary",
  OTHER: "Other",
}

export const EXPENSE_CATEGORY_OPTIONS: { value: ExpenseCategory; label: string }[] = (
  Object.keys(EXPENSE_CATEGORY_LABELS) as ExpenseCategory[]
).map((value) => ({ value, label: EXPENSE_CATEGORY_LABELS[value] }))

// Only GENERAL is creatable here; the others mark rows owned by another module.
export const EXPENSE_SOURCE_TYPE_LABELS: Record<ExpenseSourceType, string> = {
  GENERAL: "General",
  WORK_ORDER: "Work Order",
  UTILITY_BILL: "Utility Bill",
  IMPORT: "Import",
}

export const EXPENSE_SOURCE_TYPE_OPTIONS: { value: ExpenseSourceType; label: string }[] = (
  Object.keys(EXPENSE_SOURCE_TYPE_LABELS) as ExpenseSourceType[]
).map((value) => ({ value, label: EXPENSE_SOURCE_TYPE_LABELS[value] }))

export const FINANCE_ATTACHMENT_TYPE_LABELS: Record<FinanceAttachmentType, string> = {
  RECEIPT: "Receipt",
  INVOICE: "Invoice",
  CHEQUE_IMAGE: "Cheque Image",
  BANK_STATEMENT: "Bank Statement",
  OTHER: "Other",
}

export const FINANCE_ATTACHMENT_TYPE_OPTIONS: { value: FinanceAttachmentType; label: string }[] = (
  Object.keys(FINANCE_ATTACHMENT_TYPE_LABELS) as FinanceAttachmentType[]
).map((value) => ({ value, label: FINANCE_ATTACHMENT_TYPE_LABELS[value] }))
