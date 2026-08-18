"use client"

import * as React from "react"
import { Eye, FileText, Trash2 } from "lucide-react"
import { toast } from "sonner"

import { DeletePaymentAttachmentDialog } from "@/components/finance/delete-payment-attachment-dialog"
import { PaymentAttachmentUploadZone } from "@/components/finance/payment-attachment-upload-zone"
import { RoleGate } from "@/components/role-gate"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { Skeleton } from "@/components/ui/skeleton"
import { usePaymentAttachments } from "@/hooks/queries/use-payments"
import { FINANCE_ATTACHMENT_TYPE_LABELS } from "@/lib/finance-labels"
import { getErrorMessage } from "@/lib/get-error-message"
import { paymentAttachmentService } from "@/services/payment-attachment-service"
import type { FinanceAttachment } from "@/types/finance"

function formatFileSize(bytes: number): string {
  if (bytes < 1024) return `${bytes} B`
  if (bytes < 1024 * 1024) return `${(bytes / 1024).toFixed(1)} KB`
  return `${(bytes / (1024 * 1024)).toFixed(1)} MB`
}

export function PaymentAttachmentsSection({ paymentId }: { paymentId: string }) {
  const attachmentsQuery = usePaymentAttachments(paymentId)
  const attachments = attachmentsQuery.data ?? []

  const [viewingId, setViewingId] = React.useState<string | null>(null)
  const [confirmingDelete, setConfirmingDelete] = React.useState<FinanceAttachment | null>(null)

  // Signed URLs are short-lived — fetched imperatively on click, never cached.
  async function handleView(attachment: FinanceAttachment) {
    setViewingId(attachment.id)
    try {
      const { url } = await paymentAttachmentService.getSignedUrl(paymentId, attachment.id)
      window.open(url, "_blank", "noopener,noreferrer")
    } catch (error) {
      toast.error(getErrorMessage(error, "Failed to open attachment."))
    } finally {
      setViewingId(null)
    }
  }

  return (
    <section className="overflow-hidden rounded-xl border border-outline-variant bg-surface">
      <div className="flex items-center gap-2 border-b border-outline-variant bg-surface-container-low px-6 py-4">
        <FileText className="h-4 w-4 text-secondary" />
        <h3 className="font-display text-h2 text-on-surface">Receipts &amp; Attachments</h3>
      </div>

      <div className="space-y-6 p-6">
        <RoleGate allowedRoles={["MANAGER"]}>
          <PaymentAttachmentUploadZone paymentId={paymentId} />
        </RoleGate>

        {attachmentsQuery.isLoading ? (
          <div className="space-y-2">
            {Array.from({ length: 2 }).map((_, i) => (
              <Skeleton key={i} className="h-16 w-full" />
            ))}
          </div>
        ) : attachmentsQuery.isError ? (
          <div className="py-8 text-center">
            <p className="mb-3 text-body-md text-error">Failed to load attachments.</p>
            <Button variant="outline" size="sm" onClick={() => attachmentsQuery.refetch()}>
              Retry
            </Button>
          </div>
        ) : attachments.length === 0 ? (
          <p className="py-8 text-center text-on-surface-variant">No attachments uploaded yet.</p>
        ) : (
          <div className="space-y-2">
            {attachments.map((attachment) => (
              <div
                key={attachment.id}
                className="flex items-center justify-between gap-4 rounded-lg border border-outline-variant bg-surface-container-low p-3"
              >
                <div className="flex min-w-0 items-center gap-3">
                  <FileText className="h-5 w-5 shrink-0 text-on-surface-variant" />
                  <div className="min-w-0">
                    <p className="truncate text-body-md font-medium text-on-surface">{attachment.fileName}</p>
                    <div className="mt-1 flex flex-wrap items-center gap-2">
                      <Badge variant="secondary">{FINANCE_ATTACHMENT_TYPE_LABELS[attachment.type]}</Badge>
                      <span className="text-label-sm text-on-surface-variant">
                        {formatFileSize(attachment.fileSize)}
                      </span>
                      <span className="text-label-sm text-on-surface-variant">
                        {new Date(attachment.uploadedAt).toLocaleDateString()}
                      </span>
                    </div>
                  </div>
                </div>
                <div className="flex shrink-0 items-center gap-1">
                  <Button
                    type="button"
                    variant="ghost"
                    size="icon"
                    aria-label={`View ${attachment.fileName}`}
                    disabled={viewingId === attachment.id}
                    onClick={() => handleView(attachment)}
                  >
                    <Eye className="h-4 w-4" />
                  </Button>
                  <RoleGate allowedRoles={["MANAGER"]}>
                    <Button
                      type="button"
                      variant="ghost"
                      size="icon"
                      aria-label={`Delete ${attachment.fileName}`}
                      onClick={() => setConfirmingDelete(attachment)}
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

      <DeletePaymentAttachmentDialog
        paymentId={paymentId}
        attachment={confirmingDelete}
        onOpenChange={(open) => !open && setConfirmingDelete(null)}
      />
    </section>
  )
}
