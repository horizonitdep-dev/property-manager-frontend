import { apiClient, unwrap } from "@/lib/api-client"
import type { ApiEnvelope, Paginated } from "@/types/api"
import type {
  CreateExpenseDto,
  Expense,
  ExpenseListItem,
  ExpensesQuery,
  UpdateExpenseDto,
} from "@/types/expense"

export const expenseService = {
  async list(query: ExpensesQuery): Promise<Paginated<ExpenseListItem>> {
    const response = await apiClient.get<ApiEnvelope<Paginated<ExpenseListItem>>>("/finance/expenses", {
      params: query,
    })
    return unwrap(response.data)
  },

  async getById(id: string): Promise<Expense> {
    const response = await apiClient.get<ApiEnvelope<Expense>>(`/finance/expenses/${id}`)
    return unwrap(response.data)
  },

  // Scoped lists live under /finance, not under the Buildings/Properties modules.
  async listByBuilding(buildingId: string): Promise<Expense[]> {
    const response = await apiClient.get<ApiEnvelope<Paginated<Expense>>>(
      `/finance/buildings/${buildingId}/expenses`
    )
    return unwrap(response.data).items
  },

  async listByProperty(propertyId: string): Promise<Expense[]> {
    const response = await apiClient.get<ApiEnvelope<Paginated<Expense>>>(
      `/finance/properties/${propertyId}/expenses`
    )
    return unwrap(response.data).items
  },

  async create(dto: CreateExpenseDto): Promise<Expense> {
    const response = await apiClient.post<ApiEnvelope<Expense>>("/finance/expenses", dto)
    return unwrap(response.data)
  },

  async update(id: string, dto: UpdateExpenseDto): Promise<Expense> {
    const response = await apiClient.patch<ApiEnvelope<Expense>>(`/finance/expenses/${id}`, dto)
    return unwrap(response.data)
  },

  async remove(id: string): Promise<void> {
    await apiClient.delete(`/finance/expenses/${id}`)
  },
}
