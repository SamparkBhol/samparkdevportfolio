"use client";
import { useEffect, useRef, useState } from "react";
import { motion, useMotionValue, useSpring } from "motion/react";

/**
 * DaggerCursor — a custom tantō cursor scoped to ONE section. While the pointer
 * is inside `targetRef`, the OS/global cursor is suppressed (body[data-cursor=
 * "dagger"], which PixelCursor reads to hide itself) and a dagger follows the
 * pointer with a faint afterimage trail; pressing "stabs" it forward.
 *
 * Desktop + fine-pointer only; disabled under reduced-motion / touch so the
 * section keeps the normal cursor there.
 */
export function DaggerCursor({ targetRef }: { targetRef: React.RefObject<HTMLElement | null> }) {
  const x = useMotionValue(-300);
  const y = useMotionValue(-300);
  const lean = useMotionValue(0);
  // afterimage trails lag behind via softer springs
  const tx1 = useSpring(x, { stiffness: 260, damping: 26 });
  const ty1 = useSpring(y, { stiffness: 260, damping: 26 });
  const tx2 = useSpring(x, { stiffness: 150, damping: 24 });
  const ty2 = useSpring(y, { stiffness: 150, damping: 24 });

  const [enabled, setEnabled] = useState(false);
  const [active, setActive] = useState(false);
  const [stab, setStab] = useState(false);
  const activeRef = useRef(false);

  useEffect(() => {
    const fine = window.matchMedia("(pointer: fine)").matches;
    const reduce = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
    setEnabled(fine && !reduce);
  }, []);

  useEffect(() => {
    if (!enabled) return;
    let lastX = 0;
    let raf = 0;

    const setActiveState = (next: boolean) => {
      if (activeRef.current === next) return;
      activeRef.current = next;
      setActive(next);
      if (next) document.body.dataset.cursor = "dagger";
      else if (document.body.dataset.cursor === "dagger") delete document.body.dataset.cursor;
    };

    const onMove = (e: PointerEvent) => {
      const el = targetRef.current;
      if (!el) return;
      const r = el.getBoundingClientRect();
      const inside =
        e.clientX >= r.left && e.clientX <= r.right && e.clientY >= r.top && e.clientY <= r.bottom;
      if (!inside) {
        setActiveState(false);
        return;
      }
      setActiveState(true);
      x.set(e.clientX);
      y.set(e.clientY);
      // subtle lean from horizontal velocity (clamped) for a "swing" feel
      const vx = e.clientX - lastX;
      lastX = e.clientX;
      if (!raf) {
        raf = requestAnimationFrame(() => {
          raf = 0;
          lean.set(Math.max(-14, Math.min(14, vx)));
        });
      }
    };
    const onDown = () => {
      if (activeRef.current) {
        setStab(true);
        window.setTimeout(() => setStab(false), 160);
      }
    };

    window.addEventListener("pointermove", onMove, { passive: true });
    window.addEventListener("pointerdown", onDown, { passive: true });
    return () => {
      window.removeEventListener("pointermove", onMove);
      window.removeEventListener("pointerdown", onDown);
      if (raf) cancelAnimationFrame(raf);
      if (document.body.dataset.cursor === "dagger") delete document.body.dataset.cursor;
    };
  }, [enabled, targetRef, x, y, lean]);

  if (!enabled) return null;

  return (
    <>
      {/* afterimage echoes (cheap motion-blur feel) */}
      <Echo x={tx2} y={ty2} opacity={0.18} active={active} />
      <Echo x={tx1} y={ty1} opacity={0.34} active={active} />
      {/* the dagger itself */}
      <motion.div
        aria-hidden
        className="pointer-events-none fixed left-0 top-0 z-[92] hidden md:block"
        style={{ x, y, opacity: active ? 1 : 0 }}
      >
        <motion.div style={{ rotate: lean, transformOrigin: "20px 2px" }}>
          <motion.div
            animate={stab ? { x: -7, y: -7, scale: 1.12 } : { x: 0, y: 0, scale: 1 }}
            transition={{ type: "spring", stiffness: 900, damping: 18 }}
            style={{ rotate: -38, transformOrigin: "20px 2px" }}
          >
            <Tanto />
          </motion.div>
        </motion.div>
      </motion.div>
    </>
  );
}

function Echo({
  x,
  y,
  opacity,
  active,
}: {
  x: ReturnType<typeof useSpring>;
  y: ReturnType<typeof useSpring>;
  opacity: number;
  active: boolean;
}) {
  return (
    <motion.div
      aria-hidden
      className="pointer-events-none fixed left-0 top-0 z-[91] hidden md:block"
      style={{ x, y, opacity: active ? opacity : 0 }}
    >
      <div style={{ transform: "rotate(-38deg)", transformOrigin: "20px 2px" }}>
        <Tanto echo />
      </div>
    </motion.div>
  );
}

/* The tantō, drawn pointing up with the tip at (20,2) = cursor hotspot. */
function Tanto({ echo = false }: { echo?: boolean }) {
  return (
    <svg width={40} height={48} viewBox="0 0 40 48" style={{ marginLeft: -20, marginTop: -2, display: "block" }}>
      {!echo && (
        <defs>
          <linearGradient id="dagBlade" x1="0" y1="0" x2="1" y2="0">
            <stop offset="0" stopColor="#6f86b8" />
            <stop offset="0.45" stopColor="#e8edf7" />
            <stop offset="0.55" stopColor="#cdd8ff" />
            <stop offset="1" stopColor="#586a99" />
          </linearGradient>
          <filter id="dagShadow" x="-40%" y="-40%" width="180%" height="180%">
            <feDropShadow dx="1.5" dy="1.5" stdDeviation="0" floodColor="#0a0a0a" floodOpacity="0.7" />
          </filter>
        </defs>
      )}
      <g filter={echo ? undefined : "url(#dagShadow)"}>
        {/* blade */}
        <polygon
          points="20,2 15,18 25,18"
          fill={echo ? "#9fb6e8" : "url(#dagBlade)"}
          stroke="#0a0a0a"
          strokeWidth={1.6}
          strokeLinejoin="round"
        />
        {/* blood-groove highlight */}
        {!echo && <line x1="20" y1="5" x2="20" y2="16" stroke="#ffffff" strokeWidth={1} opacity={0.7} />}
        {/* tsuba (guard) */}
        <rect x="11" y="18" width="18" height="3" rx="1" fill="#0a0a0a" />
        <rect x="14" y="18.5" width="12" height="2" fill="#ffd23f" />
        {/* handle (tsuka) */}
        <rect x="16.5" y="21" width="7" height="16" rx="1.5" fill="#0a0a0a" />
        {!echo && (
          <>
            {/* ito cross-wrap */}
            <path d="M16.5 24 L23.5 28 M16.5 28 L23.5 24 M16.5 30 L23.5 34 M16.5 34 L23.5 30"
              stroke="#ffd23f" strokeWidth={1} opacity={0.85} />
          </>
        )}
        {/* pommel */}
        <rect x="15" y="37" width="10" height="3.5" rx="1.2" fill="#0a0a0a" />
        <rect x="17" y="37.6" width="6" height="2" fill="#ff3b3b" />
        {/* tip glint */}
        {!echo && <circle cx="20" cy="4.5" r="1" fill="#ffffff" />}
      </g>
    </svg>
  );
}
