"use client"

import { toast } from "sonner"

import { Button } from "@/components/ui/button"
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog"
import { useDeleteFinanceAttachment } from "@/hooks/queries/use-finance-attachments"
import { getErrorMessage } from "@/lib/get-error-message"
import type { FinanceParent } from "@/services/finance-attachment-service"
import type { FinanceAttachment } from "@/types/finance"

export function DeleteAttachmentDialog({
  parent,
  parentId,
  attachment,
  onOpenChange,
}: {
  parent: FinanceParent
  parentId: string
  attachment: FinanceAttachment | null
  onOpenChange: (open: boolean) => void
}) {
  const deleteMutation = useDeleteFinanceAttachment(parent, parentId)

  function handleDelete() {
    if (!attachment) return
    deleteMutation.mutate(attachment.id, {
      onSuccess: () => {
        toast.success(`${attachment.fileName} was removed.`)
        onOpenChange(false)
      },
      onError: (error) => {
        toast.error(getErrorMessage(error, "Failed to remove attachment."))
      },
    })
  }

  return (
    <Dialog open={!!attachment} onOpenChange={onOpenChange}>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>Remove attachment</DialogTitle>
          <DialogDescription>
            This will remove <span className="font-semibold text-on-surface">{attachment?.fileName}</span> from
            this record.
          </DialogDescription>
        </DialogHeader>
        <DialogFooter>
          <Button variant="outline" onClick={() => onOpenChange(false)} disabled={deleteMutation.isPending}>
            Cancel
          </Button>
          <Button variant="destructive" onClick={handleDelete} disabled={deleteMutation.isPending}>
            {deleteMutation.isPending ? "Removing…" : "Remove attachment"}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  )
}
