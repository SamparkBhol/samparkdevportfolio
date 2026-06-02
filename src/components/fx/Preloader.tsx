"use client";
import { useEffect, useState } from "react";
import { motion, AnimatePresence } from "motion/react";

/**
 * Cinematic arcade boot: a full-screen "INSERT COIN → LOADING" sequence with a
 * filling bar that wipes away to reveal the site. Shows once per session; skipped
 * entirely under reduced-motion.
 */
export function Preloader() {
  const [show, setShow] = useState(false);
  const [pct, setPct] = useState(0);

  useEffect(() => {
    if (typeof window === "undefined") return;
    const reduce = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
    if (reduce || sessionStorage.getItem("booted") === "1") return;
    setShow(true);
    document.body.style.overflow = "hidden";
    const start = performance.now();
    let raf = 0;
    const tick = (now: number) => {
      const t = Math.min(1, (now - start) / 1700);
      setPct(Math.round(t * 100));
      if (t < 1) raf = requestAnimationFrame(tick);
      else {
        sessionStorage.setItem("booted", "1");
        setTimeout(() => { setShow(false); document.body.style.overflow = ""; }, 380);
      }
    };
    raf = requestAnimationFrame(tick);
    return () => { cancelAnimationFrame(raf); document.body.style.overflow = ""; };
  }, []);

  return (
    <AnimatePresence>
      {show && (
        <motion.div
          aria-hidden
          exit={{ y: "-100%" }}
          transition={{ duration: 0.5, ease: [0.76, 0, 0.24, 1] }}
          className="fixed inset-0 z-[100] grid place-items-center bg-crt"
        >
          <div className="scanlines absolute inset-0 opacity-60" />
          <div className="relative w-[min(86vw,420px)] text-center">
            <motion.p
              initial={{ scale: 0.8, opacity: 0 }} animate={{ scale: 1, opacity: 1 }}
              transition={{ type: "spring", stiffness: 200, damping: 12 }}
              className="font-comic text-4xl md:text-6xl text-pop-yellow [-webkit-text-stroke:2px_black] drop-shadow-[4px_4px_0_#000]"
            >
              PRESS&nbsp;START
            </motion.p>
            <p className="mt-3 font-pixel text-[10px] text-pop-cyan">{pct < 100 ? "LOADING…" : "READY"}</p>
            <div className="mt-4 h-4 w-full nb-border bg-ink/40 overflow-hidden">
              <div className="h-full bg-pop-green transition-[width] duration-100" style={{ width: `${pct}%` }} />
            </div>
            <p className="mt-2 font-pixel text-[8px] text-paper/50">{pct}%</p>
          </div>
        </motion.div>
      )}
    </AnimatePresence>
  );
}
