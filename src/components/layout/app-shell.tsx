"use client"

import { usePathname } from "next/navigation"

import { Header } from "@/components/layout/header"
import { NavGrid } from "@/components/layout/nav-grid"
import { PageHeaderSlot } from "@/components/layout/page-header-slot"
import { PageFade } from "@/components/page-fade"

export function AppShell({ children }: { children: React.ReactNode }) {
  const pathname = usePathname()

  return (
    <div className="min-h-screen bg-background">
      <Header />
      <PageHeaderSlot />
      <NavGrid />
      <main className="mx-auto w-full max-w-[1700px] px-container-padding py-10">
        <PageFade key={pathname}>{children}</PageFade>
      </main>
    </div>
  )
}
