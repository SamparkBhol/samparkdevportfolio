"use client";
import { useRef } from "react";
import { motion, useMotionValue, useSpring, useTransform, useMotionTemplate } from "motion/react";
import { cn } from "@/lib/cn";

/**
 * Holographic trading-card effect: 3D pointer-tilt + a pointer-driven rainbow
 * "foil" sheen (conic spectrum + moving glare, color-dodge blended). Pointer-only.
 */
export function HoloCard({
  children,
  className,
  intensity = 1,
}: {
  children: React.ReactNode;
  className?: string;
  intensity?: number;
}) {
  const ref = useRef<HTMLDivElement>(null);
  const px = useMotionValue(0.5);
  const py = useMotionValue(0.5);
  const rx = useSpring(useTransform(py, [0, 1], [9 * intensity, -9 * intensity]), { stiffness: 200, damping: 18 });
  const ry = useSpring(useTransform(px, [0, 1], [-9 * intensity, 9 * intensity]), { stiffness: 200, damping: 18 });
  const hx = useTransform(px, [0, 1], ["0%", "100%"]);
  const hy = useTransform(py, [0, 1], ["0%", "100%"]);
  const foil = useMotionTemplate`radial-gradient(130% 130% at ${hx} ${hy}, rgba(255,255,255,0.4), transparent 42%), conic-gradient(from 210deg at ${hx} ${hy}, #ff3b3b66, #ffd23f66, #39ff1466, #00e5ff66, #ff4fd866, #ff3b3b66)`;

  return (
    <motion.div
      ref={ref}
      onPointerMove={(e) => {
        const r = ref.current?.getBoundingClientRect();
        if (!r) return;
        px.set((e.clientX - r.left) / r.width);
        py.set((e.clientY - r.top) / r.height);
      }}
      onPointerLeave={() => { px.set(0.5); py.set(0.5); }}
      style={{ rotateX: rx, rotateY: ry, transformStyle: "preserve-3d", transformPerspective: 900 }}
      className={cn("relative", className)}
    >
      {children}
      <motion.span
        aria-hidden
        className="pointer-events-none absolute inset-0 z-[6] mix-blend-color-dodge opacity-0 transition-opacity duration-300 [.group:hover_&]:opacity-60 hover:opacity-60"
        style={{ background: foil }}
      />
    </motion.div>
  );
}
