"use client";
import { motion } from "motion/react";
import { cn } from "@/lib/cn";

export function PowBurst({ word = "POW!", className }: { word?: string; className?: string }) {
  return (
    <motion.span
      initial={{ scale: 0, rotate: -12 }} animate={{ scale: 1, rotate: -8 }}
      transition={{ type: "spring", stiffness: 600, damping: 12 }}
      className={cn(
        "inline-block font-bang text-pop-yellow nb-border nb-shadow bg-pop-red px-3 py-1 text-2xl",
        "[-webkit-text-stroke:1px_black]", className
      )}>
      {word}
    </motion.span>
  );
}
