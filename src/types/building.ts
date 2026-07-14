export type BuildingType = "RESIDENTIAL" | "COMMERCIAL" | "MIXED_USE"
export type ConstructionStatus = "COMPLETE" | "UNDER_CONSTRUCTION"

export interface Building {
  id: string
  name: string
  code: string
  address: string
  city: string
  buildingType: BuildingType
  totalFloors: number
  totalUnits?: number
  yearBuilt?: number
  constructionStatus: ConstructionStatus
  notes?: string
  createdAt: string
  updatedAt: string
}

export interface CreateBuildingDto {
  name: string
  code: string
  address: string
  city: string
  buildingType: BuildingType
  totalFloors: number
  totalUnits?: number
  yearBuilt?: number
  constructionStatus: ConstructionStatus
  notes?: string
}

export type UpdateBuildingDto = Partial<CreateBuildingDto>

export type BuildingSortField = "name" | "code" | "city" | "totalFloors" | "yearBuilt" | "createdAt"

export interface BuildingsQuery {
  page: number
  limit: number
  search?: string
  buildingType?: BuildingType
  sortBy?: BuildingSortField
  sortOrder?: "asc" | "desc"
}
