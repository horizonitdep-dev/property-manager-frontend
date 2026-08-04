"use client"

import * as React from "react"
import Link from "next/link"
import { useParams, useRouter } from "next/navigation"
import { ArrowLeft, Pencil, Plus, Trash2 } from "lucide-react"

import { DeletePropertyDialog } from "@/components/properties/delete-property-dialog"
import { RoleGate } from "@/components/role-gate"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { Skeleton } from "@/components/ui/skeleton"
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table"
import { useProperty } from "@/hooks/queries/use-properties"
import { usePropertyContracts } from "@/hooks/queries/use-contracts"
import { usePageHeader } from "@/hooks/use-page-header"
import { CONTRACT_STATUS_BADGE_CLASSNAME, CONTRACT_STATUS_LABELS } from "@/lib/contract-labels"
import { ROUTES } from "@/lib/constants"
import {
  PROPERTY_STATUS_BADGE_CLASSNAME,
  PROPERTY_STATUS_LABELS,
  UNIT_TYPE_LABELS,
  UNIT_TYPES_WITHOUT_ROOMS,
} from "@/lib/property-labels"

function formatContractDate(value: string): string {
  const date = new Date(value)
  const day = String(date.getUTCDate()).padStart(2, "0")
  const month = String(date.getUTCMonth() + 1).padStart(2, "0")
  const year = date.getUTCFullYear()
  return `${day}-${month}-${year}`
}

function Field({ label, value }: { label: string; value: React.ReactNode }) {
  return (
    <div className="space-y-1">
      <p className="text-label-sm uppercase text-on-surface-variant">{label}</p>
      <p className="text-body-md text-on-surface">{value}</p>
    </div>
  )
}

