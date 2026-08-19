import type { FinanceAttachment, MoneyAmount, PaymentMethod } from "@/types/finance"

export type ExpenseCategory =
  | "MAINTENANCE"
  | "UTILITY"
  | "INSURANCE"
  | "GOV_FEE"
  | "MUNICIPALITY_FEE"
  | "CLEANING"
  | "SECURITY"
  | "MANAGEMENT"
  | "LEGAL"
  | "SALARY"
  | "OTHER"

/** Only GENERAL is reachable from this UI; the rest are set by originating modules. */
export type ExpenseSourceType = "GENERAL" | "WORK_ORDER" | "UTILITY_BILL" | "IMPORT"

export interface ExpenseBuildingSummary {
  id: string
  name: string
  code: string
}

export interface ExpensePropertySummary {
  id: string
  unitNumber: string
}

export interface Expense {
  id: string
  buildingId: string
  propertyId?: string | null
  category: ExpenseCategory
  /** String in transport — see MoneyAmount. */
  amount: MoneyAmount
  incurredOn: string
  vendorName: string
  description: string
  method: PaymentMethod
  invoiceNumber?: string | null
  sourceType: ExpenseSourceType
  sourceRefId?: string | null
  sourceRefType?: string | null
  /** False when another module created the expense — the UI must not offer editing. */
  isEditable: boolean
  notes?: string | null
  building?: ExpenseBuildingSummary
  property?: ExpensePropertySummary | null
  attachments?: FinanceAttachment[]
  createdAt: string
  updatedAt: string
  createdById: string
  updatedById?: string | null
}

export type ExpenseListItem = Expense

export interface CreateExpenseDto {
  buildingId: string
  propertyId?: string
  category: ExpenseCategory
  amount: number
  incurredOn: string
  vendorName: string
  description: string
  method: PaymentMethod
  invoiceNumber?: string
  notes?: string
}

/** sourceType/sourceRefId/sourceRefType are owned by the originating module. */
export type UpdateExpenseDto = Partial<CreateExpenseDto>

export type ExpenseSortField = "incurredOn" | "amount" | "category" | "createdAt"

export interface ExpensesQuery {
  page: number
  limit: number
  search?: string
  buildingId?: string
  propertyId?: string
  category?: ExpenseCategory
  sourceType?: ExpenseSourceType
  method?: PaymentMethod
  incurredOnFrom?: string
  incurredOnTo?: string
  sortBy?: ExpenseSortField
  sortOrder?: "asc" | "desc"
}
