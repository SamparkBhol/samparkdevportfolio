"use client";

import { useCallback, useEffect, useRef, useState } from "react";
import dynamic from "next/dynamic";
import { motion, AnimatePresence, useMotionValue } from "motion/react";
import { cn } from "@/lib/cn";
import { HeroBoundary } from "@/components/three/HeroBoundary";
import { useKonami } from "@/hooks/useKonami";
import { reportLore } from "@/providers/LoreProvider";

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

/* The pet emotes with tiny glyphs, never sentences — it can't be "wrong". */
type Emote = "" | "trick" | "nap" | "party";
const EMOTE_GLYPH: Record<Exclude<Emote, "">, string> = { trick: "★", nap: "zZ", party: "♪" };

/* The command ring shown when you click the pet. Each is an explicit order — the
   pet only acts on command, never on its own. */
type CmdId = "trick" | "follow" | "nap" | "cheer";

/* Pixel palette mapped to the project's pop tokens. */
const C = {
  ink: "#0a0a0a",
  steel: "#00e5ff",
  steelDk: "#0094a8",
  plume: "#ff4fd8",
  plumeRed: "#ff3b3b",
  gold: "#ffd23f",
  shield: "#39ff14",
  visor: "#0b0b12",
  paper: "#fdf6e3",
} as const;

/**
 * PixelBuddy — a COMMANDABLE pixel/fox companion. It idles in the bottom-right
 * and follows the cursor by default; click it to open a command ring and tell it
 * what to do (trick, follow/stay, nap/wake, cheer). It never acts on its own.
 */
