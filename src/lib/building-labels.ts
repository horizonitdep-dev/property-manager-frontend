import type { BuildingType, ConstructionStatus } from "@/types/building"

export const BUILDING_TYPE_LABELS: Record<BuildingType, string> = {
  RESIDENTIAL: "Residential",
  COMMERCIAL: "Commercial",
  MIXED_USE: "Mixed-Use",
}

export const BUILDING_TYPE_OPTIONS: { value: BuildingType; label: string }[] = (
  Object.keys(BUILDING_TYPE_LABELS) as BuildingType[]
).map((value) => ({ value, label: BUILDING_TYPE_LABELS[value] }))

export const CONSTRUCTION_STATUS_LABELS: Record<ConstructionStatus, string> = {
  COMPLETE: "Complete",
  UNDER_CONSTRUCTION: "Under Construction",
}

export const CONSTRUCTION_STATUS_OPTIONS: { value: ConstructionStatus; label: string }[] = (
  Object.keys(CONSTRUCTION_STATUS_LABELS) as ConstructionStatus[]
).map((value) => ({ value, label: CONSTRUCTION_STATUS_LABELS[value] }))
