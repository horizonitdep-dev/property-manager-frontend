"use client"

import * as React from "react"
import Link from "next/link"
import { useParams } from "next/navigation"
import { useQuery } from "@tanstack/react-query"
import { ArrowLeft, Eye, Pencil, Plus } from "lucide-react"

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
import { usePropertiesByBuilding } from "@/hooks/queries/use-properties"
import { usePageHeader } from "@/hooks/use-page-header"
import { BUILDING_TYPE_LABELS, CONSTRUCTION_STATUS_LABELS } from "@/lib/building-labels"
import { QUERY_KEYS, ROUTES } from "@/lib/constants"
import { PROPERTY_STATUS_BADGE_CLASSNAME, PROPERTY_STATUS_LABELS, UNIT_TYPE_LABELS } from "@/lib/property-labels"
import { buildingService } from "@/services/building-service"

function Field({ label, value }: { label: string; value: React.ReactNode }) {
  return (
    <div className="space-y-1">
      <p className="text-label-sm uppercase text-on-surface-variant">{label}</p>
      <p className="text-body-md text-on-surface">{value}</p>
    </div>
  )
}

export default function BuildingDetailPage() {
  const params = useParams<{ id: string }>()

  const buildingQuery = useQuery({
    queryKey: QUERY_KEYS.building(params.id),
    queryFn: () => buildingService.getById(params.id),
  })
  const building = buildingQuery.data

  const propertiesQuery = usePropertiesByBuilding(params.id)
  const units = propertiesQuery.data ?? []

  usePageHeader({
    title: building?.name ?? "Building",
    subtitle: building ? `${building.code} · ${building.city}` : "Building details",
    actions: building ? (
      <RoleGate allowedRoles={["MANAGER"]}>
        <Button asChild variant="outline">
          <Link href={ROUTES.buildingEdit(building.id)}>
            <Pencil className="h-4 w-4" /> Edit
          </Link>
        </Button>
      </RoleGate>
    ) : undefined,
  })

  return (
    <div className="space-y-6">
      <Button asChild variant="ghost" size="sm" className="-ml-3">
        <Link href={ROUTES.buildings}>
          <ArrowLeft className="h-4 w-4" /> Back to Buildings
        </Link>
      </Button>

      {buildingQuery.isLoading ? (
        <div className="space-y-4 rounded-xl border border-outline-variant bg-surface p-8">
          <Skeleton className="h-6 w-48" />
          <Skeleton className="h-24 w-full" />
        </div>
      ) : buildingQuery.isError ? (
        <div className="rounded-xl border border-outline-variant bg-surface py-16 text-center">
          <p className="mb-3 text-body-md text-error">Failed to load this building.</p>
          <Button variant="outline" size="sm" onClick={() => buildingQuery.refetch()}>
            Retry
          </Button>
        </div>
      ) : building ? (
        <>
          <section className="overflow-hidden rounded-xl border border-outline-variant bg-surface">
            <div className="flex items-center justify-between border-b border-outline-variant bg-surface-container-low px-6 py-4">
              <h3 className="font-display text-h2 text-on-surface">Building Details</h3>
              <Badge variant={building.constructionStatus === "COMPLETE" ? "success" : "warning"}>
                {CONSTRUCTION_STATUS_LABELS[building.constructionStatus]}
              </Badge>
            </div>
            <div className="grid grid-cols-1 gap-6 p-8 md:grid-cols-3">
              <Field label="Building Name" value={building.name} />
              <Field label="Code" value={<span className="font-mono">{building.code}</span>} />
              <Field label="Type" value={BUILDING_TYPE_LABELS[building.buildingType]} />
              <Field label="Address" value={building.address} />
              <Field label="City" value={building.city} />
              <Field label="Total Floors" value={building.totalFloors} />
              <Field label="Total Units" value={building.totalUnits ?? "—"} />
              <Field label="Year Built" value={building.yearBuilt ?? "—"} />
            </div>
            {building.notes && (
              <div className="border-t border-outline-variant p-8 pt-6">
                <Field label="Notes" value={<span className="whitespace-pre-wrap">{building.notes}</span>} />
              </div>
            )}
          </section>

          <section className="overflow-hidden rounded-xl border border-outline-variant bg-surface">
            <div className="flex items-center justify-between border-b border-outline-variant bg-surface-container-low px-6 py-4">
              <h3 className="font-display text-h2 text-on-surface">Units in this building</h3>
              <RoleGate allowedRoles={["MANAGER"]}>
                <Button asChild size="sm">
                  <Link href={`${ROUTES.propertyNew}?buildingId=${building.id}`}>
                    <Plus className="h-4 w-4" /> Add Unit
                  </Link>
                </Button>
              </RoleGate>
            </div>

            {propertiesQuery.isLoading ? (
              <div className="space-y-3 p-6">
                {Array.from({ length: 3 }).map((_, i) => (
                  <Skeleton key={i} className="h-10 w-full" />
                ))}
              </div>
            ) : propertiesQuery.isError ? (
              <div className="py-12 text-center">
                <p className="mb-3 text-body-md text-error">Failed to load units for this building.</p>
                <Button variant="outline" size="sm" onClick={() => propertiesQuery.refetch()}>
                  Retry
                </Button>
              </div>
            ) : units.length === 0 ? (
              <p className="py-12 text-center text-on-surface-variant">No units registered in this building yet.</p>
            ) : (
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Unit Number</TableHead>
                    <TableHead>Floor</TableHead>
                    <TableHead>Unit Type</TableHead>
                    <TableHead>Monthly Rent</TableHead>
                    <TableHead>Status</TableHead>
                    <TableHead className="w-12" />
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {units.map((unit) => (
                    <TableRow key={unit.id}>
                      <TableCell className="font-medium text-on-surface">{unit.unitNumber}</TableCell>
                      <TableCell className="font-mono text-data-mono">{unit.floor}</TableCell>
                      <TableCell>
                        <Badge variant="secondary">{UNIT_TYPE_LABELS[unit.unitType]}</Badge>
                      </TableCell>
                      <TableCell className="font-mono text-data-mono">
                        AED {Number(unit.monthlyRent).toLocaleString(undefined, { maximumFractionDigits: 0 })}
                      </TableCell>
                      <TableCell>
                        <Badge className={PROPERTY_STATUS_BADGE_CLASSNAME[unit.status]}>
                          {PROPERTY_STATUS_LABELS[unit.status]}
                        </Badge>
                      </TableCell>
                      <TableCell>
                        <Button asChild variant="ghost" size="icon" aria-label={`View unit ${unit.unitNumber}`}>
                          <Link href={ROUTES.propertyDetail(unit.id)}>
                            <Eye className="h-4 w-4" />
                          </Link>
                        </Button>
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            )}
          </section>
        </>
      ) : null}
    </div>
  )
}
