"use client";
import { motion } from "motion/react";
export function Marquee({ items, className = "" }: { items: string[]; className?: string }) {
  const row = [...items, ...items];
  return (
    <div className={`overflow-hidden nb-border bg-ink text-pop-yellow py-2 ${className}`}>
      <motion.div className="flex gap-8 whitespace-nowrap font-pixel text-xs"
        animate={{ x: ["0%", "-50%"] }} transition={{ repeat: Infinity, ease: "linear", duration: 18 }}>
        {row.map((t, i) => <span key={i}>★ {t}</span>)}
      </motion.div>
    </div>
  );
}
