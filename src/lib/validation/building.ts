import { z } from "zod"

const currentYear = new Date().getFullYear()

const optionalYear = z.preprocess(
  (val) => (val === "" || val === null || val === undefined || Number.isNaN(val) ? undefined : val),
  z.coerce
    .number()
    .int()
    .min(1900, `Year must be 1900 or later`)
    .max(currentYear, `Year cannot be in the future`)
    .optional()
)

const optionalTotalUnits = z.preprocess(
  (val) => (val === "" || val === null || val === undefined || Number.isNaN(val) ? undefined : val),
  z.coerce.number().int().min(0, "Must be 0 or more").optional()
)

export const buildingSchema = z.object({
  name: z.string().min(1, "Building name is required").max(200),
  code: z
    .string()
    .min(1, "Building code is required")
    .regex(/^[A-Z0-9-]+$/, "Use uppercase letters, numbers, and hyphens only (e.g. B-DXB-2024-001)"),
  address: z.string().min(1, "Address is required"),
  city: z.string().min(1, "City is required"),
  buildingType: z.enum(["RESIDENTIAL", "COMMERCIAL", "MIXED_USE"], {
    message: "Select a building type",
  }),
  totalFloors: z.coerce
    .number({ message: "Total floors is required" })
    .int()
    .min(1, "Must be at least 1 floor")
    .max(200, "Must be 200 floors or fewer"),
  totalUnits: optionalTotalUnits,
  yearBuilt: optionalYear,
  constructionStatus: z.enum(["COMPLETE", "UNDER_CONSTRUCTION"]).default("COMPLETE"),
  notes: z.string().max(2000).optional().or(z.literal("")),
})

export type BuildingFormInput = z.input<typeof buildingSchema>
export type BuildingFormValues = z.output<typeof buildingSchema>
