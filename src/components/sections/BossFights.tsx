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
import { PowBurst } from "@/components/effects/PowBurst";
import { HoloCard } from "@/components/fx/HoloCard";
import { Magnetic } from "@/components/fx/Magnetic";
import { cn } from "@/lib/cn";

// Difficulty -> ribbon color + how hard the boss hits back (cosmetic damage popup).
const DIFFICULTY: Record<Difficulty, { ribbon: string; text: string; dmg: number }> = {
  BOSS: { ribbon: "bg-pop-red", text: "text-paper", dmg: 999 },
  HARD: { ribbon: "bg-pop-magenta", text: "text-paper", dmg: 420 },
  NORMAL: { ribbon: "bg-pop-cyan", text: "text-ink", dmg: 250 },
  EASY: { ribbon: "bg-pop-green", text: "text-ink", dmg: 120 },
};

// Per-difficulty fill palette (hex so it works straight inside <svg>).
// Tied to the same hues as the VS ribbon for a coherent "boss tier" read.
const DIFFICULTY_FILL: Record<Difficulty, { body: string; accent: string }> = {
  BOSS: { body: "#ff2e2e", accent: "#ffd400" }, // pop-red + pop-yellow
  HARD: { body: "#ff3df0", accent: "#00e0ff" }, // pop-magenta + pop-cyan
  NORMAL: { body: "#00e0ff", accent: "#ff2e2e" }, // pop-cyan + pop-red
  EASY: { body: "#27d17b", accent: "#ffd400" }, // pop-green + pop-yellow
};

const INK = "#0a0a0a";
const PAPER = "#f7f3e8";

/**
 * Hand-drawn inline-SVG boss avatar. Four distinct "bosses" picked
 * deterministically by item index so the roster never repeats:
 *   0 -> Game Cartridge boss
 *   1 -> Pixel Skull / monster
 *   2 -> Floppy-Disk boss
 *   3 -> CRT-Creature
 * Body color is tied to the project's difficulty tier.
 */
