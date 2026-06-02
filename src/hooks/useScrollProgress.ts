"use client";
import { useEffect, useState } from "react";

export function computeProgress(scrollY: number, max: number): number {
  if (max <= 0) return 0;
  return Math.min(1, Math.max(0, scrollY / max));
}

export function useScrollProgress(): number {
  const [progress, setProgress] = useState(0);
  useEffect(() => {
    function onScroll() {
      const max = document.documentElement.scrollHeight - window.innerHeight;
      setProgress(computeProgress(window.scrollY, max));
    }
    onScroll();
    window.addEventListener("scroll", onScroll, { passive: true });
    window.addEventListener("resize", onScroll);
    return () => {
      window.removeEventListener("scroll", onScroll);
      window.removeEventListener("resize", onScroll);
    };
  }, []);
  return progress;
}
