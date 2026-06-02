"use client";
import { useEffect, useRef } from "react";
import { gsap } from "gsap";
import { ScrollTrigger } from "gsap/ScrollTrigger";

type Dir = "up" | "down" | "left" | "right" | "scale";

/**
 * Scroll-choreographed reveal via GSAP ScrollTrigger. Unlike one-shot whileInView,
 * this can be `scrub`bed (tied to scroll position, reversible). Falls back to
 * instantly-visible under reduced-motion (the provider sets data-lenis=off).
 */
export function Reveal({
  children,
  dir = "up",
  distance = 40,
  delay = 0,
  scrub = false,
  className,
}: {
  children: React.ReactNode;
  dir?: Dir;
  distance?: number;
  delay?: number;
  scrub?: boolean;
  className?: string;
}) {
  const ref = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const el = ref.current;
    if (!el) return;
    if (document.documentElement.dataset.lenis === "off") {
      gsap.set(el, { opacity: 1, x: 0, y: 0, scale: 1 });
      return;
    }
    gsap.registerPlugin(ScrollTrigger);
    const from: gsap.TweenVars = { opacity: 0 };
    if (dir === "up") from.y = distance;
    else if (dir === "down") from.y = -distance;
    else if (dir === "left") from.x = distance;
    else if (dir === "right") from.x = -distance;
    else if (dir === "scale") from.scale = 0.9;

    const tween = gsap.fromTo(el, from, {
      opacity: 1,
      x: 0,
      y: 0,
      scale: 1,
      duration: 0.9,
      delay: scrub ? 0 : delay,
      ease: "power3.out",
      scrollTrigger: {
        trigger: el,
        start: "top 85%",
        end: scrub ? "top 45%" : undefined,
        scrub: scrub ? 1 : false,
        toggleActions: scrub ? undefined : "play none none none",
      },
    });
    return () => {
      tween.scrollTrigger?.kill();
      tween.kill();
    };
  }, [dir, distance, delay, scrub]);

  return (
    <div ref={ref} className={className} style={{ opacity: 0 }}>
      {children}
    </div>
  );
}
