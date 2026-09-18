"use client";
import { useEffect } from "react";
/* Optional desktop-only weight on the wheel. Removable by deleting the <SmoothScroll/> line in page.tsx.
   Never on touch, never under reduced motion, never inside handled objects ([data-lenis-prevent]). */
export function SmoothScroll() {
  useEffect(() => {
    const fine = window.matchMedia("(pointer: fine) and (min-width: 900px)").matches;
    const reduced = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
    if (!fine || reduced) return;
    let destroy = () => {};
    import("lenis").then(({ default: Lenis }) => {
      const lenis = new Lenis({ lerp: 0.12, wheelMultiplier: 1, syncTouch: false, prevent: (node: HTMLElement) => !!node.closest("[data-lenis-prevent]") });
      let raf = 0;
      const loop = (t: number) => { lenis.raf(t); raf = requestAnimationFrame(loop); };
      raf = requestAnimationFrame(loop);
      destroy = () => { cancelAnimationFrame(raf); lenis.destroy(); };
    });
    return () => destroy();
  }, []);
  return null;
}
