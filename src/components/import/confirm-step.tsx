"use client"

import Link from "next/link"
import { AnimatePresence, motion, useReducedMotion } from "framer-motion"
import { AlertCircle } from "lucide-react"

import { Button } from "@/components/ui/button"
import { CountUpNumber, SuccessCheckAnimation } from "@/components/import/success-check"
import { useCommitImport } from "@/hooks/queries/use-import"
import { getErrorMessage } from "@/lib/get-error-message"
import { getImportModuleConfig } from "@/lib/import-labels"
import type { ImportModuleKey, ImportSession } from "@/types/import"

const SPRING = [0.22, 1, 0.36, 1] as const

export function ConfirmStep({
  module,
  session,
  onBack,
  onCommitted,
  onClose,
}: {
  module: ImportModuleKey
  session: ImportSession
  onBack: () => void
  onCommitted: () => void
  onClose: () => void
}) {
  const config = getImportModuleConfig(module)
  const commitMutation = useCommitImport(module)
  const animateIn = !useReducedMotion()

  function handleConfirm() {
    commitMutation.mutate(session.id, { onSuccess: () => onCommitted() })
  }

  // Confirm -> Success happens without the wizard's own step index changing
  // (both live at step 3), so that outer step-slide transition never fires
  // between them. This AnimatePresence gives that hand-off its own fade
  // instead of an instant cut from the blue confirm card to the green result.
  return (
    <AnimatePresence mode="wait" initial={false}>
      {commitMutation.isSuccess ? (
        <motion.div
          key="success"
          initial={animateIn ? { opacity: 0 } : false}
          animate={{ opacity: 1 }}
          transition={animateIn ? { duration: 0.3, ease: "easeOut" } : { duration: 0 }}
          className="flex flex-col items-center gap-4 py-10 text-center"
        >
          <SuccessCheckAnimation animateIn={animateIn} />

          <motion.div
            initial={animateIn ? { opacity: 0, y: 10 } : false}
            animate={{ opacity: 1, y: 0 }}
            transition={animateIn ? { duration: 0.55, delay: 0.76, ease: SPRING } : { duration: 0 }}
          >
            <h3 className="font-display text-body-lg font-semibold text-on-surface">
              <CountUpNumber value={commitMutation.data.inserted} animateIn={animateIn} />{" "}
              {commitMutation.data.inserted === 1 ? config.singularLabel : config.label.toLowerCase()} imported
            </h3>
          </motion.div>

          <motion.p
            className="text-body-md text-on-surface-variant"
            initial={animateIn ? { opacity: 0, y: 10 } : false}
            animate={{ opacity: 1, y: 0 }}
            transition={animateIn ? { duration: 0.55, delay: 0.86, ease: SPRING } : { duration: 0 }}
          >
            Your list has already been refreshed.
          </motion.p>

          <motion.div
            className="flex gap-2"
            initial={animateIn ? { opacity: 0, y: 10 } : false}
            animate={{ opacity: 1, y: 0 }}
            transition={animateIn ? { duration: 0.55, delay: 0.96, ease: SPRING } : { duration: 0 }}
          >
            <Button asChild variant="outline" onClick={onClose}>
              <Link href={config.listRoute}>View {config.label}</Link>
            </Button>
            <Button onClick={onClose}>Close</Button>
          </motion.div>
        </motion.div>
      ) : (
        <motion.div
          key="confirm"
          initial={false}
          exit={animateIn ? { opacity: 0, scale: 0.98 } : { opacity: 0 }}
          transition={animateIn ? { duration: 0.25, ease: "easeOut" } : { duration: 0 }}
          className="space-y-6"
        >
          <div className="rounded-xl border border-outline-variant bg-surface-container-low p-6 text-center">
            <h3 className="font-display text-body-lg font-semibold text-on-surface">
              Import {session.validRows} {config.label.toLowerCase()}?
            </h3>
            <p className="mt-2 text-body-md text-on-surface-variant">
              {session.errorRows > 0
                ? `${session.validRows} valid rows will be created. ${session.errorRows} error rows will be skipped.`
                : `All ${session.validRows} rows will be created.`}
            </p>
          </div>

          {commitMutation.isError && (
            <div className="flex items-start gap-3 rounded-lg bg-error/10 px-4 py-3">
              <AlertCircle className="mt-0.5 h-4 w-4 shrink-0 text-error" />
              <div className="text-sm text-error">
                <p className="font-semibold">Nothing was imported — the commit was rolled back.</p>
                <p className="mt-1">{getErrorMessage(commitMutation.error, "Failed to commit the import.")}</p>
              </div>
            </div>
          )}

          <div className="flex items-center justify-between border-t border-outline-variant pt-4">
            <Button type="button" variant="outline" onClick={onBack} disabled={commitMutation.isPending}>
              Back to Preview
            </Button>
            <Button type="button" onClick={handleConfirm} disabled={commitMutation.isPending}>
              {commitMutation.isPending ? "Importing…" : "Confirm Import"}
            </Button>
          </div>
        </motion.div>
      )}
    </AnimatePresence>
  )
}
