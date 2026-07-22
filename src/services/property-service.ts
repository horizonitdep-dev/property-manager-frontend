import { apiClient, unwrap } from "@/lib/api-client"
import type { ApiEnvelope, Paginated } from "@/types/api"
import type { CreatePropertyDto, PropertiesQuery, Property, UpdatePropertyDto } from "@/types/property"

export const propertyService = {
  async list(query: PropertiesQuery): Promise<Paginated<Property>> {
    const response = await apiClient.get<ApiEnvelope<Paginated<Property>>>("/properties", {
      params: query,
    })
    return unwrap(response.data)
  },

  async getById(id: string): Promise<Property> {
    const response = await apiClient.get<ApiEnvelope<Property>>(`/properties/${id}`)
    return unwrap(response.data)
  },

  async listByBuilding(buildingId: string): Promise<Property[]> {
    const response = await apiClient.get<ApiEnvelope<Property[]>>(`/buildings/${buildingId}/properties`)
    return unwrap(response.data)
  },

  async create(dto: CreatePropertyDto): Promise<Property> {
    const response = await apiClient.post<ApiEnvelope<Property>>("/properties", dto)
    return unwrap(response.data)
  },

  async update(id: string, dto: UpdatePropertyDto): Promise<Property> {
    const response = await apiClient.patch<ApiEnvelope<Property>>(`/properties/${id}`, dto)
    return unwrap(response.data)
  },

  async remove(id: string): Promise<void> {
    await apiClient.delete(`/properties/${id}`)
  },
}
