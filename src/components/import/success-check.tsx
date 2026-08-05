"use client"

import * as React from "react"
import { animate, motion } from "framer-motion"

const SPRING = [0.22, 1, 0.36, 1] as const
const SUCCESS = "#16A34A"
const SUCCESS_TINT = "rgba(22, 163, 74, 0.18)"

/**
 * Rounds every frame (no float artifacts). Skips the tween entirely for 0/1 —
 * animating 0→1 reads as broken, not celebratory. Under reduced motion (or
 * once already settled) it just shows the final value.
 */
export function CountUpNumber({ value, animateIn }: { value: number; animateIn: boolean }) {
  const [display, setDisplay] = React.useState(animateIn && value > 1 ? 0 : value)

  React.useEffect(() => {
    if (!animateIn || value <= 1) {
      setDisplay(value)
      return
    }
    const controls = animate(0, value, {
      duration: 0.65,
      delay: 0.76,
      ease: "easeOut",
      onUpdate: (latest) => setDisplay(Math.round(latest)),
    })
    return () => controls.stop()
  }, [animateIn, value])

  return <>{display}</>
}

/** Self-drawing success circle + checkmark + one-shot halo pulse. `animateIn`
 * false renders the finished state immediately (prefers-reduced-motion, or a
 * re-render after the sequence has already played). */
export function SuccessCheckAnimation({ animateIn }: { animateIn: boolean }) {
  return (
    <div className="relative h-16 w-16 shrink-0">
      {animateIn && (
        <motion.span
          className="absolute inset-0 rounded-full"
          style={{ backgroundColor: SUCCESS_TINT }}
          initial={{ scale: 0.6, opacity: 0 }}
          animate={{ scale: 1.15, opacity: [0, 0.55, 0] }}
          transition={{
            scale: { duration: 0.7, delay: 0.48, ease: "easeOut" },
            opacity: { duration: 0.7, delay: 0.48, times: [0, 0.4, 1], ease: "easeOut" },
          }}
        />
      )}

      <svg viewBox="0 0 60 60" className="absolute inset-0 h-16 w-16 -rotate-90">
        <motion.circle
          cx="30"
          cy="30"
          r="27"
          fill="none"
          stroke={SUCCESS}
          strokeWidth="3"
          strokeLinecap="round"
          initial={animateIn ? { pathLength: 0 } : false}
          animate={{ pathLength: 1 }}
          transition={animateIn ? { duration: 0.5, delay: 0.06, ease: SPRING } : { duration: 0 }}
        />
      </svg>

      <svg viewBox="0 0 60 60" className="absolute inset-0 h-16 w-16">
        <motion.path
          d="M17 31 L26 40 L44 19"
          fill="none"
          stroke={SUCCESS}
          strokeWidth="3.5"
          strokeLinecap="round"
          strokeLinejoin="round"
          initial={animateIn ? { pathLength: 0 } : false}
          animate={{ pathLength: 1 }}
          transition={animateIn ? { duration: 0.4, delay: 0.48, ease: "easeOut" } : { duration: 0 }}
        />
      </svg>
    </div>
  )
}
