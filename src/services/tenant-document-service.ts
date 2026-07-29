import { apiClient, unwrap } from "@/lib/api-client"
import type { ApiEnvelope } from "@/types/api"
import type { DocumentType, SignedDocumentUrl, TenantDocument } from "@/types/tenant"

export const tenantDocumentService = {
  async list(tenantId: string): Promise<TenantDocument[]> {
    const response = await apiClient.get<ApiEnvelope<TenantDocument[]>>(`/tenants/${tenantId}/documents`)
    return unwrap(response.data)
  },

  async upload(
    tenantId: string,
    documentType: DocumentType,
    file: File,
    onUploadProgress?: (percent: number) => void
  ): Promise<TenantDocument> {
    const formData = new FormData()
    formData.append("documentType", documentType)
    formData.append("file", file)

    const response = await apiClient.post<ApiEnvelope<TenantDocument>>(
      `/tenants/${tenantId}/documents`,
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

  async getSignedUrl(tenantId: string, documentId: string): Promise<SignedDocumentUrl> {
    const response = await apiClient.get<ApiEnvelope<SignedDocumentUrl>>(
      `/tenants/${tenantId}/documents/${documentId}/url`
    )
    return unwrap(response.data)
  },

  async remove(tenantId: string, documentId: string): Promise<void> {
    await apiClient.delete(`/tenants/${tenantId}/documents/${documentId}`)
  },
}
