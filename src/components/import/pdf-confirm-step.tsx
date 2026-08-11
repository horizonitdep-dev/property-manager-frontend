"use client"

import Link from "next/link"
import { AnimatePresence, motion, useReducedMotion } from "framer-motion"
import { AlertCircle } from "lucide-react"

import { Button } from "@/components/ui/button"
import { CountUpNumber, SuccessCheckAnimation } from "@/components/import/success-check"
import { useCommitPdfImport } from "@/hooks/queries/use-pdf-import"
import { ROUTES } from "@/lib/constants"
import { getErrorMessage } from "@/lib/get-error-message"
import type { ImportRowResult } from "@/types/import"
import type { PdfImportSession } from "@/types/import-pdf"

const SPRING = [0.22, 1, 0.36, 1] as const

function validCount(rows: ImportRowResult[]) {
  return rows.filter((row) => row.status === "VALID").length
}

export function PdfConfirmStep({
  session,
  onBack,
  onCommitted,
  onClose,
}: {
  session: PdfImportSession
  onBack: () => void
  onCommitted: () => void
  onClose: () => void
}) {
  const commitMutation = useCommitPdfImport()
  const animateIn = !useReducedMotion()

  const buildings = validCount(session.buildingRows)
  const properties = validCount(session.propertyRows)
  const tenants = validCount(session.tenantRows)
  const contracts = validCount(session.contractRows)
  const totalValid = buildings + properties + tenants + contracts

  function handleConfirm() {
    commitMutation.mutate(
      { contractSessionId: session.contractSessionId },
      { onSuccess: () => onCommitted() }
    )
  }

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
              <CountUpNumber value={commitMutation.data.contractsCreated ?? 0} animateIn={animateIn} />{" "}
              {(commitMutation.data.contractsCreated ?? 0) === 1 ? "contract" : "contracts"} imported
            </h3>
          </motion.div>

          <motion.p
            className="text-body-md text-on-surface-variant"
            initial={animateIn ? { opacity: 0, y: 10 } : false}
            animate={{ opacity: 1, y: 0 }}
            transition={animateIn ? { duration: 0.55, delay: 0.86, ease: SPRING } : { duration: 0 }}
          >
            {commitMutation.data.buildingsCreated ?? 0} building(s), {commitMutation.data.propertiesCreated ?? 0}{" "}
            propert{(commitMutation.data.propertiesCreated ?? 0) === 1 ? "y" : "ies"}, and{" "}
            {commitMutation.data.tenantsCreated ?? 0} tenant(s) were also created. Your lists have already been
            refreshed.
          </motion.p>

          {(commitMutation.data.contractFailures?.length ?? 0) > 0 && (
            <motion.div
              className="w-full rounded-lg bg-error/10 px-4 py-3 text-left"
              initial={animateIn ? { opacity: 0, y: 10 } : false}
              animate={{ opacity: 1, y: 0 }}
              transition={animateIn ? { duration: 0.55, delay: 0.9, ease: SPRING } : { duration: 0 }}
            >
              <p className="flex items-center gap-2 text-sm font-semibold text-error">
                <AlertCircle className="h-4 w-4 shrink-0" />
                {commitMutation.data.contractFailures.length} contract row
                {commitMutation.data.contractFailures.length === 1 ? "" : "s"} could not be imported
              </p>
              <ul className="mt-1 space-y-0.5 text-sm text-error/90">
                {commitMutation.data.contractFailures.map((failure) => (
                  <li key={failure.rowNumber}>
                    Row {failure.rowNumber}: {failure.reason}
                  </li>
                ))}
              </ul>
            </motion.div>
          )}

          <motion.div
            className="flex gap-2"
            initial={animateIn ? { opacity: 0, y: 10 } : false}
            animate={{ opacity: 1, y: 0 }}
            transition={animateIn ? { duration: 0.55, delay: 0.96, ease: SPRING } : { duration: 0 }}
          >
            <Button asChild variant="outline" onClick={onClose}>
              <Link href={ROUTES.contracts}>View Contracts</Link>
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
              Import {totalValid} row{totalValid === 1 ? "" : "s"}?
            </h3>
            <p className="mt-2 text-body-md text-on-surface-variant">
              Will create {buildings} building(s), {properties} properties, {tenants} tenants, {contracts} contracts.
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
              {commitMutation.isPending
                ? "Importing…"
                : commitMutation.isError
                  ? "Retry Import"
                  : "Confirm Import"}
            </Button>
          </div>
        </motion.div>
      )}
    </AnimatePresence>
  )
}
