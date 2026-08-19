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
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select"
import { Textarea } from "@/components/ui/textarea"
import {
  useBounceCheque,
  useCancelCheque,
  useClearCheque,
  useDepositCheque,
} from "@/hooks/queries/use-cheques"
import { PAYMENT_KIND_OPTIONS } from "@/lib/finance-labels"
import { getErrorMessage } from "@/lib/get-error-message"
import type { Cheque } from "@/types/cheque"
import type { PaymentKind } from "@/types/payment"

function today() {
  return new Date().toISOString().slice(0, 10)
}

/**
 * Shared shell for the lifecycle dialogs. The error is rendered inline rather
 * than as a toast so an illegal-transition 409 ("Cannot deposit a bounced
 * cheque") stays visible next to the inputs that caused it (spec §7.4).
 */
function ActionDialog({
  open,
  onOpenChange,
  title,
  description,
  confirmLabel,
  pendingLabel,
  destructive,
  isPending,
  error,
  disabled,
  onConfirm,
  children,
}: {
  open: boolean
  onOpenChange: (open: boolean) => void
  title: string
  description: React.ReactNode
  confirmLabel: string
  pendingLabel: string
  destructive?: boolean
  isPending: boolean
  error: string | null
  disabled?: boolean
  onConfirm: () => void
  children?: React.ReactNode
}) {
  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>{title}</DialogTitle>
          <DialogDescription>{description}</DialogDescription>
        </DialogHeader>

        {children && <div className="space-y-4 py-2">{children}</div>}

        {error && (
          <p role="alert" className="rounded-lg bg-error/10 px-4 py-3 text-sm font-medium text-error">
            {error}
          </p>
        )}

        <DialogFooter>
          <Button variant="outline" onClick={() => onOpenChange(false)} disabled={isPending}>
            Cancel
          </Button>
          <Button
            variant={destructive ? "destructive" : "default"}
            onClick={onConfirm}
            disabled={isPending || disabled}
          >
            {isPending ? pendingLabel : confirmLabel}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  )
}

export function DepositChequeDialog({
  cheque,
  onOpenChange,
}: {
  cheque: Cheque | null
  onOpenChange: (open: boolean) => void
}) {
  const mutation = useDepositCheque()
  const [depositedOn, setDepositedOn] = React.useState(today())
  const [error, setError] = React.useState<string | null>(null)

  React.useEffect(() => {
    if (cheque) {
      setDepositedOn(today())
      setError(null)
    }
  }, [cheque])

  function handleConfirm() {
    if (!cheque) return
    setError(null)
    mutation.mutate(
      { id: cheque.id, dto: { depositedOn } },
      {
        onSuccess: () => {
          toast.success(`Cheque ${cheque.chequeNumber} marked as deposited.`)
          onOpenChange(false)
        },
        onError: (err) => setError(getErrorMessage(err, "Failed to deposit cheque.")),
      }
    )
  }

  return (
    <ActionDialog
      open={!!cheque}
      onOpenChange={onOpenChange}
      title="Deposit cheque"
      description={`Record that cheque ${cheque?.chequeNumber ?? ""} was taken to the bank.`}
      confirmLabel="Mark as deposited"
      pendingLabel="Depositing…"
      isPending={mutation.isPending}
      error={error}
      disabled={!depositedOn}
      onConfirm={handleConfirm}
    >
      <div className="space-y-2">
        <Label htmlFor="depositedOn">Deposited On</Label>
        <Input
          id="depositedOn"
          type="date"
          value={depositedOn}
          onChange={(e) => setDepositedOn(e.target.value)}
        />
      </div>
    </ActionDialog>
  )
}

