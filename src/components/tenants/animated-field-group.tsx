"use client"

import * as React from "react"
import { AnimatePresence, motion, useReducedMotion } from "framer-motion"

/**
 * Cross-fades + height-animates between differently-keyed children (e.g. the
 * Individual vs Company field groups). `mode="wait"` keeps the transition
 * strictly sequential — the outgoing group fully exits before the incoming
 * one starts — so there's never a moment where both are visible at once.
 * Exit runs faster (150ms ease-in) than enter (200ms ease-out), which is
 * what avoids the abrupt "jump" a same-speed crossfade would have.
 */
export function AnimatedFieldGroup({ activeKey, children }: { activeKey: string; children: React.ReactNode }) {
  const shouldReduceMotion = useReducedMotion()

  return (
    <AnimatePresence mode="wait" initial={false}>
      <motion.div
        key={activeKey}
        initial={shouldReduceMotion ? false : { height: 0, opacity: 0, y: -8 }}
        animate={{
          height: "auto",
          opacity: 1,
          y: 0,
          transition: shouldReduceMotion ? { duration: 0 } : { duration: 0.2, ease: "easeOut" },
        }}
        exit={{
          height: 0,
          opacity: 0,
          y: -8,
          transition: shouldReduceMotion ? { duration: 0 } : { duration: 0.15, ease: "easeIn" },
        }}
        style={{ overflow: "hidden" }}
      >
        {children}
      </motion.div>
    </AnimatePresence>
  )
}
