export function formatDate(value: unknown): string {
  if (typeof value !== "string" || !value) return "—"
  const date = new Date(value)
  if (Number.isNaN(date.getTime())) return "—"
  const day = String(date.getUTCDate()).padStart(2, "0")
  const month = String(date.getUTCMonth() + 1).padStart(2, "0")
  return `${day}-${month}-${date.getUTCFullYear()}`
}

export function formatCurrency(value: unknown): string {
  const amount = Number(value)
  if (!value || Number.isNaN(amount)) return "—"
  return `AED ${amount.toLocaleString(undefined, { maximumFractionDigits: 0 })}`
}

export function str(value: unknown): string {
  return typeof value === "string" && value ? value : "—"
}
