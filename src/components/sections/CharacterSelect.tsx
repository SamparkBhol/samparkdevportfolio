"use client";
import { useEffect, useMemo, useRef, useState } from "react";
import { motion, AnimatePresence, useInView } from "motion/react";
import { portfolio } from "@/content/portfolio";
import { Stage } from "@/components/ui/Stage";
import { Panel } from "@/components/ui/Panel";
import { ComicPanel } from "@/components/ui/ComicPanel";
import { Badge } from "@/components/ui/Badge";
import { ArcadeButton } from "@/components/ui/ArcadeButton";
import { cn } from "@/lib/cn";

const POP_CYCLE = ["text-pop-yellow", "text-pop-cyan", "text-pop-magenta", "text-pop-green"] as const;

const INK = "#0a0a0a";

/* ---- Wax-seal crest (inline SVG) for the gothic enrollment charter. ---- */
function WaxSeal() {
  return (
    <svg viewBox="0 0 48 48" className="h-12 w-12" aria-hidden>
      <circle cx="24" cy="24" r="21" fill="#7a1322" stroke="#0a0a0a" strokeWidth="2" />
      <circle cx="24" cy="24" r="21" fill="none" stroke="#c9a227" strokeWidth="1" strokeDasharray="2 2" />
      <circle cx="24" cy="24" r="14" fill="none" stroke="#e0b94a" strokeWidth="1.5" />
      {/* a little keep/tower glyph */}
      <path d="M18 30v-9h3v-3h2v-2h2v2h2v3h3v9z" fill="#e0b94a" />
      <rect x="22" y="24" width="4" height="6" fill="#7a1322" />
    </svg>
  );
}

/* ---- Education charter: a gothic-Edinburgh × Japanese enrollment scroll.
   Stone-dark stained-glass frame, blackletter headings, a vertical brush-kanji
   rail (學 = learning), a wax seal, and the pixel castle. Sits above the carousel
   and reveals before the class cards shuffle in. ---- */
function EducationBanner() {
  const { education } = portfolio.about;
  return (
    <motion.div
      initial={{ opacity: 0, y: -18 }}
      whileInView={{ opacity: 1, y: 0 }}
      viewport={{ once: true, amount: 0.5 }}
      transition={{ type: "spring", stiffness: 240, damping: 22 }}
      className="relative mb-6 overflow-hidden border-[3px] border-ink nb-shadow-lg"
      style={{
        background:
          "radial-gradient(120% 140% at 12% -10%, #2b3550 0%, transparent 55%)," +
          "radial-gradient(100% 140% at 100% 120%, #3a1530 0%, transparent 55%)," +
          "linear-gradient(160deg, #14161f 0%, #0c0d14 60%, #100c16 100%)",
      }}
    >
      {/* gothic arch top-rule + corner tags */}
      <span aria-hidden className="absolute inset-x-0 top-0 h-1 bg-gradient-to-r from-pop-magenta/0 via-[#c9a227] to-pop-cyan/0 opacity-70" />
      <span className="absolute left-0 top-0 z-20 border-b-[3px] border-r-[3px] border-ink bg-[#c9a227] px-2 py-0.5 font-black text-[12px] tracking-wide text-ink">
        Academia
      </span>
      <span aria-hidden className="absolute right-0 top-0 z-20 border-b-[3px] border-l-[3px] border-ink bg-ink px-2 py-1 font-brush text-base leading-none text-[#e0b94a]">
        學び舎
      </span>
      {/* faint stone screentone */}
      <span aria-hidden className="halftone pointer-events-none absolute inset-0 opacity-[0.06]" />

      <div className="relative flex flex-col gap-4 px-4 py-5 sm:flex-row sm:items-center sm:gap-6 sm:px-6 sm:pt-7">
        {/* vertical brush-kanji rail (學 = learning/study) */}
        <span
          aria-hidden
          className="pointer-events-none absolute right-2 top-1/2 hidden -translate-y-1/2 select-none font-brush leading-none text-paper/[0.07] lg:block"
          style={{ fontSize: 116, writingMode: "vertical-rl" }}
        >
          學問
        </span>

        {/* pixel castle on a stone plinth */}
        <div className="relative shrink-0 self-center">
          <motion.img
            src="/sprites/edu-castle.svg"
            alt="VIT Vellore — pixel castle"
            width={160}
            height={128}
            className="h-24 w-auto [image-rendering:pixelated] drop-shadow-[3px_3px_0_#0a0a0a]"
            animate={{ y: [0, -4, 0] }}
            transition={{ repeat: Infinity, duration: 3.6, ease: "easeInOut" }}
          />
          <span aria-hidden className="absolute -bottom-1 left-1/2 h-1.5 w-20 -translate-x-1/2 rounded-full bg-ink/50 blur-[2px]" />
        </div>

        {/* charter text */}
        <div className="min-w-0 flex-1 text-center sm:text-left">
          <div className="flex flex-wrap items-baseline justify-center gap-x-3 gap-y-1 sm:justify-start">
            <h3 className="font-black text-3xl leading-none text-paper sm:text-4xl" style={{ textShadow: "2px 2px 0 #0a0a0a" }}>
              {education.school}
            </h3>
            <span className="border-[2px] border-[#c9a227] bg-ink px-2 py-0.5 font-pixel text-[8px] text-[#e0b94a]">
              {education.period}
            </span>
          </div>

          <p className="mt-1.5 font-black text-lg leading-tight text-[#e0b94a]">{education.degree}</p>

          {education.specialization && (
            <p className="mt-1 inline-flex items-center gap-1.5 font-pixel text-[9px] text-pop-cyan">
              <span aria-hidden>⛩</span> {education.specialization}
            </p>
          )}

          {education.motto && (
            <p className="mt-2 font-brush text-lg leading-snug text-paper/80">“{education.motto}”</p>
          )}

          {/* detail rune-list + seal */}
          <div className="mt-3 flex flex-col gap-3 sm:flex-row sm:items-end sm:justify-between">
            <ul className="mx-auto space-y-0.5 text-left sm:mx-0">
              {education.notes?.map((n) => (
                <li key={n} className="flex items-start gap-1.5 font-mono text-[11px] text-paper/65">
                  <span aria-hidden className="mt-[3px] text-[#c9a227]">✦</span>
                  <span>{n}</span>
                </li>
              ))}
            </ul>
            <div className="mx-auto flex items-center gap-2 sm:mx-0">
              <WaxSeal />
              <span className="font-mono text-[10px] leading-tight text-paper/45">
                {education.location}
                <br />
                <span className="text-[#c9a227]">SEALED · 入学</span>
              </span>
            </div>
          </div>
        </div>
      </div>
    </motion.div>
  );
}

