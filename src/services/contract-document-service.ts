import { apiClient, unwrap } from "@/lib/api-client"
import type { ApiEnvelope } from "@/types/api"
import type { ContractDocument, ContractDocumentType } from "@/types/contract"
import type { SignedDocumentUrl } from "@/types/tenant"

export const contractDocumentService = {
  async list(contractId: string): Promise<ContractDocument[]> {
    const response = await apiClient.get<ApiEnvelope<ContractDocument[]>>(`/contracts/${contractId}/documents`)
    return unwrap(response.data)
  },

  async upload(
    contractId: string,
    documentType: ContractDocumentType,
    file: File,
    onUploadProgress?: (percent: number) => void
  ): Promise<ContractDocument> {
    const formData = new FormData()
    formData.append("documentType", documentType)
    formData.append("file", file)

    const response = await apiClient.post<ApiEnvelope<ContractDocument>>(
      `/contracts/${contractId}/documents`,
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

  async getSignedUrl(contractId: string, documentId: string): Promise<SignedDocumentUrl> {
    const response = await apiClient.get<ApiEnvelope<SignedDocumentUrl>>(
      `/contracts/${contractId}/documents/${documentId}/url`
    )
    return unwrap(response.data)
  },

  async remove(contractId: string, documentId: string): Promise<void> {
    await apiClient.delete(`/contracts/${contractId}/documents/${documentId}`)
  },
}
