"use client"

import * as React from "react"
import { motion, useReducedMotion } from "framer-motion"
import { AlertCircle, CheckCircle2, FileSpreadsheet, Info, UploadCloud } from "lucide-react"

import { Button } from "@/components/ui/button"
import { useValidateImport } from "@/hooks/queries/use-import"
import { getErrorMessage } from "@/lib/get-error-message"
import { getImportModuleConfig } from "@/lib/import-labels"
import { importService } from "@/services/import-service"
import { cn } from "@/lib/utils"
import type { ImportModuleKey, ImportSession } from "@/types/import"

const MAX_FILE_SIZE_BYTES = 5 * 1024 * 1024
const ALLOWED_EXTENSIONS = [".csv", ".xlsx"]

function validateFile(file: File): string | null {
  const hasAllowedExtension = ALLOWED_EXTENSIONS.some((ext) => file.name.toLowerCase().endsWith(ext))
  if (!hasAllowedExtension) {
    return "Only .csv and .xlsx files are accepted"
  }
  if (file.size > MAX_FILE_SIZE_BYTES) {
    return "File must be under 5MB"
  }
  return null
}

function formatFileSize(bytes: number): string {
  if (bytes < 1024) return `${bytes} B`
  if (bytes < 1024 * 1024) return `${(bytes / 1024).toFixed(1)} KB`
  return `${(bytes / (1024 * 1024)).toFixed(1)} MB`
}

/**
 * The wizard never gets real upload byte-progress (that would mean adding
 * onUploadProgress to importService.validate — out of scope: visual layer
 * only). This bar is a state-driven stand-in: eases toward ~88% while the
 * validate request is in flight, then snaps to 100% the instant the real
 * mutation state flips to success — never a manufactured countdown.
 */
function FileChip({ file, status }: { file: File; status: "uploading" | "success" | "error" }) {
  const shouldReduceMotion = useReducedMotion()
  const width = status === "uploading" ? "88%" : status === "success" ? "100%" : "100%"

  return (
    <div className="flex items-center gap-4 rounded-lg border border-outline-variant bg-surface-container-low p-3">
      <div className="min-w-0 flex-1">
        <div className="flex items-center gap-2">
          {status === "error" && <AlertCircle className="h-4 w-4 shrink-0 text-error" />}
          {status === "success" && <CheckCircle2 className="h-4 w-4 shrink-0 text-success" />}
          <p className="truncate text-body-md font-medium text-on-surface">{file.name}</p>
          <span className="shrink-0 text-xs text-on-surface-variant">{formatFileSize(file.size)}</span>
        </div>
        <div className="mt-2 h-1.5 w-full overflow-hidden rounded-full bg-surface-container-high">
          <motion.div
            className={cn("h-full rounded-full", status === "error" ? "bg-error" : "bg-secondary")}
            initial={{ width: 0 }}
            animate={{ width }}
            transition={
              shouldReduceMotion
                ? { duration: 0 }
                : status === "uploading"
                  ? { duration: 0.9, ease: "easeOut" }
                  : { duration: 0.15, ease: "easeOut" }
            }
            style={status === "success" ? { backgroundColor: "#16A34A" } : undefined}
          />
        </div>
      </div>
    </div>
  )
}

export function UploadStep({
  module,
  onValidated,
}: {
  module: ImportModuleKey
  onValidated: (session: ImportSession) => void
}) {
  const config = getImportModuleConfig(module)
  const validateMutation = useValidateImport(module)
  const [isDragging, setIsDragging] = React.useState(false)
  const [clientError, setClientError] = React.useState<string | null>(null)
  const [isDownloading, setIsDownloading] = React.useState<"csv" | "xlsx" | null>(null)
  const [selectedFile, setSelectedFile] = React.useState<File | null>(null)
  const fileInputRef = React.useRef<HTMLInputElement>(null)

  async function handleDownloadTemplate(format: "csv" | "xlsx") {
    setIsDownloading(format)
    try {
      await importService.downloadTemplate(module, format)
    } catch {
      setClientError(`Failed to download the ${format.toUpperCase()} template. Please try again.`)
    } finally {
      setIsDownloading(null)
    }
  }

  function handleFile(file: File) {
    setClientError(null)
    const validationError = validateFile(file)
    if (validationError) {
      setClientError(validationError)
      return
    }
    setSelectedFile(file)
    validateMutation.mutate(file, {
      onSuccess: (session) => onValidated(session),
    })
  }

  function handleDrop(e: React.DragEvent<HTMLDivElement>) {
    e.preventDefault()
    setIsDragging(false)
    const file = e.dataTransfer.files[0]
    if (file) handleFile(file)
  }

  const isBusy = validateMutation.isPending
  const chipStatus = validateMutation.isPending ? "uploading" : validateMutation.isError ? "error" : "success"

  return (
    <div className="space-y-6">
      <p className="text-body-md text-on-surface-variant">
        Download a template, fill it in, and upload it here. We&apos;ll validate every row before anything is saved.
      </p>

      <div className="flex flex-col gap-3 rounded-xl border border-outline-variant bg-surface-container-low p-4 sm:flex-row sm:items-center sm:justify-between">
        <div className="flex items-center gap-2 text-body-md text-on-surface">
          <FileSpreadsheet className="h-4 w-4 text-secondary" />
          Need a starting point?
        </div>
        <div className="flex gap-2">
          <Button
            type="button"
            variant="outline"
            size="sm"
            disabled={isDownloading !== null}
            onClick={() => handleDownloadTemplate("csv")}
          >
            {isDownloading === "csv" ? "Downloading…" : "Download CSV template"}
          </Button>
          <Button
            type="button"
            variant="outline"
            size="sm"
            disabled={isDownloading !== null}
            onClick={() => handleDownloadTemplate("xlsx")}
          >
            {isDownloading === "xlsx" ? "Downloading…" : "Download Excel template"}
          </Button>
        </div>
      </div>

      {config.dependencyNote && (
        <div className="flex items-start gap-3 rounded-xl border border-secondary/20 bg-secondary/5 p-4">
          <Info className="mt-0.5 h-4 w-4 shrink-0 text-secondary" />
          <p className="text-sm text-on-surface">{config.dependencyNote}</p>
        </div>
      )}

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
          Drag &amp; drop your file here, or <span className="font-bold text-secondary">browse</span>
        </p>
        <p className="mt-1 text-xs text-on-surface-variant">Accepts .csv and .xlsx up to 5MB</p>
        <input
          ref={fileInputRef}
          type="file"
          accept=".csv,.xlsx"
          hidden
          disabled={isBusy}
          onChange={(e) => {
            const file = e.target.files?.[0]
            if (file) handleFile(file)
            e.target.value = ""
          }}
        />
      </div>

      {selectedFile && !clientError && <FileChip file={selectedFile} status={chipStatus} />}

      {(clientError || validateMutation.isError) && (
        <div className="flex items-start gap-3 rounded-lg bg-error/10 px-4 py-3">
          <AlertCircle className="mt-0.5 h-4 w-4 shrink-0 text-error" />
          <p className="text-sm font-medium text-error">
            {clientError ?? getErrorMessage(validateMutation.error, "Failed to validate the file.")}
          </p>
        </div>
      )}
    </div>
  )
}
