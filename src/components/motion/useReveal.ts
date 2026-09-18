"use client";
import { useEffect } from "react";
/** Browsers without CSS scroll-driven animations get the same ink-in via one IntersectionObserver. */
export function useReveal() {
  useEffect(() => {
    if (typeof CSS !== "undefined" && CSS.supports("animation-timeline: view()")) return;
    const els = Array.from(document.querySelectorAll<HTMLElement>(".ink-in"));
    if (!els.length) return;
    const io = new IntersectionObserver((entries) => entries.forEach((e) => { if (e.isIntersecting) { e.target.classList.add("is-on"); io.unobserve(e.target); } }), { rootMargin: "0px 0px -10% 0px", threshold: 0.05 });
    els.forEach((el) => io.observe(el));
    return () => io.disconnect();
  }, []);
}
