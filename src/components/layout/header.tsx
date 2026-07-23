"use client"

import Link from "next/link"
import { Bell, Home, MessageSquare, Search, User } from "lucide-react"

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

  return (
    <header className="sticky top-0 z-50 h-24 border-b border-outline-variant bg-white/80 backdrop-blur-xl">
      <div className="mx-auto flex h-full w-full max-w-[1700px] items-center justify-between gap-8 px-container-padding">
        <div className="flex min-w-0 items-center gap-8 lg:gap-16">
          <div className="flex flex-col">
            <h1 className="flex items-center gap-2 font-display text-2xl font-black tracking-tighter text-primary">
              <span className="h-8 w-2 rounded-full bg-secondary" />
              Horizon Property Manager
            </h1>
            <p className="ml-4 mt-1 text-[10px] font-bold uppercase tracking-[0.3em] text-on-surface-variant">
              Property Manager
            </p>
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
                <p className="font-display text-base font-extrabold text-on-surface">{user?.name ?? "—"}</p>
                <p className="mt-1 rounded-md bg-primary px-2 py-1 text-[10px] font-black uppercase tracking-widest text-white">
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
    </header>
  )
}
