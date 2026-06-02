"use client";
import { useMemo, useRef, useState } from "react";
import { motion, useInView } from "motion/react";
import { portfolio } from "@/content/portfolio";
import type { Rarity, Skill } from "@/content/types";
import { Stage } from "@/components/ui/Stage";
import { Panel } from "@/components/ui/Panel";
import { Badge } from "@/components/ui/Badge";
import { cn } from "@/lib/cn";

/* ---- rarity is derived from a skill's level, typed against the shared Rarity union ---- */
const RARITY_ORDER: Rarity[] = ["COMMON", "RARE", "EPIC", "LEGENDARY"];

function rarityOf(level: number): Rarity {
  if (level >= 90) return "LEGENDARY";
  if (level >= 80) return "EPIC";
  if (level >= 70) return "RARE";
  return "COMMON";
}

const RARITY_THEME: Record<
  Rarity,
  { ring: string; fill: string; glow: string; text: string; chip: string }
> = {
  COMMON: {
    ring: "border-ink/40",
    fill: "bg-paper",
    glow: "shadow-[0_0_0_0_transparent]",
    text: "text-ink/70",
    chip: "bg-paper text-ink",
  },
  RARE: {
    ring: "border-pop-cyan",
    fill: "bg-pop-cyan/25",
    glow: "shadow-[0_0_18px_-2px_var(--color-pop-cyan)]",
    text: "text-pop-cyan",
    chip: "bg-pop-cyan text-ink",
  },
  EPIC: {
    ring: "border-pop-magenta",
    fill: "bg-pop-magenta/25",
    glow: "shadow-[0_0_18px_-2px_var(--color-pop-magenta)]",
    text: "text-pop-magenta",
    chip: "bg-pop-magenta text-ink",
  },
  LEGENDARY: {
    ring: "border-pop-yellow",
    fill: "bg-pop-yellow/30",
    glow: "shadow-[0_0_22px_-1px_var(--color-pop-yellow)]",
    text: "text-pop-yellow",
    chip: "bg-pop-yellow text-ink",
  },
};

const CAT_TILT = ["-rotate-2", "rotate-1", "-rotate-1"];
const CAT_OFFSET = ["md:translate-y-0", "md:translate-y-6", "md:-translate-y-3"];
const PANEL_COLOR = ["yellow", "cyan", "magenta"] as const;

/* ---- decorative slot corner notches ---- */
function CornerNotches({ tone }: { tone: string }) {
  const corners = [
    "left-1 top-1 border-l-2 border-t-2",
    "right-1 top-1 border-r-2 border-t-2",
    "left-1 bottom-1 border-l-2 border-b-2",
    "right-1 bottom-1 border-r-2 border-b-2",
  ];
  return (
    <span aria-hidden className="pointer-events-none absolute inset-0">
      {corners.map((c) => (
        <span key={c} className={cn("absolute h-2.5 w-2.5", tone, c)} />
      ))}
    </span>
  );
}

/* ---- a single inventory item cell: rarity-tinted slot + on-view XP bar + hover tooltip ---- */
function ItemCell({ skill, index }: { skill: Skill; index: number }) {
  const cellRef = useRef<HTMLDivElement>(null);
  const inView = useInView(cellRef, { once: true, amount: 0.6 });
  const [hovered, setHovered] = useState(false);
  const rarity = rarityOf(skill.level);
  const theme = RARITY_THEME[rarity];

  return (
    <motion.div
      ref={cellRef}
      initial={{ opacity: 0, scale: 0.6, y: 12 }}
      animate={inView ? { opacity: 1, scale: 1, y: 0 } : {}}
      transition={{ type: "spring", stiffness: 420, damping: 18, delay: index * 0.07 }}
      whileHover={{ scale: 1.05, rotate: -1.5, zIndex: 30 }}
      onHoverStart={() => setHovered(true)}
      onHoverEnd={() => setHovered(false)}
      className="relative"
    >
      {/* hover tooltip: skill name + level */}
      <motion.div
        aria-hidden
        initial={false}
        animate={
          hovered
            ? { opacity: 1, y: -8, scale: 1 }
            : { opacity: 0, y: 0, scale: 0.9 }
        }
        transition={{ type: "spring", stiffness: 500, damping: 22 }}
        className={cn(
          "pointer-events-none absolute -top-12 left-1/2 z-40 -translate-x-1/2 whitespace-nowrap",
          "nb-border nb-shadow bg-ink px-2.5 py-1 font-pixel text-[8px] text-paper"
        )}
      >
        <span className={theme.text}>{skill.name}</span>
        <span className="text-paper"> · Lv {skill.level}</span>
        <span className="absolute -bottom-1.5 left-1/2 h-3 w-3 -translate-x-1/2 rotate-45 border-b-[3px] border-r-[3px] border-ink bg-ink" />
      </motion.div>

      <div
        className={cn(
          "relative nb-border bg-crt p-2.5 transition-shadow",
          theme.fill,
          hovered ? theme.glow : "shadow-none"
        )}
      >
        <CornerNotches tone={theme.ring} />

        {/* rarity dot + skill name */}
        <div className="mb-1.5 flex items-center gap-1.5">
          <span
            aria-hidden
            className={cn("inline-block h-2 w-2 nb-border", theme.chip)}
          />
          <span className="truncate font-comic text-[11px] leading-tight text-ink">
            {skill.name}
          </span>
        </div>

        {/* XP bar that fills on view, with the level number riding along */}
        <div className="relative h-3.5 nb-border overflow-hidden bg-ink/25">
          <motion.div
            initial={{ width: 0 }}
            animate={inView ? { width: `${skill.level}%` } : {}}
            transition={{ duration: 0.9, ease: "easeOut", delay: 0.15 + index * 0.07 }}
            className={cn("h-full", theme.chip)}
          />
          <motion.span
            initial={{ opacity: 0 }}
            animate={inView ? { opacity: 1 } : {}}
            transition={{ delay: 0.7 + index * 0.07 }}
            className="absolute inset-0 flex items-center justify-end pr-1 font-pixel text-[8px] text-ink mix-blend-luminosity"
          >
            {skill.level}
          </motion.span>
        </div>

        <div className="mt-1 flex items-center justify-between">
          <span className="font-pixel text-[6px] text-ink/50">
            {skill.category}
          </span>
          <span className={cn("font-pixel text-[6px]", theme.text)}>{rarity}</span>
        </div>
      </div>
    </motion.div>
  );
}

