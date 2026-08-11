"use client"

import * as React from "react"
import * as DialogPrimitive from "@radix-ui/react-dialog"
import { AnimatePresence, motion, useReducedMotion } from "framer-motion"
import { ArrowLeft, X } from "lucide-react"

import { DialogHeader, DialogTitle } from "@/components/ui/dialog"
import { ConfirmStep } from "@/components/import/confirm-step"
import { ModePickerStep, type ImportMode } from "@/components/import/mode-picker-step"
import { ModuleSelectStep } from "@/components/import/module-select-step"
import { PdfConfirmStep } from "@/components/import/pdf-confirm-step"
import { PdfPreviewStep } from "@/components/import/pdf-preview-step"
import { PdfUploadStep } from "@/components/import/pdf-upload-step"
import { PreviewStep } from "@/components/import/preview-step"
import { UploadStep } from "@/components/import/upload-step"
import { WizardStepper, type WizardStepDef } from "@/components/import/wizard-stepper"
import { getImportModuleConfig } from "@/lib/import-labels"
import type { ImportModuleKey, ImportSession } from "@/types/import"
import type { PdfImportSession } from "@/types/import-pdf"

const SPRING = [0.22, 1, 0.36, 1] as const
const STANDARD = [0.4, 0, 0.2, 1] as const

// Slower than a standard fade, per feedback — the scrim blur should feel deliberate.
const SCRIM_TRANSITION = { duration: 0.55, ease: STANDARD }
const PANEL_TRANSITION = { duration: 0.42, ease: SPRING }
const MODE_TRANSITION = { duration: 0.35, ease: SPRING }
const STEP_TRANSITION = { duration: 0.45, ease: SPRING }

const PDF_STEPS: WizardStepDef[] = [
  { step: 1, label: "Upload" },
  { step: 2, label: "Preview" },
  { step: 3, label: "Confirm" },
]

type WizardMode = "picker" | ImportMode

