import { apiClient, unwrap } from "@/lib/api-client"
import type { ApiEnvelope } from "@/types/api"
import type { FinanceAttachment, FinanceAttachmentType, SignedAttachmentUrl } from "@/types/finance"

// Mirrors tenantDocumentService. The upload field is `type` (not `documentType`)
// and the backend defaults it to RECEIPT for payments when omitted.
export const paymentAttachmentService = {
  async list(paymentId: string): Promise<FinanceAttachment[]> {
    const response = await apiClient.get<ApiEnvelope<FinanceAttachment[]>>(
      `/finance/payments/${paymentId}/attachments`
    )
    return unwrap(response.data)
  },

  async upload(
    paymentId: string,
    file: File,
    type?: FinanceAttachmentType,
    onUploadProgress?: (percent: number) => void
  ): Promise<FinanceAttachment> {
    const formData = new FormData()
    if (type) formData.append("type", type)
    formData.append("file", file)

    const response = await apiClient.post<ApiEnvelope<FinanceAttachment>>(
      `/finance/payments/${paymentId}/attachments`,
      formData,
      {
        headers: { "Content-Type": "multipart/form-data" },
        onUploadProgress: (event) => {
          if (onUploadProgress && event.total) {
            onUploadProgress(Math.round((event.loaded / event.total) * 100))
          }
        },
      }
    )
    return unwrap(response.data)
  },

  async getSignedUrl(paymentId: string, attachmentId: string): Promise<SignedAttachmentUrl> {
    const response = await apiClient.get<ApiEnvelope<SignedAttachmentUrl>>(
      `/finance/payments/${paymentId}/attachments/${attachmentId}/url`
    )
    return unwrap(response.data)
  },

  async remove(paymentId: string, attachmentId: string): Promise<void> {
    await apiClient.delete(`/finance/payments/${paymentId}/attachments/${attachmentId}`)
  },
}
