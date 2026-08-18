"use client"

import * as React from "react"
import { Check, ChevronDown, Search } from "lucide-react"

import { cn } from "@/lib/utils"
import type { ContractListItem } from "@/types/contract"

function contractLabel(contract: ContractListItem) {
  return `${contract.contractNumber} — ${contract.tenant.nameEn} · Unit ${contract.property.unitNumber}`
}

export function ContractCombobox({
  id,
  contracts,
  value,
  onChange,
  isLoading,
  disabled,
}: {
  id?: string
  contracts: ContractListItem[]
  value: string
  onChange: (contractId: string) => void
  isLoading?: boolean
  disabled?: boolean
}) {
  const [open, setOpen] = React.useState(false)
  const [query, setQuery] = React.useState("")
  const containerRef = React.useRef<HTMLDivElement>(null)

  const selected = contracts.find((contract) => contract.id === value)

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
    ? contracts.filter((contract) =>
        `${contract.contractNumber} ${contract.tenant.nameEn} ${contract.property.unitNumber} ${contract.property.building.name}`
          .toLowerCase()
          .includes(query.trim().toLowerCase())
      )
    : contracts

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
          {selected ? contractLabel(selected) : isLoading ? "Loading contracts…" : "Select a contract…"}
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
              placeholder="Search contract, tenant or unit…"
              className="w-full rounded-md border-none bg-surface-container-low py-2 pl-9 pr-3 text-body-md text-on-surface outline-none placeholder:text-outline"
            />
          </div>
          <div className="max-h-60 overflow-y-auto p-1">
            {filtered.length === 0 ? (
              <p className="px-3 py-4 text-center text-body-md text-on-surface-variant">No contracts found.</p>
            ) : (
              filtered.map((contract) => (
                <button
                  key={contract.id}
                  type="button"
                  onClick={() => {
                    onChange(contract.id)
                    setQuery("")
                    setOpen(false)
                  }}
                  className="flex w-full items-center justify-between rounded-md px-3 py-2 text-left text-body-md hover:bg-surface-container-high"
                >
                  <span className="truncate">{contractLabel(contract)}</span>
                  {contract.id === value && <Check className="h-4 w-4 shrink-0 text-secondary" />}
                </button>
              ))
            )}
          </div>
        </div>
      )}
    </div>
  )
}
