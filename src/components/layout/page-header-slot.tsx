"use client"

import { usePageHeaderStore } from "@/store/page-header-store"

export function PageHeaderSlot() {
  const header = usePageHeaderStore((state) => state.header)

  if (!header) return null

  return (
    <div className="mx-auto w-full max-w-[1700px] px-container-padding pt-10">
      <div className="flex flex-col justify-between gap-6 md:flex-row md:items-end">
        <div className="max-w-3xl">
          <h2 className="font-display text-display leading-tight text-primary">{header.title}</h2>
          {header.subtitle && <p className="mt-4 text-body-lg text-on-surface-variant">{header.subtitle}</p>}
        </div>
        {header.actions && <div className="flex shrink-0 gap-4">{header.actions}</div>}
      </div>
    </div>
  )
}
