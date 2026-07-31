"use client"

import * as React from "react"
import { useRouter } from "next/navigation"
import { zodResolver } from "@hookform/resolvers/zod"
import { Building2, IdCard, Info } from "lucide-react"
import { useForm } from "react-hook-form"
import { toast } from "sonner"

import { AnimatedFieldGroup } from "@/components/tenants/animated-field-group"
import { NationalityCombobox } from "@/components/tenants/nationality-combobox"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Textarea } from "@/components/ui/textarea"
import { useCreateTenant, useUpdateTenant } from "@/hooks/queries/use-tenants"
import { ROUTES } from "@/lib/constants"
import { getErrorMessage } from "@/lib/get-error-message"
import { TENANT_STATUS_OPTIONS } from "@/lib/tenant-labels"
import { cn } from "@/lib/utils"
import {
  COMPANY_ONLY_FIELDS,
  INDIVIDUAL_ONLY_FIELDS,
  tenantSchema,
  type TenantFormInput,
  type TenantFormValues,
} from "@/lib/validation/tenant"
import type { Tenant } from "@/types/tenant"

function toDateInputValue(value?: string | null): string {
  return value ? value.slice(0, 10) : ""
}

export function TenantForm({ tenant }: { tenant?: Tenant }) {
  const router = useRouter()
  const isEdit = !!tenant

  const {
    register,
    handleSubmit,
    watch,
    setValue,
    formState: { errors, isSubmitting },
  } = useForm<TenantFormInput, unknown, TenantFormValues>({
    resolver: zodResolver(tenantSchema),
    defaultValues: {
      tenantType: tenant?.tenantType ?? "INDIVIDUAL",
      nameEn: tenant?.nameEn ?? "",
      nameAr: tenant?.nameAr ?? "",
      phone: tenant?.phone ?? "",
      alternatePhone: tenant?.alternatePhone ?? "",
      email: tenant?.email ?? "",
      nationality: tenant?.nationality ?? "",
      emiratesIdNumber: tenant?.emiratesIdNumber ?? "",
      emiratesIdExpiry: toDateInputValue(tenant?.emiratesIdExpiry),
      passportNumber: tenant?.passportNumber ?? "",
      passportExpiry: toDateInputValue(tenant?.passportExpiry),
      tradeLicenseNumber: tenant?.tradeLicenseNumber ?? "",
      tradeLicenseExpiry: toDateInputValue(tenant?.tradeLicenseExpiry),
      authorizedPersonNameEn: tenant?.authorizedPersonNameEn ?? "",
      authorizedPersonNameAr: tenant?.authorizedPersonNameAr ?? "",
      authorizedPersonOccupation: tenant?.authorizedPersonOccupation ?? "",
      authorizedPersonPhone: tenant?.authorizedPersonPhone ?? "",
      status: tenant?.status ?? "ACTIVE",
      notes: tenant?.notes ?? "",
    },
  })

  const tenantType = watch("tenantType")

  // Clear the hidden group's values on every switch — otherwise a Company
  // tenant could quietly carry a leftover Emirates ID (or vice versa) into
  // the submitted payload, since react-hook-form keeps field values around
  // after the input unmounts.
  React.useEffect(() => {
    const fieldsToClear = tenantType === "INDIVIDUAL" ? COMPANY_ONLY_FIELDS : INDIVIDUAL_ONLY_FIELDS
    fieldsToClear.forEach((field) => setValue(field, "", { shouldValidate: false, shouldDirty: false }))
  }, [tenantType, setValue])

  const createMutation = useCreateTenant()
  const updateMutation = useUpdateTenant()
  const isPending = createMutation.isPending || updateMutation.isPending

  function onSubmit(values: TenantFormValues) {
    const action = isEdit
      ? updateMutation.mutateAsync({ id: tenant.id, dto: values })
      : createMutation.mutateAsync(values)

    action
      .then(() => {
        toast.success(isEdit ? "Tenant updated." : "Tenant registered.")
        router.push(isEdit ? ROUTES.tenantDetail(tenant.id) : ROUTES.tenants)
      })
      .catch((error) => {
        toast.error(getErrorMessage(error, "Failed to save tenant."))
      })
  }

  function goBack() {
    router.push(isEdit ? ROUTES.tenantDetail(tenant.id) : ROUTES.tenants)
  }

  return (
    <form className="space-y-stack-lg" onSubmit={handleSubmit(onSubmit)} noValidate>
      <section className="flex items-center justify-between rounded-xl border border-outline-variant bg-surface p-4">
        <span className="text-label-sm uppercase tracking-wider text-on-surface-variant">Onboarding Type</span>
        <div className="flex gap-1 rounded-lg bg-surface-container p-1">
          {(["INDIVIDUAL", "COMPANY"] as const).map((type) => (
            <button
              key={type}
              type="button"
              onClick={() => setValue("tenantType", type, { shouldValidate: true })}
              className={cn(
                "rounded-md px-4 py-1.5 text-sm font-medium transition-colors",
                tenantType === type
                  ? "bg-surface text-primary shadow-sm"
                  : "text-on-surface-variant hover:bg-surface-container-high"
              )}
            >
              {type === "INDIVIDUAL" ? "Individual" : "Company"}
            </button>
          ))}
        </div>
      </section>

      <section className="rounded-xl border border-outline-variant bg-surface">
        <div className="flex items-center gap-2 rounded-t-xl border-b border-outline-variant bg-surface-container-low px-6 py-4">
          <Info className="h-4 w-4 text-secondary" />
          <h3 className="font-display text-h2 text-on-surface">General Information</h3>
        </div>
        <div className="grid grid-cols-1 gap-6 p-6 md:grid-cols-2">
          <div className="space-y-2">
            <Label htmlFor="nameEn">Full Name (English)</Label>
            <Input
              id="nameEn"
              placeholder="e.g. Ahmed Al Mansoori"
              {...register("nameEn")}
              aria-invalid={!!errors.nameEn}
            />
            {errors.nameEn && <p className="text-sm text-error">{errors.nameEn.message}</p>}
          </div>

          <div className="space-y-2">
            <Label htmlFor="nameAr">Full Name (Arabic)</Label>
            <Input
              id="nameAr"
              dir="rtl"
              className="text-right"
              placeholder="الاسم الكامل"
              {...register("nameAr")}
              aria-invalid={!!errors.nameAr}
            />
            {errors.nameAr && <p className="text-sm text-error">{errors.nameAr.message}</p>}
          </div>

          <div className="space-y-2">
            <Label htmlFor="phone">Phone Number</Label>
            <Input
              id="phone"
              type="tel"
              placeholder="+971 5X XXX XXXX"
              {...register("phone")}
              aria-invalid={!!errors.phone}
            />
            {errors.phone && <p className="text-sm text-error">{errors.phone.message}</p>}
          </div>

          <div className="space-y-2">
            <Label htmlFor="alternatePhone">Alternate Phone</Label>
            <Input
              id="alternatePhone"
              type="tel"
              placeholder="+971 ..."
              {...register("alternatePhone")}
              aria-invalid={!!errors.alternatePhone}
            />
            {errors.alternatePhone && <p className="text-sm text-error">{errors.alternatePhone.message}</p>}
          </div>

          <div className="space-y-2">
            <Label htmlFor="email">Email Address</Label>
            <Input
              id="email"
              type="email"
              placeholder="tenant@example.com"
              {...register("email")}
              aria-invalid={!!errors.email}
            />
            {errors.email && <p className="text-sm text-error">{errors.email.message}</p>}
          </div>

          <div className="space-y-2">
            <Label htmlFor="status">Status</Label>
            <div id="status" className="flex gap-2 rounded-lg bg-surface-container p-1">
              {TENANT_STATUS_OPTIONS.map((option) => {
                const isActive = watch("status") === option.value
                return (
                  <button
                    key={option.value}
                    type="button"
                    onClick={() => setValue("status", option.value, { shouldValidate: true })}
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

          <div className="col-span-full space-y-2">
            <Label htmlFor="notes">Notes</Label>
            <Textarea
              id="notes"
              placeholder="Add any specific observations or internal notes…"
              rows={3}
              {...register("notes")}
            />
          </div>
        </div>
      </section>

      <AnimatedFieldGroup activeKey={tenantType}>
        {tenantType === "COMPANY" ? (
          <section className="rounded-xl border border-outline-variant bg-surface">
            <div className="flex items-center gap-2 rounded-t-xl border-b border-outline-variant bg-surface-container-low px-6 py-4">
              <Building2 className="h-4 w-4 text-secondary" />
              <h3 className="font-display text-h2 text-on-surface">Corporate Credentials</h3>
            </div>
            <div className="grid grid-cols-1 gap-6 p-6 md:grid-cols-2">
              <div className="space-y-2">
                <Label htmlFor="tradeLicenseNumber">Trade License Number</Label>
                <Input
                  id="tradeLicenseNumber"
                  placeholder="CN-XXXXXXX"
                  {...register("tradeLicenseNumber")}
                  aria-invalid={!!errors.tradeLicenseNumber}
                />
                {errors.tradeLicenseNumber && (
                  <p className="text-sm text-error">{errors.tradeLicenseNumber.message}</p>
                )}
              </div>

              <div className="space-y-2">
                <Label htmlFor="tradeLicenseExpiry">Trade License Expiry</Label>
                <Input
                  id="tradeLicenseExpiry"
                  type="date"
                  {...register("tradeLicenseExpiry")}
                  aria-invalid={!!errors.tradeLicenseExpiry}
                />
                {errors.tradeLicenseExpiry && (
                  <p className="text-sm text-error">{errors.tradeLicenseExpiry.message}</p>
                )}
              </div>

              <div className="space-y-2">
                <Label htmlFor="authorizedPersonNameEn">Authorized Person (English)</Label>
                <Input
                  id="authorizedPersonNameEn"
                  placeholder="Manager Name"
                  {...register("authorizedPersonNameEn")}
                  aria-invalid={!!errors.authorizedPersonNameEn}
                />
                {errors.authorizedPersonNameEn && (
                  <p className="text-sm text-error">{errors.authorizedPersonNameEn.message}</p>
                )}
              </div>

              <div className="space-y-2">
                <Label htmlFor="authorizedPersonNameAr">Authorized Person (Arabic)</Label>
                <Input
                  id="authorizedPersonNameAr"
                  dir="rtl"
                  className="text-right"
                  placeholder="اسم الشخص المخول"
                  {...register("authorizedPersonNameAr")}
                  aria-invalid={!!errors.authorizedPersonNameAr}
                />
                {errors.authorizedPersonNameAr && (
                  <p className="text-sm text-error">{errors.authorizedPersonNameAr.message}</p>
                )}
              </div>

              <div className="space-y-2">
                <Label htmlFor="authorizedPersonOccupation">Occupation</Label>
                <Input
                  id="authorizedPersonOccupation"
                  placeholder="e.g. Managing Director"
                  {...register("authorizedPersonOccupation")}
                  aria-invalid={!!errors.authorizedPersonOccupation}
                />
                {errors.authorizedPersonOccupation && (
                  <p className="text-sm text-error">{errors.authorizedPersonOccupation.message}</p>
                )}
              </div>

              <div className="space-y-2">
                <Label htmlFor="authorizedPersonPhone">Authorized Person Phone</Label>
                <Input
                  id="authorizedPersonPhone"
                  type="tel"
                  placeholder="+971 ..."
                  {...register("authorizedPersonPhone")}
                  aria-invalid={!!errors.authorizedPersonPhone}
                />
                {errors.authorizedPersonPhone && (
                  <p className="text-sm text-error">{errors.authorizedPersonPhone.message}</p>
                )}
              </div>
            </div>
          </section>
        ) : (
          <section className="rounded-xl border border-outline-variant bg-surface">
            <div className="flex items-center gap-2 rounded-t-xl border-b border-outline-variant bg-surface-container-low px-6 py-4">
              <IdCard className="h-4 w-4 text-secondary" />
              <h3 className="font-display text-h2 text-on-surface">Personal Identification</h3>
            </div>
            <div className="grid grid-cols-1 gap-6 p-6 md:grid-cols-2">
              <div className="col-span-full space-y-2">
                <Label htmlFor="nationality">Nationality</Label>
                <NationalityCombobox
                  id="nationality"
                  value={watch("nationality") ?? ""}
                  onChange={(value) => setValue("nationality", value, { shouldValidate: true })}
                />
                {errors.nationality && <p className="text-sm text-error">{errors.nationality.message}</p>}
              </div>

              <div className="space-y-2">
                <Label htmlFor="emiratesIdNumber">Emirates ID Number</Label>
                <Input
                  id="emiratesIdNumber"
                  placeholder="784-XXXX-XXXXXXX-X"
                  {...register("emiratesIdNumber")}
                  aria-invalid={!!errors.emiratesIdNumber}
                />
                {errors.emiratesIdNumber && <p className="text-sm text-error">{errors.emiratesIdNumber.message}</p>}
              </div>

              <div className="space-y-2">
                <Label htmlFor="emiratesIdExpiry">Emirates ID Expiry</Label>
                <Input
                  id="emiratesIdExpiry"
                  type="date"
                  {...register("emiratesIdExpiry")}
                  aria-invalid={!!errors.emiratesIdExpiry}
                />
                {errors.emiratesIdExpiry && <p className="text-sm text-error">{errors.emiratesIdExpiry.message}</p>}
              </div>

              <div className="space-y-2">
                <Label htmlFor="passportNumber">Passport Number</Label>
                <Input
                  id="passportNumber"
                  placeholder="Passport No."
                  {...register("passportNumber")}
                  aria-invalid={!!errors.passportNumber}
                />
                {errors.passportNumber && <p className="text-sm text-error">{errors.passportNumber.message}</p>}
              </div>

              <div className="space-y-2">
                <Label htmlFor="passportExpiry">Passport Expiry</Label>
                <Input
                  id="passportExpiry"
                  type="date"
                  {...register("passportExpiry")}
                  aria-invalid={!!errors.passportExpiry}
                />
                {errors.passportExpiry && <p className="text-sm text-error">{errors.passportExpiry.message}</p>}
              </div>
            </div>
          </section>
        )}
      </AnimatedFieldGroup>

      <div className="flex items-center justify-end gap-4 rounded-xl border border-outline-variant bg-surface p-6">
        <Button type="button" variant="outline" onClick={goBack}>
          Cancel
        </Button>
        <Button type="submit" disabled={isSubmitting || isPending}>
          {isPending ? "Saving…" : "Save Tenant"}
        </Button>
      </div>
    </form>
  )
}
