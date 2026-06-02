"use client";
import { motion } from "motion/react";

/** Speedlines wash — fades in when its section is active. Opacity only (no
 *  scroll-bound parallax) to keep scrolling smooth across 11 sections. */
export function Speedlines({ show }: { show: boolean }) {
  return (
    <motion.div
      aria-hidden
      initial={{ opacity: 0 }}
      animate={{ opacity: show ? 0.18 : 0 }}
      transition={{ duration: 0.4 }}
      className="speedlines pointer-events-none absolute inset-0 -z-0"
    />
  );
}
