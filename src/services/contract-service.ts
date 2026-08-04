import { apiClient, unwrap } from "@/lib/api-client"
import type { ApiEnvelope, Paginated } from "@/types/api"
import type {
  Contract,
  ContractListItem,
  ContractsQuery,
  CreateContractDto,
  RenewContractDto,
  TerminateContractDto,
  UpdateContractDto,
} from "@/types/contract"

export const contractService = {
  async list(query: ContractsQuery): Promise<Paginated<ContractListItem>> {
    const response = await apiClient.get<ApiEnvelope<Paginated<ContractListItem>>>("/contracts", {
      params: query,
    })
    return unwrap(response.data)
  },

  async getById(id: string): Promise<Contract> {
    const response = await apiClient.get<ApiEnvelope<Contract>>(`/contracts/${id}`)
    return unwrap(response.data)
  },

  async listByProperty(propertyId: string): Promise<Contract[]> {
    const response = await apiClient.get<ApiEnvelope<Paginated<Contract>>>(`/properties/${propertyId}/contracts`)
    return unwrap(response.data).items
  },

  async listByTenant(tenantId: string): Promise<Contract[]> {
    const response = await apiClient.get<ApiEnvelope<Paginated<Contract>>>(`/tenants/${tenantId}/contracts`)
    return unwrap(response.data).items
  },

  async create(dto: CreateContractDto): Promise<Contract> {
    const response = await apiClient.post<ApiEnvelope<Contract>>("/contracts", dto)
    return unwrap(response.data)
  },

  async update(id: string, dto: UpdateContractDto): Promise<Contract> {
    const response = await apiClient.patch<ApiEnvelope<Contract>>(`/contracts/${id}`, dto)
    return unwrap(response.data)
  },

  async renew(id: string, dto: RenewContractDto): Promise<Contract> {
    const response = await apiClient.post<ApiEnvelope<Contract>>(`/contracts/${id}/renew`, dto)
    return unwrap(response.data)
  },

  async terminate(id: string, dto: TerminateContractDto): Promise<Contract> {
    const response = await apiClient.post<ApiEnvelope<Contract>>(`/contracts/${id}/terminate`, dto)
    return unwrap(response.data)
  },

  async remove(id: string): Promise<void> {
    await apiClient.delete(`/contracts/${id}`)
  },
}
