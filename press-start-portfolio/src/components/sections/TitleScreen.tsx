"use client";
import { useEffect, useState } from "react";
import dynamic from "next/dynamic";
import { motion } from "motion/react";
import { portfolio } from "@/content/portfolio";
import { ArcadeButton } from "@/components/ui/ArcadeButton";
import { Marquee } from "@/components/ui/Marquee";
import { HeroBoundary } from "@/components/three/HeroBoundary";

// CSS night-sky backdrop: instant paint while the model loads + no-WebGL/reduced fallback.
function DragonAtmosphere() {
  return (
    <div
      aria-hidden
      className="absolute inset-0"
      style={{
        background:
          "radial-gradient(70% 60% at 50% 30%, rgba(95,116,166,0.22), transparent 70%)," +
          "radial-gradient(50% 50% at 60% 80%, rgba(255,160,90,0.08), transparent 70%), #0c0f16",
      }}
    >
      <div className="absolute inset-0 halftone opacity-[0.06]" />
    </div>
  );
}

const DragonScene = dynamic(() => import("@/components/three/DragonScene"), {
  ssr: false,
  loading: () => <DragonAtmosphere />,
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

export function TitleScreen() {
  const { profile } = portfolio;
  const [show3d, setShow3d] = useState(false);
  useEffect(() => {
    const reduced = window.matchMedia?.("(prefers-reduced-motion: reduce)").matches ?? false;
    setShow3d(!reduced && hasWebGL());
  }, []);

  return (
    <section id="title" aria-label="Title screen" className="relative h-screen w-full overflow-hidden bg-[#0c0f16]">
      <div className="absolute inset-0">
        {show3d ? (
          <HeroBoundary fallback={<DragonAtmosphere />}>
            <DragonScene />
          </HeroBoundary>
        ) : (
          <DragonAtmosphere />
        )}
      </div>

      {/* readability scrim along the bottom */}
      <div aria-hidden className="pointer-events-none absolute inset-x-0 bottom-0 h-2/3 bg-gradient-to-t from-[#0c0f16] via-[#0c0f16]/75 to-transparent" />

      {/* poster-style title, lower-left */}
      <div className="relative z-10 mx-auto flex h-full max-w-6xl flex-col items-start justify-end px-6 pb-28 pointer-events-none">
        <motion.p
          initial={{ opacity: 0, y: 14 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6 }}
          className="font-pixel text-[10px] tracking-[0.3em] text-pop-cyan"
        >
          {profile.title}
        </motion.p>
        <motion.h1
          initial={{ opacity: 0, y: 24 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ type: "spring", stiffness: 160, damping: 16, delay: 0.05 }}
          className="font-comic text-6xl md:text-8xl text-paper [-webkit-text-stroke:2px_black] drop-shadow-[6px_6px_0_#000]"
        >
          {profile.name.toUpperCase()}
        </motion.h1>
        <motion.p
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.25 }}
          className="mt-3 max-w-md font-body text-paper/85"
        >
          {profile.tagline}
        </motion.p>
        <div className="pointer-events-auto mt-7">
          <ArcadeButton href="#about" color="red" className="text-base animate-pulse">▼ ENTER PORTFOLIO</ArcadeButton>
        </div>
      </div>

      <div className="absolute bottom-0 inset-x-0 z-10">
        <Marquee items={["HERE BE DRAGONS", ...profile.socials.map((s) => s.label), "ENTER ↓"]} />
      </div>
    </section>
  );
}
