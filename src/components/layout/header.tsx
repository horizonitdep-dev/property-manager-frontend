"use client"

import * as React from "react"
import Link from "next/link"
import { motion, useReducedMotion } from "framer-motion"
import { Bell, Building2, Home, MessageSquare, Search, Upload, User } from "lucide-react"

import { ImportWizard } from "@/components/import/import-wizard"
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu"
import { useLogout } from "@/hooks/use-logout"
import { ROUTES } from "@/lib/constants"
import { useAuthStore } from "@/store/auth-store"

export function Header({
  hideSearch = false,
  hideHomeButton = false,
}: {
  hideSearch?: boolean
  hideHomeButton?: boolean
} = {}) {
  const user = useAuthStore((state) => state.user)
  const logout = useLogout()
  const shouldReduceMotion = useReducedMotion()
  const [importOpen, setImportOpen] = React.useState(false)

  return (
    <motion.header
      className="sticky top-0 z-50 h-24"
      style={{
        background: "linear-gradient(160deg, rgba(255,255,255,.72), rgba(255,255,255,.44))",
        backdropFilter: "blur(20px) saturate(1.3)",
        borderBottom: "1px solid rgba(255,255,255,.85)",
      }}
      initial={shouldReduceMotion ? false : { opacity: 0, y: 10 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.6, ease: [0.22, 1, 0.36, 1] }}
    >
      <div className="mx-auto flex h-full w-full max-w-[1700px] items-center justify-between gap-8 px-container-padding">
        <div className="flex min-w-0 items-center gap-8 lg:gap-16">
          <div className="flex items-center gap-3">
            <div
              className="flex h-11 w-11 shrink-0 items-center justify-center rounded-[13px] text-white shadow-[0_12px_24px_-8px_rgba(37,105,230,0.55)]"
              style={{ background: "linear-gradient(135deg,#2569E6,#3B82F6)" }}
            >
              <Building2 className="h-5 w-5" />
            </div>
            <div className="flex flex-col">
              <h1 className="font-display text-2xl font-black tracking-tighter text-on-surface">
                Horizon Property Manager
              </h1>
              <p className="mt-1 text-[10px] font-bold uppercase tracking-[0.3em] text-on-surface-variant">
                Executive Dashboard
              </p>
            </div>
          </div>

          {!hideSearch && (
            <div className="relative hidden w-[450px] md:block">
              <Search className="pointer-events-none absolute left-5 top-1/2 h-6 w-6 -translate-y-1/2 text-secondary" />
              <input
                type="text"
                placeholder="Search portfolio assets…"
                className="w-full rounded-2xl border-2 border-transparent bg-surface-container py-4 pl-14 pr-6 font-medium text-body-md placeholder:text-outline focus:border-secondary/30 focus:outline-none focus:ring-4 focus:ring-secondary/10"
              />
            </div>
          )}
        </div>

        <div className="flex shrink-0 items-center gap-8">
          <div className="flex gap-4">
            {!hideHomeButton && (
              <Link
                href={ROUTES.select}
                className="flex h-12 w-12 items-center justify-center rounded-full bg-surface-container shadow-sm transition-all hover:bg-secondary hover:text-white"
                aria-label="Navigation Hub"
              >
                <Home className="h-6 w-6" />
              </Link>
            )}
            {/* Opens the wizard in place. The /import page still exists and hosts
                the same wizard for anyone landing on it directly. */}
            {user?.role === "MANAGER" && (
              <button
                type="button"
                onClick={() => setImportOpen(true)}
                className="flex h-12 w-12 items-center justify-center rounded-full bg-surface-container shadow-sm transition-all hover:bg-secondary hover:text-white"
                aria-label="Import Center"
              >
                <Upload className="h-6 w-6" />
              </button>
            )}
            <button
              type="button"
              className="flex h-12 w-12 items-center justify-center rounded-full bg-surface-container shadow-sm transition-all hover:bg-secondary hover:text-white"
              aria-label="Notifications"
            >
              <Bell className="h-6 w-6" />
            </button>
            <button
              type="button"
              className="flex h-12 w-12 items-center justify-center rounded-full bg-surface-container shadow-sm transition-all hover:bg-secondary hover:text-white"
              aria-label="Messages"
            >
              <MessageSquare className="h-6 w-6" />
            </button>
          </div>

          <div className="h-10 w-[2px] bg-outline-variant/50" />

          <DropdownMenu>
            <DropdownMenuTrigger className="flex items-center gap-5 rounded-full pl-2 outline-none">
              <div className="text-right">
                <p className="font-display text-base font-extrabold text-on-surface">{user?.fullName ?? "—"}</p>
                <p className="mt-1 inline-flex items-center rounded-full border border-outline-variant bg-white/55 px-3 py-1 text-[10px] font-semibold uppercase tracking-widest text-on-surface-variant backdrop-blur-sm">
                  {user?.role ?? ""}
                </p>
              </div>
              <div className="relative">
                <div className="flex h-14 w-14 items-center justify-center rounded-2xl bg-white p-1 ring-4 ring-secondary/10">
                  <div className="flex h-full w-full items-center justify-center rounded-xl bg-surface-container-high text-on-surface-variant">
                    <User className="h-6 w-6" />
                  </div>
                </div>
                <span className="absolute -bottom-1 -right-1 h-5 w-5 rounded-full border-4 border-white bg-green-500" />
              </div>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="end">
              <DropdownMenuLabel>{user?.email}</DropdownMenuLabel>
              <DropdownMenuSeparator />
              <DropdownMenuItem onSelect={() => void logout()} className="gap-2 text-error">
                Log out
              </DropdownMenuItem>
            </DropdownMenuContent>
          </DropdownMenu>
        </div>
      </div>

      {user?.role === "MANAGER" && <ImportWizard open={importOpen} onOpenChange={setImportOpen} />}
    </motion.header>
  )
}
