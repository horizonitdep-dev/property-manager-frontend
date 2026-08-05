import { apiClient, unwrap } from "@/lib/api-client"
import type { ApiEnvelope } from "@/types/api"
import type { ImportCommitResult, ImportModuleKey, ImportSession } from "@/types/import"

function triggerDownload(blob: Blob, fileName: string) {
  const url = window.URL.createObjectURL(blob)
  const link = document.createElement("a")
  link.href = url
  link.download = fileName
  document.body.appendChild(link)
  link.click()
  link.remove()
  window.URL.revokeObjectURL(url)
}

export const importService = {
  async downloadTemplate(module: ImportModuleKey, format: "csv" | "xlsx"): Promise<void> {
    const response = await apiClient.get(`/import/${module}/template`, {
      params: { format },
      responseType: "blob",
    })
    triggerDownload(response.data as Blob, `${module}-import-template.${format}`)
  },

  async validate(module: ImportModuleKey, file: File): Promise<ImportSession> {
    const formData = new FormData()
    formData.append("file", file)

    const response = await apiClient.post<ApiEnvelope<ImportSession>>(`/import/${module}/validate`, formData, {
      headers: { "Content-Type": "multipart/form-data" },
    })
    return unwrap(response.data)
  },

  async commit(module: ImportModuleKey, sessionId: string): Promise<ImportCommitResult> {
    const response = await apiClient.post<ApiEnvelope<ImportCommitResult>>(`/import/${module}/commit`, {
      sessionId,
    })
    return unwrap(response.data)
  },

  async getSession(id: string): Promise<ImportSession> {
    const response = await apiClient.get<ApiEnvelope<ImportSession>>(`/import/sessions/${id}`)
    return unwrap(response.data)
  },
}
