"use client";
import { motion } from "motion/react";
export function Speedlines({ show }: { show: boolean }) {
  return (
    <motion.div aria-hidden
      initial={{ opacity: 0 }} animate={{ opacity: show ? 0.25 : 0 }} transition={{ duration: 0.4 }}
      className="speedlines pointer-events-none absolute inset-0 -z-0" />
  );
}
