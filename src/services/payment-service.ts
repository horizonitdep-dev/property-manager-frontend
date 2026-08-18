import { apiClient, unwrap } from "@/lib/api-client"
import type { ApiEnvelope, Paginated } from "@/types/api"
import type {
  CreatePaymentDto,
  Payment,
  PaymentListItem,
  PaymentsQuery,
  UpdatePaymentDto,
} from "@/types/payment"

export const paymentService = {
  async list(query: PaymentsQuery): Promise<Paginated<PaymentListItem>> {
    const response = await apiClient.get<ApiEnvelope<Paginated<PaymentListItem>>>("/finance/payments", {
      params: query,
    })
    return unwrap(response.data)
  },

  async getById(id: string): Promise<Payment> {
    const response = await apiClient.get<ApiEnvelope<Payment>>(`/finance/payments/${id}`)
    return unwrap(response.data)
  },

  // Note the path: the contract-scoped list lives under /finance, not under the
  // Contracts module's own /contracts/:id tree.
  async listByContract(contractId: string): Promise<Payment[]> {
    const response = await apiClient.get<ApiEnvelope<Paginated<Payment>>>(
      `/finance/contracts/${contractId}/payments`
    )
    return unwrap(response.data).items
  },

  async create(dto: CreatePaymentDto): Promise<Payment> {
    const response = await apiClient.post<ApiEnvelope<Payment>>("/finance/payments", dto)
    return unwrap(response.data)
  },

  async update(id: string, dto: UpdatePaymentDto): Promise<Payment> {
    const response = await apiClient.patch<ApiEnvelope<Payment>>(`/finance/payments/${id}`, dto)
    return unwrap(response.data)
  },

  async remove(id: string): Promise<void> {
    await apiClient.delete(`/finance/payments/${id}`)
  },
}
