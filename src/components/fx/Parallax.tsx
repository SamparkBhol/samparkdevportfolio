"use client";
import { useEffect, useRef } from "react";
import { gsap } from "gsap";
import { ScrollTrigger } from "gsap/ScrollTrigger";

/** Scroll-driven parallax: translates the element by `amount` px over its scroll
 *  span. Positive = moves down slower (depth back); negative = faster (depth front). */
export function Parallax({
  children,
  amount = 80,
  axis = "y",
  className,
}: {
  children: React.ReactNode;
  amount?: number;
  axis?: "x" | "y";
  className?: string;
}) {
  const ref = useRef<HTMLDivElement>(null);
  useEffect(() => {
    const el = ref.current;
    if (!el || document.documentElement.dataset.lenis === "off") return;
    gsap.registerPlugin(ScrollTrigger);
    const tween = gsap.fromTo(
      el,
      { [axis]: -amount },
      {
        [axis]: amount,
        ease: "none",
        scrollTrigger: { trigger: el, start: "top bottom", end: "bottom top", scrub: true },
      },
    );
    return () => {
      tween.scrollTrigger?.kill();
      tween.kill();
    };
  }, [amount, axis]);
  return (
    <div ref={ref} className={className}>
      {children}
    </div>
  );
}
