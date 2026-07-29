import { apiClient, unwrap } from "@/lib/api-client"
import type { ApiEnvelope, Paginated } from "@/types/api"
import type { CreateTenantDto, Tenant, TenantListItem, TenantsQuery, UpdateTenantDto } from "@/types/tenant"

export const tenantService = {
  async list(query: TenantsQuery): Promise<Paginated<TenantListItem>> {
    const response = await apiClient.get<ApiEnvelope<Paginated<TenantListItem>>>("/tenants", {
      params: query,
    })
    return unwrap(response.data)
  },

  async getById(id: string): Promise<Tenant> {
    const response = await apiClient.get<ApiEnvelope<Tenant>>(`/tenants/${id}`)
    return unwrap(response.data)
  },

  async create(dto: CreateTenantDto): Promise<Tenant> {
    const response = await apiClient.post<ApiEnvelope<Tenant>>("/tenants", dto)
    return unwrap(response.data)
  },

  async update(id: string, dto: UpdateTenantDto): Promise<Tenant> {
    const response = await apiClient.patch<ApiEnvelope<Tenant>>(`/tenants/${id}`, dto)
    return unwrap(response.data)
  },

  async remove(id: string): Promise<void> {
    await apiClient.delete(`/tenants/${id}`)
  },
}
