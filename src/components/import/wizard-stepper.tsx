"use client"

import * as React from "react"
import { AnimatePresence, motion, useReducedMotion } from "framer-motion"
import { Check } from "lucide-react"

import { cn } from "@/lib/utils"

const SPRING = [0.22, 1, 0.36, 1] as const
const STANDARD = [0.4, 0, 0.2, 1] as const

const SECONDARY = "#2569E6"
const SUCCESS = "#16A34A"
const IDLE_BG = "#F1F5F9"

const STEPS = [
  { step: 1, label: "Upload" },
  { step: 2, label: "Preview" },
  { step: 3, label: "Confirm" },
] as const

function StepNode({ step, current, shouldReduceMotion }: { step: 1 | 2 | 3; current: 1 | 2 | 3 | 4; shouldReduceMotion: boolean }) {
  const isDone = current > step
  const isActive = current === step
  const bg = isDone ? SUCCESS : isActive ? SECONDARY : IDLE_BG

  return (
    <div className="relative">
      {/* One-shot ring pulse, fired the instant this node becomes "done". */}
      {isDone && !shouldReduceMotion && (
        <motion.span
          className="pointer-events-none absolute inset-0 rounded-full"
          style={{ backgroundColor: SUCCESS }}
          initial={{ scale: 1, opacity: 0.55 }}
          animate={{ scale: 1.8, opacity: 0 }}
          transition={{ duration: 0.5, ease: STANDARD }}
        />
      )}
      <motion.div
        className="relative flex h-7 w-7 items-center justify-center rounded-full text-xs font-bold"
        initial={false}
        animate={{ backgroundColor: bg }}
        transition={shouldReduceMotion ? { duration: 0 } : { duration: 0.3, ease: STANDARD }}
      >
        <AnimatePresence mode="wait" initial={false}>
          {isDone ? (
            <motion.span
              key="check"
              initial={shouldReduceMotion ? false : { scale: 0, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              exit={{ scale: 0, opacity: 0 }}
              transition={shouldReduceMotion ? { duration: 0 } : { duration: 0.22, ease: SPRING }}
              className="flex items-center justify-center text-white"
            >
              <Check className="h-4 w-4" />
            </motion.span>
          ) : (
            <motion.span
              key="number"
              initial={shouldReduceMotion ? false : { opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              transition={shouldReduceMotion ? { duration: 0 } : { duration: 0.15 }}
              className={cn(isActive ? "text-white" : "text-on-surface-variant")}
            >
              {step}
            </motion.span>
          )}
        </AnimatePresence>
      </motion.div>
    </div>
  )
}

export function WizardStepper({ current }: { current: 1 | 2 | 3 | 4 }) {
  const shouldReduceMotion = !!useReducedMotion()

  return (
    <div className="flex items-center gap-3">
      {STEPS.map(({ step, label }, index) => (
        <React.Fragment key={step}>
          {index > 0 && (
            <div className="relative h-0.5 w-[54px] overflow-hidden bg-outline-variant">
              <motion.div
                className="absolute inset-y-0 left-0 w-full"
                style={{ backgroundColor: SUCCESS, transformOrigin: "left" }}
                initial={false}
                animate={{ scaleX: current > index ? 1 : 0 }}
                transition={shouldReduceMotion ? { duration: 0 } : { duration: 0.45, ease: STANDARD }}
              />
            </div>
          )}
          <div className="flex items-center gap-[9px]">
            <StepNode step={step} current={current} shouldReduceMotion={shouldReduceMotion} />
            <span
              className={cn(
                "text-[13px] font-semibold",
                current === step ? "text-on-surface" : "text-on-surface-variant"
              )}
            >
              {label}
            </span>
          </div>
        </React.Fragment>
      ))}
    </div>
  )
}
