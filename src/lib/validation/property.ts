import { z } from "zod"

const optionalCount = z.preprocess(
  (val) => (val === "" || val === null || val === undefined || Number.isNaN(val) ? undefined : val),
  z.coerce.number().int().min(0, "Must be 0 or more").optional()
)

const optionalSize = z.preprocess(
  (val) => (val === "" || val === null || val === undefined || Number.isNaN(val) ? undefined : val),
  z.coerce.number().min(0, "Must be 0 or more").optional()
)

export const propertySchema = z.object({
  unitNumber: z.string().min(1, "Unit number is required").max(50),
  buildingId: z.string().uuid("Select a building"),
  floor: z.coerce.number({ message: "Floor is required" }).int("Floor must be a whole number"),
  unitType: z.enum(["APARTMENT", "STUDIO", "VILLA", "SHOP", "OFFICE", "ROOF_UNIT", "WAREHOUSE"], {
    message: "Select a unit type",
  }),
  bedrooms: optionalCount,
  bathrooms: optionalCount,
  sizeSqm: optionalSize,
  monthlyRent: z.coerce.number({ message: "Monthly rent is required" }).min(0, "Must be 0 or more"),
  status: z.enum(["OCCUPIED", "VACANT", "UNDER_MAINTENANCE", "RESERVED"]).default("VACANT"),
  notes: z.string().max(2000).optional().or(z.literal("")),
})

export type PropertyFormInput = z.input<typeof propertySchema>
export type PropertyFormValues = z.output<typeof propertySchema>