export function ClearChequeDialog({
  cheque,
  onOpenChange,
}: {
  cheque: Cheque | null
  onOpenChange: (open: boolean) => void
}) {
  const mutation = useClearCheque()
  const [clearedOn, setClearedOn] = React.useState(today())
  const [kind, setKind] = React.useState<PaymentKind>("RENT")
  const [notes, setNotes] = React.useState("")
  const [error, setError] = React.useState<string | null>(null)

  React.useEffect(() => {
    if (cheque) {
      setClearedOn(today())
      setKind("RENT")
      setNotes("")
      setError(null)
    }
  }, [cheque])

  function handleConfirm() {
    if (!cheque) return
    setError(null)
    mutation.mutate(
      { id: cheque.id, dto: { clearedOn, kind, notes: notes || undefined } },
      {
        onSuccess: () => {
          toast.success(`Cheque ${cheque.chequeNumber} cleared — a payment was created.`)
          onOpenChange(false)
        },
        onError: (err) => setError(getErrorMessage(err, "Failed to clear cheque.")),
      }
    )
  }

  return (
    <ActionDialog
      open={!!cheque}
      onOpenChange={onOpenChange}
      title="Clear cheque"
      description="Clearing records the money as received and creates a linked payment on this contract."
      confirmLabel="Clear cheque"
      pendingLabel="Clearing…"
      isPending={mutation.isPending}
      error={error}
      disabled={!clearedOn}
      onConfirm={handleConfirm}
    >
      <div className="space-y-2">
        <Label htmlFor="clearedOn">Cleared On</Label>
        <Input id="clearedOn" type="date" value={clearedOn} onChange={(e) => setClearedOn(e.target.value)} />
      </div>

      <div className="space-y-2">
        <Label htmlFor="clearKind">Payment Kind</Label>
        <Select value={kind} onValueChange={(value) => setKind(value as PaymentKind)}>
          <SelectTrigger id="clearKind">
            <SelectValue />
          </SelectTrigger>
          <SelectContent>
            {PAYMENT_KIND_OPTIONS.map((option) => (
              <SelectItem key={option.value} value={option.value}>
                {option.label}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
        <p className="text-sm text-on-surface-variant">Defaults to Rent — change it for a deposit cheque.</p>
      </div>

      <div className="space-y-2">
        <Label htmlFor="clearNotes">Payment Notes (optional)</Label>
        <Textarea
          id="clearNotes"
          rows={2}
          value={notes}
          onChange={(e) => setNotes(e.target.value)}
          placeholder="Recorded on the created payment…"
        />
      </div>
    </ActionDialog>
  )
}

export function BounceChequeDialog({
  cheque,
  onOpenChange,
}: {
  cheque: Cheque | null
  onOpenChange: (open: boolean) => void
}) {
  const mutation = useBounceCheque()
  const [bouncedOn, setBouncedOn] = React.useState(today())
  const [bounceReason, setBounceReason] = React.useState("")
  const [error, setError] = React.useState<string | null>(null)

  React.useEffect(() => {
    if (cheque) {
      setBouncedOn(today())
      setBounceReason("")
      setError(null)
    }
  }, [cheque])

  function handleConfirm() {
    if (!cheque) return
    setError(null)
    mutation.mutate(
      { id: cheque.id, dto: { bouncedOn, bounceReason } },
      {
        onSuccess: () => {
          toast.success(`Cheque ${cheque.chequeNumber} marked as bounced.`)
          onOpenChange(false)
        },
        onError: (err) => setError(getErrorMessage(err, "Failed to bounce cheque.")),
      }
    )
  }

  return (
    <ActionDialog
      open={!!cheque}
      onOpenChange={onOpenChange}
      title="Bounce cheque"
      description="Record that the bank returned this cheque. A reason is required."
      confirmLabel="Mark as bounced"
      pendingLabel="Recording…"
      destructive
      isPending={mutation.isPending}
      error={error}
      disabled={!bouncedOn || !bounceReason.trim()}
      onConfirm={handleConfirm}
    >
      <div className="space-y-2">
        <Label htmlFor="bouncedOn">Bounced On</Label>
        <Input id="bouncedOn" type="date" value={bouncedOn} onChange={(e) => setBouncedOn(e.target.value)} />
      </div>

      <div className="space-y-2">
        <Label htmlFor="bounceReason">Reason</Label>
        <Input
          id="bounceReason"
          placeholder="e.g. Insufficient funds"
          maxLength={500}
          value={bounceReason}
          onChange={(e) => setBounceReason(e.target.value)}
        />
      </div>
    </ActionDialog>
  )
}

export function CancelChequeDialog({
  cheque,
  onOpenChange,
}: {
  cheque: Cheque | null
  onOpenChange: (open: boolean) => void
}) {
  const mutation = useCancelCheque()
  const [notes, setNotes] = React.useState("")
  const [error, setError] = React.useState<string | null>(null)

  React.useEffect(() => {
    if (cheque) {
      setNotes("")
      setError(null)
    }
  }, [cheque])

  function handleConfirm() {
    if (!cheque) return
    setError(null)
    mutation.mutate(
      { id: cheque.id, dto: { notes: notes || undefined } },
      {
        onSuccess: () => {
          toast.success(`Cheque ${cheque.chequeNumber} cancelled.`)
          onOpenChange(false)
        },
        onError: (err) => setError(getErrorMessage(err, "Failed to cancel cheque.")),
      }
    )
  }

  return (
    <ActionDialog
      open={!!cheque}
      onOpenChange={onOpenChange}
      title="Cancel cheque"
      description={`Void cheque ${cheque?.chequeNumber ?? ""} by mutual agreement. Only possible before it is deposited.`}
      confirmLabel="Cancel cheque"
      pendingLabel="Cancelling…"
      destructive
      isPending={mutation.isPending}
      error={error}
      onConfirm={handleConfirm}
    >
      <div className="space-y-2">
        <Label htmlFor="cancelNotes">Reason (optional)</Label>
        <Textarea
          id="cancelNotes"
          rows={2}
          value={notes}
          onChange={(e) => setNotes(e.target.value)}
          placeholder="Recorded on the cheque notes…"
        />
      </div>
    </ActionDialog>
  )
}
