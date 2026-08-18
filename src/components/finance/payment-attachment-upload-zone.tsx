"use client"

import * as React from "react"
import { AlertCircle, RotateCcw, UploadCloud, X } from "lucide-react"
import { toast } from "sonner"

import { Button } from "@/components/ui/button"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { useUploadPaymentAttachment } from "@/hooks/queries/use-payments"
import { FINANCE_ATTACHMENT_TYPE_OPTIONS } from "@/lib/finance-labels"
import { getErrorMessage } from "@/lib/get-error-message"
import { cn } from "@/lib/utils"
import type { FinanceAttachmentType } from "@/types/finance"

const ALLOWED_MIME_TYPES = ["application/pdf", "image/jpeg", "image/png"]
const MAX_FILE_SIZE_BYTES = 10 * 1024 * 1024

interface PendingUpload {
  id: string
  file: File
  type: FinanceAttachmentType
  progress: number
  status: "uploading" | "error"
  errorMessage?: string
}

function validateFile(file: File): string | null {
  if (!ALLOWED_MIME_TYPES.includes(file.type)) {
    return "PNG, JPG and PDF only"
  }
  if (file.size > MAX_FILE_SIZE_BYTES) {
    return "File must be under 10MB"
  }
  return null
}

export function PaymentAttachmentUploadZone({ paymentId }: { paymentId: string }) {
  const uploadMutation = useUploadPaymentAttachment(paymentId)
  // Payments default to RECEIPT server-side; mirror that as the pre-selection.
  const [attachmentType, setAttachmentType] = React.useState<FinanceAttachmentType>("RECEIPT")
  const [isDragging, setIsDragging] = React.useState(false)
  const [pending, setPending] = React.useState<PendingUpload[]>([])
  const fileInputRef = React.useRef<HTMLInputElement>(null)

  function startUpload(file: File, type: FinanceAttachmentType, existingId?: string) {
    const id = existingId ?? crypto.randomUUID()
    setPending((prev) => [...prev.filter((p) => p.id !== id), { id, file, type, progress: 0, status: "uploading" }])

    uploadMutation.mutate(
      {
        file,
        type,
        onUploadProgress: (percent) => {
          setPending((prev) => prev.map((p) => (p.id === id ? { ...p, progress: percent } : p)))
        },
      },
      {
        onSuccess: () => {
          setPending((prev) => prev.filter((p) => p.id !== id))
          toast.success(`${file.name} uploaded.`)
        },
        onError: (error) => {
          setPending((prev) =>
            prev.map((p) =>
              p.id === id ? { ...p, status: "error", errorMessage: getErrorMessage(error, "Upload failed.") } : p
            )
          )
        },
      }
    )
  }

  function handleFiles(files: FileList | File[]) {
    Array.from(files).forEach((file) => {
      const validationError = validateFile(file)
      if (validationError) {
        toast.error(`${file.name}: ${validationError}`)
        return
      }
      startUpload(file, attachmentType)
    })
  }

  function handleDrop(e: React.DragEvent<HTMLDivElement>) {
    e.preventDefault()
    setIsDragging(false)
    if (e.dataTransfer.files.length > 0) handleFiles(e.dataTransfer.files)
  }

  return (
    <div className="space-y-4">
      <div className="max-w-xs space-y-2">
        <label className="text-label-sm uppercase text-on-surface-variant">Attachment type for next upload</label>
        <Select value={attachmentType} onValueChange={(value) => setAttachmentType(value as FinanceAttachmentType)}>
          <SelectTrigger>
            <SelectValue />
          </SelectTrigger>
          <SelectContent>
            {FINANCE_ATTACHMENT_TYPE_OPTIONS.map((option) => (
              <SelectItem key={option.value} value={option.value}>
                {option.label}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
      </div>

      <div
        role="button"
        tabIndex={0}
        onClick={() => fileInputRef.current?.click()}
        onKeyDown={(e) => {
          if (e.key === "Enter" || e.key === " ") fileInputRef.current?.click()
        }}
        onDragOver={(e) => {
          e.preventDefault()
          setIsDragging(true)
        }}
        onDragLeave={(e) => {
          e.preventDefault()
          setIsDragging(false)
        }}
        onDrop={handleDrop}
        className={cn(
          "group flex cursor-pointer flex-col items-center justify-center rounded-lg border-2 border-dashed border-outline-variant bg-surface-container-lowest p-8 text-center transition-colors hover:border-secondary",
          isDragging && "border-secondary bg-secondary/5"
        )}
      >
        <UploadCloud className="mb-2 h-10 w-10 text-outline transition-colors group-hover:text-secondary" />
        <p className="text-body-md text-on-surface">
          Drag &amp; drop receipts here, or <span className="font-bold text-secondary">browse</span>
        </p>
        <p className="mt-1 text-xs text-on-surface-variant">Accepts PDF, JPG, PNG up to 10MB</p>
        <input
          ref={fileInputRef}
          type="file"
          accept={ALLOWED_MIME_TYPES.join(",")}
          multiple
          hidden
          onChange={(e) => {
            if (e.target.files) handleFiles(e.target.files)
            e.target.value = ""
          }}
        />
      </div>

      {pending.length > 0 && (
        <div className="space-y-2">
          {pending.map((item) => (
            <div
              key={item.id}
              className="flex items-center justify-between gap-4 rounded-lg border border-outline-variant bg-surface-container-low p-3"
            >
              <div className="min-w-0 flex-1">
                <div className="flex items-center gap-2">
                  {item.status === "error" && <AlertCircle className="h-4 w-4 shrink-0 text-error" />}
                  <p className="truncate text-body-md font-medium text-on-surface">{item.file.name}</p>
                </div>
                {item.status === "uploading" ? (
                  <div className="mt-2 h-1.5 w-full overflow-hidden rounded-full bg-surface-container-high">
                    <div
                      className="h-full rounded-full bg-secondary transition-all"
                      style={{ width: `${item.progress}%` }}
                    />
                  </div>
                ) : (
                  <p className="mt-1 text-sm text-error">{item.errorMessage}</p>
                )}
              </div>
              <div className="flex shrink-0 items-center gap-1">
                {item.status === "error" && (
                  <Button
                    type="button"
                    variant="ghost"
                    size="icon"
                    aria-label={`Retry uploading ${item.file.name}`}
                    onClick={() => startUpload(item.file, item.type, item.id)}
                  >
                    <RotateCcw className="h-4 w-4" />
                  </Button>
                )}
                <Button
                  type="button"
                  variant="ghost"
                  size="icon"
                  aria-label={`Remove ${item.file.name} from upload queue`}
                  onClick={() => setPending((prev) => prev.filter((p) => p.id !== item.id))}
                >
                  <X className="h-4 w-4" />
                </Button>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  )
}
