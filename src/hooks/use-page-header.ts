"use client"

import * as React from "react"
import type { ReactNode } from "react"

import { usePageHeaderStore } from "@/store/page-header-store"

export function usePageHeader(header: { title: ReactNode; subtitle?: ReactNode; actions?: ReactNode }) {
  const setHeader = usePageHeaderStore((state) => state.setHeader)
  const clear = usePageHeaderStore((state) => state.clear)

  React.useEffect(() => {
    setHeader(header)
    return () => clear()
  })
}