/**
 * Hand-drawn inline-SVG dev-hero bust. No external image — every shape is
 * authored here: hoodie collar, head, hair, gamer headset, sharp shades, and a
 * little comic spark. crispEdges keeps the chunky pixel-comic feel.
 */
function HeroAvatar({ name }: { name: string }) {
  return (
    <svg
      role="img"
      aria-label={`${name} — pixel hero portrait`}
      viewBox="0 0 120 120"
      width={120}
      height={120}
      shapeRendering="crispEdges"
      className="relative z-10 mx-auto block"
    >
      {/* backdrop: cyan pop disc + ink frame so the bust pops off the plate */}
      <rect x="2" y="2" width="116" height="116" fill="#22d3ee" stroke={INK} strokeWidth="4" />
      <circle cx="60" cy="54" r="40" fill="#fde047" stroke={INK} strokeWidth="3" />

      {/* radiating comic burst behind the head (decorative) */}
      <g stroke={INK} strokeWidth="2">
        <line x1="60" y1="6" x2="60" y2="14" />
        <line x1="24" y1="20" x2="29" y2="26" />
        <line x1="96" y1="20" x2="91" y2="26" />
        <line x1="14" y1="54" x2="22" y2="54" />
        <line x1="106" y1="54" x2="98" y2="54" />
      </g>

      {/* ── HOODIE / JACKET ── magenta torso with raised collar */}
      <path
        d="M22 120 L22 96 Q22 80 40 76 L80 76 Q98 80 98 96 L98 120 Z"
        fill="#ec4899"
        stroke={INK}
        strokeWidth="4"
      />
      {/* collar wedges */}
      <path d="M44 78 L60 98 L48 100 L40 84 Z" fill="#0a0a0a" />
      <path d="M76 78 L60 98 L72 100 L80 84 Z" fill="#0a0a0a" />
      {/* hoodie zipper + shading */}
      <line x1="60" y1="98" x2="60" y2="120" stroke={INK} strokeWidth="3" />
      <path d="M80 76 Q98 80 98 96 L98 120 L90 120 L90 92 Q88 82 78 80 Z" fill="#0a0a0a" opacity="0.18" />

      {/* ── NECK ── */}
      <rect x="50" y="66" width="20" height="14" fill="#fbbf24" stroke={INK} strokeWidth="3" />
      <rect x="50" y="66" width="20" height="4" fill="#0a0a0a" opacity="0.2" />

      {/* ── HEAD ── rounded square skin tone */}
      <path
        d="M34 40 Q34 22 60 22 Q86 22 86 40 L86 56 Q86 72 60 72 Q34 72 34 56 Z"
        fill="#fbbf24"
        stroke={INK}
        strokeWidth="4"
      />
      {/* cheek shading on the right */}
      <path d="M78 44 Q82 54 78 64 Q72 70 60 70 L60 64 Q74 64 74 52 Z" fill="#0a0a0a" opacity="0.12" />

      {/* ── HAIR ── chunky green pixel-spikes + side sweep */}
      <path
        d="M32 42 L32 30 L40 30 L40 22 L50 22 L50 16 L62 16 L62 22 L72 22 L72 28 L82 28 L82 34 L88 34 L88 44 L82 40 L82 32 L74 36 L74 28 L64 30 L64 24 L54 26 L54 22 L46 28 L46 24 L40 32 L40 40 Z"
        fill="#22c55e"
        stroke={INK}
        strokeWidth="3"
      />
      {/* hair highlight strands */}
      <g stroke={INK} strokeWidth="2">
        <line x1="48" y1="26" x2="46" y2="38" />
        <line x1="60" y1="24" x2="60" y2="36" />
        <line x1="72" y1="30" x2="74" y2="40" />
      </g>

      {/* ── GAMER HEADSET ── red headband + ear cups + boom mic */}
      <path d="M30 44 Q30 18 60 18 Q90 18 90 44" fill="none" stroke="#ef4444" strokeWidth="6" />
      <path d="M30 44 Q30 18 60 18 Q90 18 90 44" fill="none" stroke={INK} strokeWidth="2" />
      {/* left ear cup */}
      <rect x="24" y="44" width="14" height="20" fill="#ef4444" stroke={INK} strokeWidth="3" />
      <rect x="28" y="48" width="6" height="12" fill="#0a0a0a" opacity="0.35" />
      {/* right ear cup */}
      <rect x="82" y="44" width="14" height="20" fill="#ef4444" stroke={INK} strokeWidth="3" />
      <rect x="86" y="48" width="6" height="12" fill="#0a0a0a" opacity="0.35" />
      {/* boom mic arm + tip */}
      <path d="M38 60 Q40 74 52 74" fill="none" stroke={INK} strokeWidth="3" />
      <rect x="50" y="71" width="7" height="7" fill="#0a0a0a" />
      <rect x="51" y="72" width="3" height="3" fill="#22d3ee" />

      {/* ── SHADES ── single sharp visor with cyan glint */}
      <path d="M40 48 L56 48 L56 56 L40 56 Z" fill="#0a0a0a" />
      <path d="M64 48 L80 48 L80 56 L64 56 Z" fill="#0a0a0a" />
      <line x1="56" y1="51" x2="64" y2="51" stroke={INK} strokeWidth="3" />
      {/* lens glints */}
      <rect x="43" y="50" width="5" height="2" fill="#22d3ee" />
      <rect x="67" y="50" width="5" height="2" fill="#22d3ee" />

      {/* ── SMIRK ── confident half-grin */}
      <path d="M52 62 Q60 68 70 62" fill="none" stroke={INK} strokeWidth="3" strokeLinecap="round" />
      <rect x="50" y="58" width="3" height="3" fill={INK} />

      {/* corner spark stamp (decorative) */}
      <path d="M100 90 L104 98 L112 100 L104 102 L100 110 L96 102 L88 100 L96 98 Z" fill="#fde047" stroke={INK} strokeWidth="2" />
    </svg>
  );
}

