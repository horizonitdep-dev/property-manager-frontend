import { apiClient, unwrap } from "@/lib/api-client"
import type { ApiEnvelope, Paginated } from "@/types/api"
import type {
  BounceChequeDto,
  CancelChequeDto,
  Cheque,
  ChequeListItem,
  ChequesQuery,
  ClearChequeDto,
  CreateChequeDto,
  DepositChequeDto,
  ReplaceChequeDto,
  UpdateChequeDto,
} from "@/types/cheque"

export const chequeService = {
  async list(query: ChequesQuery): Promise<Paginated<ChequeListItem>> {
    const response = await apiClient.get<ApiEnvelope<Paginated<ChequeListItem>>>("/finance/cheques", {
      params: query,
    })
    return unwrap(response.data)
  },

  async getById(id: string): Promise<Cheque> {
    const response = await apiClient.get<ApiEnvelope<Cheque>>(`/finance/cheques/${id}`)
    return unwrap(response.data)
  },

  async listByContract(contractId: string): Promise<Cheque[]> {
    const response = await apiClient.get<ApiEnvelope<Paginated<Cheque>>>(
      `/finance/contracts/${contractId}/cheques`
    )
    return unwrap(response.data).items
  },

  async create(dto: CreateChequeDto): Promise<Cheque> {
    const response = await apiClient.post<ApiEnvelope<Cheque>>("/finance/cheques", dto)
    return unwrap(response.data)
  },

  async update(id: string, dto: UpdateChequeDto): Promise<Cheque> {
    const response = await apiClient.patch<ApiEnvelope<Cheque>>(`/finance/cheques/${id}`, dto)
    return unwrap(response.data)
  },

  // ── lifecycle ───────────────────────────────────────────────────────────
  // Each transition is its own endpoint; the server validates legality and
  // answers 409 with a specific message when the move isn't allowed.

  async deposit(id: string, dto: DepositChequeDto): Promise<Cheque> {
    const response = await apiClient.post<ApiEnvelope<Cheque>>(`/finance/cheques/${id}/deposit`, dto)
    return unwrap(response.data)
  },

  /** Creates the linked Payment atomically. */
  async clear(id: string, dto: ClearChequeDto): Promise<Cheque> {
    const response = await apiClient.post<ApiEnvelope<Cheque>>(`/finance/cheques/${id}/clear`, dto)
    return unwrap(response.data)
  },

  async bounce(id: string, dto: BounceChequeDto): Promise<Cheque> {
    const response = await apiClient.post<ApiEnvelope<Cheque>>(`/finance/cheques/${id}/bounce`, dto)
    return unwrap(response.data)
  },

  /** Returns the NEW cheque; the old one flips to REPLACED. */
  async replace(id: string, dto: ReplaceChequeDto): Promise<Cheque> {
    const response = await apiClient.post<ApiEnvelope<Cheque>>(`/finance/cheques/${id}/replace`, dto)
    return unwrap(response.data)
  },

  async cancel(id: string, dto: CancelChequeDto): Promise<Cheque> {
    const response = await apiClient.post<ApiEnvelope<Cheque>>(`/finance/cheques/${id}/cancel`, dto)
    return unwrap(response.data)
  },

  async remove(id: string): Promise<void> {
    await apiClient.delete(`/finance/cheques/${id}`)
  },
}
