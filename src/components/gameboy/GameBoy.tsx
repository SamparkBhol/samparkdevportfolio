"use client";
import { useEffect, useRef, useState } from "react";
import { motion, AnimatePresence } from "motion/react";
import { useBlox } from "@/hooks/useBlox";
import { useInView } from "@/hooks/useInView";
import { useSound } from "@/hooks/useSound";
import { Lcd } from "./Lcd";
import { cn } from "@/lib/cn";
import type { Action } from "@/lib/blox";

const PHASE_LABEL: Record<string, string> = {
  ready: "READY", playing: "PLAYING", paused: "PAUSED", gameover: "GAME OVER",
};

const dpadCls =
  "absolute grid place-items-center bg-[#1c1c1c] text-[#9bbc0f] font-pixel text-[8px] " +
  "active:translate-y-[1px] active:brightness-110 transition";
const abCls =
  "h-12 w-12 rounded-full bg-[#7a1f3d] text-paper font-pixel text-sm nb-border nb-shadow " +
  "grid place-items-center active:translate-y-[2px] active:shadow-none transition";
const ssCls =
  "h-4 w-12 rounded-full bg-[#5a5a52] text-[#2a2a2a] font-pixel text-[7px] grid place-items-center " +
  "-rotate-[20deg] nb-border active:translate-y-[1px] transition";

export function GameBoy() {
  const { ref, inView } = useInView<HTMLDivElement>({ threshold: 0.25 });
  const { state, dispatch, canvasRef } = useBlox(inView);
  const { play } = useSound();
  const [reduced, setReduced] = useState(false);
  const [booted, setBooted] = useState(false);
  const [tilt, setTilt] = useState({ rx: 0, ry: 0 });

  useEffect(() => {
    setReduced(window.matchMedia?.("(prefers-reduced-motion: reduce)").matches ?? false);
  }, []);

  useEffect(() => {
    if (!inView || booted) return;
    if (reduced) { setBooted(true); return; }
    const t = setTimeout(() => setBooted(true), 1700);
    return () => clearTimeout(t);
  }, [inView, booted, reduced]);

  useEffect(() => {
    if (reduced) return;
    const onMove = (e: MouseEvent) => {
      const el = ref.current;
      if (!el) return;
      const r = el.getBoundingClientRect();
      const cx = r.left + r.width / 2, cy = r.top + r.height / 2;
      setTilt({
        ry: Math.max(-8, Math.min(8, ((e.clientX - cx) / r.width) * 16)),
        rx: Math.max(-6, Math.min(6, -((e.clientY - cy) / r.height) * 12)),
      });
    };
    window.addEventListener("mousemove", onMove, { passive: true });
    return () => window.removeEventListener("mousemove", onMove);
  }, [reduced, ref]);

  const press = (a: Action) => () => { play("select"); dispatch(a); };

  return (
    <div ref={ref} className="select-none" style={{ perspective: 900 }}>
      <motion.div
        animate={{ rotateX: tilt.rx, rotateY: tilt.ry, y: reduced ? 0 : [0, -4, 0] }}
        transition={{
          rotateX: { type: "spring", stiffness: 120, damping: 14 },
          rotateY: { type: "spring", stiffness: 120, damping: 14 },
          y: { repeat: Infinity, duration: 5, ease: "easeInOut" },
        }}
        style={{ transformStyle: "preserve-3d" }}
        className="relative w-[300px] max-w-[86vw] rounded-[16px_16px_56px_16px] bg-[#c9c9bd] nb-border nb-shadow-lg p-5 pb-7"
      >
        {/* top strip */}
        <div className="mb-2 flex items-center gap-2">
          <span className={cn("h-2 w-2 rounded-full", inView ? "bg-pop-red" : "bg-pop-red/40")} aria-hidden />
          <span className="font-pixel text-[7px] text-ink/60">BATTERY</span>
          <span className="ml-auto font-pixel text-[8px] text-ink/70">PLAYER ONE · PB-01</span>
        </div>

        {/* screen */}
        <div className="rounded-[10px] bg-[#4a4a44] p-3 pb-4 nb-border">
          <p className="mb-1 text-center font-pixel text-[6px] text-[#c9c9bd]">DOT MATRIX WITH STEREO SOUND</p>
          <div className="relative aspect-[160/144] overflow-hidden rounded-sm ring-2 ring-black/70">
            <Lcd ref={canvasRef} className="h-full w-full" />
            <AnimatePresence>
              {!booted && (
                <motion.div
                  initial={{ y: -80, opacity: 0 }}
                  animate={{ y: 0, opacity: 1 }}
                  exit={{ opacity: 0, transition: { duration: 0.3 } }}
                  transition={{ type: "spring", stiffness: 140, damping: 12 }}
                  className="absolute inset-0 grid place-items-center bg-[#9bbc0f]"
                >
                  <span className="font-pixel text-[11px] text-[#0f380f]">PLAYER ONE™</span>
                </motion.div>
              )}
            </AnimatePresence>
          </div>
        </div>

        <span className="sr-only" aria-live="polite">
          Status: {PHASE_LABEL[state.phase]}. Score {state.score}, level {state.level}.
        </span>

        {/* controls */}
        <div className="mt-5 flex items-center justify-between">
          {/* D-pad */}
          <div className="relative h-[78px] w-[78px]">
            <div aria-hidden className="absolute left-[27px] top-0 h-[78px] w-[24px] rounded bg-[#1c1c1c]" />
            <div aria-hidden className="absolute left-0 top-[27px] h-[24px] w-[78px] rounded bg-[#1c1c1c]" />
            <button aria-label="Rotate clockwise (Up)" onClick={press("rotateCW")} className={cn(dpadCls, "left-[27px] top-0 h-[26px] w-[24px]")}>▲</button>
            <button aria-label="Soft drop (Down)" onClick={press("softDrop")} className={cn(dpadCls, "left-[27px] top-[52px] h-[26px] w-[24px]")}>▼</button>
            <button aria-label="Move left" onClick={press("left")} className={cn(dpadCls, "left-0 top-[27px] h-[24px] w-[26px]")}>◀</button>
            <button aria-label="Move right" onClick={press("right")} className={cn(dpadCls, "left-[52px] top-[27px] h-[24px] w-[26px]")}>▶</button>
          </div>
          {/* A / B */}
          <div className="flex -rotate-[18deg] gap-3">
            <button aria-label="Rotate counter-clockwise (B)" onClick={press("rotateCCW")} className={abCls}>B</button>
            <button aria-label="Rotate clockwise (A)" onClick={press("rotateCW")} className={abCls}>A</button>
          </div>
        </div>

        {/* start / select */}
        <div className="mt-5 flex justify-center gap-4">
          <button aria-label="Hard drop (Select)" onClick={press("hardDrop")} className={ssCls}>SELECT</button>
          <button aria-label="Start, pause or restart" onClick={press("start")} className={ssCls}>START</button>
        </div>

        {/* speaker grille */}
        <div
          aria-hidden
          className="mt-4 ml-auto h-7 w-16 -rotate-[25deg] rounded"
          style={{ background: "radial-gradient(circle, rgba(0,0,0,0.4) 1px, transparent 1.6px)", backgroundSize: "6px 6px" }}
        />
      </motion.div>
    </div>
  );
}
