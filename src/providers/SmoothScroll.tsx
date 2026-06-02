"use client";
import { useEffect } from "react";
import { gsap } from "gsap";
import { ScrollTrigger } from "gsap/ScrollTrigger";

/**
 * Scroll FX coordinator. Uses the browser's NATIVE scroll (snappy, what
 * recruiters expect) and just enables GSAP ScrollTrigger reveals on capable
 * desktops. The `data-lenis` flag is the gate the fx components read:
 *   "on"  → desktop, fine pointer, motion allowed → run scroll reveals
 *   "off" → reduced-motion or touch → components render their static fallback
 * (The attribute name is historical; there is no smooth-scroll hijack anymore.)
 */
export function SmoothScroll({ children }: { children: React.ReactNode }) {
  useEffect(() => {
    if (typeof window === "undefined") return;
    const reduce = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
    const coarse = window.matchMedia("(pointer: coarse)").matches;

    if (reduce || coarse) {
      document.documentElement.dataset.lenis = "off";
      return;
    }
    gsap.registerPlugin(ScrollTrigger);
    document.documentElement.dataset.lenis = "on";
    // ScrollTrigger listens to native scroll on its own; one refresh after
    // layout settles keeps trigger positions correct.
    const id = window.setTimeout(() => ScrollTrigger.refresh(), 200);

    return () => {
      window.clearTimeout(id);
      document.documentElement.removeAttribute("data-lenis");
    };
  }, []);

  return <>{children}</>;
}

/** Smoothly scroll to an element id using native smooth-scroll. */
export function scrollToId(id: string) {
  if (typeof window === "undefined") return;
  const el = document.getElementById(id);
  if (el) el.scrollIntoView({ behavior: "smooth", block: "start" });
}
