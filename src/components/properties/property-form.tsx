"use client"

import * as React from "react"
import { useRouter } from "next/navigation"
import { zodResolver } from "@hookform/resolvers/zod"
import { useQuery } from "@tanstack/react-query"
import { Info, Wallet } from "lucide-react"
import { useForm } from "react-hook-form"
import { toast } from "sonner"

import { BuildingCombobox } from "@/components/properties/building-combobox"
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
import { useCreateProperty, useUpdateProperty } from "@/hooks/queries/use-properties"
import { QUERY_KEYS, ROUTES } from "@/lib/constants"
import { getErrorMessage } from "@/lib/get-error-message"
import {
  PROPERTY_STATUS_DOT_CLASSNAME,
  PROPERTY_STATUS_OPTIONS,
  UNIT_TYPE_OPTIONS,
  UNIT_TYPES_WITHOUT_ROOMS,
} from "@/lib/property-labels"
import { cn } from "@/lib/utils"
import { propertySchema, type PropertyFormInput, type PropertyFormValues } from "@/lib/validation/property"
import { buildingService } from "@/services/building-service"
import type { Property } from "@/types/property"

export function PropertyForm({ property, defaultBuildingId }: { property?: Property; defaultBuildingId?: string }) {
  const router = useRouter()
  const isEdit = !!property

  const buildingsListQuery = { page: 1, limit: 100, sortBy: "name" as const, sortOrder: "asc" as const }
  const buildingsQuery = useQuery({
    queryKey: QUERY_KEYS.buildings(buildingsListQuery),
    queryFn: () => buildingService.list(buildingsListQuery),
  })
  const buildings = buildingsQuery.data?.items ?? []

  const {
    register,
    handleSubmit,
    watch,
    setValue,
    formState: { errors, isSubmitting },
  } = useForm<PropertyFormInput, unknown, PropertyFormValues>({
    resolver: zodResolver(propertySchema),
    defaultValues: {
      unitNumber: property?.unitNumber ?? "",
      buildingId: property?.buildingId ?? defaultBuildingId ?? "",
      floor: property?.floor ?? 0,
      unitType: property?.unitType ?? "APARTMENT",
      bedrooms: property?.bedrooms,
      bathrooms: property?.bathrooms,
      sizeSqm: property?.sizeSqm,
      monthlyRent: property?.monthlyRent,
      status: property?.status ?? "VACANT",
      notes: property?.notes ?? "",
    },
  })

  const unitType = watch("unitType")
  const roomsDisabled = UNIT_TYPES_WITHOUT_ROOMS.includes(unitType)

  React.useEffect(() => {
    if (roomsDisabled) {
      setValue("bedrooms", undefined)
      setValue("bathrooms", undefined)
    }
  }, [roomsDisabled, setValue])

  const createMutation = useCreateProperty()
  const updateMutation = useUpdateProperty()
  const isPending = createMutation.isPending || updateMutation.isPending

  function onSubmit(values: PropertyFormValues) {
    const action = isEdit
      ? updateMutation.mutateAsync({ id: property.id, dto: values })
      : createMutation.mutateAsync(values)

    action
      .then(() => {
        toast.success(isEdit ? "Property unit updated." : "Property unit registered.")
        router.push(ROUTES.properties)
      })
      .catch((error) => {
        toast.error(getErrorMessage(error, "Failed to save property unit."))
      })
  }

  return (
    <form className="space-y-stack-lg" onSubmit={handleSubmit(onSubmit)} noValidate>
      <section className="overflow-hidden rounded-xl border border-outline-variant bg-surface">
        <div className="flex items-center gap-2 border-b border-outline-variant bg-surface-container-low px-6 py-4">
          <Info className="h-4 w-4 text-secondary" />
          <h3 className="font-display text-h2 text-on-surface">Unit Details</h3>
        </div>
        <div className="grid grid-cols-1 gap-6 p-6 md:grid-cols-2">
          <div className="space-y-2">
            <Label htmlFor="unitNumber">Unit Number</Label>
            <Input
              id="unitNumber"
              placeholder="e.g. 101"
              {...register("unitNumber")}
              aria-invalid={!!errors.unitNumber}
            />
            {errors.unitNumber && <p className="text-sm text-error">{errors.unitNumber.message}</p>}
          </div>

          <div className="space-y-2">
            <Label htmlFor="buildingId">Building</Label>
            <BuildingCombobox
              id="buildingId"
              buildings={buildings}
              value={watch("buildingId")}
              onChange={(buildingId) => setValue("buildingId", buildingId, { shouldValidate: true })}
              isLoading={buildingsQuery.isLoading}
            />
            {errors.buildingId && <p className="text-sm text-error">{errors.buildingId.message}</p>}
          </div>

          <div className="space-y-2">
            <Label htmlFor="floor">Floor</Label>
            <Input
              id="floor"
              type="number"
              placeholder="0"
              {...register("floor")}
              aria-invalid={!!errors.floor}
            />
            {errors.floor && <p className="text-sm text-error">{errors.floor.message}</p>}
          </div>

          <div className="space-y-2">
            <Label htmlFor="unitType">Unit Type</Label>
            <Select
              value={watch("unitType")}
              onValueChange={(value) => setValue("unitType", value as PropertyFormValues["unitType"], { shouldValidate: true })}
            >
              <SelectTrigger id="unitType">
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                {UNIT_TYPE_OPTIONS.map((option) => (
                  <SelectItem key={option.value} value={option.value}>
                    {option.label}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
            {errors.unitType && <p className="text-sm text-error">{errors.unitType.message}</p>}
          </div>
        </div>
      </section>

      <section className="overflow-hidden rounded-xl border border-outline-variant bg-surface">
        <div className="flex items-center gap-2 border-b border-outline-variant bg-surface-container-low px-6 py-4">
          <Wallet className="h-4 w-4 text-secondary" />
          <h3 className="font-display text-h2 text-on-surface">Specifications &amp; Financials</h3>
        </div>
        <div className="space-y-6 p-6">
          <div className="grid grid-cols-1 gap-6 md:grid-cols-3">
            <div className={cn("space-y-2", roomsDisabled && "opacity-50")}>
              <Label htmlFor="bedrooms">Bedrooms</Label>
              <Input
                id="bedrooms"
                type="number"
                min={0}
                placeholder="0"
                disabled={roomsDisabled}
                {...register("bedrooms")}
                aria-invalid={!!errors.bedrooms}
              />
              {errors.bedrooms && <p className="text-sm text-error">{errors.bedrooms.message}</p>}
            </div>

            <div className={cn("space-y-2", roomsDisabled && "opacity-50")}>
              <Label htmlFor="bathrooms">Bathrooms</Label>
              <Input
                id="bathrooms"
                type="number"
                min={0}
                placeholder="0"
                disabled={roomsDisabled}
                {...register("bathrooms")}
                aria-invalid={!!errors.bathrooms}
              />
              {errors.bathrooms && <p className="text-sm text-error">{errors.bathrooms.message}</p>}
            </div>

            <div className="space-y-2">
              <Label htmlFor="sizeSqm">Size (sqm)</Label>
              <Input
                id="sizeSqm"
                type="number"
                min={0}
                step="0.01"
                placeholder="0.00"
                {...register("sizeSqm")}
                aria-invalid={!!errors.sizeSqm}
              />
              {errors.sizeSqm && <p className="text-sm text-error">{errors.sizeSqm.message}</p>}
            </div>
          </div>

          <div className="grid grid-cols-1 gap-6 md:grid-cols-2">
            <div className="space-y-2">
              <Label htmlFor="monthlyRent">Monthly Rent (AED)</Label>
              <div className="relative">
                <span className="pointer-events-none absolute left-3 top-1/2 -translate-y-1/2 text-label-sm text-on-surface-variant">
                  AED
                </span>
                <Input
                  id="monthlyRent"
                  type="number"
                  min={0}
                  step="0.01"
                  placeholder="0.00"
                  className="pl-12"
                  {...register("monthlyRent")}
                  aria-invalid={!!errors.monthlyRent}
                />
              </div>
              {errors.monthlyRent && <p className="text-sm text-error">{errors.monthlyRent.message}</p>}
            </div>

            <div className="space-y-2">
              <Label htmlFor="status">Status</Label>
              <Select
                value={watch("status")}
                onValueChange={(value) => setValue("status", value as PropertyFormValues["status"], { shouldValidate: true })}
              >
                <SelectTrigger id="status">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  {PROPERTY_STATUS_OPTIONS.map((option) => (
                    <SelectItem key={option.value} value={option.value}>
                      <span className={cn("mr-2 inline-block h-2 w-2 rounded-full", PROPERTY_STATUS_DOT_CLASSNAME[option.value])} />
                      {option.label}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
              {errors.status && <p className="text-sm text-error">{errors.status.message}</p>}
            </div>
          </div>

          <div className="space-y-2">
            <Label htmlFor="notes">Notes</Label>
            <Textarea
              id="notes"
              placeholder="Enter any additional unit notes…"
              rows={4}
              {...register("notes")}
            />
          </div>
        </div>

        <div className="flex items-center justify-end gap-4 border-t border-outline-variant p-6">
          <Button type="button" variant="outline" onClick={() => router.push(ROUTES.properties)}>
            Cancel
          </Button>
          <Button type="submit" disabled={isSubmitting || isPending}>
            {isPending ? "Saving…" : "Save Property"}
          </Button>
        </div>
      </section>
    </form>
  )
}
