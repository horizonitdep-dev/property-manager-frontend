import { apiClient, unwrap } from "@/lib/api-client"
import type { ApiEnvelope, Paginated } from "@/types/api"
import type { Building, BuildingsQuery, CreateBuildingDto, UpdateBuildingDto } from "@/types/building"

export const buildingService = {
  async list(query: BuildingsQuery): Promise<Paginated<Building>> {
    const response = await apiClient.get<ApiEnvelope<Paginated<Building>>>("/buildings", {
      params: query,
    })
    return unwrap(response.data)
  },

  async getById(id: string): Promise<Building> {
    const response = await apiClient.get<ApiEnvelope<Building>>(`/buildings/${id}`)
    return unwrap(response.data)
  },

  async create(dto: CreateBuildingDto): Promise<Building> {
    const response = await apiClient.post<ApiEnvelope<Building>>("/buildings", dto)
    return unwrap(response.data)
  },

  async update(id: string, dto: UpdateBuildingDto): Promise<Building> {
    const response = await apiClient.patch<ApiEnvelope<Building>>(`/buildings/${id}`, dto)
    return unwrap(response.data)
  },

  async remove(id: string): Promise<void> {
    await apiClient.delete(`/buildings/${id}`)
  },
}
