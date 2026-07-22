import type { PropertyStatus, UnitType } from "@/types/property"

export const UNIT_TYPE_LABELS: Record<UnitType, string> = {
  APARTMENT: "Apartment",
  STUDIO: "Studio",
  SHOP: "Shop",
  OFFICE: "Office",
  ROOF_UNIT: "Roof Unit",
  WAREHOUSE: "Warehouse",
}

export const UNIT_TYPE_OPTIONS: { value: UnitType; label: string }[] = (
  Object.keys(UNIT_TYPE_LABELS) as UnitType[]
).map((value) => ({ value, label: UNIT_TYPE_LABELS[value] }))

// Commercial/storage unit types that don't carry a bedroom/bathroom count.
export const UNIT_TYPES_WITHOUT_ROOMS: UnitType[] = ["SHOP", "OFFICE", "WAREHOUSE"]

export const PROPERTY_STATUS_LABELS: Record<PropertyStatus, string> = {
  OCCUPIED: "Occupied",
  VACANT: "Vacant",
  UNDER_MAINTENANCE: "Under Maintenance",
  RESERVED: "Reserved",
}

export const PROPERTY_STATUS_OPTIONS: { value: PropertyStatus; label: string }[] = (
  Object.keys(PROPERTY_STATUS_LABELS) as PropertyStatus[]
).map((value) => ({ value, label: PROPERTY_STATUS_LABELS[value] }))

export const PROPERTY_STATUS_BADGE_CLASSNAME: Record<PropertyStatus, string> = {
  OCCUPIED: "border-transparent bg-emerald-100 text-emerald-700",
  VACANT: "border-transparent bg-amber-100 text-amber-700",
  UNDER_MAINTENANCE: "border-transparent bg-blue-100 text-blue-700",
  RESERVED: "border-transparent bg-slate-200 text-slate-700",
}

export const PROPERTY_STATUS_DOT_CLASSNAME: Record<PropertyStatus, string> = {
  OCCUPIED: "bg-emerald-500",
  VACANT: "bg-amber-500",
  UNDER_MAINTENANCE: "bg-blue-500",
  RESERVED: "bg-slate-500",
}
