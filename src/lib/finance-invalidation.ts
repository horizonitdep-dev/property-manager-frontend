// The Finance invalidation matrix (spec §9) in ONE place.
//
// Finance mutations reach further than their own sub-module: clearing a cheque
// creates a Payment and moves three reports. Encoding that per-hook means
// fifteen places to fix when it drifts, so every mutation hook calls
// `invalidateFinance(queryClient, "<mutation>", ctx)` instead.

import type { QueryClient } from "@tanstack/react-query"

import { QUERY_KEYS } from "@/lib/constants"

const KEYS = QUERY_KEYS.finance

export type FinanceMutation =
  | "payment.create"
  | "payment.update"
  | "payment.delete"
  | "cheque.create"
  | "cheque.update"
  | "cheque.deposit"
  | "cheque.clear"
  | "cheque.bounce"
  | "cheque.replace"
  | "cheque.cancel"
  | "cheque.delete"
  | "expense.create"
  | "expense.update"
  | "expense.delete"

export interface FinanceInvalidationContext {
  paymentId?: string
  chequeId?: string
  /** The successor cheque produced by a replace. */
  replacementChequeId?: string
  expenseId?: string
  contractId?: string
  buildingId?: string
  propertyId?: string
}

// The inner arrays are `as const` tuples from QUERY_KEYS, so both levels are readonly.
type KeyFactory = (ctx: FinanceInvalidationContext) => readonly (readonly unknown[])[]

const reports = {
  outstanding: KEYS.reports.outstanding(),
  pnl: KEYS.reports.pnl(),
  rentRoll: KEYS.reports.rentRoll(),
  chequesUpcoming: KEYS.reports.chequesUpcoming(),
}

// Reports are keyed by their filter params, so invalidating one report means
// matching every param variant — react-query does that from the shared prefix.
const reportPrefix = (name: keyof typeof reports) => reports[name].slice(0, 3)

const paymentWrites: KeyFactory = (ctx) => [
  KEYS.payments.all,
  ...(ctx.paymentId ? [KEYS.payments.detail(ctx.paymentId)] : []),
  ...(ctx.contractId ? [KEYS.payments.byContract(ctx.contractId)] : []),
  reportPrefix("outstanding"),
  reportPrefix("pnl"),
  reportPrefix("rentRoll"),
]

const expenseWrites: KeyFactory = (ctx) => [
  KEYS.expenses.all,
  ...(ctx.expenseId ? [KEYS.expenses.detail(ctx.expenseId)] : []),
  ...(ctx.buildingId ? [KEYS.expenses.byBuilding(ctx.buildingId)] : []),
  ...(ctx.propertyId ? [KEYS.expenses.byProperty(ctx.propertyId)] : []),
  reportPrefix("pnl"),
]

const chequeBase: KeyFactory = (ctx) => [
  KEYS.cheques.all,
  ...(ctx.chequeId ? [KEYS.cheques.detail(ctx.chequeId)] : []),
  ...(ctx.contractId ? [KEYS.cheques.byContract(ctx.contractId)] : []),
]

export const financeInvalidation: Record<FinanceMutation, KeyFactory> = {
  "payment.create": paymentWrites,
  "payment.update": paymentWrites,
  "payment.delete": paymentWrites,

  "cheque.create": (ctx) => [...chequeBase(ctx), reportPrefix("chequesUpcoming")],
  "cheque.update": (ctx) => [...chequeBase(ctx), reportPrefix("chequesUpcoming")],
  "cheque.deposit": (ctx) => [...chequeBase(ctx), reportPrefix("chequesUpcoming")],

  // Clearing is the wide one: it creates a Payment against the contract and
  // moves every money report.
  "cheque.clear": (ctx) => [
    ...chequeBase(ctx),
    KEYS.payments.all,
    ...(ctx.contractId ? [KEYS.payments.byContract(ctx.contractId)] : []),
    reportPrefix("outstanding"),
    reportPrefix("pnl"),
    reportPrefix("rentRoll"),
    reportPrefix("chequesUpcoming"),
  ],

  "cheque.bounce": (ctx) => [
    ...chequeBase(ctx),
    reportPrefix("outstanding"),
    reportPrefix("chequesUpcoming"),
  ],

  "cheque.replace": (ctx) => [
    ...chequeBase(ctx),
    ...(ctx.replacementChequeId ? [KEYS.cheques.detail(ctx.replacementChequeId)] : []),
    reportPrefix("outstanding"),
    reportPrefix("chequesUpcoming"),
  ],

  "cheque.cancel": (ctx) => [...chequeBase(ctx), reportPrefix("chequesUpcoming")],
  "cheque.delete": (ctx) => [...chequeBase(ctx), reportPrefix("chequesUpcoming")],

  "expense.create": expenseWrites,
  "expense.update": expenseWrites,
  "expense.delete": expenseWrites,
}

/** Call from every Finance mutation's onSuccess. */
export function invalidateFinance(
  queryClient: QueryClient,
  mutation: FinanceMutation,
  ctx: FinanceInvalidationContext = {}
) {
  for (const queryKey of financeInvalidation[mutation](ctx)) {
    queryClient.invalidateQueries({ queryKey })
  }
}
