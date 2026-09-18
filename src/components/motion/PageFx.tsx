"use client";
import { useReveal } from "./useReveal";
import { SmoothScroll } from "./SmoothScroll";
/* Page-level motion: the IntersectionObserver fallback for .ink-in reveals, and the optional desktop-only weight on the wheel. */
export function PageFx() {
  useReveal();
  return <SmoothScroll />;
}
