import { z } from "zod"

// <input type="date"> only ever yields a date-only "YYYY-MM-DD" string, but
// the backend's Prisma DateTime columns require a full ISO-8601 datetime —
// mirrors the same fix used in lib/validation/tenant.ts.
const requiredDate = z
  .string()
  .min(1, "This date is required")
  .transform((value) => `${value}T00:00:00.000Z`)

const optionalSecurityDeposit = z.preprocess(
  (val) => (val === "" || val === null || val === undefined || Number.isNaN(val) ? undefined : val),
  z.coerce.number().min(0, "Must be 0 or more").optional()
)

const optionalNumberOfCheques = z.preprocess(
  (val) => (val === "" || val === null || val === undefined || Number.isNaN(val) ? undefined : val),
  z.coerce.number().int().min(1, "Must be at least 1").optional()
)

const contractBaseSchema = z.object({
  contractNumber: z.string().min(1, "Contract number is required").max(100),
  tenantId: z.string().uuid("Select a tenant"),
  propertyId: z.string().uuid("Select a property"),
  startDate: requiredDate,
  endDate: requiredDate,
  annualRent: z.coerce.number({ message: "Annual rent is required" }).min(0, "Must be 0 or more"),
  monthlyRent: z.coerce.number({ message: "Monthly rent is required" }).min(0, "Must be 0 or more"),
  paymentFrequency: z.enum(
    ["MONTHLY", "QUARTERLY", "BI_ANNUAL", "ANNUAL", "SINGLE_PAYMENT", "CHEQUES"],
    { message: "Select a payment frequency" }
  ),
  numberOfCheques: optionalNumberOfCheques,
  securityDeposit: optionalSecurityDeposit,
  // Terminated is a separate action (POST /contracts/:id/terminate), not a form value.
  status: z.enum(["DRAFT", "ACTIVE"]).default("DRAFT"),
  notes: z.string().max(2000).optional().or(z.literal("")),
})

export const contractSchema = contractBaseSchema.superRefine((data, ctx) => {
  if (new Date(data.endDate) <= new Date(data.startDate)) {
    ctx.addIssue({ code: "custom", path: ["endDate"], message: "End date must be after the start date" })
  }
  if (data.paymentFrequency === "CHEQUES" && !data.numberOfCheques) {
    ctx.addIssue({
      code: "custom",
      path: ["numberOfCheques"],
      message: "Number of cheques is required for cheque payments",
    })
  }
})

export type ContractFormInput = z.input<typeof contractSchema>
export type ContractFormValues = z.output<typeof contractSchema>
