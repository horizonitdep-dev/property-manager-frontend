export type UnitType = "APARTMENT" | "STUDIO" | "SHOP" | "OFFICE" | "ROOF_UNIT" | "WAREHOUSE"
export type PropertyStatus = "OCCUPIED" | "VACANT" | "UNDER_MAINTENANCE" | "RESERVED"

export interface PropertyBuildingSummary {
  id: string
  name: string
  code: string
}

export interface Property {
  id: string
  unitNumber: string
  buildingId: string
  floor: number
  unitType: UnitType
  bedrooms?: number
  bathrooms?: number
  sizeSqm?: number
  monthlyRent: number
  status: PropertyStatus
  notes?: string
  building: PropertyBuildingSummary
  createdAt: string
  updatedAt: string
}

export interface CreatePropertyDto {
  unitNumber: string
  buildingId: string
  floor: number
  unitType: UnitType
  bedrooms?: number
  bathrooms?: number
  sizeSqm?: number
  monthlyRent: number
  status?: PropertyStatus
  notes?: string
}

export type UpdatePropertyDto = Partial<CreatePropertyDto>

export type PropertySortField = "unitNumber" | "floor" | "monthlyRent" | "createdAt"

export interface PropertiesQuery {
  page: number
  limit: number
  search?: string
  buildingId?: string
  unitType?: UnitType
  status?: PropertyStatus
  sortBy?: PropertySortField
  sortOrder?: "asc" | "desc"
}
