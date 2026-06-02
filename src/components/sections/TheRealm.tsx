"use client";
import { useEffect, useState } from "react";
import dynamic from "next/dynamic";
import { motion } from "motion/react";
import { useInView } from "@/hooks/useInView";
import { HeroBoundary } from "@/components/three/HeroBoundary";

// CSS-only dramatic backdrop: load placeholder + reduced-motion + no-WebGL fallback.
function RealmAtmosphere() {
  return (
    <div
      aria-hidden
      className="absolute inset-0"
      style={{
        background:
          "radial-gradient(60% 60% at 50% 62%, rgba(255,80,0,0.30), transparent 70%)," +
          "radial-gradient(45% 50% at 72% 28%, rgba(0,229,255,0.12), transparent 70%), #0a0608",
      }}
    >
      <div className="absolute inset-0 halftone opacity-10" />
    </div>
  );
}

const DragonScene = dynamic(() => import("@/components/three/DragonScene"), {
  ssr: false,
  loading: () => <RealmAtmosphere />,
});

function hasWebGL(): boolean {
  try {
    const c = document.createElement("canvas");
    return (
      typeof window !== "undefined" &&
      !!window.WebGLRenderingContext &&
      !!(c.getContext("webgl") || c.getContext("experimental-webgl"))
    );
  } catch {
    return false;
  }
}

export function TheRealm() {
  const { ref, inView } = useInView<HTMLElement>({ rootMargin: "300px", threshold: 0 });
  const [show3d, setShow3d] = useState(false);
  useEffect(() => {
    const reduced = window.matchMedia?.("(prefers-reduced-motion: reduce)").matches ?? false;
    setShow3d(!reduced && hasWebGL());
  }, []);

  const render3d = show3d && inView;

  return (
    <section ref={ref} id="realm" aria-label="The Realm" className="relative h-screen w-full overflow-hidden bg-[#0a0608]">
      <div className="absolute inset-0">
        {render3d ? (
          <HeroBoundary fallback={<RealmAtmosphere />}>
            <DragonScene />
          </HeroBoundary>
        ) : (
          <RealmAtmosphere />
        )}
      </div>

      {/* fog gradients blend the realm into its neighbors */}
      <div aria-hidden className="pointer-events-none absolute inset-x-0 top-0 h-1/4 bg-gradient-to-b from-crt to-transparent" />
      <div aria-hidden className="pointer-events-none absolute inset-x-0 bottom-0 h-1/3 bg-gradient-to-t from-crt to-transparent" />

      {/* title overlay (non-blocking so drag-to-orbit reaches the canvas) */}
      <div className="relative z-10 flex h-full flex-col items-center justify-center px-4 text-center pointer-events-none">
        <motion.p
          initial={{ opacity: 0, y: 16 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          className="font-pixel text-[10px] tracking-[0.3em] text-pop-yellow/80"
        >
          CHAPTER II
        </motion.p>
        <motion.h2
          initial={{ opacity: 0, scale: 0.92 }}
          whileInView={{ opacity: 1, scale: 1 }}
          viewport={{ once: true }}
          transition={{ duration: 0.8 }}
          className="font-black text-6xl md:text-8xl text-[#ff6a00] [-webkit-text-stroke:1px_#0a0608]"
          style={{ textShadow: "0 0 36px rgba(255,60,0,0.55)" }}
        >
          THE REALM
        </motion.h2>
        <motion.p
          initial={{ opacity: 0 }}
          whileInView={{ opacity: 1 }}
          viewport={{ once: true }}
          transition={{ delay: 0.2 }}
          className="mt-4 max-w-md font-body text-paper/70"
        >
          Here be dragons. Drag to circle the beast.
        </motion.p>
      </div>
    </section>
  );
}
