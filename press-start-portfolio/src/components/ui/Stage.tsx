"use client";
import { motion } from "motion/react";
import { useInView } from "@/hooks/useInView";
import { Speedlines } from "@/components/effects/Speedlines";
import { HalftoneBg } from "./HalftoneBg";
import { SectionHeader } from "./SectionHeader";
import type { SectionId } from "@/lib/sfx";

export function Stage({
  id, label, title, subtitle, children, className = "",
}: {
  id: SectionId; label: string; title: string; subtitle?: string;
  children: React.ReactNode; className?: string;
}) {
  const { ref, inView } = useInView<HTMLElement>({ threshold: 0.15 });
  return (
    <section ref={ref} id={id} aria-label={title}
      className={`relative min-h-screen w-full px-5 py-24 md:px-12 ${className}`}>
      <HalftoneBg />
      <Speedlines show={inView} />
      <motion.div
        initial={{ opacity: 0, y: 40 }} animate={inView ? { opacity: 1, y: 0 } : {}}
        transition={{ duration: 0.6, ease: "easeOut" }}
        className="relative z-10 mx-auto max-w-6xl">
        <SectionHeader kicker={label} title={title} subtitle={subtitle} />
        {children}
      </motion.div>
    </section>
  );
}
