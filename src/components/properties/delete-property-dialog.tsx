"use client"

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
import { useDeleteProperty } from "@/hooks/queries/use-properties"
import { getErrorMessage } from "@/lib/get-error-message"
import type { Property } from "@/types/property"

export function DeletePropertyDialog({
  property,
  onOpenChange,
  onDeleted,
}: {
  property: Property | null
  onOpenChange: (open: boolean) => void
  onDeleted?: () => void
}) {
  const deleteMutation = useDeleteProperty()

  function handleDelete() {
    if (!property) return
    deleteMutation.mutate(property.id, {
      onSuccess: () => {
        toast.success(`Unit ${property.unitNumber} was deleted.`)
        onOpenChange(false)
        onDeleted?.()
      },
      onError: (error) => {
        toast.error(getErrorMessage(error, "Failed to delete property unit."))
      },
    })
  }

  return (
    <Dialog open={!!property} onOpenChange={onOpenChange}>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>Delete property unit</DialogTitle>
          <DialogDescription>
            This will permanently delete unit{" "}
            <span className="font-semibold text-on-surface">{property?.unitNumber}</span>
            {property?.building ? <> in {property.building.name}</> : null}. This action cannot be undone.
          </DialogDescription>
        </DialogHeader>
        <DialogFooter>
          <Button variant="outline" onClick={() => onOpenChange(false)} disabled={deleteMutation.isPending}>
            Cancel
          </Button>
          <Button variant="destructive" onClick={handleDelete} disabled={deleteMutation.isPending}>
            {deleteMutation.isPending ? "Deleting…" : "Delete unit"}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  )
}
