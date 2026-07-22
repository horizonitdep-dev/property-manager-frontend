"use client"

import * as React from "react"
import { Check, ChevronDown, Search } from "lucide-react"

import { cn } from "@/lib/utils"
import type { Building } from "@/types/building"

export function BuildingCombobox({
  id,
  buildings,
  value,
  onChange,
  isLoading,
  disabled,
}: {
  id?: string
  buildings: Building[]
  value: string
  onChange: (buildingId: string) => void
  isLoading?: boolean
  disabled?: boolean
}) {
  const [open, setOpen] = React.useState(false)
  const [query, setQuery] = React.useState("")
  const containerRef = React.useRef<HTMLDivElement>(null)

  const selected = buildings.find((building) => building.id === value)

  React.useEffect(() => {
    function handleClickOutside(event: MouseEvent) {
      if (containerRef.current && !containerRef.current.contains(event.target as Node)) {
        setOpen(false)
      }
    }
    document.addEventListener("mousedown", handleClickOutside)
    return () => document.removeEventListener("mousedown", handleClickOutside)
  }, [])

  const filtered = query.trim()
    ? buildings.filter((building) =>
        `${building.name} ${building.code}`.toLowerCase().includes(query.trim().toLowerCase())
      )
    : buildings

  return (
    <div ref={containerRef} className="relative">
      <button
        type="button"
        id={id}
        disabled={disabled}
        onClick={() => setOpen((o) => !o)}
        className="flex h-10 w-full items-center justify-between rounded-lg border border-outline-variant bg-surface px-3 py-2 text-left text-body-md text-on-surface transition-all focus:border-secondary focus:outline-none focus:ring-1 focus:ring-secondary disabled:cursor-not-allowed disabled:opacity-50"
      >
        <span className={cn("truncate", !selected && "text-outline")}>
          {selected ? `${selected.name} (${selected.code})` : isLoading ? "Loading buildings…" : "Select a building…"}
        </span>
        <ChevronDown className="h-4 w-4 shrink-0 opacity-50" />
      </button>

      {open && (
        <div className="absolute z-50 mt-1 w-full overflow-hidden rounded-lg border border-outline-variant bg-surface shadow-md">
          <div className="relative border-b border-outline-variant p-2">
            <Search className="pointer-events-none absolute left-5 top-1/2 h-4 w-4 -translate-y-1/2 text-outline" />
            <input
              autoFocus
              value={query}
              onChange={(e) => setQuery(e.target.value)}
              placeholder="Search building name or code…"
              className="w-full rounded-md border-none bg-surface-container-low py-2 pl-9 pr-3 text-body-md text-on-surface outline-none placeholder:text-outline"
            />
          </div>
          <div className="max-h-60 overflow-y-auto p-1">
            {filtered.length === 0 ? (
              <p className="px-3 py-4 text-center text-body-md text-on-surface-variant">No buildings found.</p>
            ) : (
              filtered.map((building) => (
                <button
                  key={building.id}
                  type="button"
                  onClick={() => {
                    onChange(building.id)
                    setQuery("")
                    setOpen(false)
                  }}
                  className="flex w-full items-center justify-between rounded-md px-3 py-2 text-left text-body-md hover:bg-surface-container-high"
                >
                  <span>
                    {building.name} <span className="text-on-surface-variant">({building.code})</span>
                  </span>
                  {building.id === value && <Check className="h-4 w-4 text-secondary" />}
                </button>
              ))
            )}
          </div>
        </div>
      )}
    </div>
  )
}
