import { apiClient, unwrap } from "@/lib/api-client"
import type { ApiEnvelope } from "@/types/api"
import type { FinanceAttachment, FinanceAttachmentType, SignedAttachmentUrl } from "@/types/finance"

/** Payments, cheques and expenses expose the same attachment endpoints. */
export type FinanceParent = "payments" | "cheques" | "expenses"

function basePath(parent: FinanceParent, parentId: string) {
  return `/finance/${parent}/${parentId}/attachments`
}

export const financeAttachmentService = {
  async list(parent: FinanceParent, parentId: string): Promise<FinanceAttachment[]> {
    const response = await apiClient.get<ApiEnvelope<FinanceAttachment[]>>(basePath(parent, parentId))
    return unwrap(response.data)
  },

  async upload(
    parent: FinanceParent,
    parentId: string,
    file: File,
    type?: FinanceAttachmentType,
    onUploadProgress?: (percent: number) => void
  ): Promise<FinanceAttachment> {
    const formData = new FormData()
    if (type) formData.append("type", type)
    formData.append("file", file)

    const response = await apiClient.post<ApiEnvelope<FinanceAttachment>>(
      basePath(parent, parentId),
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

  async getSignedUrl(
    parent: FinanceParent,
    parentId: string,
    attachmentId: string
  ): Promise<SignedAttachmentUrl> {
    const response = await apiClient.get<ApiEnvelope<SignedAttachmentUrl>>(
      `${basePath(parent, parentId)}/${attachmentId}/url`
    )
    return unwrap(response.data)
  },

  async remove(parent: FinanceParent, parentId: string, attachmentId: string): Promise<void> {
    await apiClient.delete(`${basePath(parent, parentId)}/${attachmentId}`)
  },
}