export function Inventory() {
  /* aggregate loadout stats from the data for the footer HUD */
  const loadout = useMemo(() => {
    const all = portfolio.skills.flatMap((c) => c.skills);
    const total = all.reduce((sum, s) => sum + s.level, 0);
    const counts = RARITY_ORDER.reduce(
      (acc, r) => ({ ...acc, [r]: all.filter((s) => rarityOf(s.level) === r).length }),
      {} as Record<Rarity, number>
    );
    return { count: all.length, total, counts };
  }, []);

  return (
    <Stage
      id="skills"
      label="INVENTORY"
      title="SKILL TREE"
      subtitle="Open your bag — every ability is a looted item, rarity scales with mastery."
    >
      {/* signature: rarity legend HUD strip */}
      <div className="mb-8 flex flex-wrap items-center gap-2">
        <span className="font-pixel text-[9px] text-ink/60">RARITY:</span>
        {RARITY_ORDER.map((r) => (
          <motion.span
            key={r}
            whileHover={{ y: -2, rotate: -2 }}
            className={cn(
              "nb-border font-pixel text-[8px] px-2 py-1 inline-flex items-center gap-1.5",
              RARITY_THEME[r].chip
            )}
          >
            <span className={cn("h-1.5 w-1.5 nb-border bg-ink")} aria-hidden />
            {r} ×{loadout.counts[r]}
          </motion.span>
        ))}
      </div>

      <div className="grid gap-7 md:grid-cols-3">
        {portfolio.skills.map((cat, ci) => (
          <motion.div
            key={cat.name}
            initial={{ opacity: 0, y: 30 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true, amount: 0.3 }}
            transition={{ type: "spring", stiffness: 280, damping: 22, delay: ci * 0.1 }}
            className={cn("relative", CAT_TILT[ci % CAT_TILT.length], CAT_OFFSET[ci % CAT_OFFSET.length])}
          >
            <Panel color={PANEL_COLOR[ci % PANEL_COLOR.length]} lg className="relative p-4">
              {/* slot-style corner notches on the whole bag */}
              <CornerNotches tone="border-ink" />

              {/* bag header: category name as an equipped-tab label */}
              <div className="mb-4 flex items-center justify-between">
                <h3 className="font-comic text-xl text-ink [-webkit-text-stroke:0.5px_black]">
                  {cat.name}
                </h3>
                <Badge className="-rotate-3">
                  {cat.skills.length} SLOTS
                </Badge>
              </div>

              {/* the RPG inventory grid of item cells */}
              <div className="grid grid-cols-2 gap-2.5">
                {cat.skills.map((s, si) => (
                  <ItemCell key={s.name} skill={s} index={si} />
                ))}
              </div>
            </Panel>

            {/* stitched category tab tucked behind the panel */}
            <span
              aria-hidden
              className="absolute -top-3 left-4 z-20 nb-border bg-ink px-2 py-0.5 font-pixel text-[7px] text-pop-green"
            >
              BAG {String(ci + 1).padStart(2, "0")}
            </span>
          </motion.div>
        ))}
      </div>

      {/* loadout footer HUD aggregated from portfolio data */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        whileInView={{ opacity: 1, y: 0 }}
        viewport={{ once: true, amount: 0.5 }}
        transition={{ type: "spring", stiffness: 240, damping: 20, delay: 0.15 }}
        className="mt-12 flex flex-wrap items-center justify-between gap-3 nb-border nb-shadow-lg bg-ink px-4 py-3 rotate-[0.4deg]"
      >
        <span className="font-pixel text-[10px] text-pop-yellow">LOADOUT</span>
        <span className="font-pixel text-[9px] text-paper">
          {loadout.count} ITEMS EQUIPPED
        </span>
        <span className="font-pixel text-[9px] text-pop-cyan">
          TOTAL XP {loadout.total}
        </span>
        <span className="font-pixel text-[9px] text-pop-magenta">
          {loadout.counts.LEGENDARY} LEGENDARY
        </span>
      </motion.div>
    </Stage>
  );
}
