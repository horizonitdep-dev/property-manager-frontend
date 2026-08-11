import { apiClient, unwrap } from "@/lib/api-client"
import type { ApiEnvelope } from "@/types/api"
import type { PdfImportCommitResult, PdfImportSession } from "@/types/import-pdf"

export interface PdfImportCommitPayload {
  contractSessionId: string
}

export const pdfImportService = {
  async validate(files: File[]): Promise<PdfImportSession> {
    const formData = new FormData()
    for (const file of files) formData.append("files", file)

    const response = await apiClient.post<ApiEnvelope<PdfImportSession>>("/import/pdf/validate", formData, {
      headers: { "Content-Type": "multipart/form-data" },
    })
    return unwrap(response.data)
  },

  // Confirmed against a real /import/pdf/commit response — the endpoint
  // takes only the contractSessionId (the batch's anchor id), not the other
  // three session ids.
  async commit(payload: PdfImportCommitPayload): Promise<PdfImportCommitResult> {
    const response = await apiClient.post<ApiEnvelope<PdfImportCommitResult>>("/import/pdf/commit", payload)
    return unwrap(response.data)
  },

  async getSession(id: string): Promise<PdfImportSession> {
    const response = await apiClient.get<ApiEnvelope<PdfImportSession>>(`/import/pdf/sessions/${id}`)
    return unwrap(response.data)
  },
}
