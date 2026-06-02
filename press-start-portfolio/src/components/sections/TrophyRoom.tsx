"use client";
import { useRef } from "react";
import { motion, useInView } from "motion/react";
import { portfolio } from "@/content/portfolio";
import { Stage } from "@/components/ui/Stage";
import { Panel } from "@/components/ui/Panel";
import { Badge } from "@/components/ui/Badge";
import { ArcadeButton } from "@/components/ui/ArcadeButton";
import { PowBurst } from "@/components/effects/PowBurst";
import { cn } from "@/lib/cn";
import type { Rarity } from "@/content/types";

const RARITY_COLOR: Record<Rarity, "yellow" | "magenta" | "cyan" | "paper"> = {
  LEGENDARY: "yellow", EPIC: "magenta", RARE: "cyan", COMMON: "paper",
};

// Per-rarity styling: glow ring color, pedestal color, and "shiny" flag for the sparkle sweep.
const RARITY_META: Record<
  Rarity,
  { ring: string; pedestal: string; chip: "yellow" | "magenta" | "cyan" | "green" | "red"; shiny: boolean; rank: string }
> = {
  LEGENDARY: { ring: "shadow-[0_0_0_4px_#ffd400,0_0_30px_8px_rgba(255,212,0,0.55)]", pedestal: "bg-pop-yellow", chip: "yellow", shiny: true, rank: "S-TIER" },
  EPIC: { ring: "shadow-[0_0_0_4px_#ff2fb9,0_0_26px_6px_rgba(255,47,185,0.5)]", pedestal: "bg-pop-magenta", chip: "magenta", shiny: true, rank: "A-TIER" },
  RARE: { ring: "shadow-[0_0_0_4px_#16d0ff,0_0_18px_4px_rgba(22,208,255,0.4)]", pedestal: "bg-pop-cyan", chip: "cyan", shiny: false, rank: "B-TIER" },
  COMMON: { ring: "shadow-[0_0_0_3px_rgba(0,0,0,0.6)]", pedestal: "bg-crt", chip: "green", shiny: false, rank: "C-TIER" },
};

// Deliberate, intentional tilts so the shelf "breaks the grid" without feeling random.
const TILTS = ["-rotate-3", "rotate-2", "-rotate-1", "rotate-3"];
const Y_OFFSETS = ["mt-0", "sm:mt-8", "mt-0", "sm:mt-6"];

// Drawn trophy icon (rarity-tinted) — replaces fragile emoji so it always renders.
const TROPHY_FILL: Record<Rarity, string> = {
  LEGENDARY: "#ffd23f", EPIC: "#ff4fd8", RARE: "#00e5ff", COMMON: "#c9c9bd",
};
function starPoints(cx: number, cy: number, outer: number, inner: number): string {
  const p: string[] = [];
  for (let i = 0; i < 10; i++) {
    const r = i % 2 ? inner : outer;
    const a = -Math.PI / 2 + (i * Math.PI) / 5;
    p.push(`${(cx + r * Math.cos(a)).toFixed(1)},${(cy + r * Math.sin(a)).toFixed(1)}`);
  }
  return p.join(" ");
}
function TrophyIcon({ rarity }: { rarity: Rarity }) {
  const fill = TROPHY_FILL[rarity];
  const shiny = rarity === "LEGENDARY" || rarity === "EPIC";
  return (
    <svg viewBox="0 0 64 64" className="h-full w-full" aria-hidden focusable="false">
      <path d="M14 12 C2 14 6 32 19 31" fill="none" stroke="#0a0a0a" strokeWidth={5} strokeLinecap="round" />
      <path d="M50 12 C62 14 58 32 45 31" fill="none" stroke="#0a0a0a" strokeWidth={5} strokeLinecap="round" />
      <path d="M14 9 H50 V20 C50 36 40 43 32 43 C24 43 14 36 14 20 Z" fill={fill} stroke="#0a0a0a" strokeWidth={3} strokeLinejoin="round" />
      <path d="M20 13 H25 V22 C25 26 23 28 21 28 Z" fill="rgba(255,255,255,0.55)" />
      <rect x="28" y="43" width="8" height="7" fill="#0a0a0a" />
      <rect x="19" y="50" width="26" height="6" rx="1.5" fill={fill} stroke="#0a0a0a" strokeWidth={3} />
      <rect x="15" y="56" width="34" height="5" rx="1.5" fill="#0a0a0a" />
      <polygon points={starPoints(32, 22, 6.5, 2.8)} fill={shiny ? "#0a0a0a" : "rgba(10,10,10,0.5)"} />
    </svg>
  );
}