/**
 * Hand-drawn inline-SVG origin mini-scene — one tiny themed comic panel per
 * origin beat, picked deterministically by index (no external image, no random).
 */
function OriginScene({ index, label, size = 72 }: { index: number; label: string; size?: number }) {
  const variant = index % 3;
  return (
    <svg
      role="img"
      aria-label={label}
      viewBox="0 0 72 72"
      width={size}
      height={size}
      shapeRendering="crispEdges"
      className="relative z-10 mx-auto block"
    >
      <rect x="2" y="2" width="68" height="68" fill="#fef9c3" stroke={INK} strokeWidth="3" />
      {variant === 0 && <KeyboardScene />}
      {variant === 1 && <GlitchScene />}
      {variant === 2 && <RocketScene />}
    </svg>
  );
}

/** Panel 0 — "Found a keyboard." A chunky pixel keyboard + glowing spacebar. */
function KeyboardScene() {
  const cols = [10, 21, 32, 43, 54];
  return (
    <g>
      <circle cx="36" cy="32" r="22" fill="#22d3ee" stroke={INK} strokeWidth="2" />
      <rect x="9" y="24" width="54" height="30" fill="#ec4899" stroke={INK} strokeWidth="3" />
      <rect x="9" y="48" width="54" height="6" fill="#0a0a0a" opacity="0.2" />
      {[28, 36].map((y) =>
        cols.map((x) => (
          <rect key={`${x}-${y}`} x={x} y={y} width="8" height="6" fill="#fde047" stroke={INK} strokeWidth="2" />
        )),
      )}
      <rect x="32" y="36" width="8" height="6" fill="#22c55e" stroke={INK} strokeWidth="2" />
      <rect x="18" y="45" width="36" height="5" fill="#f8fafc" stroke={INK} strokeWidth="2" />
      <path d="M54 14 L57 20 L63 22 L57 24 L54 30 L51 24 L45 22 L51 20 Z" fill="#fde047" stroke={INK} strokeWidth="2" />
    </g>
  );
}

