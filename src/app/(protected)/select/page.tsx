"use client"

import Image from "next/image"
import Link from "next/link"
import { Bell, Building2, LogOut, Mail, Shield } from "lucide-react"

import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu"
import { useLogout } from "@/hooks/use-logout"
import { PageFade } from "@/components/page-fade"
import { cn } from "@/lib/utils"
import { SELECT_MODULES } from "@/lib/select-modules"
import { useAuthStore } from "@/store/auth-store"

export default function SelectPage() {
  const user = useAuthStore((state) => state.user)
  const logout = useLogout()

  return (
    <div className="min-h-screen bg-background">
      <header className="fixed inset-x-0 top-0 z-50 flex h-20 items-center justify-between border-b border-outline-variant/60 bg-surface/70 px-container-padding backdrop-blur-xl">
        <div className="flex items-center gap-stack-md">
          <div className="rounded-xl bg-secondary p-2.5 shadow-lg shadow-secondary/20">
            <Building2 className="h-6 w-6 text-on-secondary" />
          </div>
          <div>
            <h1 className="font-display text-h1 tracking-tight text-on-surface">Horizon</h1>
            <p className="-mt-1 text-[10px] font-bold uppercase tracking-[0.2em] text-secondary">
              Property Management
            </p>
          </div>
        </div>

        <div className="flex items-center gap-stack-lg">
          <div className="flex items-center gap-stack-sm">
            <button
              type="button"
              className="group relative flex h-10 w-10 items-center justify-center rounded-xl transition-all hover:bg-surface-container-low"
              aria-label="Notifications"
            >
              <Bell className="h-5 w-5 text-on-surface-variant group-hover:text-secondary" />
              <span className="absolute right-2 top-2 h-2 w-2 rounded-full bg-secondary ring-2 ring-white" />
            </button>
            <button
              type="button"
              className="group flex h-10 w-10 items-center justify-center rounded-xl transition-all hover:bg-surface-container-low"
              aria-label="Messages"
            >
              <Mail className="h-5 w-5 text-on-surface-variant group-hover:text-secondary" />
            </button>
          </div>

          <DropdownMenu>
            <DropdownMenuTrigger className="flex items-center gap-stack-md border-l border-outline-variant/50 pl-stack-lg outline-none">
              <div className="hidden text-right sm:block">
                <p className="text-label-sm text-on-surface">{user?.name ?? "—"}</p>
                <p className="text-[10px] font-bold uppercase tracking-widest text-secondary">
                  {user?.role ?? ""}
                </p>
              </div>
              <div className="relative">
                <div className="flex h-11 w-11 items-center justify-center rounded-xl border-2 border-secondary/20 bg-surface-container-high text-on-surface-variant shadow-md">
                  {user?.name?.charAt(0).toUpperCase() ?? "?"}
                </div>
                <div className="absolute -bottom-1 -right-1 h-4 w-4 rounded-full border-2 border-white bg-emerald-500" />
              </div>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="end">
              <DropdownMenuItem onSelect={() => void logout()} className="gap-2 text-error">
                <LogOut className="h-4 w-4" /> Log out
              </DropdownMenuItem>
            </DropdownMenuContent>
          </DropdownMenu>
        </div>
      </header>

      <main className="flex min-h-screen flex-col items-center px-container-padding pb-16 pt-32">
        <PageFade className="w-full max-w-7xl">
          <div className="mb-16 text-center">
            <h2 className="font-display text-display tracking-tight text-on-surface">Navigation Hub</h2>
            <div className="mx-auto mb-6 mt-4 h-1.5 w-24 rounded-full bg-secondary" />
            <p className="mx-auto max-w-2xl text-body-lg text-on-surface-variant">
              Welcome back, {user?.name ?? "there"}. Select a specialized module to manage your property
              portfolio with precision.
            </p>
          </div>

          <div className="grid grid-cols-1 gap-8 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
            {SELECT_MODULES.map((module) => {
              const cardClassName = cn(
                "group relative flex flex-col items-center overflow-hidden rounded-2xl border border-outline-variant/60 bg-surface p-8 text-center shadow-sm transition-all",
                module.enabled
                  ? "hover:-translate-y-1 hover:shadow-2xl hover:border-secondary/40"
                  : "opacity-50"
              )

              const content = (
                <>
                  {!module.enabled && (
                    <span className="absolute right-4 top-4 rounded-full bg-surface-container-highest px-3 py-1 text-[10px] font-bold uppercase tracking-widest text-on-surface-variant">
                      Coming soon
                    </span>
                  )}
                  <div
                    className={cn(
                      "mb-8 flex h-32 w-32 items-center justify-center overflow-hidden rounded-3xl bg-white shadow-xl transition-transform",
                      module.shadowClassName,
                      module.enabled && "group-hover:scale-105"
                    )}
                  >
                    <Image src={module.iconSrc} alt={module.label} width={128} height={128} className="h-full w-full object-contain p-2" />
                  </div>
                  <h3 className="mb-3 font-display text-h2 text-on-surface">{module.label}</h3>
                  <p className="text-sm leading-relaxed text-on-surface-variant">{module.description}</p>
                </>
              )

              if (!module.enabled) {
                return (
                  <div key={module.key} className={cardClassName} aria-disabled>
                    {content}
                  </div>
                )
              }

              return (
                <Link key={module.key} href={module.href} className={cardClassName}>
                  {content}
                </Link>
              )
            })}
          </div>

          <div className="mt-20 flex flex-col items-center justify-between gap-4 border-t border-outline-variant/30 pt-8 font-label-sm text-[10px] uppercase tracking-widest text-on-surface-variant md:flex-row">
            <span className="flex items-center gap-2">
              <Shield className="h-3.5 w-3.5 text-secondary" /> Last Server Sync: Today
            </span>
            <span className="flex items-center gap-3 rounded-full border border-secondary/20 bg-secondary/10 px-5 py-2 text-secondary">
              <span className="h-2 w-2 rounded-full bg-secondary" /> Network Integrity: Secure
            </span>
          </div>
        </PageFade>
      </main>
    </div>
  )
}