function TrophyCard({
  cert,
  index,
}: {
  cert: (typeof portfolio.certifications)[number];
  index: number;
}) {
  const meta = RARITY_META[cert.rarity];
  return (
    <motion.div
      initial={{ opacity: 0, y: 60, rotate: 0 }}
      whileInView={{ opacity: 1, y: 0 }}
      viewport={{ once: true, amount: 0.4 }}
      transition={{ type: "spring", stiffness: 240, damping: 18, delay: index * 0.12 }}
      className={cn("group relative", Y_OFFSETS[index % Y_OFFSETS.length])}
    >
      {/* ACHIEVEMENT UNLOCKED toast — slides in on hover/focus-within */}
      <div
        aria-hidden
        className={cn(
          "pointer-events-none absolute -top-7 left-1/2 z-30 -translate-x-1/2",
          "translate-y-2 opacity-0 transition-all duration-300 ease-out",
          "group-hover:translate-y-0 group-hover:opacity-100",
          "group-focus-within:translate-y-0 group-focus-within:opacity-100"
        )}
      >
        <span className="whitespace-nowrap nb-border nb-shadow bg-ink px-2 py-1 font-pixel text-[7px] uppercase text-pop-green">
          ★ Achievement Unlocked
        </span>
      </div>

      {/* The trophy card itself, with rarity glow ring + intentional tilt */}
      <div className={cn(TILTS[index % TILTS.length], "transition-transform duration-300")}>
        <Panel
          color={RARITY_COLOR[cert.rarity]}
          lg
          className={cn(
            "relative overflow-hidden p-5 text-center transition-all duration-300",
            "group-hover:-translate-y-1.5 group-hover:rotate-0",
            meta.ring
          )}
        >
          {/* rank corner tag */}
          <span className="absolute left-0 top-0 z-20 nb-border border-l-0 border-t-0 bg-ink px-2 py-1 font-pixel text-[7px] text-paper">
            {meta.rank}
          </span>

          {/* animated shine/sparkle sweep for LEGENDARY + EPIC */}
          {meta.shiny && (
            <>
              <motion.div
                aria-hidden
                className="pointer-events-none absolute inset-0 z-10"
                style={{
                  background:
                    "linear-gradient(115deg, transparent 35%, rgba(255,255,255,0.85) 50%, transparent 65%)",
                }}
                initial={{ x: "-130%" }}
                animate={{ x: "130%" }}
                transition={{ duration: 2.4, repeat: Infinity, repeatDelay: 1.6, ease: "easeInOut", delay: index * 0.4 }}
              />
              <motion.span
                aria-hidden
                className="absolute right-3 top-3 z-20 text-lg"
                animate={{ scale: [0.6, 1.2, 0.6], rotate: [0, 25, 0], opacity: [0.4, 1, 0.4] }}
                transition={{ duration: 1.8, repeat: Infinity, ease: "easeInOut", delay: index * 0.3 }}
              >
                ✦
              </motion.span>
            </>
          )}

          {/* trophy icon, bobbing — drawn SVG so it always renders */}
          <motion.div
            className="relative z-20 mx-auto h-16 w-16"
            animate={{ y: [0, -6, 0], rotate: [-2, 2, -2] }}
            transition={{ duration: 3.2, repeat: Infinity, ease: "easeInOut", delay: index * 0.25 }}
          >
            <TrophyIcon rarity={cert.rarity} />
          </motion.div>

          <h3 className="relative z-20 mt-3 font-comic text-lg leading-tight">{cert.title}</h3>
          <p className="relative z-20 mt-1 font-pixel text-[9px]">
            {cert.issuer} · {cert.year}
          </p>

          <div className="relative z-20 mt-3 flex flex-wrap items-center justify-center gap-2">
            <Badge className={cn("bg-ink", cert.rarity === "LEGENDARY" && "text-pop-yellow")}>{cert.rarity}</Badge>
            {cert.credentialUrl && (
              <ArcadeButton href={cert.credentialUrl} color={meta.chip} className="px-2 py-1 text-[8px]">
                Verify
              </ArcadeButton>
            )}
          </div>
        </Panel>
      </div>

      {/* PEDESTAL BASE under each trophy */}
      <div aria-hidden className="relative z-0 mx-auto -mt-1 w-[78%]">
        {/* top plinth */}
        <div className={cn("mx-auto h-3 w-[88%] nb-border border-b-0", meta.pedestal)} />
        {/* body */}
        <div className="mx-auto h-5 w-full nb-border nb-shadow bg-ink/90 text-center">
          <span className="block pt-0.5 font-pixel text-[6px] uppercase tracking-widest text-paper/80">
            {cert.id}
          </span>
        </div>
        {/* contact shadow */}
        <div className="mx-auto mt-1 h-2 w-[70%] rounded-full bg-ink/25 blur-[2px]" />
      </div>
    </motion.div>
  );
}

