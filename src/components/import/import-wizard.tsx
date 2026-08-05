"use client"

import * as React from "react"
import * as DialogPrimitive from "@radix-ui/react-dialog"
import { AnimatePresence, motion, useReducedMotion } from "framer-motion"
import { X } from "lucide-react"

import { DialogHeader, DialogTitle } from "@/components/ui/dialog"
import { ConfirmStep } from "@/components/import/confirm-step"
import { PreviewStep } from "@/components/import/preview-step"
import { UploadStep } from "@/components/import/upload-step"
import { WizardStepper } from "@/components/import/wizard-stepper"
import { getImportModuleConfig } from "@/lib/import-labels"
import type { ImportModuleKey, ImportSession } from "@/types/import"

const SPRING = [0.22, 1, 0.36, 1] as const
const STANDARD = [0.4, 0, 0.2, 1] as const

// Slower than a standard fade, per feedback — the scrim blur should feel deliberate.
const SCRIM_TRANSITION = { duration: 0.55, ease: STANDARD }
const PANEL_TRANSITION = { duration: 0.42, ease: SPRING }
const STEP_TRANSITION = { duration: 0.45, ease: SPRING }

export function ImportWizard({
  module,
  open,
  onOpenChange,
}: {
  module: ImportModuleKey
  open: boolean
  onOpenChange: (open: boolean) => void
}) {
  const config = getImportModuleConfig(module)
  const shouldReduceMotion = !!useReducedMotion()
  const [step, setStep] = React.useState<1 | 2 | 3>(1)
  const [direction, setDirection] = React.useState<1 | -1>(1)
  const [session, setSession] = React.useState<ImportSession | null>(null)
  const [committed, setCommitted] = React.useState(false)

  // Reset wizard state whenever it's (re)opened, so a previous session never bleeds through.
  React.useEffect(() => {
    if (open) {
      setStep(1)
      setDirection(1)
      setSession(null)
      setCommitted(false)
    }
  }, [open])

  function goTo(nextStep: 1 | 2 | 3) {
    setDirection(nextStep > step ? 1 : -1)
    setStep(nextStep)
  }

  function handleValidated(newSession: ImportSession) {
    setSession(newSession)
    goTo(2)
  }

  function handleReupload() {
    setSession(null)
    goTo(1)
  }

  const slideVariants = {
    enter: (dir: 1 | -1) => (shouldReduceMotion ? { opacity: 1, x: 0 } : { opacity: 0, x: dir * 40 }),
    center: { opacity: 1, x: 0 },
    exit: (dir: 1 | -1) => (shouldReduceMotion ? { opacity: 0, x: 0 } : { opacity: 0, x: dir * -40 }),
  }

  return (
    <DialogPrimitive.Root open={open} onOpenChange={onOpenChange}>
      <AnimatePresence>
        {open && (
          <DialogPrimitive.Portal forceMount>
            <DialogPrimitive.Overlay asChild forceMount>
              <motion.div
                className="fixed inset-0 z-50"
                style={{ background: "rgba(12,20,40,.45)" }}
                initial={{ opacity: 0, backdropFilter: "blur(0px)" }}
                animate={{ opacity: 1, backdropFilter: "blur(6px)" }}
                exit={{ opacity: 0, backdropFilter: "blur(0px)" }}
                transition={shouldReduceMotion ? { duration: 0 } : SCRIM_TRANSITION}
              />
            </DialogPrimitive.Overlay>

            <DialogPrimitive.Content asChild forceMount>
              <div className="pointer-events-none fixed inset-0 z-50 flex items-center justify-center p-4">
                <motion.div
                  className="pointer-events-auto relative max-h-[90vh] w-full max-w-5xl overflow-y-auto rounded-[20px] border border-outline-variant bg-surface shadow-lg"
                  initial={shouldReduceMotion ? { opacity: 0 } : { opacity: 0, y: 20, scale: 0.965 }}
                  animate={{ opacity: 1, y: 0, scale: 1 }}
                  exit={shouldReduceMotion ? { opacity: 0 } : { opacity: 0, y: 20, scale: 0.965 }}
                  transition={shouldReduceMotion ? { duration: 0.15 } : PANEL_TRANSITION}
                >
                  <DialogHeader className="px-[26px] pt-6">
                    <DialogTitle className="text-[20px] font-semibold tracking-[-0.02em]">
                      Import <span className={config.accentClassName}>{config.label}</span>
                    </DialogTitle>
                  </DialogHeader>

                  {/* Once committed there's no step 4 to advance to, but the stepper
                      should still show step 3 as done, not still "active". */}
                  <div className="px-[26px] pb-[22px] pt-5">
                    <WizardStepper current={committed ? 4 : step} />
                  </div>

                  <div className="relative overflow-hidden px-[26px] pb-[26px] pt-1">
                    <AnimatePresence mode="wait" custom={direction} initial={false}>
                      <motion.div
                        key={step}
                        custom={direction}
                        variants={slideVariants}
                        initial="enter"
                        animate="center"
                        exit="exit"
                        transition={shouldReduceMotion ? { duration: 0.15 } : STEP_TRANSITION}
                      >
                        {step === 1 && <UploadStep module={module} onValidated={handleValidated} />}
                        {step === 2 && session && (
                          <PreviewStep
                            module={module}
                            session={session}
                            onReupload={handleReupload}
                            onCancel={() => onOpenChange(false)}
                            onContinue={() => goTo(3)}
                          />
                        )}
                        {step === 3 && session && (
                          <ConfirmStep
                            module={module}
                            session={session}
                            onBack={() => goTo(2)}
                            onCommitted={() => setCommitted(true)}
                            onClose={() => onOpenChange(false)}
                          />
                        )}
                      </motion.div>
                    </AnimatePresence>
                  </div>

                  <DialogPrimitive.Close className="absolute right-[26px] top-6 flex h-[34px] w-[34px] items-center justify-center rounded-[7px] text-on-surface-variant/70 transition-colors hover:bg-surface-container-high hover:text-on-surface focus:outline-none focus:ring-2 focus:ring-secondary disabled:pointer-events-none">
                    <X className="h-4 w-4" />
                    <span className="sr-only">Close</span>
                  </DialogPrimitive.Close>
                </motion.div>
              </div>
            </DialogPrimitive.Content>
          </DialogPrimitive.Portal>
        )}
      </AnimatePresence>
    </DialogPrimitive.Root>
  )
}
