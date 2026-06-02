"use client";
import { motion } from "motion/react";
export function Sprite({
  src, alt, size = 64, bob = true, className,
}: { src: string; alt: string; size?: number; bob?: boolean; className?: string }) {
  return (
    <motion.img
      src={src} alt={alt} width={size} height={size}
      style={{ imageRendering: "pixelated" }}
      animate={bob ? { y: [0, -6, 0] } : undefined}
      transition={bob ? { repeat: Infinity, duration: 1.6, ease: "easeInOut" } : undefined}
      className={className}
      onError={(e) => { (e.currentTarget as HTMLImageElement).style.visibility = "hidden"; }}
    />
  );
}
