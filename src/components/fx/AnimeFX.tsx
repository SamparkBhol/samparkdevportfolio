"use client";
import { motion, AnimatePresence } from "motion/react";

/* ============================================================================
   Anime effect primitives — pure CSS/SVG/Motion, no canvas, hydration-safe
   (deterministic positions, no Math.random in render).
   ========================================================================== */

/** 集中線 — radial focus lines that emphasise a subject. `currentColor` drives
 *  the line color; wrap with a text-color class. Spins via CSS (killed under
 *  reduced-motion by the global media query). */
export function FocusLines({
  className = "",
  reverse = false,
  active = false,
}: {
  className?: string;
  reverse?: boolean;
  active?: boolean;
}) {
  return (
    <motion.div
      aria-hidden
      className={`pointer-events-none absolute inset-0 ${className}`}
      animate={{ scale: active ? 1.06 : 1, opacity: active ? 1 : 0.55 }}
      transition={{ type: "spring", stiffness: 160, damping: 20 }}
    >
      <div className={`focus-lines absolute inset-[-25%] ${reverse ? "focus-spin-rev" : "focus-spin"}`} />
    </motion.div>
  );
}

/** きらきら — a few twinkling sparkles at deterministic spots. */
const SPARKS = [
  { x: 12, y: 22, s: 10, d: 0 },
  { x: 82, y: 14, s: 14, d: 0.4 },
  { x: 68, y: 70, s: 9, d: 0.8 },
  { x: 28, y: 78, s: 12, d: 1.2 },
  { x: 50, y: 38, s: 8, d: 1.6 },
  { x: 90, y: 52, s: 11, d: 2.0 },
];
export function KiraSparkles({ count = 4, color = "#ffd23f" }: { count?: number; color?: string }) {
  return (
    <div aria-hidden className="pointer-events-none absolute inset-0 overflow-hidden">
      {SPARKS.slice(0, count).map((p, i) => (
        <span
          key={i}
          className="absolute"
          style={{
            left: `${p.x}%`,
            top: `${p.y}%`,
            width: p.s,
            height: p.s,
            background: color,
            clipPath:
              "polygon(50% 0%, 60% 40%, 100% 50%, 60% 60%, 50% 100%, 40% 60%, 0% 50%, 40% 40%)",
            animation: `kira-pop ${2.4 + (i % 3) * 0.6}s ease-in-out ${p.d}s infinite`,
            filter: `drop-shadow(0 0 4px ${color})`,
          }}
        />
      ))}
    </div>
  );
}

/** 斬撃 — a one-shot anime blade-slash + flash that wipes across the parent. */
export function SlashImpact({ show, onDone }: { show: boolean; onDone?: () => void }) {
  return (
    <AnimatePresence onExitComplete={onDone}>
      {show && (
        <motion.div
          aria-hidden
          className="pointer-events-none absolute inset-0 z-[8] overflow-hidden"
          initial={{ opacity: 1 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
        >
          {/* white slash slab sweeping diagonally */}
          <motion.div
            className="absolute top-1/2 h-[160%] w-[55%]"
            style={{
              left: "-30%",
              rotate: -24,
              background:
                "linear-gradient(90deg, transparent, rgba(255,255,255,.95) 45%, #00e5ff 50%, rgba(255,255,255,.95) 55%, transparent)",
              filter: "blur(1px)",
            }}
            initial={{ x: "-60%", y: "-50%", opacity: 0 }}
            animate={{ x: "260%", opacity: [0, 1, 1, 0] }}
            transition={{ duration: 0.42, ease: [0.7, 0, 0.3, 1] }}
          />
          {/* hard ink slash stroke left behind */}
          <motion.div
            className="absolute left-[8%] top-1/2 h-[3px] w-[84%] origin-center bg-ink"
            style={{ rotate: -24 }}
            initial={{ scaleX: 0, opacity: 0 }}
            animate={{ scaleX: [0, 1, 1], opacity: [0, 1, 0] }}
            transition={{ duration: 0.5, ease: "easeOut" }}
          />
          {/* localized flash */}
          <motion.div
            className="absolute inset-0 bg-paper mix-blend-overlay"
            initial={{ opacity: 0.65 }}
            animate={{ opacity: 0 }}
            transition={{ duration: 0.38 }}
          />
        </motion.div>
      )}
    </AnimatePresence>
  );
}

/** Impact stamp — a "UNLOCKED!" star-burst that pops then fades. */
export function ImpactStamp({ show, label, color = "#ffd23f" }: { show: boolean; label: string; color?: string }) {
  return (
    <AnimatePresence>
      {show && (
        <motion.div
          aria-hidden
          className="pointer-events-none absolute inset-0 z-[9] grid place-items-center"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
        >
          <motion.div
            className="relative grid place-items-center"
            initial={{ scale: 0.2, rotate: -18 }}
            animate={{ scale: [0.2, 1.15, 1], rotate: [-18, -8, -8] }}
            transition={{ duration: 0.5, ease: [0.2, 0.9, 0.2, 1] }}
          >
            {/* starburst backing */}
            <div
              className="absolute h-24 w-24"
              style={{
                background: color,
                clipPath:
                  "polygon(50% 0,61% 35%,98% 35%,68% 57%,79% 91%,50% 70%,21% 91%,32% 57%,2% 35%,39% 35%)",
                filter: `drop-shadow(2px 2px 0 #0a0a0a)`,
              }}
            />
            <span className="relative font-comic text-sm text-ink [-webkit-text-stroke:0.4px_black]">
              {label}
            </span>
          </motion.div>
        </motion.div>
      )}
    </AnimatePresence>
  );
}
