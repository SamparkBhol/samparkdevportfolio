"use client";
import { useEffect, useRef } from "react";
import { gsap } from "gsap";
import { ScrollTrigger } from "gsap/ScrollTrigger";
import { useInView } from "@/hooks/useInView";
import { Speedlines } from "@/components/effects/Speedlines";
import { HalftoneBg } from "./HalftoneBg";
import { SectionHeader } from "./SectionHeader";
import type { SectionId } from "@/lib/sfx";

/**
 * Section shell. On capable desktops (Lenis active) the header reveals on a
 * SCRUBBED ScrollTrigger (tied to scroll position) and the content does a fast,
 * readable reveal — premium without slowing a recruiter down. Mobile / reduced-
 * motion / unit-tests render everything instantly (gated on data-lenis="on").
 */
export function Stage({
  id,
  label,
  title,
  subtitle,
  children,
  className = "",
}: {
  id: SectionId;
  label: string;
  title: string;
  subtitle?: string;
  children: React.ReactNode;
  className?: string;
}) {
  const { ref, inView } = useInView<HTMLElement>({ threshold: 0.12 });
  const headerRef = useRef<HTMLDivElement>(null);
  const contentRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    let ctx: gsap.Context | undefined;
    // Defer one frame so the SmoothScroll provider (a parent) has set data-lenis.
    const raf = requestAnimationFrame(() => {
      const header = headerRef.current;
      const content = contentRef.current;
      if (!header || !content) return;
      if (document.documentElement.dataset.lenis !== "on") {
        gsap.set([header, content], { opacity: 1, y: 0 });
        return;
      }
      gsap.registerPlugin(ScrollTrigger);
      ctx = gsap.context(() => {
        // One-shot reveal (not scrubbed) — content no longer drifts with the
        // scrollbar, which reads calmer and costs far less per scroll frame.
        gsap.fromTo(
          header,
          { opacity: 0, y: 32 },
          { opacity: 1, y: 0, duration: 0.7, ease: "power3.out", scrollTrigger: { trigger: header, start: "top 85%", toggleActions: "play none none none" } },
        );
        gsap.fromTo(
          content,
          { opacity: 0, y: 30 },
          { opacity: 1, y: 0, duration: 0.7, ease: "power3.out", scrollTrigger: { trigger: content, start: "top 86%", toggleActions: "play none none none" } },
        );
      });
    });
    return () => {
      cancelAnimationFrame(raf);
      ctx?.revert();
    };
  }, []);

  return (
    <section ref={ref} id={id} aria-label={title} className={`relative min-h-screen w-full px-5 py-24 md:px-12 ${className}`}>
      <HalftoneBg />
      <Speedlines show={inView} />
      <div className="relative z-10 mx-auto max-w-6xl">
        <div ref={headerRef} style={{ opacity: 0 }}>
          <SectionHeader kicker={label} title={title} subtitle={subtitle} />
        </div>
        <div ref={contentRef} style={{ opacity: 0 }}>
          {children}
        </div>
      </div>
    </section>
  );
}
