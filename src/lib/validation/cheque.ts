import { z } from "zod"

const amount = z.coerce
  .number({ message: "Amount is required" })
  .positive("Amount must be greater than zero")
  .refine((v) => Number.isInteger(Math.round(v * 100)), "Amount can have at most 2 decimal places")

/** Shared by create and by the replacement form, which takes the same fields. */
const chequeFields = {
  chequeNumber: z.string().min(1, "Cheque number is required").max(50),
  bankName: z.string().min(1, "Bank name is required").max(150),
  amount,
  chequeDate: z.string().min(1, "Cheque date is required"),
  receivedOn: z.string().min(1, "Received on date is required"),
  notes: z.string().max(2000).optional().or(z.literal("")),
}

// New cheques are always HELD — there is no status field on the form.
export const chequeSchema = z.object({
  contractId: z.string().uuid("Select a contract"),
  ...chequeFields,
})

export const replaceChequeSchema = z.object({
  ...chequeFields,
  replacementNotes: z.string().max(2000).optional().or(z.literal("")),
})

export type ChequeFormInput = z.input<typeof chequeSchema>
export type ChequeFormValues = z.output<typeof chequeSchema>
export type ReplaceChequeFormInput = z.input<typeof replaceChequeSchema>
export type ReplaceChequeFormValues = z.output<typeof replaceChequeSchema>
