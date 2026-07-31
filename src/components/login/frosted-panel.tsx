"use client"

import * as React from "react"
import { Building2 } from "lucide-react"
import {
  animate,
  motion,
  useMotionTemplate,
  useMotionValue,
  useReducedMotion,
  useSpring,
  useTransform,
  type MotionValue,
} from "framer-motion"

import { FrostedSkyline } from "@/components/login/frosted-skyline"
import { StaggerGroup, StaggerItem } from "@/components/login/stagger-reveal"

const EASE = [0.22, 1, 0.36, 1] as const

const MESH_BACKGROUND =
  "radial-gradient(38% 45% at 22% 28%, #9DC0FF 0%, transparent 60%), radial-gradient(40% 42% at 78% 22%, #C4B5FF 0%, transparent 62%), radial-gradient(46% 50% at 68% 78%, #A5E4FF 0%, transparent 60%), radial-gradient(42% 46% at 26% 82%, #B8CCFF 0%, transparent 62%)"
const MESH_FILTER_BASE = "blur(58px) saturate(1.25) hue-rotate(0deg)"
const MESH_FILTER_MID = "blur(64px) saturate(1.35) hue-rotate(-12deg)"

const BLOB1_BG = "radial-gradient(circle, #9CC0FF, transparent 66%)"
const BLOB2_BG = "radial-gradient(circle, #C7B8FF, transparent 66%)"
const BLOB3_BG = "radial-gradient(circle, #A8E0FF, transparent 66%)"

interface BlobMotionOptions {
  duration: number
  depthX: number
  depthY: number
  reduce: boolean
}

