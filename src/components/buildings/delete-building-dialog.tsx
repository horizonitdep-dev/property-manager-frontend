"use client"

import { useMutation, useQueryClient } from "@tanstack/react-query"
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
import { getErrorMessage } from "@/lib/get-error-message"
import { buildingService } from "@/services/building-service"
import type { Building } from "@/types/building"

export function DeleteBuildingDialog({
  building,
  onOpenChange,
}: {
  building: Building | null
  onOpenChange: (open: boolean) => void
}) {
  const queryClient = useQueryClient()

  const deleteMutation = useMutation({
    mutationFn: (id: string) => buildingService.remove(id),
    onSuccess: () => {
      toast.success(`${building?.name ?? "Building"} was deleted.`)
      queryClient.invalidateQueries({ queryKey: ["buildings"] })
      onOpenChange(false)
    },
    onError: (error) => {
      toast.error(getErrorMessage(error, "Failed to delete building."))
    },
  })

  return (
    <Dialog open={!!building} onOpenChange={onOpenChange}>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>Delete building</DialogTitle>
          <DialogDescription>
            This will permanently delete <span className="font-semibold text-on-surface">{building?.name}</span>{" "}
            ({building?.code}). This action cannot be undone.
          </DialogDescription>
        </DialogHeader>
        <DialogFooter>
          <Button variant="outline" onClick={() => onOpenChange(false)} disabled={deleteMutation.isPending}>
            Cancel
          </Button>
          <Button
            variant="destructive"
            onClick={() => building && deleteMutation.mutate(building.id)}
            disabled={deleteMutation.isPending}
          >
            {deleteMutation.isPending ? "Deleting…" : "Delete building"}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  )
}
