// Money handling for the Finance module.
//
// The API serialises Decimal(12,2) as a STRING because a JSON double cannot
// round-trip it. So: parse to integer minor units (fils), do all arithmetic
// there, and convert back only at the formatting boundary.
//
// Why not just use floats? Adding a few 2-decimal amounts is actually safe in
// float — but two things this module does are not:
//   • percentages (a 5% late fee on 1808.20 gives 90.41000000000001)
//   • long sums (1,000 report rows drift to ...9999999998)
// and the drift breaks equality, not just display: `owed === paid` comes back
// false for a contract paid to the fils. Integers avoid the whole class.
//
// Plain numbers are exact for integers up to 2^53 — about 90 trillion AED in
// fils — so no BigInt is needed.

import type { MoneyAmount } from "@/types/finance"

const MINOR_UNITS = 2

/**
 * "1234.50" → 123450 (fils). Accepts a number too, for values that originate in
 * a form input rather than the API.
 */
export function parseMoney(value: MoneyAmount | number | null | undefined): number {
  if (value === null || value === undefined || value === "") return 0
  if (typeof value === "number") return Math.round(value * 100)

  const match = /^\s*(-)?(\d*)(?:\.(\d*))?\s*$/.exec(value)
  if (!match) return 0

  const [, sign, whole = "0", fraction = ""] = match
  const minor = (fraction + "00").slice(0, MINOR_UNITS)
  const magnitude = Number(whole || "0") * 100 + Number(minor || "0")
  return sign === "-" ? -magnitude : magnitude
}

/** 123450 → "1234.50". The inverse of parseMoney, for sending back to the API. */
export function formatMinorUnits(minor: number): MoneyAmount {
  const rounded = Math.round(minor)
  const negative = rounded < 0
  const abs = Math.abs(rounded)
  const whole = Math.floor(abs / 100)
  const fraction = String(abs % 100).padStart(MINOR_UNITS, "0")
  return `${negative ? "-" : ""}${whole}.${fraction}`
}

/** Exact sum — stays in integer fils the whole way. */
export function sumMoney(values: (MoneyAmount | number | null | undefined)[]): MoneyAmount {
  return formatMinorUnits(values.reduce<number>((total, v) => total + parseMoney(v), 0))
}

export function subtractMoney(
  a: MoneyAmount | number | null | undefined,
  b: MoneyAmount | number | null | undefined
): MoneyAmount {
  return formatMinorUnits(parseMoney(a) - parseMoney(b))
}

/**
 * Percentage of an amount, rounded to the nearest fils — the one operation
 * where float genuinely misbehaves (late fees, VAT).
 */
export function percentOfMoney(value: MoneyAmount | number | null | undefined, percent: number): MoneyAmount {
  return formatMinorUnits(Math.round((parseMoney(value) * percent) / 100))
}

const currencyFormatter = new Intl.NumberFormat("en-AE", {
  style: "currency",
  currency: "AED",
  currencyDisplay: "code",
  minimumFractionDigits: 2,
  maximumFractionDigits: 2,
})

const compactFormatter = new Intl.NumberFormat("en-AE", {
  style: "currency",
  currency: "AED",
  currencyDisplay: "code",
  minimumFractionDigits: 0,
  maximumFractionDigits: 0,
})

/** "145000.00" → "AED 145,000.00". Nothing is computed after this point. */
export function formatMoney(
  value: MoneyAmount | number | null | undefined,
  options?: { compact?: boolean; fallback?: string }
): string {
  if (value === null || value === undefined || value === "") return options?.fallback ?? "—"
  const amount = parseMoney(value) / 100
  return (options?.compact ? compactFormatter : currencyFormatter).format(amount)
}

export function isNegativeMoney(value: MoneyAmount | number | null | undefined): boolean {
  return parseMoney(value) < 0
}

/** For prefilling a numeric form input from an API string. */
export function moneyToInputValue(value: MoneyAmount | null | undefined): number | undefined {
  if (value === null || value === undefined || value === "") return undefined
  return parseMoney(value) / 100
}
