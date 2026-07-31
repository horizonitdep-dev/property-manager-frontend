"use client"

import * as React from "react"
import { motion, useReducedMotion, type Variants } from "framer-motion"

type TowerId = "A" | "B" | "C"

interface RectSpec {
  x: number
  y: number
  width: number
  height: number
}

interface FillSpec extends RectSpec {
  delay: number
}

interface PolySpec {
  points: string
  delay: number
}

interface LineSpec {
  x1: number
  y1: number
  x2: number
  y2: number
  delay: number
}

interface TowerSpec {
  id: TowerId
  fills: FillSpec[]
  polylines: PolySpec[]
  lines: LineSpec[]
  windows: RectSpec[]
}

const STROKE_BASE = "#5B7FD6"
const HOVER_STROKE = "#2569E6"
const FILL_BASE = "#6E8FDB"
const GRID = "#7B96D8"
const WINDOW_FILL = "#2569E6"
const BEACON = "#FF3B30"
const WASH = "#CFE0FF"

function strokeVariants(delay: number): Variants {
  return {
    hidden: { pathLength: 0, opacity: 0 },
    show: {
      pathLength: 1,
      opacity: 0.48,
      stroke: STROKE_BASE,
      filter: "none",
      transition: {
        pathLength: { duration: 1.8, ease: "easeInOut", delay },
        opacity: { duration: 0.4, delay },
      },
    },
    rest: {
      pathLength: 1,
      opacity: 0.48,
      stroke: STROKE_BASE,
      filter: "none",
      transition: { duration: 0.3, ease: "easeOut" },
    },
    hover: {
      pathLength: 1,
      opacity: 0.95,
      stroke: HOVER_STROKE,
      filter: "drop-shadow(0 6px 12px rgba(0,81,213,0.4))",
      transition: { duration: 0.3, ease: "easeOut" },
    },
  }
}

function fillVariants(delay: number): Variants {
  return {
    hidden: { opacity: 0, fill: FILL_BASE },
    show: { opacity: 0.08, fill: FILL_BASE, transition: { duration: 0.8, delay } },
    rest: { opacity: 0.08, fill: FILL_BASE, transition: { duration: 0.4, ease: "easeOut" } },
    hover: { opacity: 0.15, fill: HOVER_STROKE, transition: { duration: 0.4, ease: "easeOut" } },
  }
}

const windowVariants: Variants = {
  idle: { opacity: 0.25, transition: { duration: 0.3 } },
  active: { opacity: [0.25, 1, 0.25], transition: { duration: 1.4, repeat: Infinity, ease: "easeInOut" } },
  activeStatic: { opacity: 1, transition: { duration: 0.2 } },
}