/** Panel 1 — "Broke the internet (locally)." A glitched browser window blowing up. */
function GlitchScene() {
  return (
    <g>
      <path
        d="M36 4 L42 18 L57 12 L50 27 L66 30 L51 36 L62 49 L46 45 L44 62 L36 50 L28 62 L26 45 L10 49 L21 36 L6 30 L22 27 L15 12 L30 18 Z"
        fill="#ef4444"
        stroke={INK}
        strokeWidth="3"
        strokeLinejoin="round"
      />
      <rect x="18" y="22" width="36" height="26" fill="#f8fafc" stroke={INK} strokeWidth="3" />
      <rect x="18" y="22" width="36" height="6" fill="#0a0a0a" />
      <rect x="21" y="24" width="2" height="2" fill="#ef4444" />
      <rect x="25" y="24" width="2" height="2" fill="#fde047" />
      <rect x="29" y="24" width="2" height="2" fill="#22c55e" />
      <rect x="21" y="31" width="22" height="3" fill="#22d3ee" />
      <rect x="26" y="36" width="22" height="3" fill="#ec4899" />
      <rect x="21" y="41" width="14" height="3" fill="#0a0a0a" />
      <path d="M44 36 L48 40 M48 36 L44 40" stroke={INK} strokeWidth="3" strokeLinecap="round" />
      <g stroke={INK} strokeWidth="2">
        <line x1="8" y1="10" x2="14" y2="14" />
        <line x1="64" y1="10" x2="58" y2="14" />
        <line x1="60" y1="60" x2="54" y2="55" />
      </g>
    </g>
  );
}

/** Panel 2 — "Shipped to prod. Survived." A rocket roaring off a server rack. */
function RocketScene() {
  return (
    <g>
      <circle cx="36" cy="30" r="22" fill="#22c55e" stroke={INK} strokeWidth="2" />
      <rect x="14" y="48" width="44" height="14" fill="#0a0a0a" stroke={INK} strokeWidth="3" />
      {[51, 56].map((y) => (
        <g key={y}>
          <rect x="18" y={y} width="36" height="3" fill="#f8fafc" />
          <rect x="50" y={y} width="2" height="3" fill="#22c55e" />
          <rect x="46" y={y} width="2" height="3" fill="#fde047" />
        </g>
      ))}
      <path d="M36 8 Q44 18 44 36 L28 36 Q28 18 36 8 Z" fill="#f8fafc" stroke={INK} strokeWidth="3" />
      <path d="M36 8 Q40 13 41 20 L31 20 Q32 13 36 8 Z" fill="#ef4444" stroke={INK} strokeWidth="2" />
      <circle cx="36" cy="26" r="4" fill="#22d3ee" stroke={INK} strokeWidth="2" />
      <path d="M28 30 L20 40 L28 38 Z" fill="#ec4899" stroke={INK} strokeWidth="2" />
      <path d="M44 30 L52 40 L44 38 Z" fill="#ec4899" stroke={INK} strokeWidth="2" />
      <path d="M30 36 L36 50 L42 36 Z" fill="#fde047" stroke={INK} strokeWidth="2" />
      <path d="M33 36 L36 45 L39 36 Z" fill="#ef4444" />
    </g>
  );
}