export default function PropertyDetailPage() {
  const params = useParams<{ id: string }>()
  const router = useRouter()
  const [confirmingDelete, setConfirmingDelete] = React.useState(false)

  const propertyQuery = useProperty(params.id)
  const property = propertyQuery.data

  const contractsQuery = usePropertyContracts(params.id)
  const contracts = contractsQuery.data ?? []

  usePageHeader({
    title: property ? `Unit ${property.unitNumber}` : "Property Unit",
    subtitle: property?.building ? property.building.name : "Property unit details",
  })

  const showRooms = property ? !UNIT_TYPES_WITHOUT_ROOMS.includes(property.unitType) : true

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <Button asChild variant="ghost" size="sm" className="-ml-3">
          <Link href={ROUTES.properties}>
            <ArrowLeft className="h-4 w-4" /> Back to Properties
          </Link>
        </Button>
        {property && (
          <RoleGate allowedRoles={["MANAGER"]}>
            <div className="flex gap-2">
              <Button asChild variant="outline">
                <Link href={ROUTES.propertyEdit(property.id)}>
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

      {propertyQuery.isLoading ? (
        <div className="space-y-4 rounded-xl border border-outline-variant bg-surface p-8">
          <Skeleton className="h-6 w-48" />
          <Skeleton className="h-24 w-full" />
        </div>
      ) : propertyQuery.isError ? (
        <div className="rounded-xl border border-outline-variant bg-surface py-16 text-center">
          <p className="mb-3 text-body-md text-error">Failed to load this property unit.</p>
          <Button variant="outline" size="sm" onClick={() => propertyQuery.refetch()}>
            Retry
          </Button>
        </div>
      ) : property ? (
        <>
          <section className="overflow-hidden rounded-xl border border-outline-variant bg-surface">
            <div className="flex items-center justify-between border-b border-outline-variant bg-surface-container-low px-6 py-4">
              <h3 className="font-display text-h2 text-on-surface">Unit Details</h3>
              <Badge className={PROPERTY_STATUS_BADGE_CLASSNAME[property.status]}>
                {PROPERTY_STATUS_LABELS[property.status]}
              </Badge>
            </div>
            <div className="grid grid-cols-1 gap-6 p-8 md:grid-cols-3">
              <Field label="Unit Number" value={property.unitNumber} />
              <Field
                label="Building"
                value={
                  <Link href={ROUTES.buildingDetail(property.buildingId)} className="text-secondary hover:underline">
                    {property.building?.name} ({property.building?.code})
                  </Link>
                }
              />
              <Field label="Floor" value={property.floor} />
              <Field label="Unit Type" value={UNIT_TYPE_LABELS[property.unitType]} />
              {showRooms && <Field label="Bedrooms" value={property.bedrooms ?? "—"} />}
              {showRooms && <Field label="Bathrooms" value={property.bathrooms ?? "—"} />}
              <Field label="Size (sqm)" value={property.sizeSqm ?? "—"} />
              <Field
                label="Monthly Rent"
                value={`AED ${Number(property.monthlyRent).toLocaleString(undefined, { maximumFractionDigits: 0 })}`}
              />
            </div>
            {property.notes && (
              <div className="border-t border-outline-variant p-8 pt-6">
                <Field label="Notes" value={<span className="whitespace-pre-wrap">{property.notes}</span>} />
              </div>
            )}
          </section>

          <section className="overflow-hidden rounded-xl border border-outline-variant bg-surface">
            <div className="flex items-center justify-between border-b border-outline-variant bg-surface-container-low px-6 py-4">
              <h3 className="font-display text-h2 text-on-surface">Contract History</h3>
              <RoleGate allowedRoles={["MANAGER"]}>
                <Button asChild size="sm">
                  <Link href={`${ROUTES.contractNew}?propertyId=${property.id}`}>
                    <Plus className="h-4 w-4" /> Add Contract
                  </Link>
                </Button>
              </RoleGate>
            </div>

            {contractsQuery.isLoading ? (
              <div className="space-y-3 p-6">
                {Array.from({ length: 2 }).map((_, i) => (
                  <Skeleton key={i} className="h-10 w-full" />
                ))}
              </div>
            ) : contractsQuery.isError ? (
              <div className="py-12 text-center">
                <p className="mb-3 text-body-md text-error">Failed to load contracts for this unit.</p>
                <Button variant="outline" size="sm" onClick={() => contractsQuery.refetch()}>
                  Retry
                </Button>
              </div>
            ) : contracts.length === 0 ? (
              <p className="py-12 text-center text-on-surface-variant">No contracts on file for this unit yet.</p>
            ) : (
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Contract #</TableHead>
                    <TableHead>Tenant</TableHead>
                    <TableHead>Start</TableHead>
                    <TableHead>End</TableHead>
                    <TableHead>Status</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {contracts.map((contract) => (
                    <TableRow key={contract.id}>
                      <TableCell>
                        <Link
                          href={ROUTES.contractDetail(contract.id)}
                          className="font-mono text-data-mono text-on-surface hover:text-secondary"
                        >
                          {contract.contractNumber}
                        </Link>
                      </TableCell>
                      <TableCell>
                        <Link href={ROUTES.tenantDetail(contract.tenant.id)} className="hover:text-secondary">
                          {contract.tenant.nameEn}
                        </Link>
                      </TableCell>
                      <TableCell className="font-mono text-data-mono">{formatContractDate(contract.startDate)}</TableCell>
                      <TableCell className="font-mono text-data-mono">{formatContractDate(contract.endDate)}</TableCell>
                      <TableCell>
                        <Badge className={CONTRACT_STATUS_BADGE_CLASSNAME[contract.status]}>
                          {CONTRACT_STATUS_LABELS[contract.status]}
                        </Badge>
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            )}
          </section>

          <DeletePropertyDialog
            property={confirmingDelete ? property : null}
            onOpenChange={setConfirmingDelete}
            onDeleted={() => router.push(ROUTES.properties)}
          />
        </>
      ) : null}
    </div>
  )
}
