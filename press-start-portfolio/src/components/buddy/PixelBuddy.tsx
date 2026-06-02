"use client";

import { useCallback, useEffect, useMemo, useRef, useState } from "react";
import dynamic from "next/dynamic";
import { motion, AnimatePresence, useAnimationControls } from "motion/react";
import { cn } from "@/lib/cn";
import { SpeechBubble } from "@/components/ui/SpeechBubble";
import { HeroBoundary } from "@/components/three/HeroBoundary";

// The 3D fox companion (real CC0 model). Loaded only on the client; falls back
// to the hand-drawn pixel knight when WebGL is unavailable or via the boundary.
const FoxBuddy = dynamic(() => import("./FoxBuddy"), { ssr: false });

function hasWebGL(): boolean {
  try {
    const c = document.createElement("canvas");
    return (
      typeof window !== "undefined" &&
      !!window.WebGLRenderingContext &&
      !!(c.getContext("webgl") || c.getContext("experimental-webgl"))
    );
  } catch {
    return false;
  }
}

/* ------------------------------------------------------------------ */
/* Goofy, on-theme one-liners. Cycles forward on each interaction.     */
/* ------------------------------------------------------------------ */
const QUIPS = [
  "Press START, hero!",
  "Just stretching my legs.",
  "Mind the bosses below.",
  "Sound is in the HUD, knave.",
  "Try the Konami code...",
  "+10 XP for scrolling!",
  "Off on patrol — back soon.",
  "Hire this hero. Trust me.",
] as const;

/* Pixel palette mapped to the project's pop tokens. */
const C = {
  ink: "#0a0a0a",
  steel: "#00e5ff", // pop-cyan armor
  steelDk: "#0094a8",
  plume: "#ff4fd8", // pop-magenta crest
  plumeRed: "#ff3b3b", // pop-red accent
  gold: "#ffd23f", // pop-yellow trim / sword
  shield: "#39ff14", // pop-green shield face
  visor: "#0b0b12", // crt-dark visor slit
  paper: "#fdf6e3",
} as const;

/**
 * PixelBuddy — a floating, interactable pixel-art knight companion. Idles in the
 * bottom-right, then periodically strolls across the bottom of the screen and
 * walks back home. Built entirely from inline <rect> pixels (no images).
 */