/** Splits "9001", "6+", "∞" into an animatable number + a static suffix (e.g. "+"). */
function parseStat(value: string): { target: number; suffix: string; numeric: boolean } {
  const match = value.match(/^(\d+)(.*)$/);
  if (!match) return { target: 0, suffix: value, numeric: false };
  return { target: parseInt(match[1], 10), suffix: match[2] ?? "", numeric: true };
}

/** A single stat cell whose number counts up + whose fill-bar grows when scrolled into view. */
function StatCell({
  label,
  value,
  index,
  active,
}: {
  label: string;
  value: string;
  index: number;
  active: boolean;
}) {
  const { target, suffix, numeric } = useMemo(() => parseStat(value), [value]);
  const [display, setDisplay] = useState(numeric ? "0" : value);

  useEffect(() => {
    if (!active || !numeric) return;
    const duration = 900;
    const start = performance.now();
    let raf = 0;
    const tick = (now: number) => {
      const t = Math.min(1, (now - start) / duration);
      const eased = 1 - Math.pow(1 - t, 3);
      setDisplay(String(Math.round(target * eased)));
      if (t < 1) raf = requestAnimationFrame(tick);
    };
    raf = requestAnimationFrame(tick);
    return () => cancelAnimationFrame(raf);
  }, [active, numeric, target]);

  const accent = POP_CYCLE[index % POP_CYCLE.length];

  return (
    <motion.div
      initial={{ opacity: 0, y: 14, rotate: index % 2 ? 2 : -2 }}
      animate={active ? { opacity: 1, y: 0, rotate: index % 2 ? 1.5 : -1.5 } : {}}
      transition={{ delay: 0.15 + index * 0.08, type: "spring", stiffness: 320, damping: 18 }}
      whileHover={{ y: -4, rotate: 0, scale: 1.04 }}
      className="nb-border nb-shadow bg-ink p-2 text-left"
    >
      <div className={cn("font-comic text-2xl leading-none", accent)}>
        {display}
        <span className="text-paper">{numeric ? suffix : ""}</span>
      </div>
      <div aria-hidden className="mt-1 h-1.5 w-full overflow-hidden bg-paper/20">
        <motion.div
          className={cn("h-full", accent.replace("text-", "bg-"))}
          initial={{ width: "0%" }}
          animate={active ? { width: numeric ? `${Math.min(100, (target % 100) + 35)}%` : "100%" } : {}}
          transition={{ delay: 0.25 + index * 0.08, duration: 0.8, ease: "easeOut" }}
        />
      </div>
      <div className="mt-1 font-pixel text-[8px] text-paper/80">{label}</div>
    </motion.div>
  );
}

/* ============================================================================
   Character roster — AUTHORED classes (not auto-derived from skills). Each is a
   distinct facet of the dev with a title, rarity, RPG stats, and a curated set
   of "signature spells". Uniform shape → uniform card size.
   ========================================================================== */
type Accent = "yellow" | "cyan" | "magenta" | "green" | "red";
type Rarity = "SSR" | "SR" | "R";
type Stat = { k: "ATK" | "DEF" | "INT" | "SPD"; v: number };
type Klass = {
  id: string;
  name: string;
  role: string;        // tiny sub-title
  rarity: Rarity;
  accent: Accent;
  flavor: string;      // one punchy line
  stats: Stat[];       // exactly 4, uniform
  spells: string[];    // exactly 3 signature skills
  weapon: string;      // flavor "equipped" line
};

const ACCENT_TEXT: Record<Accent, string> = {
  yellow: "text-pop-yellow", cyan: "text-pop-cyan", magenta: "text-pop-magenta", green: "text-pop-green", red: "text-pop-red",
};
const ACCENT_BG: Record<Accent, string> = {
  yellow: "bg-pop-yellow", cyan: "bg-pop-cyan", magenta: "bg-pop-magenta", green: "bg-pop-green", red: "bg-pop-red",
};
const RARITY_TONE: Record<Rarity, string> = { SSR: "bg-pop-yellow text-ink", SR: "bg-pop-magenta text-ink", R: "bg-pop-cyan text-ink" };