export function TrophyRoom() {
  const shelfRef = useRef<HTMLDivElement>(null);
  const shelfInView = useInView(shelfRef, { once: true, amount: 0.3 });
  const total = portfolio.certifications.length;
  const legendary = portfolio.certifications.filter((c) => c.rarity === "LEGENDARY").length;

  return (
    <Stage
      id="certifications"
      label="TROPHIES"
      title="ACHIEVEMENTS UNLOCKED"
      subtitle="Step into the trophy room — mind the velvet rope."
    >
      {/* Loud header banner with marquee-style stat + a POW burst */}
      <div className="relative mb-12 flex flex-wrap items-end justify-between gap-4">
        <motion.div
          initial={{ opacity: 0, x: -30 }}
          whileInView={{ opacity: 1, x: 0 }}
          viewport={{ once: true }}
          transition={{ type: "spring", stiffness: 200, damping: 16 }}
          className="-rotate-1"
        >
          <Panel color="red" className="px-4 py-2 font-pixel text-[10px] uppercase text-paper">
            <span className="text-pop-yellow">{total}</span> trophies ·{" "}
            <span className="text-pop-yellow">{legendary}</span> legendary
          </Panel>
        </motion.div>
        <div className="hidden sm:block">
          <PowBurst word="100%!" />
        </div>
      </div>

      {/* THE TROPHY SHELF */}
      <div ref={shelfRef} className="relative">
        <div className="grid items-end gap-6 sm:grid-cols-2 lg:grid-cols-4">
          {portfolio.certifications.map((cert, i) => (
            <TrophyCard key={cert.id} cert={cert} index={i} />
          ))}
        </div>

        {/* The shelf plank running beneath every pedestal — draws in once in view */}
        <motion.div
          aria-hidden
          className="relative mx-auto mt-2 origin-left"
          initial={{ scaleX: 0 }}
          animate={shelfInView ? { scaleX: 1 } : {}}
          transition={{ duration: 0.7, ease: "easeOut", delay: 0.2 }}
        >
          <div className="h-4 w-full nb-border nb-shadow-lg bg-pop-green" />
          {/* shelf brackets */}
          <div className="absolute -bottom-5 left-[12%] h-5 w-3 nb-border border-t-0 bg-ink" />
          <div className="absolute -bottom-5 right-[12%] h-5 w-3 nb-border border-t-0 bg-ink" />
        </motion.div>

        <p className="mt-8 text-center font-pixel text-[8px] uppercase tracking-widest text-ink/60">
          ▸ Hover a trophy to unlock the toast ◂
        </p>
      </div>
    </Stage>
  );
}