export function PixelBuddy() {
  const [open, setOpen] = useState(false);
  const [quipIndex, setQuipIndex] = useState(0);
  const [hovered, setHovered] = useState(false);
  const [blink, setBlink] = useState(false);
  const [reduced, setReduced] = useState(false);
  const [look, setLook] = useState({ x: 0, y: 0 });
  const [walking, setWalking] = useState(false);
  const [facing, setFacing] = useState<1 | -1>(1); // sprite faces right by default
  const [use3d, setUse3d] = useState(false); // prefer the 3D fox when WebGL is available

  useEffect(() => {
    if (typeof window === "undefined") return;
    const reducedNow = window.matchMedia?.("(prefers-reduced-motion: reduce)").matches ?? false;
    setUse3d(!reducedNow && hasWebGL());
  }, []);

  const hideTimer = useRef<ReturnType<typeof setTimeout> | null>(null);
  const rootRef = useRef<HTMLDivElement | null>(null);
  const controls = useAnimationControls();

  // Live mirrors so the async walk-loop reads current values without restarting.
  const posRef = useRef(0); // current x translate (0 = home, negative = left)
  const hoverRef = useRef(false);
  const openRef = useRef(false);
  useEffect(() => void (hoverRef.current = hovered), [hovered]);
  useEffect(() => void (openRef.current = open), [open]);

  /* ---- Respect prefers-reduced-motion (mirrors the global CSS guard). ---- */
  useEffect(() => {
    if (typeof window === "undefined" || !window.matchMedia) return;
    const mq = window.matchMedia("(prefers-reduced-motion: reduce)");
    const apply = () => setReduced(mq.matches);
    apply();
    mq.addEventListener("change", apply);
    return () => mq.removeEventListener("change", apply);
  }, []);

  /* ---- Occasional blink so the visor feels alive. ---- */
  useEffect(() => {
    if (reduced) return;
    let blinkOff: ReturnType<typeof setTimeout> | null = null;
    const schedule = () => {
      const delay = 2600 + Math.random() * 3200;
      return setTimeout(() => {
        setBlink(true);
        blinkOff = setTimeout(() => setBlink(false), 130);
        timer = schedule();
      }, delay);
    };
    let timer = schedule();
    return () => {
      clearTimeout(timer);
      if (blinkOff) clearTimeout(blinkOff);
    };
  }, [reduced]);

  /* ---- Companion follow: the buddy trails the cursor's horizontal position,
         walking toward it and idling when it arrives. Holds still while petted. ---- */
  const targetRef = useRef(0);
  useEffect(() => {
    if (reduced || typeof window === "undefined") return;
    const SPRITE = 96;
    const leftBound = () => -Math.max(0, window.innerWidth - SPRITE - 24);
    const homeCenter = () => window.innerWidth - 24 - SPRITE / 2;

    const onMove = (e: MouseEvent) => {
      const desired = e.clientX - homeCenter();
      targetRef.current = Math.max(leftBound(), Math.min(0, desired));
    };
    window.addEventListener("mousemove", onMove, { passive: true });

    let raf = 0;
    let lastWalking = false;
    let lastFacing: 1 | -1 = 1;
    const tick = () => {
      const cur = posRef.current;
      const tgt = hoverRef.current ? cur : targetRef.current; // stay put while petted
      const d = tgt - cur;
      posRef.current = cur + d * 0.09; // smooth ease toward the cursor
      controls.set({ x: posRef.current });
      const moving = Math.abs(d) > 5;
      if (moving !== lastWalking) { lastWalking = moving; setWalking(moving); }
      if (moving) {
        const face: 1 | -1 = d > 0 ? 1 : -1;
        if (face !== lastFacing) { lastFacing = face; setFacing(face); }
      }
      raf = window.requestAnimationFrame(tick);
    };
    raf = window.requestAnimationFrame(tick);
    return () => {
      window.removeEventListener("mousemove", onMove);
      if (raf) window.cancelAnimationFrame(raf);
    };
  }, [reduced, controls]);

  /* ---- Keep the buddy on-screen when the window resizes. ---- */
  useEffect(() => {
    if (typeof window === "undefined") return;
    const onResize = () => {
      const min = -Math.max(0, window.innerWidth - 96 - 24);
      targetRef.current = Math.max(min, Math.min(0, targetRef.current));
      posRef.current = Math.max(min, Math.min(0, posRef.current));
      controls.set({ x: posRef.current });
    };
    window.addEventListener("resize", onResize);
    return () => window.removeEventListener("resize", onResize);
  }, [controls]);

  /* ---- Cheap pointer-look: knight tilts slightly toward the cursor. ---- */
  useEffect(() => {
    if (reduced || typeof window === "undefined") return;
    let raf = 0;
    const onMove = (e: MouseEvent) => {
      if (raf) return; // throttle to one update per frame
      raf = window.requestAnimationFrame(() => {
        raf = 0;
        const el = rootRef.current;
        if (!el) return;
        const r = el.getBoundingClientRect();
        const cx = r.left + r.width / 2;
        const cy = r.top + r.height / 2;
        const dx = (e.clientX - cx) / window.innerWidth;
        const dy = (e.clientY - cy) / window.innerHeight;
        setLook({
          x: Math.max(-1, Math.min(1, dx * 2)),
          y: Math.max(-1, Math.min(1, dy * 2)),
        });
      });
    };
    window.addEventListener("mousemove", onMove, { passive: true });
    return () => {
      window.removeEventListener("mousemove", onMove);
      if (raf) window.cancelAnimationFrame(raf);
    };
  }, [reduced]);

  /* ---- Cleanup auto-hide timer on unmount. ---- */
  useEffect(
    () => () => {
      if (hideTimer.current) clearTimeout(hideTimer.current);
    },
    [],
  );

  const speak = useCallback(() => {
    setOpen(true);
    setQuipIndex((i) => (i + 1) % QUIPS.length);
    if (hideTimer.current) clearTimeout(hideTimer.current);
    hideTimer.current = setTimeout(() => setOpen(false), 3600);
  }, []);

  /* Current line: show the *previous* index so the first click reads line 0. */
  const quip = useMemo(
    () => QUIPS[(quipIndex + QUIPS.length - 1) % QUIPS.length],
    [quipIndex],
  );

  // Pointer-look is suppressed while walking so facing/flip reads cleanly.
  const activeLook = reduced || walking ? { x: 0, y: 0 } : look;
  const eye = { x: activeLook.x * 1.4, y: activeLook.y * 1.0 };
  const knightProps = { facing, blink, hovered, walking, eye, look: activeLook, reduced } as const;

  // Body bob: a quick march cadence while walking, a lazy idle otherwise.
  const bodyAnim = reduced
    ? undefined
    : walking
      ? { y: [0, -4, 0] }
      : { y: [0, -5, 0, -8, 0], rotate: [0, -1.5, 0, 1.5, 0] };
  const bodyTrans = reduced
    ? undefined
    : walking
      ? { repeat: Infinity, duration: 0.34, ease: "easeInOut" as const }
      : { repeat: Infinity, duration: 3.4, ease: "easeInOut" as const };

  return (
    <motion.div
      ref={rootRef}
      animate={controls}
      initial={{ x: 0 }}
      className="fixed bottom-4 right-4 z-[65] flex flex-col items-end gap-2 select-none"
      style={{ pointerEvents: "none" }}
    >
      {/* Speech bubble — only present while open; itself non-blocking. */}
      <AnimatePresence>
        {open && (
          <motion.div
            key={quip}
            initial={{ opacity: 0, y: 8, scale: 0.85 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: 6, scale: 0.9 }}
            transition={{ type: "spring", stiffness: 500, damping: 24 }}
            className="mr-2 max-w-[200px]"
            style={{ pointerEvents: "none" }}
            role="status"
            aria-live="polite"
          >
            <SpeechBubble className="font-mono text-[12px] leading-snug">
              {quip}
            </SpeechBubble>
          </motion.div>
        )}
      </AnimatePresence>

      {/* The knight — the one real interactive control. */}
      <motion.button
        type="button"
        aria-label="Pixel knight companion"
        onClick={speak}
        onMouseEnter={() => setHovered(true)}
        onMouseLeave={() => setHovered(false)}
        onFocus={() => setHovered(true)}
        onBlur={() => setHovered(false)}
        className={cn(
          "block cursor-pointer rounded-[2px] outline-none",
          "drop-shadow-[3px_3px_0_rgba(10,10,10,0.55)]",
        )}
        style={{ pointerEvents: "auto" }}
        animate={bodyAnim}
        transition={bodyTrans}
        whileHover={reduced ? undefined : { scale: 1.08 }}
        whileTap={reduced ? undefined : { scale: 0.92, rotate: -4 }}
      >
        {use3d ? (
          <HeroBoundary fallback={<KnightFlip {...knightProps} />}>
            <FoxBuddy walking={walking} facing={facing} />
          </HeroBoundary>
        ) : (
          <KnightFlip {...knightProps} />
        )}
      </motion.button>
    </motion.div>
  );
}

