"use client"

import * as React from "react"
import { Eye, FileText, Trash2 } from "lucide-react"
import { toast } from "sonner"

import { DeleteDocumentDialog } from "@/components/contracts/delete-document-dialog"
import { DocumentUploadZone } from "@/components/contracts/document-upload-zone"
import { RoleGate } from "@/components/role-gate"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { Skeleton } from "@/components/ui/skeleton"
import { useContractDocuments } from "@/hooks/queries/use-contracts"
import { getErrorMessage } from "@/lib/get-error-message"
import { CONTRACT_DOCUMENT_TYPE_LABELS } from "@/lib/contract-labels"
import { contractDocumentService } from "@/services/contract-document-service"
import type { ContractDocument } from "@/types/contract"

function formatFileSize(bytes: number): string {
  if (bytes < 1024) return `${bytes} B`
  if (bytes < 1024 * 1024) return `${(bytes / 1024).toFixed(1)} KB`
  return `${(bytes / (1024 * 1024)).toFixed(1)} MB`
}

export function ContractDocumentsSection({ contractId }: { contractId: string }) {
  const documentsQuery = useContractDocuments(contractId)
  const documents = documentsQuery.data ?? []

  const [viewingId, setViewingId] = React.useState<string | null>(null)
  const [confirmingDelete, setConfirmingDelete] = React.useState<ContractDocument | null>(null)

  // Signed URLs are short-lived — fetched imperatively on click, never cached.
  async function handleView(doc: ContractDocument) {
    setViewingId(doc.id)
    try {
      const { url } = await contractDocumentService.getSignedUrl(contractId, doc.id)
      window.open(url, "_blank", "noopener,noreferrer")
    } catch (error) {
      toast.error(getErrorMessage(error, "Failed to open document."))
    } finally {
      setViewingId(null)
    }
  }

  return (
    <section className="overflow-hidden rounded-xl border border-outline-variant bg-surface">
      <div className="flex items-center gap-2 border-b border-outline-variant bg-surface-container-low px-6 py-4">
        <FileText className="h-4 w-4 text-secondary" />
        <h3 className="font-display text-h2 text-on-surface">Documents</h3>
      </div>

      <div className="space-y-6 p-6">
        <RoleGate allowedRoles={["MANAGER"]}>
          <DocumentUploadZone contractId={contractId} />
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
            {documents.map((doc) => (
              <div
                key={doc.id}
                className="flex items-center justify-between gap-4 rounded-lg border border-outline-variant bg-surface-container-low p-3"
              >
                <div className="flex min-w-0 items-center gap-3">
                  <FileText className="h-5 w-5 shrink-0 text-on-surface-variant" />
                  <div className="min-w-0">
                    <p className="truncate text-body-md font-medium text-on-surface">{doc.fileName}</p>
                    <div className="mt-1 flex flex-wrap items-center gap-2">
                      <Badge variant="secondary">{CONTRACT_DOCUMENT_TYPE_LABELS[doc.documentType]}</Badge>
                      <span className="text-label-sm text-on-surface-variant">{formatFileSize(doc.fileSize)}</span>
                      <span className="text-label-sm text-on-surface-variant">
                        {new Date(doc.uploadedAt).toLocaleDateString()}
                      </span>
                    </div>
                  </div>
                </div>
                <div className="flex shrink-0 items-center gap-1">
                  <Button
                    type="button"
                    variant="ghost"
                    size="icon"
                    aria-label={`View ${doc.fileName}`}
                    disabled={viewingId === doc.id}
                    onClick={() => handleView(doc)}
                  >
                    <Eye className="h-4 w-4" />
                  </Button>
                  <RoleGate allowedRoles={["MANAGER"]}>
                    <Button
                      type="button"
                      variant="ghost"
                      size="icon"
                      aria-label={`Delete ${doc.fileName}`}
                      onClick={() => setConfirmingDelete(doc)}
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
        contractId={contractId}
        document={confirmingDelete}
        onOpenChange={(open) => !open && setConfirmingDelete(null)}
      />
    </section>
  )
}