function BossIcon({
  index,
  difficulty,
  label,
  size = 60,
  engaged = false,
}: {
  index: number;
  difficulty: Difficulty;
  label: string;
  size?: number;
  engaged?: boolean;
}) {
  const variant = index % 4;
  const { body, accent } = DIFFICULTY_FILL[difficulty];
  // Eyes flash to the accent color when the boss is engaged (taking hits).
  const eye = engaged ? accent : INK;

  return (
    <svg
      role="img"
      aria-label={`${label} boss icon`}
      width={size}
      height={size}
      viewBox="0 0 64 64"
      shapeRendering="crispEdges"
    >
      {/* Variant 0 — GAME CARTRIDGE BOSS */}
      {variant === 0 && (
        <g>
          {/* cart body */}
          <rect x="10" y="6" width="44" height="52" fill={body} stroke={INK} strokeWidth="3" />
          {/* label window */}
          <rect x="16" y="12" width="32" height="20" fill={PAPER} stroke={INK} strokeWidth="3" />
          {/* angry label face */}
          <rect x="21" y="18" width="6" height="6" fill={eye} />
          <rect x="37" y="18" width="6" height="6" fill={eye} />
          <path d="M22 28 L32 25 L42 28" fill="none" stroke={INK} strokeWidth="3" />
          {/* ridged grip lines */}
          <rect x="16" y="38" width="32" height="3" fill={INK} />
          <rect x="16" y="44" width="32" height="3" fill={INK} />
          <rect x="16" y="50" width="32" height="3" fill={INK} />
          {/* connector teeth */}
          <rect x="14" y="55" width="6" height="6" fill={accent} stroke={INK} strokeWidth="3" />
          <rect x="29" y="55" width="6" height="6" fill={accent} stroke={INK} strokeWidth="3" />
          <rect x="44" y="55" width="6" height="6" fill={accent} stroke={INK} strokeWidth="3" />
        </g>
      )}

      {/* Variant 1 — PIXEL SKULL / MONSTER */}
      {variant === 1 && (
        <g>
          {/* cranium */}
          <rect x="12" y="8" width="40" height="34" fill={body} stroke={INK} strokeWidth="3" />
          {/* jaw */}
          <rect x="18" y="42" width="28" height="10" fill={body} stroke={INK} strokeWidth="3" />
          {/* eye sockets */}
          <rect x="18" y="18" width="11" height="11" fill={eye} />
          <rect x="35" y="18" width="11" height="11" fill={eye} />
          {/* glint */}
          <rect x="21" y="21" width="3" height="3" fill={PAPER} />
          <rect x="38" y="21" width="3" height="3" fill={PAPER} />
          {/* nose */}
          <path d="M32 31 L28 38 L36 38 Z" fill={INK} />
          {/* teeth */}
          <rect x="22" y="46" width="4" height="6" fill={INK} />
          <rect x="30" y="46" width="4" height="6" fill={INK} />
          <rect x="38" y="46" width="4" height="6" fill={INK} />
          {/* cracked crown horns */}
          <path d="M12 8 L8 0 L18 6 Z" fill={accent} stroke={INK} strokeWidth="3" />
          <path d="M52 8 L56 0 L46 6 Z" fill={accent} stroke={INK} strokeWidth="3" />
        </g>
      )}

      {/* Variant 2 — FLOPPY-DISK BOSS */}
      {variant === 2 && (
        <g>
          {/* disk body */}
          <rect x="8" y="8" width="48" height="48" fill={body} stroke={INK} strokeWidth="3" />
          {/* metal shutter */}
          <rect x="22" y="8" width="20" height="20" fill={PAPER} stroke={INK} strokeWidth="3" />
          {/* shutter notch */}
          <rect x="31" y="10" width="4" height="16" fill={INK} />
          {/* clipped corner */}
          <path d="M48 8 L56 16 L48 16 Z" fill={accent} stroke={INK} strokeWidth="3" />
          {/* write-protect tab */}
          <rect x="12" y="12" width="6" height="8" fill={accent} stroke={INK} strokeWidth="3" />
          {/* label with angry face */}
          <rect x="14" y="32" width="36" height="20" fill={PAPER} stroke={INK} strokeWidth="3" />
          <rect x="20" y="37" width="6" height="6" fill={eye} />
          <rect x="38" y="37" width="6" height="6" fill={eye} />
          <path d="M22 48 L32 45 L42 48" fill="none" stroke={INK} strokeWidth="3" />
        </g>
      )}

      {/* Variant 3 — CRT-CREATURE */}
      {variant === 3 && (
        <g>
          {/* monitor shell */}
          <rect x="8" y="10" width="48" height="38" rx="4" fill={body} stroke={INK} strokeWidth="3" />
          {/* screen */}
          <rect x="14" y="16" width="36" height="26" fill={INK} />
          {/* glowing creature eyes */}
          <circle cx="25" cy="27" r="4" fill={eye} />
          <circle cx="39" cy="27" r="4" fill={eye} />
          {/* fanged grin */}
          <path d="M22 34 L26 38 L30 34 L34 38 L38 34 L42 38" fill="none" stroke={accent} strokeWidth="3" />
          {/* scanline */}
          <rect x="14" y="22" width="36" height="2" fill={accent} opacity="0.5" />
          {/* stand + base */}
          <rect x="28" y="48" width="8" height="6" fill={INK} />
          <rect x="18" y="54" width="28" height="5" fill={body} stroke={INK} strokeWidth="3" />
          {/* antenna */}
          <path d="M20 10 L14 2" stroke={INK} strokeWidth="3" />
          <path d="M44 10 L50 2" stroke={INK} strokeWidth="3" />
          <circle cx="14" cy="2" r="3" fill={accent} stroke={INK} strokeWidth="2" />
          <circle cx="50" cy="2" r="3" fill={accent} stroke={INK} strokeWidth="2" />
        </g>
      )}
    </svg>
  );
}

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

      <HoloCard className="group">
      <ComicPanel
        title={`${project.difficulty} · ${project.year}`}
        className={cn(
          "transition-shadow duration-200",
          engaged ? "ring-4 ring-pop-red ring-offset-2 ring-offset-paper" : "",
        )}
      >
        <div className="flex items-center gap-3">
          <motion.div
            className="grid shrink-0 place-items-center nb-border nb-shadow bg-paper p-1"
            animate={
              engaged
                ? { x: [0, -3, 3, -2, 0], rotate: [0, -4, 4, 0] }
                : { x: 0, rotate: 0, y: [0, -4, 0] }
            }
            transition={
              engaged
                ? { duration: 0.4 }
                : { y: { repeat: Infinity, duration: 1.6, ease: "easeInOut" }, default: { duration: 0.3 } }
            }
          >
            <BossIcon
              index={index}
              difficulty={project.difficulty}
              label={project.name}
              size={56}
              engaged={engaged}
            />
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
            <Magnetic key={link.label} strength={0.5}>
              <ArcadeButton href={link.href} color="green">
                {link.label}
              </ArcadeButton>
            </Magnetic>
          ))}
        </div>
      </ComicPanel>
      </HoloCard>
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
