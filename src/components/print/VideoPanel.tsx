"use client";
import { useEffect, useRef } from "react";
import { preload } from "react-dom";
import { VIDEOS, videoPoster, videoPosterSmall, videoSrc, type VideoKey } from "@/content/videos";
import { cn } from "@/lib/cn";

/* One IntersectionObserver for every printed video on the page. A video gets its source the first
   time it comes near the viewport, plays while visible, pauses when it leaves, and drops its source
   once it is two screens away so the hardware decoder is free for the next chapter. */
let io: IntersectionObserver | null = null;
const handlers = new WeakMap<Element, (e: IntersectionObserverEntry) => void>();
/* Page-wide arbitration: of every printed video at least a quarter on screen, only the most visible one
   plays (ties keep the current leader, so nothing flaps at a chapter boundary). */
const ratios = new Map<Element, number>();
const controls = new Map<Element, { play: () => void; pause: () => void }>();
let leader: Element | null = null;
function arbitrate() {
  let best: Element | null = null; let bestRatio = 0;
  ratios.forEach((r, el) => { if (r >= 0.25 && r > bestRatio) { best = el; bestRatio = r; } });
  const keep = leader && (ratios.get(leader) ?? 0) >= 0.25 && (ratios.get(leader) ?? 0) >= bestRatio - 0.01;
  leader = keep ? leader : best;
  controls.forEach((c, el) => { if (el === leader) c.play(); else c.pause(); });
}
function observe(el: Element, fn: (e: IntersectionObserverEntry) => void) {
  if (!io) io = new IntersectionObserver((entries) => { entries.forEach((e) => handlers.get(e.target)?.(e)); arbitrate(); }, { rootMargin: "0px", threshold: [0, 0.25, 0.5, 0.75, 1] });
  handlers.set(el, fn);
  io.observe(el);
  return () => { io?.unobserve(el); handlers.delete(el); };
}

export function VideoPanel({ video, priority = false, dim = 0.5, className, children, ariaLabel, ...rest }: {
  video: VideoKey; priority?: boolean; dim?: number; className?: string; children?: React.ReactNode; ariaLabel?: string;
} & Omit<React.HTMLAttributes<HTMLElement>, "children" | "className">) {
  const asset = VIDEOS[video];
  const ref = useRef<HTMLVideoElement>(null);
  if (priority) {
    // Resource hint so the first paint starts before the fonts and scripts do.
    preload(videoPosterSmall(asset), { as: "image", fetchPriority: "high", imageSrcSet: `${videoPosterSmall(asset)} 720w, ${videoPoster(asset)} 1280w`, imageSizes: "100vw" });
  }

  useEffect(() => {
    const v = ref.current;
    if (!v) return;
    const reduced = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
    if (reduced) return; // poster only
    const tier = window.matchMedia("(min-width: 900px)").matches ? "1080" : "720";
    const src = videoSrc(asset, tier);
    const attach = () => { if (!v.src) { v.src = src; v.load(); } v.play().catch(() => {}); };
    // Phones: no video before the visitor's first touch or scroll (the poster is the first paint).
    const coarse = window.matchMedia("(pointer: coarse)").matches;
    let armed = !coarse;
    const arm = () => { armed = true; arbitrate(); }; // the first gesture plays the one most visible loop, never two
    if (coarse) { window.addEventListener("pointerdown", arm, { once: true, passive: true }); window.addEventListener("scroll", arm, { once: true, passive: true }); }
    const attachWhenArmed = () => { if (armed) attach(); };
    if (priority) {
      // Let the poster paint first; the loop joins once the page has loaded.
      if (document.readyState === "complete") attachWhenArmed(); else window.addEventListener("load", attachWhenArmed, { once: true });
    }
    let far = false;
    controls.set(v, {
      play: attachWhenArmed,
      pause: () => { v.pause(); if (far && v.src) { v.removeAttribute("src"); v.load(); } },
    });
    const stop = observe(v, (e) => {
      ratios.set(v, e.isIntersecting ? e.intersectionRatio : 0);
      far = !e.isIntersecting && Math.abs(e.boundingClientRect.top) > window.innerHeight * 2;
    });
    const onVis = () => { if (document.hidden) v.pause(); else if (v.src && v.getBoundingClientRect().bottom > 0) v.play().catch(() => {}); };
    document.addEventListener("visibilitychange", onVis);
    return () => { stop(); ratios.delete(v); controls.delete(v); if (leader === v) leader = null; document.removeEventListener("visibilitychange", onVis); window.removeEventListener("pointerdown", arm); window.removeEventListener("scroll", arm); };
  }, [asset, priority]);

  return (
    <section className={cn("vp", className)} aria-label={ariaLabel} {...rest}>
      <video ref={ref} muted playsInline loop preload="none" poster={priority ? undefined : videoPoster(asset)} aria-hidden="true" tabIndex={-1}
        onPlaying={(e) => e.currentTarget.parentElement?.classList.add("vp-live")} />
      {priority ? (
        /* The first paint is this image, not the video: it is the LCP, fetched at high priority in the right size. */
        <img className="vp-poster" src={videoPoster(asset)} srcSet={`${videoPosterSmall(asset)} 720w, ${videoPoster(asset)} 1280w`} sizes="100vw" alt="" aria-hidden="true" fetchPriority="high" />
      ) : null}
      <div className="vp-duo" /><div className="vp-dots" /><div className="vp-wash" style={{ "--dim": dim } as React.CSSProperties} />
      {children}
    </section>
  );
}