const TOWERS: TowerSpec[] = [
  {
    id: "A",
    fills: [{ x: 230, y: 560, width: 150, height: 440, delay: 2.1 }],
    polylines: [{ points: "230,1000 230,560 305,510 380,560 380,1000", delay: 0.3 }],
    lines: [
      { x1: 230, y1: 630, x2: 380, y2: 630, delay: 0.6 },
      { x1: 230, y1: 700, x2: 380, y2: 700, delay: 0.6 },
      { x1: 230, y1: 770, x2: 380, y2: 770, delay: 0.6 },
      { x1: 230, y1: 840, x2: 380, y2: 840, delay: 0.6 },
      { x1: 230, y1: 910, x2: 380, y2: 910, delay: 0.6 },
      { x1: 305, y1: 560, x2: 305, y2: 1000, delay: 0.6 },
    ],
    windows: [
      { x: 262, y: 660, width: 8, height: 11 },
      { x: 340, y: 730, width: 8, height: 11 },
      { x: 262, y: 800, width: 8, height: 11 },
      { x: 340, y: 870, width: 8, height: 11 },
    ],
  },
  {
    id: "B",
    fills: [
      { x: 470, y: 390, width: 34, height: 610, delay: 2.4 },
      { x: 504, y: 470, width: 100, height: 530, delay: 2.7 },
    ],
    polylines: [
      { points: "470,1000 470,390 470,360 487,344 504,360 504,390 504,1000", delay: 0.6 },
      { points: "504,1000 504,470 604,430 604,1000", delay: 0.9 },
    ],
    lines: [
      { x1: 504, y1: 540, x2: 604, y2: 540, delay: 0.9 },
      { x1: 504, y1: 610, x2: 604, y2: 610, delay: 0.9 },
      { x1: 504, y1: 680, x2: 604, y2: 680, delay: 0.9 },
      { x1: 504, y1: 750, x2: 604, y2: 750, delay: 0.9 },
      { x1: 504, y1: 820, x2: 604, y2: 820, delay: 0.9 },
      { x1: 504, y1: 890, x2: 604, y2: 890, delay: 0.9 },
    ],
    windows: [
      { x: 540, y: 570, width: 8, height: 11 },
      { x: 570, y: 710, width: 8, height: 11 },
      { x: 540, y: 850, width: 8, height: 11 },
      { x: 483, y: 540, width: 7, height: 10 },
    ],
  },
  {
    id: "C",
    fills: [{ x: 640, y: 680, width: 90, height: 320, delay: 3.0 }],
    polylines: [{ points: "640,1000 640,680 730,680 730,1000", delay: 1.2 }],
    lines: [
      { x1: 640, y1: 760, x2: 730, y2: 760, delay: 1.2 },
      { x1: 640, y1: 840, x2: 730, y2: 840, delay: 1.2 },
      { x1: 640, y1: 920, x2: 730, y2: 920, delay: 1.2 },
      { x1: 685, y1: 680, x2: 685, y2: 1000, delay: 1.2 },
    ],
    windows: [
      { x: 660, y: 800, width: 8, height: 11 },
      { x: 700, y: 880, width: 8, height: 11 },
    ],
  },
]

interface TowerGroupProps extends TowerSpec {
  hovered: TowerId | null
  active: boolean
  hasDrawn: boolean
  shouldReduceMotion: boolean
  onHover: (id: TowerId | null) => void
  onToggle: (id: TowerId) => void
}

function TowerGroup({
  id,
  fills,
  polylines,
  lines,
  windows,
  hovered,
  active,
  hasDrawn,
  shouldReduceMotion,
  onHover,
  onToggle,
}: TowerGroupProps) {
  const isHovered = hovered === id
  const animateKey = shouldReduceMotion ? "rest" : !hasDrawn ? "show" : isHovered ? "hover" : "rest"
  const initial = shouldReduceMotion ? false : "hidden"
  const windowAnimate = active ? (shouldReduceMotion ? "activeStatic" : "active") : "idle"

  return (
    <motion.g
      className="cursor-pointer"
      onPointerEnter={() => onHover(id)}
      onPointerLeave={() => onHover(null)}
      onClick={() => onToggle(id)}
      animate={{ y: shouldReduceMotion || !isHovered ? 0 : -6 }}
      transition={{ duration: 0.5, ease: "easeOut" }}
    >
      {fills.map((r, i) => (
        <motion.rect
          key={`fill-${i}`}
          x={r.x}
          y={r.y}
          width={r.width}
          height={r.height}
          initial={initial}
          animate={animateKey}
          variants={fillVariants(r.delay)}
        />
      ))}
      {polylines.map((p, i) => (
        <motion.polyline
          key={`poly-${i}`}
          points={p.points}
          strokeWidth={1.25}
          vectorEffect="non-scaling-stroke"
          initial={initial}
          animate={animateKey}
          variants={strokeVariants(p.delay)}
        />
      ))}
      {lines.map((l, i) => (
        <motion.line
          key={`line-${i}`}
          x1={l.x1}
          y1={l.y1}
          x2={l.x2}
          y2={l.y2}
          strokeWidth={1.25}
          vectorEffect="non-scaling-stroke"
          initial={initial}
          animate={animateKey}
          variants={strokeVariants(l.delay)}
        />
      ))}
      <motion.g initial={false} animate={windowAnimate} variants={windowVariants}>
        {windows.map((w, i) => (
          <rect key={`win-${i}`} x={w.x} y={w.y} width={w.width} height={w.height} fill={WINDOW_FILL} />
        ))}
      </motion.g>
    </motion.g>
  )
}