function useBlobMotion(px: MotionValue<number>, py: MotionValue<number>, opts: BlobMotionOptions) {
  const idleX = useMotionValue(0)
  const idleY = useMotionValue(0)
  const idleScale = useMotionValue(1)

  React.useEffect(() => {
    if (opts.reduce) return
    const controls = [
      animate(idleX, [0, 40, 0], { duration: opts.duration, repeat: Infinity, ease: "easeInOut" }),
      animate(idleY, [0, 30, 0], { duration: opts.duration, repeat: Infinity, ease: "easeInOut" }),
      animate(idleScale, [1, 1.1, 1], { duration: opts.duration, repeat: Infinity, ease: "easeInOut" }),
    ]
    return () => controls.forEach((c) => c.stop())
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [opts.duration, opts.reduce])

  const parallaxX = useTransform(px, (v) => v * opts.depthX)
  const parallaxY = useTransform(py, (v) => v * opts.depthY)
  const x = useTransform([idleX, parallaxX], (values) => (values as number[]).reduce((a, b) => a + b, 0))
  const y = useTransform([idleY, parallaxY], (values) => (values as number[]).reduce((a, b) => a + b, 0))

  return { x, y, scale: idleScale }
}

/** Frosted-glass left login panel: animated gradient mesh, parallax blobs, cursor spotlight, interactive skyline, tilting stat card. */
export function FrostedPanel() {
  const shouldReduceMotion = !!useReducedMotion()
  const [isHovering, setIsHovering] = React.useState(false)

  const mx = useMotionValue(50)
  const my = useMotionValue(50)
  const px = useMotionValue(0)
  const py = useMotionValue(0)

  const spotlightBg = useMotionTemplate`radial-gradient(320px circle at ${mx}% ${my}%, rgba(255,255,255,0.5), transparent 60%)`

  const rotateY = useTransform(px, (v) => v * 5)
  const rotateX = useTransform(py, (v) => v * -5)
  const rotateXSpring = useSpring(rotateX, { stiffness: 150, damping: 20 })
  const rotateYSpring = useSpring(rotateY, { stiffness: 150, damping: 20 })

  const blob1 = useBlobMotion(px, py, { duration: 22, depthX: 50, depthY: 50, reduce: shouldReduceMotion })
  const blob2 = useBlobMotion(px, py, { duration: 27, depthX: -40, depthY: 40, reduce: shouldReduceMotion })
  const blob3 = useBlobMotion(px, py, { duration: 30, depthX: 30, depthY: -30, reduce: shouldReduceMotion })

  function handlePointerMove(e: React.PointerEvent<HTMLElement>) {
    if (shouldReduceMotion) return
    const rect = e.currentTarget.getBoundingClientRect()
    const relX = (e.clientX - rect.left) / rect.width
    const relY = (e.clientY - rect.top) / rect.height
    mx.set(relX * 100)
    my.set(relY * 100)
    px.set(relX - 0.5)
    py.set(relY - 0.5)
  }

  function handlePointerEnter() {
    if (!shouldReduceMotion) setIsHovering(true)
  }

  function handlePointerLeave() {
    setIsHovering(false)
    if (!shouldReduceMotion) {
      px.set(0)
      py.set(0)
    }
  }

  return (
    <section
      className="relative hidden overflow-hidden bg-[#EEF2FF] lg:grid lg:w-1/2 lg:grid-rows-[auto_1fr_auto] lg:p-11"
      style={{ cursor: shouldReduceMotion ? "default" : "crosshair" }}
      onPointerMove={handlePointerMove}
      onPointerEnter={handlePointerEnter}
      onPointerLeave={handlePointerLeave}
    >
      {/* animated gradient mesh */}
      <motion.div
        className="pointer-events-none absolute -inset-1/4 z-0"
        style={{ background: MESH_BACKGROUND }}
        animate={
          shouldReduceMotion
            ? { filter: MESH_FILTER_BASE }
            : { filter: [MESH_FILTER_BASE, MESH_FILTER_MID, MESH_FILTER_BASE], scale: [1, 1.03, 1] }
        }
        transition={shouldReduceMotion ? { duration: 0 } : { duration: 18, repeat: Infinity, ease: "easeInOut" }}
      />

      {/* parallax blobs */}
      <motion.div
        className="pointer-events-none absolute -left-[90px] -top-[80px] z-10 h-[440px] w-[440px] rounded-full opacity-[0.32] blur-[52px]"
        style={{ background: BLOB1_BG, x: blob1.x, y: blob1.y, scale: blob1.scale }}
      />
      <motion.div
        className="pointer-events-none absolute -right-[80px] top-[28%] z-10 h-[380px] w-[380px] rounded-full opacity-[0.32] blur-[52px]"
        style={{ background: BLOB2_BG, x: blob2.x, y: blob2.y, scale: blob2.scale }}
      />
      <motion.div
        className="pointer-events-none absolute -bottom-[140px] left-[30%] z-10 h-[420px] w-[420px] rounded-full opacity-[0.32] blur-[52px]"
        style={{ background: BLOB3_BG, x: blob3.x, y: blob3.y, scale: blob3.scale }}
      />

      {/* frost layer */}
      <div className="pointer-events-none absolute inset-0 z-10 bg-white/30 backdrop-blur-3xl backdrop-saturate-[1.2]" />

      {/* cursor spotlight */}
      <motion.div
        className="pointer-events-none absolute inset-0 z-20 transition-opacity duration-300"
        style={{ background: spotlightBg, opacity: isHovering && !shouldReduceMotion ? 1 : 0 }}
      />

      {/* interactive skyline */}
      <FrostedSkyline />

      {/* bottom fade for legibility */}
      <div className="pointer-events-none absolute inset-x-0 bottom-0 z-20 h-[38%] bg-gradient-to-t from-[rgba(240,244,255,0.5)] to-transparent" />

      {/* ROW 1: logo + status */}
      <div className="relative z-40 flex items-center gap-3">
        <motion.div
          className="relative flex h-11 w-11 shrink-0 cursor-pointer items-center justify-center overflow-hidden rounded-[13px] bg-gradient-to-br from-secondary to-[#3B82F6] text-white shadow-[0_12px_24px_-8px_rgba(0,81,213,0.55)]"
          initial={shouldReduceMotion ? false : { opacity: 0, scale: 0.8, rotate: -8 }}
          animate={{ opacity: 1, scale: 1, rotate: 0 }}
          transition={{ duration: 0.6, delay: shouldReduceMotion ? 0 : 0.1, ease: EASE }}
          whileHover={shouldReduceMotion ? undefined : { scale: 1.12 }}
          whileTap={shouldReduceMotion ? undefined : { scale: 0.94 }}
        >
          <motion.span
            aria-hidden="true"
            className="pointer-events-none absolute -top-[60%] left-0 h-[220%] w-[55%] rotate-[20deg] bg-gradient-to-r from-transparent via-white/60 to-transparent"
            initial={{ x: "-140%" }}
            animate={shouldReduceMotion ? { x: "-140%" } : { x: ["-140%", "-140%", "260%"] }}
            transition={
              shouldReduceMotion
                ? { duration: 0 }
                : { duration: 5, times: [0, 0.72, 1], repeat: Infinity, ease: "easeInOut", delay: 1.4 }
            }
          />
          <Building2 className="relative h-5 w-5" />
        </motion.div>
        <div>
          <motion.b
            className="block font-display text-base font-semibold tracking-tight text-[#14264D]"
            initial={shouldReduceMotion ? false : { opacity: 0, y: 8 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6, delay: shouldReduceMotion ? 0 : 0.18, ease: EASE }}
          >
            Horizon Property Manager
          </motion.b>
          <motion.span
            className="mt-0.5 block text-[10.5px] font-medium uppercase tracking-[0.14em] text-[#6E7FA6]"
            initial={shouldReduceMotion ? false : { opacity: 0, y: 8 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6, delay: shouldReduceMotion ? 0 : 0.24, ease: EASE }}
          >
            Executive Dashboard
          </motion.span>
        </div>

        <motion.div
          className="ml-auto flex items-center gap-2 rounded-full border border-white/80 bg-white/55 px-3.5 py-2 text-[11.5px] font-semibold text-[#3B6B4A] backdrop-blur-md"
          initial={shouldReduceMotion ? false : { opacity: 0, y: 8 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6, delay: shouldReduceMotion ? 0 : 0.3, ease: EASE }}
        >
          <motion.span
            className="h-[7px] w-[7px] shrink-0 rounded-full bg-[#16A34A]"
            animate={
              shouldReduceMotion
                ? { boxShadow: "0 0 0 0 rgba(22,163,74,0)" }
                : {
                    boxShadow: [
                      "0 0 0 0 rgba(22,163,74,0.5)",
                      "0 0 0 6px rgba(22,163,74,0)",
                      "0 0 0 0 rgba(22,163,74,0)",
                    ],
                  }
            }
            transition={shouldReduceMotion ? { duration: 0 } : { duration: 2.2, repeat: Infinity, ease: "easeInOut" }}
          />
          All systems operational
        </motion.div>
      </div>

      {/* ROW 2: flexible spacer for the skyline to breathe in */}
      <div aria-hidden="true" />

      {/* ROW 3: pitch + stat card */}
      <StaggerGroup className="relative z-40 self-end">
        <div className="max-w-[28ch]">
          <StaggerItem>
            <h2 className="font-display text-[32px] font-semibold leading-[1.18] tracking-tight text-[#14264D]">
              Every asset, precisely managed.
            </h2>
          </StaggerItem>
          <StaggerItem className="mt-3.5">
            <p className="text-[14.5px] leading-relaxed text-[#48597E]">
              Portfolios, tenants, contracts and finance — one executive command center.
            </p>
          </StaggerItem>
          <StaggerItem className="mt-4">
            <span className="inline-flex items-center gap-1.5 rounded-full border border-white/80 bg-white/55 px-3.5 py-1.5 text-xs font-medium text-[#5E6E93] backdrop-blur-sm">
              <motion.span
                className="h-[7px] w-[7px] shrink-0 rounded-full bg-secondary"
                animate={
                  shouldReduceMotion
                    ? { boxShadow: "0 0 0 0 rgba(0,81,213,0)" }
                    : {
                        boxShadow: [
                          "0 0 0 0 rgba(0,81,213,0.5)",
                          "0 0 0 7px rgba(0,81,213,0)",
                          "0 0 0 0 rgba(0,81,213,0)",
                        ],
                      }
                }
                transition={shouldReduceMotion ? { duration: 0 } : { duration: 2, repeat: Infinity, ease: "easeInOut" }}
              />
              Hover the skyline &amp; move your cursor
            </span>
          </StaggerItem>
        </div>

        <StaggerItem className="mt-6">
          <motion.div
            className="rounded-[20px] border border-white/85 bg-gradient-to-br from-white/72 to-white/44 p-[22px] shadow-[0_20px_50px_-24px_rgba(40,70,160,0.35)] backdrop-blur-xl backdrop-saturate-[1.3]"
            style={{ rotateX: rotateXSpring, rotateY: rotateYSpring, transformPerspective: 700 }}
          >
            <div className="flex gap-[26px]">
              <div>
                <span className="block text-[23px] font-semibold tracking-tight text-[#132C63]">1.2B+</span>
                <span className="mt-1 block text-[11px] tracking-wide text-[#5E6E93]">Assets managed</span>
              </div>
              <div>
                <span className="block text-[23px] font-semibold tracking-tight text-[#132C63]">99.8%</span>
                <span className="mt-1 block text-[11px] tracking-wide text-[#5E6E93]">Tenant retention</span>
              </div>
              <div>
                <span className="block text-[23px] font-semibold tracking-tight text-[#132C63]">24</span>
                <span className="mt-1 block text-[11px] tracking-wide text-[#5E6E93]">Active properties</span>
              </div>
            </div>
          </motion.div>
        </StaggerItem>
      </StaggerGroup>
    </section>
  )
}
