"use client"

import Image from "next/image"
import Link from "next/link"
import { Shield } from "lucide-react"

import { Header } from "@/components/layout/header"
import { PageFade } from "@/components/page-fade"
import { cn } from "@/lib/utils"
import { SELECT_MODULES } from "@/lib/select-modules"
import { useAuthStore } from "@/store/auth-store"

export default function SelectPage() {
  const user = useAuthStore((state) => state.user)

  return (
    <div className="min-h-screen bg-background">
      <Header hideSearch hideHomeButton />

      <main className="flex min-h-screen flex-col items-center px-container-padding pb-16 pt-16">
        <PageFade className="w-full max-w-7xl">
          <div className="mb-16 text-center">
            <h2 className="font-display text-display tracking-tight text-on-surface">Navigation Hub</h2>
            <div className="mx-auto mb-6 mt-4 h-1.5 w-24 rounded-full bg-secondary" />
            <p className="mx-auto max-w-2xl text-body-lg text-on-surface-variant">
              Welcome back, {user?.fullName ?? "there"}. Select a specialized module to manage your property
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
