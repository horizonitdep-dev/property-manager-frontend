"use client"

import { useRouter } from "next/navigation"
import { zodResolver } from "@hookform/resolvers/zod"
import { useMutation, useQueryClient } from "@tanstack/react-query"
import { useForm } from "react-hook-form"
import { toast } from "sonner"

import { Button } from "@/components/ui/button"
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
import { BUILDING_TYPE_OPTIONS, CONSTRUCTION_STATUS_OPTIONS } from "@/lib/building-labels"
import { ROUTES } from "@/lib/constants"
import { getErrorMessage } from "@/lib/get-error-message"
import { cn } from "@/lib/utils"
import { buildingSchema, type BuildingFormInput, type BuildingFormValues } from "@/lib/validation/building"
import { buildingService } from "@/services/building-service"
import type { Building } from "@/types/building"

export function BuildingForm({ building }: { building?: Building }) {
  const router = useRouter()
  const queryClient = useQueryClient()
  const isEdit = !!building

  const {
    register,
    handleSubmit,
    watch,
    setValue,
    formState: { errors, isSubmitting },
  } = useForm<BuildingFormInput, unknown, BuildingFormValues>({
    resolver: zodResolver(buildingSchema),
    defaultValues: {
      name: building?.name ?? "",
      code: building?.code ?? "",
      address: building?.address ?? "",
      city: building?.city ?? "",
      buildingType: building?.buildingType ?? "RESIDENTIAL",
      totalFloors: building?.totalFloors ?? 1,
      totalUnits: building?.totalUnits,
      yearBuilt: building?.yearBuilt,
      constructionStatus: building?.constructionStatus ?? "COMPLETE",
      notes: building?.notes ?? "",
    },
  })

  const mutation = useMutation({
    mutationFn: (values: BuildingFormValues) =>
      isEdit ? buildingService.update(building.id, values) : buildingService.create(values),
    onSuccess: () => {
      toast.success(isEdit ? "Building updated." : "Building registered.")
      queryClient.invalidateQueries({ queryKey: ["buildings"] })
      router.push(ROUTES.buildings)
    },
    onError: (error) => {
      toast.error(getErrorMessage(error, "Failed to save building."))
    },
  })

  return (
    <form className="space-y-stack-lg" onSubmit={handleSubmit((values) => mutation.mutate(values))} noValidate>
      <section className="space-y-6 rounded-xl border border-outline-variant bg-surface p-8">
        <div className="grid grid-cols-1 gap-6 md:grid-cols-2">
          <div className="col-span-full">
            <h3 className="border-b border-outline-variant pb-4 font-heading text-h2 text-on-surface">
              Primary Identification
            </h3>
          </div>

          <div className="space-y-2">
            <Label htmlFor="name">Building Name</Label>
            <Input id="name" placeholder="e.g. Horizon Tower A" {...register("name")} aria-invalid={!!errors.name} />
            {errors.name && <p className="text-sm text-error">{errors.name.message}</p>}
          </div>

          <div className="space-y-2">
            <Label htmlFor="code">Building Code</Label>
            <Input
              id="code"
              placeholder="B-DXB-2024-001"
              className="font-mono"
              {...register("code")}
              aria-invalid={!!errors.code}
            />
            {errors.code && <p className="text-sm text-error">{errors.code.message}</p>}
          </div>

          <div className="col-span-full pt-4">
            <h3 className="border-b border-outline-variant pb-4 font-heading text-h2 text-on-surface">
              Geographical Parameters
            </h3>
          </div>

          <div className="col-span-full space-y-2">
            <Label htmlFor="address">Address</Label>
            <Textarea
              id="address"
              placeholder="Street name, plot number, sector…"
              rows={2}
              {...register("address")}
              aria-invalid={!!errors.address}
            />
            {errors.address && <p className="text-sm text-error">{errors.address.message}</p>}
          </div>

          <div className="space-y-2">
            <Label htmlFor="city">City</Label>
            <Input id="city" placeholder="e.g. Abu Dhabi" {...register("city")} aria-invalid={!!errors.city} />
            {errors.city && <p className="text-sm text-error">{errors.city.message}</p>}
          </div>

          <div className="space-y-2">
            <Label htmlFor="buildingType">Building Type</Label>
            <Select
              value={watch("buildingType")}
              onValueChange={(value) => setValue("buildingType", value as BuildingFormValues["buildingType"], { shouldValidate: true })}
            >
              <SelectTrigger id="buildingType">
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                {BUILDING_TYPE_OPTIONS.map((option) => (
                  <SelectItem key={option.value} value={option.value}>
                    {option.label}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
            {errors.buildingType && <p className="text-sm text-error">{errors.buildingType.message}</p>}
          </div>

          <div className="col-span-full pt-4">
            <h3 className="border-b border-outline-variant pb-4 font-heading text-h2 text-on-surface">
              Structural Engineering
            </h3>
          </div>

          <div className="space-y-2">
            <Label htmlFor="totalFloors">Total Floors</Label>
            <Input
              id="totalFloors"
              type="number"
              min={1}
              max={200}
              placeholder="0"
              {...register("totalFloors")}
              aria-invalid={!!errors.totalFloors}
            />
            {errors.totalFloors && <p className="text-sm text-error">{errors.totalFloors.message}</p>}
          </div>

          <div className="space-y-2">
            <Label htmlFor="totalUnits">Total Units</Label>
            <Input
              id="totalUnits"
              type="number"
              min={0}
              placeholder="0"
              {...register("totalUnits")}
              aria-invalid={!!errors.totalUnits}
            />
            {errors.totalUnits && <p className="text-sm text-error">{errors.totalUnits.message}</p>}
          </div>

          <div className="space-y-2">
            <Label htmlFor="yearBuilt">Year Built</Label>
            <Input
              id="yearBuilt"
              type="number"
              placeholder="YYYY"
              {...register("yearBuilt")}
              aria-invalid={!!errors.yearBuilt}
            />
            {errors.yearBuilt && <p className="text-sm text-error">{errors.yearBuilt.message}</p>}
          </div>

          <div className="space-y-2">
            <Label htmlFor="constructionStatus">Construction Status</Label>
            <div id="constructionStatus" className="flex gap-2 rounded-lg bg-surface-container p-1">
              {CONSTRUCTION_STATUS_OPTIONS.map((option) => {
                const isActive = watch("constructionStatus") === option.value
                return (
                  <button
                    key={option.value}
                    type="button"
                    onClick={() => setValue("constructionStatus", option.value, { shouldValidate: true })}
                    className={cn(
                      "flex-1 rounded-md py-2 text-xs font-bold transition-colors",
                      isActive
                        ? "border border-outline-variant bg-surface text-primary shadow-sm"
                        : "text-on-surface-variant hover:bg-surface-container-high"
                    )}
                  >
                    {option.label}
                  </button>
                )
              })}
            </div>
          </div>

          <div className="col-span-full space-y-2 pt-4">
            <Label htmlFor="notes">Notes</Label>
            <Textarea
              id="notes"
              placeholder="Additional contextual details or historical maintenance notes…"
              rows={4}
              {...register("notes")}
            />
          </div>
        </div>

        <div className="flex items-center justify-end gap-4 border-t border-outline-variant pt-8">
          <Button type="button" variant="outline" onClick={() => router.push(ROUTES.buildings)}>
            Cancel
          </Button>
          <Button type="submit" disabled={isSubmitting || mutation.isPending}>
            {mutation.isPending ? "Saving…" : "Save Building"}
          </Button>
        </div>
      </section>
    </form>
  )
}
