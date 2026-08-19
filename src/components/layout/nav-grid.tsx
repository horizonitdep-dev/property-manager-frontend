"use client"

import Link from "next/link"
import { usePathname } from "next/navigation"
import { motion, useReducedMotion } from "framer-motion"

import { cn } from "@/lib/utils"
import { NAV_MODULES } from "@/lib/nav-modules"

export function NavGrid() {
  const pathname = usePathname()
  const shouldReduceMotion = useReducedMotion()

  return (
    <motion.div
      className="mx-auto w-full max-w-[1700px] px-container-padding pt-10"
      initial={shouldReduceMotion ? false : { opacity: 0, y: 10 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.6, delay: shouldReduceMotion ? 0 : 0.08, ease: [0.22, 1, 0.36, 1] }}
    >
      <div className="grid grid-cols-2 gap-5 md:grid-cols-5 lg:grid-cols-10">
        {NAV_MODULES.map((module) => {
          const Icon = module.icon
          const matchPrefix = module.matchPrefix ?? module.href
          const isActive = module.enabled && (pathname === matchPrefix || pathname.startsWith(`${matchPrefix}/`))
          const iconClassName = isActive ? "text-white" : (module.accentClassName ?? "text-on-surface")

          if (!module.enabled) {
            return (
              <div
                key={module.key}
                className="nav-hub-card relative flex cursor-not-allowed flex-col items-center justify-center gap-4 rounded-2xl p-6 text-center opacity-50"
                title={`${module.label} — Soon`}
              >
                <span className="absolute right-2 top-2 rounded-full bg-surface-container-highest px-2 py-0.5 text-[9px] font-bold uppercase tracking-widest text-on-surface-variant">
                  Soon
                </span>
                <Icon className={cn("h-9 w-9", iconClassName)} />
                <span className="font-label-sm" style={{ fontWeight: 500 }}>
                  {module.label}
                </span>
              </div>
            )
          }

          return (
            <Link
              key={module.key}
              href={module.href}
              className={cn(
                "nav-hub-card relative flex flex-col items-center justify-center gap-4 rounded-2xl p-6 text-center",
                isActive && "active"
              )}
            >
              <Icon className={cn("h-9 w-9", iconClassName)} />
              <span className="font-label-sm">{module.label}</span>
            </Link>
          )
        })}
      </div>
    </motion.div>
  )
}