function Beacon({ cx, cy, delay, shouldReduceMotion }: { cx: number; cy: number; delay: number; shouldReduceMotion: boolean }) {
  if (shouldReduceMotion) {
    return (
      <g>
        <circle cx={cx} cy={cy} r={7} fill={BEACON} opacity={0.3} />
        <circle cx={cx} cy={cy} r={3.2} fill={BEACON} opacity={1} />
      </g>
    )
  }
  return (
    <g>
      <motion.circle
        cx={cx}
        cy={cy}
        r={7}
        fill={BEACON}
        animate={{ opacity: [0, 0, 0.4, 0, 0] }}
        transition={{ duration: 2.4, times: [0, 0.42, 0.5, 0.58, 1], repeat: Infinity, ease: "easeInOut", delay }}
      />
      <motion.circle
        cx={cx}
        cy={cy}
        r={3.2}
        fill={BEACON}
        animate={{ opacity: [0.2, 0.2, 1, 0.2, 0.2] }}
        transition={{ duration: 2.4, times: [0, 0.42, 0.5, 0.58, 1], repeat: Infinity, ease: "easeInOut", delay }}
      />
    </g>
  )
}

/** Interactive 3-tower skyline: draws in on mount, lifts + recolors on hover, toggles lit windows on click. */
export function FrostedSkyline() {
  const shouldReduceMotion = !!useReducedMotion()
  const gradientId = React.useId()
  const [hovered, setHovered] = React.useState<TowerId | null>(null)
  const [active, setActive] = React.useState<Record<TowerId, boolean>>({ A: false, B: false, C: false })
  const [hasDrawn, setHasDrawn] = React.useState(shouldReduceMotion)

  React.useEffect(() => {
    if (shouldReduceMotion) {
      setHasDrawn(true)
      return
    }
    const timer = setTimeout(() => setHasDrawn(true), 3000)
    return () => clearTimeout(timer)
  }, [shouldReduceMotion])

  return (
    <svg
      className="absolute inset-0 z-20 h-full w-full"
      viewBox="0 0 1000 1000"
      preserveAspectRatio="xMidYMax slice"
      fill="none"
      aria-hidden="true"
    >
      <defs>
        <radialGradient id={gradientId} cx="50%" cy="60%" r="60%">
          <stop offset="0%" stopColor={WASH} stopOpacity={0.55} />
          <stop offset="100%" stopColor={WASH} stopOpacity={0} />
        </radialGradient>
      </defs>
      <rect x={580} y={600} width={220} height={400} fill={`url(#${gradientId})`} />

      <g stroke={GRID} strokeWidth={1} opacity={0.12}>
        <line x1="0" y1="500" x2="1000" y2="500" vectorEffect="non-scaling-stroke" />
        <line x1="0" y1="700" x2="1000" y2="700" vectorEffect="non-scaling-stroke" />
        <line x1="0" y1="880" x2="1000" y2="880" vectorEffect="non-scaling-stroke" />
        <line x1="300" y1="300" x2="300" y2="1000" vectorEffect="non-scaling-stroke" />
        <line x1="500" y1="300" x2="500" y2="1000" vectorEffect="non-scaling-stroke" />
        <line x1="700" y1="300" x2="700" y2="1000" vectorEffect="non-scaling-stroke" />
      </g>

      {TOWERS.map((tower) => (
        <TowerGroup
          key={tower.id}
          {...tower}
          hovered={hovered}
          active={active[tower.id]}
          hasDrawn={hasDrawn}
          shouldReduceMotion={shouldReduceMotion}
          onHover={setHovered}
          onToggle={(id) => setActive((prev) => ({ ...prev, [id]: !prev[id] }))}
        />
      ))}

      <Beacon cx={305} cy={507} delay={0} shouldReduceMotion={shouldReduceMotion} />
      <Beacon cx={487} cy={341} delay={1.2} shouldReduceMotion={shouldReduceMotion} />
    </svg>
  )
}
