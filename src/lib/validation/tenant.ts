import { z } from "zod"

const PHONE_REGEX = /^\+?[0-9\s-]{7,20}$/
const PHONE_MESSAGE = "Enter a valid international phone number"

const optionalString = (max: number) => z.string().max(max).optional().or(z.literal(""))
const optionalPhone = z.string().regex(PHONE_REGEX, PHONE_MESSAGE).optional().or(z.literal(""))

// <input type="date"> only ever yields a date-only "YYYY-MM-DD" string, but
// the backend's Prisma DateTime columns require a full ISO-8601 datetime —
// bare date-only strings fail with "premature end of input" on create/update.
// Empty values become undefined (dropped from the JSON payload) rather than
// "" — Prisma's DateTime columns reject an empty string the same way.
const optionalDate = z
  .string()
  .optional()
  .or(z.literal(""))
  .transform((value) => (value ? `${value}T00:00:00.000Z` : undefined))

const INDIVIDUAL_REQUIRED_FIELDS = [
  "emiratesIdNumber",
  "emiratesIdExpiry",
  "passportNumber",
  "passportExpiry",
] as const

const COMPANY_REQUIRED_FIELDS = [
  "tradeLicenseNumber",
  "tradeLicenseExpiry",
  "authorizedPersonNameEn",
  "authorizedPersonOccupation",
] as const

// Mirrors backend `getMissingTenantTypeFields` field-by-field, so the same
// request fails identically client-side and server-side.
const REQUIRED_FIELD_MESSAGES: Record<string, string> = {
  emiratesIdNumber: "Emirates ID number is required",
  emiratesIdExpiry: "Emirates ID expiry is required",
  passportNumber: "Passport number is required",
  passportExpiry: "Passport expiry is required",
  tradeLicenseNumber: "Trade licence number is required",
  tradeLicenseExpiry: "Trade licence expiry is required",
  authorizedPersonNameEn: "Authorized person name is required",
  authorizedPersonOccupation: "Occupation is required",
}

const tenantBaseSchema = z.object({
  tenantType: z.enum(["INDIVIDUAL", "COMPANY"], { message: "Select a tenant type" }),
  nameEn: z.string().min(1, "Full name (English) is required").max(150),
  nameAr: optionalString(150),
  phone: z.string().regex(PHONE_REGEX, PHONE_MESSAGE),
  alternatePhone: optionalPhone,
  email: z.string().email("Enter a valid email address").optional().or(z.literal("")),
  nationality: optionalString(100),
  emiratesIdNumber: optionalString(50),
  emiratesIdExpiry: optionalDate,
  passportNumber: optionalString(50),
  passportExpiry: optionalDate,
  tradeLicenseNumber: optionalString(50),
  tradeLicenseExpiry: optionalDate,
  authorizedPersonNameEn: optionalString(150),
  authorizedPersonNameAr: optionalString(150),
  authorizedPersonOccupation: optionalString(100),
  authorizedPersonPhone: optionalPhone,
  status: z.enum(["ACTIVE", "FORMER"]).default("ACTIVE"),
  notes: optionalString(2000),
})

export const tenantSchema = tenantBaseSchema.superRefine((data, ctx) => {
  const requiredFields = data.tenantType === "INDIVIDUAL" ? INDIVIDUAL_REQUIRED_FIELDS : COMPANY_REQUIRED_FIELDS

  for (const field of requiredFields) {
    if (!data[field]) {
      ctx.addIssue({
        code: "custom",
        path: [field],
        message: REQUIRED_FIELD_MESSAGES[field],
      })
    }
  }
})

export type TenantFormInput = z.input<typeof tenantSchema>
export type TenantFormValues = z.output<typeof tenantSchema>

export const INDIVIDUAL_ONLY_FIELDS = [
  "nationality",
  "emiratesIdNumber",
  "emiratesIdExpiry",
  "passportNumber",
  "passportExpiry",
] as const

export const COMPANY_ONLY_FIELDS = [
  "tradeLicenseNumber",
  "tradeLicenseExpiry",
  "authorizedPersonNameEn",
  "authorizedPersonNameAr",
  "authorizedPersonOccupation",
  "authorizedPersonPhone",
] as const
