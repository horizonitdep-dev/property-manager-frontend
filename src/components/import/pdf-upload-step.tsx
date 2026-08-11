"use client"

import * as React from "react"
import { motion, useReducedMotion } from "framer-motion"
import { AlertCircle, FileText, UploadCloud, X } from "lucide-react"
import { toast } from "sonner"

import { Button } from "@/components/ui/button"
import { useValidatePdfImport } from "@/hooks/queries/use-pdf-import"
import { getErrorMessage } from "@/lib/get-error-message"
import { cn } from "@/lib/utils"
import type { PdfImportSession } from "@/types/import-pdf"

const MAX_FILE_SIZE_BYTES = 10 * 1024 * 1024
const MAX_FILES = 10

interface PendingPdf {
  id: string
  file: File
}

function formatFileSize(bytes: number): string {
  if (bytes < 1024) return `${bytes} B`
  if (bytes < 1024 * 1024) return `${(bytes / 1024).toFixed(1)} KB`
  return `${(bytes / (1024 * 1024)).toFixed(1)} MB`
}

function validateFile(file: File): string | null {
  if (!file.name.toLowerCase().endsWith(".pdf")) return "PDF only"
  if (file.size > MAX_FILE_SIZE_BYTES) return "Each file must be under 10MB"
  return null
}

/**
 * There's no real per-file server progress for one batch multipart POST —
 * extraction happens server-side across all files at once. This eases a
 * counter up toward (but never reaching) the total while the request is in
 * flight, purely as a "something is happening" indicator — never a
 * manufactured completion, matching the honesty of upload-step.tsx's FileChip.
 */
function useExtractingCounter(isPending: boolean, total: number) {
  const [count, setCount] = React.useState(0)

  React.useEffect(() => {
    if (!isPending || total === 0) {
      setCount(0)
      return
    }
    const perFileMs = 2500
    const interval = setInterval(() => {
      setCount((prev) => Math.min(prev + 1, Math.max(total - 1, 0)))
    }, perFileMs)
    return () => clearInterval(interval)
  }, [isPending, total])

  return count
}

export function PdfUploadStep({ onValidated }: { onValidated: (session: PdfImportSession) => void }) {
  const shouldReduceMotion = useReducedMotion()
  const validateMutation = useValidatePdfImport()
  const [isDragging, setIsDragging] = React.useState(false)
  const [pending, setPending] = React.useState<PendingPdf[]>([])
  const fileInputRef = React.useRef<HTMLInputElement>(null)
  const extractedCount = useExtractingCounter(validateMutation.isPending, pending.length)

  function handleFiles(files: FileList | File[]) {
    const incoming = Array.from(files)
    const room = MAX_FILES - pending.length
    if (room <= 0) {
      toast.error("Max 10 files per batch")
      return
    }
    const accepted: PendingPdf[] = []
    incoming.forEach((file, index) => {
      const error = validateFile(file)
      if (error) {
        toast.error(`${file.name}: ${error}`)
        return
      }
      if (index >= room) {
        toast.error("Max 10 files per batch")
        return
      }
      accepted.push({ id: crypto.randomUUID(), file })
    })
    if (accepted.length > 0) setPending((prev) => [...prev, ...accepted])
  }

  function handleDrop(e: React.DragEvent<HTMLDivElement>) {
    e.preventDefault()
    setIsDragging(false)
    if (e.dataTransfer.files.length > 0) handleFiles(e.dataTransfer.files)
  }

  const isBusy = validateMutation.isPending

  function handleExtract() {
    validateMutation.mutate(
      pending.map((p) => p.file),
      { onSuccess: onValidated }
    )
  }

  return (
    <div className="space-y-4">
      <p className="text-body-md text-on-surface-variant">
        Upload up to 10 official DMT tenancy contract PDFs. Buildings, properties, tenants, and contracts
        are extracted automatically for your review.
      </p>

      <div
        role="button"
        tabIndex={0}
        onClick={() => !isBusy && fileInputRef.current?.click()}
        onKeyDown={(e) => {
          if (!isBusy && (e.key === "Enter" || e.key === " ")) fileInputRef.current?.click()
        }}
        onDragOver={(e) => {
          e.preventDefault()
          if (!isBusy) setIsDragging(true)
        }}
        onDragLeave={(e) => {
          e.preventDefault()
          setIsDragging(false)
        }}
        onDrop={(e) => !isBusy && handleDrop(e)}
        className={cn(
          "group flex cursor-pointer flex-col items-center justify-center rounded-lg border-2 border-dashed border-outline-variant bg-surface-container-lowest p-10 text-center transition-colors",
          !isBusy && "hover:border-secondary",
          isDragging && "border-secondary bg-secondary/5",
          isBusy && "cursor-not-allowed opacity-70"
        )}
      >
        <UploadCloud className="mb-2 h-10 w-10 text-outline transition-colors group-hover:text-secondary" />
        <p className="text-body-md text-on-surface">
          Drag &amp; drop PDFs here, or <span className="font-bold text-secondary">browse</span>
        </p>
        <p className="mt-1 text-xs text-on-surface-variant">Accepts .pdf, up to 10 files, 10MB each</p>
        <input
          ref={fileInputRef}
          type="file"
          accept=".pdf"
          multiple
          hidden
          disabled={isBusy}
          onChange={(e) => {
            if (e.target.files) handleFiles(e.target.files)
            e.target.value = ""
          }}
        />
      </div>

      {pending.length > 0 && (
        <div className="space-y-2">
          {pending.map((item, index) => (
            <motion.div
              key={item.id}
              initial={shouldReduceMotion ? false : { opacity: 0, y: 8 }}
              animate={{ opacity: 1, y: 0 }}
              transition={
                shouldReduceMotion ? { duration: 0 } : { duration: 0.2, delay: index * 0.03, ease: "easeOut" }
              }
              className="flex items-center gap-3 rounded-lg border border-outline-variant bg-surface-container-low p-3"
            >
              <FileText className="h-4 w-4 shrink-0 text-secondary" />
              <div className="min-w-0 flex-1">
                <p className="truncate text-body-md font-medium text-on-surface">{item.file.name}</p>
                <span className="text-xs text-on-surface-variant">{formatFileSize(item.file.size)}</span>
              </div>
              <Button
                type="button"
                variant="ghost"
                size="icon"
                aria-label={`Remove ${item.file.name}`}
                disabled={isBusy}
                onClick={() => setPending((prev) => prev.filter((p) => p.id !== item.id))}
              >
                <X className="h-4 w-4" />
              </Button>
            </motion.div>
          ))}
        </div>
      )}

      {validateMutation.isError && (
        <div className="flex items-start gap-3 rounded-lg bg-error/10 px-4 py-3">
          <AlertCircle className="mt-0.5 h-4 w-4 shrink-0 text-error" />
          <p className="text-sm font-medium text-error">
            {getErrorMessage(validateMutation.error, "Failed to extract the PDFs.")}
          </p>
        </div>
      )}

      <div className="flex items-center justify-end border-t border-outline-variant pt-4">
        <Button type="button" onClick={handleExtract} disabled={pending.length === 0 || isBusy}>
          {isBusy ? `Extracting ${extractedCount} of ${pending.length}…` : "Extract"}
        </Button>
      </div>
    </div>
  )
}