const CLASSES: Klass[] = [
  {
    id: "summoner", name: "THE LLM SUMMONER", role: "Generative AI", rarity: "SSR", accent: "magenta",
    flavor: "Binds frontier models to his will — RAG, agents, and fine-tunes that actually ship.",
    stats: [{ k: "ATK", v: 92 }, { k: "DEF", v: 70 }, { k: "INT", v: 96 }, { k: "SPD", v: 84 }],
    spells: ["RAG Pipelines", "LangChain / LangGraph", "LoRA / QLoRA Fine-Tuning"],
    weapon: "Staff of Retrieval",
  },
  {
    id: "alchemist", name: "THE QUANTUM ALCHEMIST", role: "Quantum ML", rarity: "SSR", accent: "cyan",
    flavor: "Brews hybrid quantum–classical circuits; first-authored where physics meets ML.",
    stats: [{ k: "ATK", v: 80 }, { k: "DEF", v: 74 }, { k: "INT", v: 95 }, { k: "SPD", v: 66 }],
    spells: ["QAOA / VQE", "Variational Circuits", "Quark (open source)"],
    weapon: "Phial of Superposition",
  },
  {
    id: "engineer", name: "THE ML ENGINEER", role: "Production ML", rarity: "SR", accent: "green",
    flavor: "Founding-engineer instincts: Kafka streams, recommenders at 10K+ qps, full observability.",
    stats: [{ k: "ATK", v: 88 }, { k: "DEF", v: 90 }, { k: "INT", v: 86 }, { k: "SPD", v: 80 }],
    spells: ["Gradient Boosting", "Kafka + ClickHouse", "Docker / Kubernetes"],
    weapon: "Hammer of Deployment",
  },
  {
    id: "necromancer", name: "THE DATA NECROMANCER", role: "Data Science", rarity: "SR", accent: "yellow",
    flavor: "Raises insight from a million dead rows — anomaly detection, EDA, and dashboards that get adopted.",
    stats: [{ k: "ATK", v: 78 }, { k: "DEF", v: 82 }, { k: "INT", v: 88 }, { k: "SPD", v: 72 }],
    spells: ["Anomaly Detection", "Feature Engineering", "Pandas / NumPy / Plotly"],
    weapon: "Grimoire of Statistics",
  },
  {
    id: "rogue", name: "THE GAME-DEV ROGUE", role: "Creative Coding", rarity: "R", accent: "red",
    flavor: "Off-hours hacker — ships browser games, WebGPU toys, CLI roguelikes, and npm trinkets for fun.",
    stats: [{ k: "ATK", v: 84 }, { k: "DEF", v: 64 }, { k: "INT", v: 80 }, { k: "SPD", v: 94 }],
    spells: ["WebGPU / Three.js", "Godot / Unity", "Published npm packages"],
    weapon: "Dagger of Side-Quests",
  },
];

/** A roster card in the coverflow carousel — uniform size, class identity. */
function ClassCard({ k, selected }: { k: Klass; selected: boolean }) {
  return (
    <div
      className={cn(
        "w-[200px] select-none rounded-sm nb-border bg-paper p-3 text-center",
        selected ? "nb-shadow-lg" : "nb-shadow",
      )}
    >
      <div className={cn("mb-2 flex items-center justify-between nb-border px-1.5 py-1 font-pixel text-[8px] text-ink", ACCENT_BG[k.accent])}>
        <span>{selected ? "▶ SELECTED" : "TAP"}</span>
        <span className="nb-border bg-ink px-1 py-0.5 text-paper">{k.rarity}</span>
      </div>
      <div className="nb-border bg-crt p-1">
        <HeroAvatar name={k.name} />
      </div>
      <p className={cn("mt-2 truncate font-comic text-sm leading-tight", ACCENT_TEXT[k.accent])}>{k.name}</p>
      <p className="font-pixel text-[7px] uppercase tracking-wide text-ink/55">{k.role}</p>
    </div>
  );
}

/* a chunky pixel stat bar for the dossier */
function StatBar({ label, value, accentBg }: { label: string; value: number; accentBg: string }) {
  const cells = 10, filled = Math.round(value / 10);
  return (
    <div className="flex items-center gap-2">
      <span className="w-8 font-pixel text-[8px] text-ink/70">{label}</span>
      <span className="flex flex-1 gap-0.5">
        {Array.from({ length: cells }).map((_, i) => (
          <span key={i} className={cn("h-2 flex-1 border-[1.5px] border-ink", i < filled ? accentBg : "bg-ink/10")} />
        ))}
      </span>
      <span className="w-6 text-right font-pixel text-[8px] text-ink/70">{value}</span>
    </div>
  );
}