/* Facing flip wrapper for the pixel-knight fallback (used when WebGL is off). */
function KnightFlip({
  facing,
  ...rest
}: {
  facing: 1 | -1;
  blink: boolean;
  hovered: boolean;
  walking: boolean;
  eye: { x: number; y: number };
  look: { x: number; y: number };
  reduced: boolean;
}) {
  return (
    <motion.div
      animate={{ scaleX: facing }}
      transition={{ type: "spring", stiffness: 260, damping: 22 }}
      style={{ transformOrigin: "center" }}
    >
      <KnightSprite {...rest} />
    </motion.div>
  );
}

/* ------------------------------------------------------------------ */
/* Inline pixel-art knight. 16x16 grid scaled up; crispEdges renders   */
/* every <rect> as a hard pixel block.                                 */
/* ------------------------------------------------------------------ */
function KnightSprite({
  blink,
  hovered,
  walking,
  eye,
  look,
  reduced,
}: {
  blink: boolean;
  hovered: boolean;
  walking: boolean;
  eye: { x: number; y: number };
  look: { x: number; y: number };
  reduced: boolean;
}) {
  const U = 5; // pixel unit size in SVG user units
  const px = (n: number) => n * U;

  // Tiny head tilt toward the pointer (whole-sprite group rotation).
  const tilt = reduced || walking ? 0 : look.x * 4;

  // Walk cycle: legs pump in opposite phase while walking.
  const step = px(1);
  const legTrans = walking && !reduced
    ? { repeat: Infinity, duration: 0.34, ease: "easeInOut" as const }
    : { duration: 0.2 };
  const legA = walking && !reduced ? { y: [0, -step, 0] } : { y: 0 };
  const legB = walking && !reduced ? { y: [-step, 0, -step] } : { y: 0 };

  return (
    <svg
      width={80}
      height={80}
      viewBox="0 0 80 80"
      shapeRendering="crispEdges"
      role="img"
      aria-hidden
      focusable="false"
      style={{ imageRendering: "pixelated", display: "block" }}
    >
      <motion.g
        animate={{ rotate: tilt }}
        transition={{ type: "spring", stiffness: 200, damping: 18 }}
        style={{ transformOrigin: "40px 56px" }}
      >
        {/* ---- PLUME / CREST (animated wiggle on hover) ---- */}
        <motion.g
          animate={
            reduced
              ? undefined
              : hovered
                ? { rotate: [0, -8, 8, -5, 0] }
                : { rotate: [0, 3, 0] }
          }
          transition={
            reduced
              ? undefined
              : hovered
                ? { duration: 0.6, ease: "easeInOut" }
                : { repeat: Infinity, duration: 2.2, ease: "easeInOut" }
          }
          style={{ transformOrigin: "40px 18px" }}
        >
          {/* crest stalk */}
          <rect x={px(7)} y={px(0)} width={px(2)} height={px(1)} fill={C.ink} />
          {/* magenta plume blobs */}
          <rect x={px(6)} y={px(0)} width={px(1)} height={px(1)} fill={C.plume} />
          <rect x={px(9)} y={px(0)} width={px(1)} height={px(1)} fill={C.plume} />
          <rect x={px(7)} y={px(-0.6)} width={px(2)} height={px(1)} fill={C.plume} />
          <rect x={px(7.5)} y={px(0)} width={px(1)} height={px(1)} fill={C.plumeRed} />
        </motion.g>

        {/* ---- HELMET ---- */}
        {/* outline / top */}
        <rect x={px(5)} y={px(1)} width={px(6)} height={px(1)} fill={C.ink} />
        <rect x={px(4)} y={px(2)} width={px(8)} height={px(4)} fill={C.ink} />
        {/* helmet face plate (steel) */}
        <rect x={px(5)} y={px(2)} width={px(6)} height={px(3)} fill={C.steel} />
        {/* helmet shading */}
        <rect x={px(5)} y={px(4)} width={px(6)} height={px(1)} fill={C.steelDk} />
        <rect x={px(10)} y={px(2)} width={px(1)} height={px(3)} fill={C.steelDk} />

        {/* visor slit (dark) */}
        <rect x={px(5)} y={px(3)} width={px(6)} height={px(1)} fill={C.visor} />
        {/* glowing eyes inside the slit; blink collapses them */}
        {!blink && (
          <>
            <rect
              x={px(6) + eye.x}
              y={px(3) + eye.y}
              width={px(0.8)}
              height={px(0.8)}
              fill={C.gold}
            />
            <rect
              x={px(9) + eye.x}
              y={px(3) + eye.y}
              width={px(0.8)}
              height={px(0.8)}
              fill={C.gold}
            />
          </>
        )}

        {/* ---- BODY / ARMOR ---- */}
        {/* torso outline */}
        <rect x={px(4)} y={px(6)} width={px(8)} height={px(6)} fill={C.ink} />
        {/* torso plate */}
        <rect x={px(5)} y={px(6)} width={px(6)} height={px(5)} fill={C.steel} />
        {/* breastplate shine + shading */}
        <rect x={px(5)} y={px(6)} width={px(2)} height={px(1)} fill={C.paper} />
        <rect x={px(5)} y={px(9)} width={px(6)} height={px(2)} fill={C.steelDk} />
        {/* gold belt trim */}
        <rect x={px(5)} y={px(8)} width={px(6)} height={px(1)} fill={C.gold} />

        {/* legs — pump in opposite phase while walking */}
        <motion.g animate={legA} transition={legTrans}>
          <rect x={px(5)} y={px(12)} width={px(2)} height={px(2)} fill={C.ink} />
          <rect x={px(5)} y={px(12)} width={px(2)} height={px(1)} fill={C.steelDk} />
        </motion.g>
        <motion.g animate={legB} transition={legTrans}>
          <rect x={px(9)} y={px(12)} width={px(2)} height={px(2)} fill={C.ink} />
          <rect x={px(9)} y={px(12)} width={px(2)} height={px(1)} fill={C.steelDk} />
        </motion.g>

        {/* ---- SWORD (right hand, gold blade) ---- */}
        <g>
          {/* blade */}
          <rect x={px(11)} y={px(4)} width={px(1)} height={px(5)} fill={C.ink} />
          <rect x={px(11.2)} y={px(4)} width={px(0.6)} height={px(5)} fill={C.gold} />
          {/* tip */}
          <rect x={px(11.2)} y={px(3.4)} width={px(0.6)} height={px(0.8)} fill={C.gold} />
          {/* crossguard + grip */}
          <rect x={px(10.4)} y={px(9)} width={px(2.2)} height={px(0.8)} fill={C.ink} />
          <rect x={px(11.1)} y={px(9.8)} width={px(0.8)} height={px(1)} fill={C.plumeRed} />
        </g>

        {/* ---- SHIELD (left arm). Raises on hover. ---- */}
        <motion.g
          animate={
            reduced ? undefined : { y: hovered ? -px(1.4) : 0, rotate: hovered ? -6 : 0 }
          }
          transition={{ type: "spring", stiffness: 320, damping: 18 }}
          style={{ transformOrigin: "20px 50px" }}
        >
          {/* shield outline */}
          <rect x={px(2)} y={px(6)} width={px(3)} height={px(6)} fill={C.ink} />
          {/* shield face (green) */}
          <rect x={px(2.6)} y={px(6.6)} width={px(1.8)} height={px(4.4)} fill={C.shield} />
          {/* shield emblem cross (gold) */}
          <rect x={px(3.3)} y={px(7)} width={px(0.6)} height={px(3.4)} fill={C.gold} />
          <rect x={px(2.6)} y={px(8.2)} width={px(1.8)} height={px(0.7)} fill={C.gold} />
          {/* shield boss highlight */}
          <rect x={px(2.6)} y={px(6.6)} width={px(0.6)} height={px(0.8)} fill={C.paper} />
        </motion.g>
      </motion.g>
    </svg>
  );
}
