"use client";
import { useState } from "react";
import { motion, AnimatePresence } from "motion/react";
import { portfolio } from "@/content/portfolio";
import type { Difficulty } from "@/content/types";
import { Stage } from "@/components/ui/Stage";
import { ComicPanel } from "@/components/ui/ComicPanel";
import { HealthBar } from "@/components/ui/HealthBar";
import { Badge } from "@/components/ui/Badge";
import { ArcadeButton } from "@/components/ui/ArcadeButton";
import { Sprite } from "@/components/ui/Sprite";
import { PowBurst } from "@/components/effects/PowBurst";
import { cn } from "@/lib/cn";

// Difficulty -> ribbon color + how hard the boss hits back (cosmetic damage popup).
const DIFFICULTY: Record<Difficulty, { ribbon: string; text: string; dmg: number }> = {
  BOSS: { ribbon: "bg-pop-red", text: "text-paper", dmg: 999 },
  HARD: { ribbon: "bg-pop-magenta", text: "text-paper", dmg: 420 },
  NORMAL: { ribbon: "bg-pop-cyan", text: "text-ink", dmg: 250 },
  EASY: { ribbon: "bg-pop-green", text: "text-ink", dmg: 120 },
};

function BossCard({ project, index }: { project: (typeof portfolio.projects)[number]; index: number }) {
  const [engaged, setEngaged] = useState(false);
  const meta = DIFFICULTY[project.difficulty];
  // Alternating tilt + vertical offset for the fighting-game roster overlap.
  const tilt = index % 2 === 0 ? -2 : 2;
  const lift = index % 2 === 0 ? "md:translate-y-3" : "md:-translate-y-3";
  // HP visibly drains when you "engage" (hover/focus) the boss.
  const drainedHp = engaged ? Math.max(0, Math.round(project.hp * 0.25)) : project.hp;

  return (
    <motion.div
      className={cn("relative", lift)}
      initial={{ opacity: 0, y: 60, rotate: tilt * 3 }}
      whileInView={{ opacity: 1, y: 0, rotate: tilt }}
      viewport={{ once: true, amount: 0.3 }}
      transition={{ type: "spring", stiffness: 120, damping: 14, delay: index * 0.12 }}
      whileHover={{ rotate: 0, scale: 1.03, zIndex: 20 }}
      onHoverStart={() => setEngaged(true)}
      onHoverEnd={() => setEngaged(false)}
      onFocusCapture={() => setEngaged(true)}
      onBlurCapture={() => setEngaged(false)}
    >
      {/* Difficulty / VS corner ribbon */}
      <div
        aria-hidden
        className={cn(
          "absolute -right-2 -top-2 z-30 rotate-12 select-none",
          "nb-border nb-shadow px-3 py-1 font-bang text-lg uppercase leading-none",
          meta.ribbon,
          meta.text,
        )}
      >
        VS · {project.difficulty}
      </div>

      {/* Damage / HIT! popup on engage */}
      <AnimatePresence>
        {engaged && (
          <motion.div
            key="hit"
            aria-hidden
            className="pointer-events-none absolute -left-4 top-8 z-30 flex flex-col items-start gap-1"
            initial={{ opacity: 0, y: 14, scale: 0.6 }}
            animate={{ opacity: 1, y: -6, scale: 1 }}
            exit={{ opacity: 0, y: -22, scale: 0.7 }}
            transition={{ type: "spring", stiffness: 500, damping: 16 }}
          >
            <PowBurst word="HIT!" className="text-xl" />
            <span className="font-bang text-3xl text-pop-yellow [-webkit-text-stroke:1.5px_black] [text-shadow:2px_2px_0_#000]">
              -{meta.dmg}
            </span>
          </motion.div>
        )}
      </AnimatePresence>

      <ComicPanel
        title={`${project.difficulty} · ${project.year}`}
        className={cn(
          "transition-shadow duration-200",
          engaged ? "ring-4 ring-pop-red ring-offset-2 ring-offset-paper" : "",
        )}
      >
        <div className="flex items-center gap-3">
          <motion.div
            className="shrink-0"
            animate={engaged ? { x: [0, -3, 3, -2, 0], rotate: [0, -4, 4, 0] } : { x: 0, rotate: 0 }}
            transition={{ duration: 0.4 }}
          >
            <Sprite src={project.sprite} alt={`${project.name} sprite`} size={56} bob={!engaged} />
          </motion.div>
          <div className="flex-1">
            <h3 className="font-comic text-2xl leading-none text-pop-red">{project.name}</h3>
            <p className="mt-1 font-pixel text-[10px]">{project.tagline}</p>
          </div>
          <span className="font-bang text-2xl leading-none text-ink/40" aria-hidden>
            P{index + 1}
          </span>
        </div>

        {/* Boss HP — drains visibly on engage */}
        <div className="my-3">
          <HealthBar value={drainedHp} max={100} label="BOSS HP" />
          <motion.p
            className="mt-1 font-pixel text-[8px] uppercase text-pop-red"
            animate={{ opacity: engaged ? 1 : 0 }}
          >
            ▸ Boss staggered! Combo x{index + 2}
          </motion.p>
        </div>

        <p className="font-body text-sm">{project.description}</p>

        <div className="my-3 flex flex-wrap gap-2">
          {project.tags.map((tag, ti) => (
            <motion.div
              key={tag}
              initial={{ opacity: 0, scale: 0.5 }}
              whileInView={{ opacity: 1, scale: 1 }}
              viewport={{ once: true }}
              transition={{ delay: index * 0.12 + ti * 0.06 }}
              whileHover={{ y: -2, rotate: ti % 2 ? 3 : -3 }}
            >
              <Badge>{tag}</Badge>
            </motion.div>
          ))}
        </div>

        <div className="flex flex-wrap gap-2">
          {project.links.map((link) => (
            <ArcadeButton key={link.label} href={link.href} color="green">
              {link.label}
            </ArcadeButton>
          ))}
        </div>
      </ComicPanel>
    </motion.div>
  );
}

export function BossFights() {
  return (
    <Stage
      id="projects"
      label="BOSS FIGHTS"
      title="PROJECTS"
      subtitle="Select your opponent. Hover to land a hit and watch the boss HP drain."
    >
      <div className="grid gap-x-6 gap-y-10 md:grid-cols-2">
        {portfolio.projects.map((project, index) => (
          <BossCard key={project.id} project={project} index={index} />
        ))}
      </div>
    </Stage>
  );
}
