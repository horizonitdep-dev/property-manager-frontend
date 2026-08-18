import { z } from "zod"

const optionalDate = z.preprocess(
  (val) => (val === "" || val === null || val === undefined ? undefined : val),
  z.string().optional()
)

const optionalText = z.string().max(2000).optional().or(z.literal(""))

export const paymentSchema = z
  .object({
    contractId: z.string().uuid("Select a contract"),
    kind: z.enum(["RENT", "SECURITY_DEPOSIT", "LATE_FEE", "REFUND", "OTHER"], {
      message: "Select a payment kind",
    }),
    // Positive, max two decimals — mirrors @IsPositive + maxDecimalPlaces: 2.
    amount: z.coerce
      .number({ message: "Amount is required" })
      .positive("Amount must be greater than zero")
      .refine((v) => Number.isInteger(Math.round(v * 100)), "Amount can have at most 2 decimal places"),
    paidOn: z.string().min(1, "Paid on date is required"),
    method: z.enum(["CASH", "BANK_TRANSFER", "CHEQUE", "CARD", "ONLINE", "COURT_TRANSFER", "OTHER"], {
      message: "Select a payment method",
    }),
    periodStart: optionalDate,
    periodEnd: optionalDate,
    referenceNumber: z.string().max(100).optional().or(z.literal("")),
    notes: optionalText,
  })
  // Cross-field rule from the spec: when both period bounds are given, the end
  // must not precede the start.
  .refine(
    (data) => !data.periodStart || !data.periodEnd || data.periodEnd >= data.periodStart,
    { message: "Period end must be on or after period start", path: ["periodEnd"] }
  )

export type PaymentFormInput = z.input<typeof paymentSchema>
export type PaymentFormValues = z.output<typeof paymentSchema>
