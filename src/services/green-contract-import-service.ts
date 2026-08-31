import { apiClient, unwrap } from "@/lib/api-client"
import type { ApiEnvelope } from "@/types/api"
import type { GreenContractCommitResult, GreenContractImportSession } from "@/types/import-green-contract"

// Isolated from pdfImportService on purpose — the two importers share nothing
// but a shape, and the DMT flow must stay untouched.
export const greenContractImportService = {
  async validate(files: File[]): Promise<GreenContractImportSession> {
    const formData = new FormData()
    for (const file of files) formData.append("files", file)

    const response = await apiClient.post<ApiEnvelope<GreenContractImportSession>>(
      "/import/green-contract/validate",
      formData,
      { headers: { "Content-Type": "multipart/form-data" } }
    )
    return unwrap(response.data)
  },

  // The backend's GreenContractCommitDto takes only sessionId — the contract
  // number is derived server-side and cannot be overridden from here.
  async commit(sessionId: string): Promise<GreenContractCommitResult> {
    const response = await apiClient.post<ApiEnvelope<GreenContractCommitResult>>(
      "/import/green-contract/commit",
      { sessionId }
    )
    return unwrap(response.data)
  },

  async getSession(id: string): Promise<GreenContractImportSession> {
    const response = await apiClient.get<ApiEnvelope<GreenContractImportSession>>(
      `/import/green-contract/sessions/${id}`
    )
    return unwrap(response.data)
  },
}
