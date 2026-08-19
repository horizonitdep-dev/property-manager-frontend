"use client"

import { cn } from "@/lib/utils"
import type { Cheque } from "@/types/cheque"

function formatDate(value?: string | null): string {
  if (!value) return ""
  const date = new Date(value)
  const day = String(date.getUTCDate()).padStart(2, "0")
  const month = String(date.getUTCMonth() + 1).padStart(2, "0")
  return `${day}-${month}-${date.getUTCFullYear()}`
}

/**
 * Only steps that actually happened are rendered — a cheque's history is
 * whichever dates the backend has filled in, not a fixed set of stages.
 */
interface Step {
  label: string
  date?: string | null
  tone: "neutral" | "success" | "error"
  detail?: string | null
}

export function ChequeLifecycleTimeline({ cheque }: { cheque: Cheque }) {
  const dated: Step[] = [
    { label: "Received", date: cheque.receivedOn, tone: "neutral" },
    { label: "Deposited", date: cheque.depositedOn, tone: "neutral" },
    { label: "Cleared", date: cheque.clearedOn, tone: "success" },
    { label: "Bounced", date: cheque.bouncedOn, tone: "error", detail: cheque.bounceReason },
  ]
  const steps = dated.filter((step) => !!step.date)

  if (cheque.status === "REPLACED" && cheque.replacedBy) {
    steps.push({
      label: "Replaced",
      date: cheque.updatedAt,
      tone: "neutral",
      detail: `by cheque ${cheque.replacedBy.chequeNumber}`,
    })
  }

  if (cheque.status === "CANCELLED") {
    steps.push({ label: "Cancelled", date: cheque.updatedAt, tone: "neutral" })
  }

  return (
    <ol className="space-y-4">
      {steps.map((step, index) => (
        <li key={step.label} className="flex gap-3">
          <div className="flex flex-col items-center">
            <span
              className={cn(
                "mt-1.5 h-2.5 w-2.5 shrink-0 rounded-full",
                step.tone === "success" && "bg-success",
                step.tone === "error" && "bg-error",
                step.tone === "neutral" && "bg-outline"
              )}
            />
            {index < steps.length - 1 && <span className="mt-1 w-px flex-1 bg-outline-variant" />}
          </div>
          <div className="pb-1">
            <p className="text-body-md text-on-surface">{step.label}</p>
            <p className="font-mono text-data-mono text-on-surface-variant">{formatDate(step.date)}</p>
            {step.detail && <p className="mt-1 text-sm text-on-surface-variant">{step.detail}</p>}
          </div>
        </li>
      ))}
    </ol>
  )
}