export function ImportWizard({
  preselectedModule,
  open,
  onOpenChange,
}: {
  preselectedModule?: ImportModuleKey
  open: boolean
  onOpenChange: (open: boolean) => void
}) {
  const shouldReduceMotion = !!useReducedMotion()

  const [mode, setMode] = React.useState<WizardMode>("picker")
  const [step, setStep] = React.useState(1)
  const [direction, setDirection] = React.useState<1 | -1>(1)
  const [csvModule, setCsvModule] = React.useState<ImportModuleKey | null>(preselectedModule ?? null)
  const [csvSession, setCsvSession] = React.useState<ImportSession | null>(null)
  const [pdfSession, setPdfSession] = React.useState<PdfImportSession | null>(null)
  const [committed, setCommitted] = React.useState(false)

  const csvIncludesModuleStep = !preselectedModule

  // Reset wizard state whenever it's (re)opened, so a previous session never bleeds through.
  React.useEffect(() => {
    if (open) {
      setMode("picker")
      setStep(1)
      setDirection(1)
      setCsvModule(preselectedModule ?? null)
      setCsvSession(null)
      setPdfSession(null)
      setCommitted(false)
    }
  }, [open, preselectedModule])

  const csvSteps: WizardStepDef[] = csvIncludesModuleStep
    ? [
        { step: 1, label: "Module" },
        { step: 2, label: "Upload" },
        { step: 3, label: "Preview" },
        { step: 4, label: "Confirm" },
      ]
    : [
        { step: 1, label: "Upload" },
        { step: 2, label: "Preview" },
        { step: 3, label: "Confirm" },
      ]
  const stepperSteps = mode === "picker" ? null : mode === "pdf" ? PDF_STEPS : csvSteps

  function goTo(nextStep: number) {
    setDirection(nextStep > step ? 1 : -1)
    setStep(nextStep)
  }

  function handleSelectMode(nextMode: ImportMode) {
    setMode(nextMode)
    setStep(1)
    setDirection(1)
  }

  // Back navigation from step 1 of either flow returns to the mode picker.
  function goToPicker() {
    setMode("picker")
    setCsvSession(null)
    setPdfSession(null)
    setCsvModule(preselectedModule ?? null)
    setCommitted(false)
  }

  const slideVariants = {
    enter: (dir: 1 | -1) => (shouldReduceMotion ? { opacity: 1, x: 0 } : { opacity: 0, x: dir * 40 }),
    center: { opacity: 1, x: 0 },
    exit: (dir: 1 | -1) => (shouldReduceMotion ? { opacity: 0, x: 0 } : { opacity: 0, x: dir * -40 }),
  }

  const modeVariants = {
    enter: shouldReduceMotion ? { opacity: 1, y: 0 } : { opacity: 0, y: 16 },
    center: { opacity: 1, y: 0 },
    exit: shouldReduceMotion ? { opacity: 0, y: 0 } : { opacity: 0, y: -8 },
  }

  function renderCsvStep() {
    const uploadStep = csvIncludesModuleStep ? 2 : 1
    const previewStep = csvIncludesModuleStep ? 3 : 2
    const confirmStep = csvIncludesModuleStep ? 4 : 3

    if (csvIncludesModuleStep && step === 1) {
      return (
        <ModuleSelectStep
          onSelect={(m) => {
            setCsvModule(m)
            goTo(uploadStep)
          }}
        />
      )
    }
    if (step === uploadStep && csvModule) {
      return (
        <UploadStep
          module={csvModule}
          onValidated={(session) => {
            setCsvSession(session)
            goTo(previewStep)
          }}
        />
      )
    }
    if (step === previewStep && csvSession && csvModule) {
      return (
        <PreviewStep
          module={csvModule}
          session={csvSession}
          onReupload={() => {
            setCsvSession(null)
            goTo(uploadStep)
          }}
          onCancel={() => onOpenChange(false)}
          onContinue={() => goTo(confirmStep)}
        />
      )
    }
    if (step === confirmStep && csvSession && csvModule) {
      return (
        <ConfirmStep
          module={csvModule}
          session={csvSession}
          onBack={() => goTo(previewStep)}
          onCommitted={() => setCommitted(true)}
          onClose={() => onOpenChange(false)}
        />
      )
    }
    return null
  }

  function renderPdfStep() {
    if (step === 1) {
      return (
        <PdfUploadStep
          onValidated={(session) => {
            setPdfSession(session)
            goTo(2)
          }}
        />
      )
    }
    if (step === 2 && pdfSession) {
      return (
        <PdfPreviewStep
          session={pdfSession}
          onReupload={() => {
            setPdfSession(null)
            goTo(1)
          }}
          onCancel={() => onOpenChange(false)}
          onContinue={() => goTo(3)}
        />
      )
    }
    if (step === 3 && pdfSession) {
      return (
        <PdfConfirmStep
          session={pdfSession}
          onBack={() => goTo(2)}
          onCommitted={() => setCommitted(true)}
          onClose={() => onOpenChange(false)}
        />
      )
    }
    return null
  }

  function renderTitle() {
    if (mode === "picker") return "Import"
    if (mode === "pdf") return "Import from DMT PDFs"
    if (!csvModule) return "Import"
    const config = getImportModuleConfig(csvModule)
    return (
      <>
        Import <span className={config.accentClassName}>{config.label}</span>
      </>
    )
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
                    <div className="flex items-center gap-2">
                      {mode !== "picker" && step === 1 && (
                        <button
                          type="button"
                          onClick={goToPicker}
                          aria-label="Back to import method"
                          className="flex h-7 w-7 items-center justify-center rounded-full text-on-surface-variant transition-colors hover:bg-surface-container-high hover:text-on-surface"
                        >
                          <ArrowLeft className="h-4 w-4" />
                        </button>
                      )}
                      <DialogTitle className="text-[20px] font-semibold tracking-[-0.02em]">
                        {renderTitle()}
                      </DialogTitle>
                    </div>
                  </DialogHeader>

                  {/* Once committed there's no next step to advance to, but the stepper
                      should still show the final step as done, not still "active". */}
                  <div className="px-[26px] pb-[22px] pt-5">
                    <WizardStepper
                      steps={stepperSteps}
                      current={committed ? (stepperSteps?.length ?? 0) + 1 : step}
                    />
                  </div>

                  <div className="relative overflow-hidden px-[26px] pb-[26px] pt-1">
                    <AnimatePresence mode="wait" initial={false}>
                      {mode === "picker" ? (
                        <motion.div
                          key="picker"
                          variants={modeVariants}
                          initial="enter"
                          animate="center"
                          exit="exit"
                          transition={shouldReduceMotion ? { duration: 0.15 } : MODE_TRANSITION}
                        >
                          <ModePickerStep onSelectMode={handleSelectMode} />
                        </motion.div>
                      ) : (
                        <motion.div
                          key={mode}
                          variants={modeVariants}
                          initial="enter"
                          animate="center"
                          exit="exit"
                          transition={shouldReduceMotion ? { duration: 0.15 } : MODE_TRANSITION}
                        >
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
                              {mode === "csv" ? renderCsvStep() : renderPdfStep()}
                            </motion.div>
                          </AnimatePresence>
                        </motion.div>
                      )}
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
