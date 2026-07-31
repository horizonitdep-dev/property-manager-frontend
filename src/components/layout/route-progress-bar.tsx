"use client"

import { usePathname } from "next/navigation"
import { motion, useReducedMotion } from "framer-motion"

/** 3px brand bar that scales in from the left on every route change — the v2 "top progress line." */
export function RouteProgressBar() {
  const pathname = usePathname()
  const shouldReduceMotion = useReducedMotion()

  return (
    <motion.div
      key={pathname}
      aria-hidden="true"
      className="pointer-events-none fixed inset-x-0 top-0 z-[100] h-[3px] origin-left bg-secondary"
      initial={shouldReduceMotion ? false : { scaleX: 0 }}
      animate={{ scaleX: 1 }}
      transition={shouldReduceMotion ? { duration: 0 } : { duration: 0.5, ease: [0.4, 0, 0.2, 1] }}
    />
  )
}