export function CharacterSelect() {
  const { about, profile } = portfolio;
  const rootRef = useRef<HTMLDivElement>(null);
  const inView = useInView(rootRef, { amount: 0.2, once: true });

  const roster = CLASSES;

  const [sel, setSel] = useState(0);
  const selected = roster[sel];
  const go = (d: number) => setSel((s) => Math.min(roster.length - 1, Math.max(0, s + d)));

  return (
    <Stage id="about" label="PLAYER 1" title="CHARACTER SELECT" subtitle={about.blurb}>
      <div ref={rootRef}>
        {/* player header */}
        <div className="mb-6 flex flex-wrap items-center gap-3">
          <Badge className="bg-ink text-pop-yellow">PLAYER 1</Badge>
          <span className="font-comic text-2xl text-paper">{profile.name}</span>
          <span className="nb-border bg-ink px-2 py-1 font-pixel text-[9px] text-pop-green">{profile.title}</span>
          <span className="ml-auto font-pixel text-[9px] text-paper/50">◀ ▶ / tap a card to choose a class</span>
        </div>

        {/* education enrollment banner — revealed before the class cards */}
        <EducationBanner />

        <div className="grid items-center gap-8 lg:grid-cols-[1.15fr_1fr]">
          {/* ── COVERFLOW CAROUSEL ── */}
          <div
            tabIndex={0}
            role="listbox"
            aria-label="Character class carousel"
            onKeyDown={(e) => {
              if (e.key === "ArrowLeft") { e.preventDefault(); go(-1); }
              if (e.key === "ArrowRight") { e.preventDefault(); go(1); }
            }}
            className="relative h-[340px] overflow-hidden rounded-sm outline-none ring-pop-cyan focus-visible:ring-4 [perspective:1100px]"
          >
            <div aria-hidden className="absolute inset-0 -z-10 halftone opacity-10" />
            {roster.map((k, i) => {
              const off = i - sel;
              const isSel = off === 0;
              return (
                <motion.button
                  key={k.id}
                  type="button"
                  role="option"
                  aria-selected={isSel}
                  aria-label={`Select ${k.name}`}
                  onClick={() => setSel(i)}
                  className="absolute left-1/2 top-1/2 origin-center"
                  style={{ transformStyle: "preserve-3d" }}
                  animate={{
                    x: off * 132 - 100,
                    y: -150 + (isSel ? -6 : 0),
                    scale: isSel ? 1 : 0.74,
                    rotateY: off * -24,
                    opacity: Math.abs(off) > 2 ? 0 : isSel ? 1 : 0.5,
                    zIndex: 20 - Math.abs(off),
                  }}
                  transition={{ type: "spring", stiffness: 240, damping: 26 }}
                >
                  <ClassCard k={k} selected={isSel} />
                </motion.button>
              );
            })}

            {/* arrows */}
            <button
              type="button"
              aria-label="Previous class"
              onClick={() => go(-1)}
              disabled={sel === 0}
              className="absolute left-2 top-1/2 z-30 -translate-y-1/2 nb-border nb-shadow bg-pop-yellow px-3 py-2 font-pixel text-xs text-ink transition active:translate-y-[-46%] disabled:opacity-30"
            >
              ◀
            </button>
            <button
              type="button"
              aria-label="Next class"
              onClick={() => go(1)}
              disabled={sel === roster.length - 1}
              className="absolute right-2 top-1/2 z-30 -translate-y-1/2 nb-border nb-shadow bg-pop-yellow px-3 py-2 font-pixel text-xs text-ink transition active:translate-y-[-46%] disabled:opacity-30"
            >
              ▶
            </button>

            {/* selection dots */}
            <div className="absolute bottom-2 left-1/2 z-30 flex -translate-x-1/2 gap-1.5">
              {roster.map((k, i) => (
                <button
                  key={k.id}
                  type="button"
                  aria-label={`Go to ${k.name}`}
                  onClick={() => setSel(i)}
                  className={cn("h-2 w-4 nb-border", i === sel ? "bg-pop-red" : "bg-paper/40")}
                />
              ))}
            </div>
          </div>

          {/* ── CLASS DOSSIER (crossfades on selection) ── */}
          <AnimatePresence mode="wait">
            <motion.div
              key={selected.id}
              initial={{ opacity: 0, x: 26, rotate: 1 }}
              animate={{ opacity: 1, x: 0, rotate: 0 }}
              exit={{ opacity: 0, x: -26 }}
              transition={{ duration: 0.28, ease: "easeOut" }}
            >
              <Panel color={selected.accent} lg className="relative p-5">
                <div className="mb-3 flex items-center justify-between">
                  <Badge className="bg-ink text-paper">CLASS DOSSIER</Badge>
                  <span className={cn("nb-border px-2 py-0.5 font-comic text-sm leading-none", RARITY_TONE[selected.rarity])}>
                    {selected.rarity}
                  </span>
                </div>
                <h3 className="font-comic text-3xl leading-none text-ink [-webkit-text-stroke:0.4px_black]">{selected.name}</h3>
                <p className="mt-0.5 font-pixel text-[8px] uppercase tracking-widest text-ink/60">{selected.role}</p>
                <p className="mt-2 font-body text-sm text-ink/85">{selected.flavor}</p>

                {/* RPG stat block — fixed 4 bars, uniform height every class */}
                <div className="mt-4 grid grid-cols-1 gap-1.5 rounded-sm nb-border bg-paper/70 p-3 sm:grid-cols-2">
                  {selected.stats.map((s) => (
                    <StatBar key={s.k} label={s.k} value={s.v} accentBg={ACCENT_BG[selected.accent]} />
                  ))}
                </div>

                {/* signature spells — exactly 3 */}
                <div className="mt-3 rounded-sm nb-border bg-ink/90 p-3">
                  <p className="mb-1.5 font-pixel text-[8px] uppercase tracking-widest text-pop-green">Signature Spells</p>
                  <ul className="space-y-1">
                    {selected.spells.map((sp) => (
                      <li key={sp} className="flex items-center gap-2 font-mono text-[12px] text-paper">
                        <span aria-hidden className={ACCENT_TEXT[selected.accent]}>◈</span> {sp}
                      </li>
                    ))}
                  </ul>
                  <p className="mt-2 font-mono text-[10px] text-paper/45">
                    <span className="text-pop-yellow">WPN</span> · {selected.weapon}
                  </p>
                </div>

                <div className="mt-5">
                  <ArcadeButton color="green" className="w-full justify-center">▶ READY · {selected.name}</ArcadeButton>
                </div>
              </Panel>
            </motion.div>
          </AnimatePresence>
        </div>

        {/* ── CAREER STATS strip (counts up on view) ── */}
        <div className="mt-9">
          <p className="mb-2 font-pixel text-[9px] uppercase tracking-widest text-paper/60">Career stats</p>
          <div className="grid grid-cols-2 gap-2 sm:grid-cols-4">
            {about.stats.map((s, i) => (
              <StatCell key={s.label} label={s.label} value={s.value} index={i} active={inView} />
            ))}
          </div>
        </div>

        {/* ── ORIGIN STORY: comic strip w/ gutters + page-curl corners ── */}
        <div className="mt-10">
          <div className="mb-3 flex items-center gap-2">
            <span className="font-bang text-3xl text-pop-magenta [-webkit-text-stroke:1.5px_black]">ORIGIN STORY</span>
            <span aria-hidden className="font-pixel text-[8px] text-ink/60">EP.01</span>
          </div>

          <div className="grid gap-5 bg-ink p-3 nb-border nb-shadow-lg sm:grid-cols-3">
            {about.originStrip.map((p, i) => (
              <motion.div
                key={i}
                initial={{ opacity: 0, y: 36, rotate: i % 2 ? 3 : -3 }}
                animate={inView ? { opacity: 1, y: 0, rotate: i % 2 ? 1.5 : -1.5 } : {}}
                transition={{ delay: 0.3 + i * 0.14, type: "spring", stiffness: 240, damping: 18 }}
                whileHover={{ rotate: 0, y: -6, scale: 1.03, zIndex: 5 }}
                className="relative"
              >
                <ComicPanel title={`PANEL ${i + 1}`} className="relative h-full">
                  <span
                    aria-hidden
                    className={cn(
                      "absolute right-2 top-9 z-10 font-comic text-4xl leading-none opacity-20",
                      POP_CYCLE[i % POP_CYCLE.length],
                    )}
                  >
                    {i + 1}
                  </span>
                  <OriginScene index={i} label={p.caption} size={72} />
                  <p className="relative z-10 mt-3 font-body text-sm leading-snug">{p.caption}</p>
                  <span
                    aria-hidden
                    className="absolute bottom-0 right-0 h-6 w-6 border-l-[3px] border-t-[3px] border-ink bg-crt"
                    style={{ clipPath: "polygon(100% 0, 0 100%, 100% 100%)" }}
                  />
                </ComicPanel>
              </motion.div>
            ))}
          </div>

          <motion.div
            initial={{ opacity: 0, rotate: -2 }}
            animate={inView ? { opacity: 1, rotate: 1 } : {}}
            transition={{ delay: 0.8, type: "spring", stiffness: 260, damping: 16 }}
            className="mt-5 inline-block nb-border nb-shadow bg-pop-yellow px-4 py-2 font-comic text-lg text-ink"
          >
            …TO BE CONTINUED →
          </motion.div>
        </div>
      </div>
    </Stage>
  );
}
