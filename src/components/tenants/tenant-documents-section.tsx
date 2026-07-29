"use client"

import * as React from "react"
import { Eye, FileText, Trash2 } from "lucide-react"
import { toast } from "sonner"

import { DeleteDocumentDialog } from "@/components/tenants/delete-document-dialog"
import { DocumentUploadZone } from "@/components/tenants/document-upload-zone"
import { RoleGate } from "@/components/role-gate"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { Skeleton } from "@/components/ui/skeleton"
import { useTenantDocuments } from "@/hooks/queries/use-tenants"
import { getErrorMessage } from "@/lib/get-error-message"
import { DOCUMENT_TYPE_LABELS } from "@/lib/tenant-labels"
import { tenantDocumentService } from "@/services/tenant-document-service"
import type { TenantDocument, TenantType } from "@/types/tenant"

function formatFileSize(bytes: number): string {
  if (bytes < 1024) return `${bytes} B`
  if (bytes < 1024 * 1024) return `${(bytes / 1024).toFixed(1)} KB`
  return `${(bytes / (1024 * 1024)).toFixed(1)} MB`
}

export function TenantDocumentsSection({ tenantId, tenantType }: { tenantId: string; tenantType: TenantType }) {
  const documentsQuery = useTenantDocuments(tenantId)
  const documents = documentsQuery.data ?? []

  const [viewingId, setViewingId] = React.useState<string | null>(null)
  const [confirmingDelete, setConfirmingDelete] = React.useState<TenantDocument | null>(null)

  // Signed URLs are short-lived — fetched imperatively on click, never cached.
  async function handleView(document: TenantDocument) {
    setViewingId(document.id)
    try {
      const { url } = await tenantDocumentService.getSignedUrl(tenantId, document.id)
      window.open(url, "_blank", "noopener,noreferrer")
    } catch (error) {
      toast.error(getErrorMessage(error, "Failed to open document."))
    } finally {
      setViewingId(null)
    }
  }

  return (
    <section className="rounded-xl border border-outline-variant bg-surface">
      <div className="flex items-center gap-2 rounded-t-xl border-b border-outline-variant bg-surface-container-low px-6 py-4">
        <FileText className="h-4 w-4 text-secondary" />
        <h3 className="font-display text-h2 text-on-surface">Documents</h3>
      </div>

      <div className="space-y-6 p-6">
        <RoleGate allowedRoles={["MANAGER"]}>
          <DocumentUploadZone tenantId={tenantId} tenantType={tenantType} />
        </RoleGate>

        {documentsQuery.isLoading ? (
          <div className="space-y-2">
            {Array.from({ length: 2 }).map((_, i) => (
              <Skeleton key={i} className="h-16 w-full" />
            ))}
          </div>
        ) : documentsQuery.isError ? (
          <div className="py-8 text-center">
            <p className="mb-3 text-body-md text-error">Failed to load documents.</p>
            <Button variant="outline" size="sm" onClick={() => documentsQuery.refetch()}>
              Retry
            </Button>
          </div>
        ) : documents.length === 0 ? (
          <p className="py-8 text-center text-on-surface-variant">No documents uploaded yet.</p>
        ) : (
          <div className="space-y-2">
            {documents.map((document) => (
              <div
                key={document.id}
                className="flex items-center justify-between gap-4 rounded-lg border border-outline-variant bg-surface-container-low p-3"
              >
                <div className="flex min-w-0 items-center gap-3">
                  <FileText className="h-5 w-5 shrink-0 text-on-surface-variant" />
                  <div className="min-w-0">
                    <p className="truncate text-body-md font-medium text-on-surface">{document.fileName}</p>
                    <div className="mt-1 flex flex-wrap items-center gap-2">
                      <Badge variant="secondary">{DOCUMENT_TYPE_LABELS[document.documentType]}</Badge>
                      <span className="text-label-sm text-on-surface-variant">{formatFileSize(document.fileSize)}</span>
                      <span className="text-label-sm text-on-surface-variant">
                        {new Date(document.uploadedAt).toLocaleDateString()}
                      </span>
                    </div>
                  </div>
                </div>
                <div className="flex shrink-0 items-center gap-1">
                  <Button
                    type="button"
                    variant="ghost"
                    size="icon"
                    aria-label={`View ${document.fileName}`}
                    disabled={viewingId === document.id}
                    onClick={() => handleView(document)}
                  >
                    <Eye className="h-4 w-4" />
                  </Button>
                  <RoleGate allowedRoles={["MANAGER"]}>
                    <Button
                      type="button"
                      variant="ghost"
                      size="icon"
                      aria-label={`Delete ${document.fileName}`}
                      onClick={() => setConfirmingDelete(document)}
                    >
                      <Trash2 className="h-4 w-4 text-error" />
                    </Button>
                  </RoleGate>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>

      <DeleteDocumentDialog
        tenantId={tenantId}
        document={confirmingDelete}
        onOpenChange={(open) => !open && setConfirmingDelete(null)}
      />
    </section>
  )
}