export function PixelBuddy() {
  const [hovered, setHovered] = useState(false);
  const [blink, setBlink] = useState(false);
  const [reduced, setReduced] = useState(false);
  const [look, setLook] = useState({ x: 0, y: 0 });
  const [walking, setWalking] = useState(false);
  const [facing, setFacing] = useState<1 | -1>(1); // sprite faces right by default
  const [use3d, setUse3d] = useState(false); // prefer the 3D fox when WebGL is available

  /* command state */
  const [menuOpen, setMenuOpen] = useState(false);
  const [following, setFollowing] = useState(true); // trail the cursor by default
  const [trick, setTrick] = useState(false);
  const [napping, setNapping] = useState(false);
  const [party, setParty] = useState(false);
  const [emote, setEmote] = useState<Emote>("");
  const emoteTimer = useRef<ReturnType<typeof setTimeout> | null>(null);
  const trickTimer = useRef<ReturnType<typeof setTimeout> | null>(null);
  const trickCount = useRef(0); // SECRET: 5 tricks → Codex Fragment IV (The Fox)

  const popEmote = useCallback((e: Exclude<Emote, "">, ms = 1300) => {
    setEmote(e);
    if (emoteTimer.current) clearTimeout(emoteTimer.current);
    emoteTimer.current = setTimeout(() => setEmote(""), ms);
  }, []);

  useEffect(() => {
    if (typeof window === "undefined") return;
    const reducedNow = window.matchMedia?.("(prefers-reduced-motion: reduce)").matches ?? false;
    setUse3d(!reducedNow && hasWebGL());
  }, []);

  const rootRef = useRef<HTMLDivElement | null>(null);
  // x position is a MotionValue (not animation-controls): it can be .set() every
  // frame from the rAF loop without requiring the component to be mounted, which
  // avoids Motion's "controls.set() before mount" error under React 19 / HMR.
  const x = useMotionValue(0);

  // Live mirrors so the async follow-loop reads current values without restarting.
  const posRef = useRef(0); // current x translate (0 = home, negative = left)
  const hoverRef = useRef(false);
  const followRef = useRef(true);
  const napRef = useRef(false);
  useEffect(() => void (hoverRef.current = hovered), [hovered]);
  useEffect(() => void (followRef.current = following), [following]);
  useEffect(() => void (napRef.current = napping), [napping]);

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

  /* ---- Follow command: trails the cursor's x while FOLLOW is on; holds still
         while STAY (or napping, or being petted). Only moves when commanded to. ---- */
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
      const hold = hoverRef.current || napRef.current || !followRef.current;
      const tgt = hold ? cur : targetRef.current;
      const d = tgt - cur;
      posRef.current = cur + d * 0.09; // smooth ease toward the cursor
      x.set(posRef.current);
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
  }, [reduced, x]);

  /* ---- Keep the buddy on-screen when the window resizes. ---- */
  useEffect(() => {
    if (typeof window === "undefined") return;
    const onResize = () => {
      const min = -Math.max(0, window.innerWidth - 96 - 24);
      targetRef.current = Math.max(min, Math.min(0, targetRef.current));
      posRef.current = Math.max(min, Math.min(0, posRef.current));
      x.set(posRef.current);
    };
    window.addEventListener("resize", onResize);
    return () => window.removeEventListener("resize", onResize);
  }, [x]);

  /* ---- Cheap pointer-look: the buddy tilts slightly toward the cursor. ---- */
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

  /* ------------------------- commands (explicit only) ------------------------ */
  const doTrick = useCallback(() => {
    setNapping(false);
    // count tricks for the hidden Fox lore (works even under reduced-motion)
    trickCount.current += 1;
    if (trickCount.current >= 5) {
      trickCount.current = 0;
      reportLore("fox");
    }
    if (reduced) return;
    setTrick(true);
    popEmote("trick", 900);
    if (trickTimer.current) clearTimeout(trickTimer.current);
    trickTimer.current = setTimeout(() => setTrick(false), 650);
  }, [reduced, popEmote]);

  const doCheer = useCallback(() => {
    setNapping(false);
    if (reduced) {
      popEmote("party", 1200);
      return;
    }
    setParty(true);
    setEmote("party");
    window.setTimeout(() => {
      setParty(false);
      setEmote("");
    }, 3800);
  }, [reduced, popEmote]);

  const toggleFollow = useCallback(() => setFollowing((f) => !f), []);
  const toggleNap = useCallback(() => {
    setNapping((n) => {
      const next = !n;
      if (next) setEmote("nap");
      else setEmote("");
      return next;
    });
  }, []);

  const runCommand = useCallback(
    (id: CmdId) => {
      setMenuOpen(false);
      if (id === "trick") doTrick();
      else if (id === "follow") toggleFollow();
      else if (id === "nap") toggleNap();
      else if (id === "cheer") doCheer();
    },
    [doTrick, toggleFollow, toggleNap, doCheer],
  );

  /* Konami code: CHEER + the final Codex Fragment V (Player One). */
  useKonami(() => {
    doCheer();
    reportLore("playerone");
  });

  /* ---- Cleanup transient timers on unmount. ---- */
  useEffect(
    () => () => {
      if (emoteTimer.current) clearTimeout(emoteTimer.current);
      if (trickTimer.current) clearTimeout(trickTimer.current);
    },
    [],
  );

  // Pointer-look suppressed while moving/napping so facing/flip reads cleanly.
  const napEyes = napping && !hovered;
  const activeLook = reduced || walking || napEyes ? { x: 0, y: 0 } : look;
  const eye = { x: activeLook.x * 1.4, y: activeLook.y * 1.0 };
  const knightProps = { facing, blink: blink || napEyes, hovered, walking, eye, look: activeLook, reduced } as const;

  // Body motion priority: trick flip > party bounce > walking > nap > idle.
  const bodyAnim = reduced
    ? undefined
    : trick
      ? { rotate: facing === 1 ? [0, -360] : [0, 360], y: [0, -26, 0], scale: [1, 1.12, 1] }
      : party
        ? { y: [0, -14, 0], rotate: [0, -8, 8, 0] }
        : walking
          ? { y: [0, -4, 0] }
          : napping
            ? { y: [0, -1.5, 0], rotate: 0 }
            : { y: [0, -5, 0, -8, 0], rotate: [0, -1.5, 0, 1.5, 0] };
  const bodyTrans = reduced
    ? undefined
    : trick
      ? { duration: 0.62, ease: "easeOut" as const }
      : party
        ? { repeat: Infinity, duration: 0.5, ease: "easeInOut" as const }
        : walking
          ? { repeat: Infinity, duration: 0.34, ease: "easeInOut" as const }
          : napping
            ? { repeat: Infinity, duration: 4.5, ease: "easeInOut" as const }
            : { repeat: Infinity, duration: 3.4, ease: "easeInOut" as const };

  const commands: { id: CmdId; label: string; color: string }[] = [
    { id: "trick", label: "TRICK", color: "bg-pop-yellow" },
    { id: "follow", label: following ? "STAY" : "FOLLOW", color: "bg-pop-cyan" },
    { id: "nap", label: napping ? "WAKE" : "NAP", color: "bg-pop-magenta" },
    { id: "cheer", label: "CHEER", color: "bg-pop-green" },
  ];

  return (
    <motion.div
      ref={rootRef}
      className="fixed bottom-4 right-4 z-[65] flex flex-col items-end gap-2 select-none"
      style={{ x, pointerEvents: "none" }}
    >
      {/* Confetti while cheering. Decorative, non-blocking. */}
      <AnimatePresence>
        {party && !reduced && (
          <motion.div
            key="confetti"
            aria-hidden
            className="pointer-events-none absolute -top-2 right-6"
            initial={{ opacity: 1 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
          >
            {CONFETTI.map((c, i) => (
              <motion.span
                key={i}
                className="absolute block h-1.5 w-1.5"
                style={{ background: c.color }}
                initial={{ x: 0, y: 0, opacity: 1, rotate: 0 }}
                animate={{ x: c.x, y: c.y, opacity: [1, 1, 0], rotate: c.r }}
                transition={{ duration: 1.1, repeat: Infinity, repeatDelay: 0.2, delay: c.d, ease: "easeOut" }}
              />
            ))}
          </motion.div>
        )}
      </AnimatePresence>

      {/* COMMAND RING — explicit orders for the pet. */}
      <AnimatePresence>
        {menuOpen && (
          <motion.div
            key="cmd"
            initial={{ opacity: 0, y: 10, scale: 0.9 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: 8, scale: 0.92 }}
            transition={{ type: "spring", stiffness: 480, damping: 26 }}
            className="mb-1 flex flex-col items-end gap-1.5"
            style={{ pointerEvents: "auto" }}
            role="menu"
            aria-label="Companion commands"
          >
            {commands.map((cmd, i) => (
              <motion.button
                key={cmd.id}
                type="button"
                role="menuitem"
                onClick={() => runCommand(cmd.id)}
                initial={{ opacity: 0, x: 14 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ delay: i * 0.04 }}
                className={cn(
                  "nb-border nb-shadow px-3 py-1.5 font-pixel text-[9px] text-ink hover:-translate-y-0.5 active:translate-y-0",
                  cmd.color,
                )}
              >
                {cmd.label}
              </motion.button>
            ))}
          </motion.div>
        )}
      </AnimatePresence>

      {/* Tiny emote glyph (★ zZ ♪) — purely decorative, never a sentence. */}
      <AnimatePresence>
        {emote && (
          <motion.span
            key={emote}
            aria-hidden
            initial={{ opacity: 0, y: 6, scale: 0.6 }}
            animate={{ opacity: 1, y: -2, scale: 1 }}
            exit={{ opacity: 0, y: -10, scale: 0.8 }}
            transition={{ type: "spring", stiffness: 500, damping: 22 }}
            className={cn(
              "mr-3 nb-border bg-paper px-1.5 py-0.5 font-comic text-sm leading-none text-ink",
              emote === "party" && "text-pop-magenta",
            )}
          >
            {EMOTE_GLYPH[emote]}
          </motion.span>
        )}
      </AnimatePresence>

      {/* The companion — click to open / close its command ring. */}
      <motion.button
        type="button"
        aria-label="Companion — click to command"
        aria-expanded={menuOpen}
        aria-haspopup="menu"
        onClick={() => setMenuOpen((o) => !o)}
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
        whileTap={reduced ? undefined : { scale: 0.9 }}
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

/* Deterministic confetti spray (no Math.random in render → hydration-safe). */
const CONFETTI = [
  { x: -22, y: -30, r: 220, d: 0, color: "#ff3b3b" },
  { x: 18, y: -34, r: -200, d: 0.1, color: "#ffd23f" },
  { x: -34, y: -16, r: 160, d: 0.2, color: "#00e5ff" },
  { x: 30, y: -20, r: -180, d: 0.05, color: "#39ff14" },
  { x: 6, y: -40, r: 240, d: 0.15, color: "#ff4fd8" },
  { x: -12, y: -26, r: -140, d: 0.25, color: "#ffd23f" },
] as const;

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
          <rect x={px(7)} y={px(0)} width={px(2)} height={px(1)} fill={C.ink} />
          <rect x={px(6)} y={px(0)} width={px(1)} height={px(1)} fill={C.plume} />
          <rect x={px(9)} y={px(0)} width={px(1)} height={px(1)} fill={C.plume} />
          <rect x={px(7)} y={px(-0.6)} width={px(2)} height={px(1)} fill={C.plume} />
          <rect x={px(7.5)} y={px(0)} width={px(1)} height={px(1)} fill={C.plumeRed} />
        </motion.g>

        {/* ---- HELMET ---- */}
        <rect x={px(5)} y={px(1)} width={px(6)} height={px(1)} fill={C.ink} />
        <rect x={px(4)} y={px(2)} width={px(8)} height={px(4)} fill={C.ink} />
        <rect x={px(5)} y={px(2)} width={px(6)} height={px(3)} fill={C.steel} />
        <rect x={px(5)} y={px(4)} width={px(6)} height={px(1)} fill={C.steelDk} />
        <rect x={px(10)} y={px(2)} width={px(1)} height={px(3)} fill={C.steelDk} />
        <rect x={px(5)} y={px(3)} width={px(6)} height={px(1)} fill={C.visor} />
        {!blink && (
          <>
            <rect x={px(6) + eye.x} y={px(3) + eye.y} width={px(0.8)} height={px(0.8)} fill={C.gold} />
            <rect x={px(9) + eye.x} y={px(3) + eye.y} width={px(0.8)} height={px(0.8)} fill={C.gold} />
          </>
        )}

        {/* ---- BODY / ARMOR ---- */}
        <rect x={px(4)} y={px(6)} width={px(8)} height={px(6)} fill={C.ink} />
        <rect x={px(5)} y={px(6)} width={px(6)} height={px(5)} fill={C.steel} />
        <rect x={px(5)} y={px(6)} width={px(2)} height={px(1)} fill={C.paper} />
        <rect x={px(5)} y={px(9)} width={px(6)} height={px(2)} fill={C.steelDk} />
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
          <rect x={px(11)} y={px(4)} width={px(1)} height={px(5)} fill={C.ink} />
          <rect x={px(11.2)} y={px(4)} width={px(0.6)} height={px(5)} fill={C.gold} />
          <rect x={px(11.2)} y={px(3.4)} width={px(0.6)} height={px(0.8)} fill={C.gold} />
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
          <rect x={px(2)} y={px(6)} width={px(3)} height={px(6)} fill={C.ink} />
          <rect x={px(2.6)} y={px(6.6)} width={px(1.8)} height={px(4.4)} fill={C.shield} />
          <rect x={px(3.3)} y={px(7)} width={px(0.6)} height={px(3.4)} fill={C.gold} />
          <rect x={px(2.6)} y={px(8.2)} width={px(1.8)} height={px(0.7)} fill={C.gold} />
          <rect x={px(2.6)} y={px(6.6)} width={px(0.6)} height={px(0.8)} fill={C.paper} />
        </motion.g>
      </motion.g>
    </svg>
  );
}
