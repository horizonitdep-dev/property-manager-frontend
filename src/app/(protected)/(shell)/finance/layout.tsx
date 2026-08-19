"use client"

import Link from "next/link"
import { usePathname } from "next/navigation"

import { ROUTES } from "@/lib/constants"
import { cn } from "@/lib/utils"

// Sub-modules currently built. Cheques and Reports join this list as they land.
const FINANCE_TABS = [
  { label: "Payments", href: ROUTES.payments },
  { label: "Expenses", href: ROUTES.expenses },
]

export default function FinanceLayout({ children }: { children: React.ReactNode }) {
  const pathname = usePathname()

  return (
    <div className="space-y-6">
      <nav className="flex gap-1 rounded-lg bg-surface-container p-1">
        {FINANCE_TABS.map((tab) => {
          const isActive = pathname === tab.href || pathname.startsWith(`${tab.href}/`)
          return (
            <Link
              key={tab.href}
              href={tab.href}
              className={cn(
                "rounded-md px-4 py-2 text-body-md font-medium transition-colors",
                isActive
                  ? "border border-outline-variant bg-surface text-primary shadow-sm"
                  : "text-on-surface-variant hover:bg-surface-container-high"
              )}
            >
              {tab.label}
            </Link>
          )
        })}
      </nav>

      {children}
    </div>
  )
}
