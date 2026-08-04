"use client"

import * as React from "react"
import { toast } from "sonner"

import { Button } from "@/components/ui/button"
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog"
import { Label } from "@/components/ui/label"
import { Textarea } from "@/components/ui/textarea"
import { useTerminateContract } from "@/hooks/queries/use-contracts"
import { getErrorMessage } from "@/lib/get-error-message"
import type { Contract, ContractListItem } from "@/types/contract"

export function TerminateContractDialog({
  contract,
  onOpenChange,
  onTerminated,
}: {
  contract: Contract | ContractListItem | null
  onOpenChange: (open: boolean) => void
  onTerminated?: () => void
}) {
  const [reason, setReason] = React.useState("")
  const terminateMutation = useTerminateContract()

  React.useEffect(() => {
    if (!contract) setReason("")
  }, [contract])

  function handleTerminate() {
    if (!contract) return
    terminateMutation.mutate(
      { id: contract.id, dto: { reason: reason.trim() || undefined } },
      {
        onSuccess: () => {
          toast.success(`Contract ${contract.contractNumber} was terminated.`)
          onOpenChange(false)
          onTerminated?.()
        },
        onError: (error) => {
          toast.error(getErrorMessage(error, "Failed to terminate contract."))
        },
      }
    )
  }

  return (
    <Dialog open={!!contract} onOpenChange={onOpenChange}>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>Terminate contract</DialogTitle>
          <DialogDescription>
            This ends the lease for contract{" "}
            <span className="font-semibold text-on-surface">{contract?.contractNumber}</span> immediately and frees
            up its property for a new tenant. This action cannot be undone.
          </DialogDescription>
        </DialogHeader>
        <div className="space-y-2">
          <Label htmlFor="terminate-reason">Reason (optional)</Label>
          <Textarea
            id="terminate-reason"
            placeholder="e.g. Early termination requested by tenant…"
            rows={3}
            value={reason}
            onChange={(e) => setReason(e.target.value)}
          />
        </div>
        <DialogFooter>
          <Button variant="outline" onClick={() => onOpenChange(false)} disabled={terminateMutation.isPending}>
            Cancel
          </Button>
          <Button variant="destructive" onClick={handleTerminate} disabled={terminateMutation.isPending}>
            {terminateMutation.isPending ? "Terminating…" : "Terminate contract"}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  )
}
