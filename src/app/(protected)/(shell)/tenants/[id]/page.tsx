"use client"

import * as React from "react"
import Link from "next/link"
import { useParams, useRouter } from "next/navigation"
import { ArrowLeft, Building2, IdCard, Pencil, Trash2 } from "lucide-react"

import { DeleteTenantDialog } from "@/components/tenants/delete-tenant-dialog"
import { TenantDocumentsSection } from "@/components/tenants/tenant-documents-section"
import { RoleGate } from "@/components/role-gate"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { Skeleton } from "@/components/ui/skeleton"
import { useTenant } from "@/hooks/queries/use-tenants"
import { usePageHeader } from "@/hooks/use-page-header"
import { ROUTES } from "@/lib/constants"
import { TENANT_STATUS_BADGE_CLASSNAME, TENANT_STATUS_LABELS, TENANT_TYPE_LABELS } from "@/lib/tenant-labels"

function Field({ label, value, rtl }: { label: string; value: React.ReactNode; rtl?: boolean }) {
  return (
    <div className="space-y-1">
      <p className="text-label-sm uppercase text-on-surface-variant">{label}</p>
      <p className={rtl ? "text-right text-body-md text-on-surface" : "text-body-md text-on-surface"} dir={rtl ? "rtl" : undefined}>
        {value}
      </p>
    </div>
  )
}

function formatDate(value?: string | null): string {
  if (!value) return "—"
  const date = new Date(value)
  const day = String(date.getUTCDate()).padStart(2, "0")
  const month = String(date.getUTCMonth() + 1).padStart(2, "0")
  const year = date.getUTCFullYear()
  return `${day}-${month}-${year}`
}

export default function TenantDetailPage() {
  const params = useParams<{ id: string }>()
  const router = useRouter()
  const [confirmingDelete, setConfirmingDelete] = React.useState(false)

  const tenantQuery = useTenant(params.id)
  const tenant = tenantQuery.data

  usePageHeader({
    title: tenant?.nameEn ?? "Tenant",
    subtitle: tenant ? TENANT_TYPE_LABELS[tenant.tenantType] : "Tenant details",
  })

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <Button asChild variant="ghost" size="sm" className="-ml-3">
          <Link href={ROUTES.tenants}>
            <ArrowLeft className="h-4 w-4" /> Back to Tenants
          </Link>
        </Button>
        {tenant && (
          <RoleGate allowedRoles={["MANAGER"]}>
            <div className="flex gap-2">
              <Button asChild variant="outline">
                <Link href={ROUTES.tenantEdit(tenant.id)}>
                  <Pencil className="h-4 w-4" /> Edit
                </Link>
              </Button>
              <Button variant="destructive" onClick={() => setConfirmingDelete(true)}>
                <Trash2 className="h-4 w-4" /> Delete
              </Button>
            </div>
          </RoleGate>
        )}
      </div>

      {tenantQuery.isLoading ? (
        <div className="space-y-4 rounded-xl border border-outline-variant bg-surface p-8">
          <Skeleton className="h-6 w-48" />
          <Skeleton className="h-24 w-full" />
        </div>
      ) : tenantQuery.isError ? (
        <div className="rounded-xl border border-outline-variant bg-surface py-16 text-center">
          <p className="mb-3 text-body-md text-error">Failed to load this tenant.</p>
          <Button variant="outline" size="sm" onClick={() => tenantQuery.refetch()}>
            Retry
          </Button>
        </div>
      ) : tenant ? (
        <>
          <section className="overflow-hidden rounded-xl border border-outline-variant bg-surface">
            <div className="flex items-center justify-between border-b border-outline-variant bg-surface-container-low px-6 py-4">
              <h3 className="font-display text-h2 text-on-surface">General Information</h3>
              <div className="flex items-center gap-2">
                <Badge variant="secondary">{TENANT_TYPE_LABELS[tenant.tenantType]}</Badge>
                <Badge className={TENANT_STATUS_BADGE_CLASSNAME[tenant.status]}>
                  {TENANT_STATUS_LABELS[tenant.status]}
                </Badge>
              </div>
            </div>
            <div className="grid grid-cols-1 gap-6 p-8 md:grid-cols-3">
              <Field label="Full Name (English)" value={tenant.nameEn} />
              <Field label="Full Name (Arabic)" value={tenant.nameAr || "—"} rtl={!!tenant.nameAr} />
              <Field label="Phone" value={tenant.phone} />
              <Field label="Alternate Phone" value={tenant.alternatePhone || "—"} />
              <Field label="Email" value={tenant.email || "—"} />
            </div>
            {tenant.notes && (
              <div className="border-t border-outline-variant p-8 pt-6">
                <Field label="Notes" value={<span className="whitespace-pre-wrap">{tenant.notes}</span>} />
              </div>
            )}
          </section>

          <section className="overflow-hidden rounded-xl border border-outline-variant bg-surface">
            <div className="flex items-center gap-2 border-b border-outline-variant bg-surface-container-low px-6 py-4">
              {tenant.tenantType === "INDIVIDUAL" ? (
                <>
                  <IdCard className="h-4 w-4 text-secondary" />
                  <h3 className="font-display text-h2 text-on-surface">Personal Identification</h3>
                </>
              ) : (
                <>
                  <Building2 className="h-4 w-4 text-secondary" />
                  <h3 className="font-display text-h2 text-on-surface">Corporate Credentials</h3>
                </>
              )}
            </div>
            <div className="grid grid-cols-1 gap-6 p-8 md:grid-cols-3">
              {tenant.tenantType === "INDIVIDUAL" ? (
                <>
                  <Field label="Nationality" value={tenant.nationality || "—"} />
                  <Field label="Emirates ID Number" value={tenant.emiratesIdNumber || "—"} />
                  <Field label="Emirates ID Expiry" value={formatDate(tenant.emiratesIdExpiry)} />
                  <Field label="Passport Number" value={tenant.passportNumber || "—"} />
                  <Field label="Passport Expiry" value={formatDate(tenant.passportExpiry)} />
                </>
              ) : (
                <>
                  <Field label="Trade License Number" value={tenant.tradeLicenseNumber || "—"} />
                  <Field label="Trade License Expiry" value={formatDate(tenant.tradeLicenseExpiry)} />
                  <Field label="Authorized Person (English)" value={tenant.authorizedPersonNameEn || "—"} />
                  <Field
                    label="Authorized Person (Arabic)"
                    value={tenant.authorizedPersonNameAr || "—"}
                    rtl={!!tenant.authorizedPersonNameAr}
                  />
                  <Field label="Occupation" value={tenant.authorizedPersonOccupation || "—"} />
                  <Field label="Authorized Person Phone" value={tenant.authorizedPersonPhone || "—"} />
                </>
              )}
            </div>
          </section>

          <TenantDocumentsSection tenantId={tenant.id} tenantType={tenant.tenantType} />

          <DeleteTenantDialog
            tenant={confirmingDelete ? tenant : null}
            onOpenChange={setConfirmingDelete}
            onDeleted={() => router.push(ROUTES.tenants)}
          />
        </>
      ) : null}
    </div>
  )
}
