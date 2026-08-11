"use client"

import * as React from "react"
import { motion, useReducedMotion } from "framer-motion"
import { FileText, Sparkles, Table2 } from "lucide-react"

import { cn } from "@/lib/utils"

const SPRING = [0.22, 1, 0.36, 1] as const

export type ImportMode = "pdf" | "csv"

function ModeCard({
  icon,
  chip,
  title,
  description,
  selected,
  fading,
  shouldReduceMotion,
  onClick,
}: {
  icon: React.ReactNode
  chip?: React.ReactNode
  title: string
  description: string
  selected: boolean
  fading: boolean
  shouldReduceMotion: boolean | null
  onClick: () => void
}) {
  return (
    <motion.button
      type="button"
      onClick={onClick}
      animate={
        shouldReduceMotion
          ? undefined
          : selected
            ? { scale: 1.02, opacity: 1 }
            : fading
              ? { opacity: 0.4, x: -12 }
              : { scale: 1, opacity: 1, x: 0 }
      }
      transition={{ duration: 0.3, ease: SPRING }}
      whileHover={shouldReduceMotion ? undefined : { y: -4 }}
      className="group relative flex flex-col items-start gap-4 overflow-hidden rounded-[20px] border border-outline-variant bg-surface p-6 text-left focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-secondary"
    >
      {chip && (
        <span className="absolute right-4 top-4 rounded-full bg-secondary/10 px-2.5 py-1 text-[11px] font-semibold uppercase tracking-wide text-secondary">
          {chip}
        </span>
      )}
      {/* Muted hover shimmer — a working surface, not marketing chrome. */}
      <div className="pointer-events-none absolute inset-0 -translate-x-full bg-gradient-to-r from-transparent via-secondary/5 to-transparent transition-transform duration-700 group-hover:translate-x-full" />
      <div className="flex h-12 w-12 items-center justify-center rounded-xl bg-secondary/10 text-secondary">
        {icon}
      </div>
      <div>
        <h3 className="text-h2 font-display text-on-surface">{title}</h3>
        <p className="mt-1.5 text-body-md text-on-surface-variant">{description}</p>
      </div>
    </motion.button>
  )
}

export function ModePickerStep({ onSelectMode }: { onSelectMode: (mode: ImportMode) => void }) {
  const shouldReduceMotion = useReducedMotion()
  const [selecting, setSelecting] = React.useState<ImportMode | null>(null)

  function handleSelect(mode: ImportMode) {
    if (selecting) return
    setSelecting(mode)
    setTimeout(() => onSelectMode(mode), shouldReduceMotion ? 0 : 150)
  }

  return (
    <div className="space-y-4">
      <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
        <ModeCard
          icon={
            <span className="relative">
              <FileText className="h-6 w-6" />
              <Sparkles className="absolute -right-1.5 -top-1.5 h-3.5 w-3.5" />
            </span>
          }
          chip="AI-assisted"
          title="Import from DMT PDFs"
          description="Upload official DMT tenancy contracts. Buildings, properties, tenants, and contracts are extracted automatically for your review."
          selected={selecting === "pdf"}
          fading={selecting === "csv"}
          shouldReduceMotion={shouldReduceMotion}
          onClick={() => handleSelect("pdf")}
        />
        <ModeCard
          icon={<Table2 className="h-6 w-6" />}
          title="Import from CSV or Excel"
          description="Bulk import into a single module using a template. Available for Buildings, Properties, Tenants, and Contracts."
          selected={selecting === "csv"}
          fading={selecting === "pdf"}
          shouldReduceMotion={shouldReduceMotion}
          onClick={() => handleSelect("csv")}
        />
      </div>
      <p className="text-center text-sm text-on-surface-variant">
        Both methods produce a preview before anything is created.
      </p>
    </div>
  )
}
