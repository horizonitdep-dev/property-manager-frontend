import { z } from "zod"

export const expenseSchema = z.object({
  buildingId: z.string().uuid("Select a building"),
  // Optional at the type level; the form clears it whenever the building changes
  // so a property can never belong to a different building than the one selected.
  propertyId: z.string().uuid().optional().or(z.literal("")),
  category: z.enum(
    [
      "MAINTENANCE",
      "UTILITY",
      "INSURANCE",
      "GOV_FEE",
      "MUNICIPALITY_FEE",
      "CLEANING",
      "SECURITY",
      "MANAGEMENT",
      "LEGAL",
      "SALARY",
      "OTHER",
    ],
    { message: "Select a category" }
  ),
  amount: z.coerce
    .number({ message: "Amount is required" })
    .positive("Amount must be greater than zero")
    .refine((v) => Number.isInteger(Math.round(v * 100)), "Amount can have at most 2 decimal places"),
  incurredOn: z.string().min(1, "Incurred on date is required"),
  vendorName: z.string().min(1, "Vendor name is required").max(200),
  description: z.string().min(1, "Description is required").max(2000),
  method: z.enum(["CASH", "BANK_TRANSFER", "CHEQUE", "CARD", "ONLINE", "COURT_TRANSFER", "OTHER"], {
    message: "Select a payment method",
  }),
  invoiceNumber: z.string().max(100).optional().or(z.literal("")),
  notes: z.string().max(2000).optional().or(z.literal("")),
})

export type ExpenseFormInput = z.input<typeof expenseSchema>
export type ExpenseFormValues = z.output<typeof expenseSchema>
