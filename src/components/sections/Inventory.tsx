"use client";
import { useEffect, useMemo, useState } from "react";
import { createPortal } from "react-dom";
import { motion, AnimatePresence } from "motion/react";
import { portfolio } from "@/content/portfolio";
import type { Rarity, Skill } from "@/content/types";
import { Stage } from "@/components/ui/Stage";
import { Reveal } from "@/components/fx/Reveal";
import { HoloCard } from "@/components/fx/HoloCard";
import { cn } from "@/lib/cn";

/* ============================================================================
   SKILL BINDER — a collector's card binder
   Every skill is a holographic TCG card, ALL visible at once, grouped onto
   labeled shelves (one per category) inside a ring-bound binder page. Hover
   tilts + foils a card; click flies it to center as a big inspect card with
   full HoloCard 3D-tilt + foil and a segmented mastery readout.
   ========================================================================== */

const RARITY_ORDER: Rarity[] = ["COMMON", "RARE", "EPIC", "LEGENDARY"];

function rarityOf(level: number): Rarity {
  if (level >= 90) return "LEGENDARY";
  if (level >= 80) return "EPIC";
  if (level >= 70) return "RARE";
  return "COMMON";
}

type RarityTheme = { accent: string; label: string; chip: string; flavor: string };
const THEME: Record<Rarity, RarityTheme> = {
  COMMON: { accent: "#cdd3da", label: "COMMON", chip: "bg-paper text-ink", flavor: "Solid, dependable working knowledge." },
  RARE: { accent: "#00e5ff", label: "RARE", chip: "bg-pop-cyan text-ink", flavor: "Sharp, fast, and reliable in the field." },
  EPIC: { accent: "#ff4fd8", label: "EPIC", chip: "bg-pop-magenta text-ink", flavor: "Battle-tested across real production fires." },
  LEGENDARY: { accent: "#ffd23f", label: "LEGENDARY", chip: "bg-pop-yellow text-ink", flavor: "Mastered to muscle memory. Ship on sight." },
};

function monogram(name: string): string {
  const cleaned = name.replace(/[^a-zA-Z0-9 ./]/g, "");
  const parts = cleaned.split(/[ ./]+/).filter(Boolean);
  if (parts.length >= 2) return (parts[0][0] + parts[1][0]).toUpperCase();
  return cleaned.slice(0, 2).toUpperCase();
}

const SHELF_ACCENT = ["text-pop-yellow", "text-pop-cyan", "text-pop-magenta"];

/* ----------------------------------------------------------------------------
   Per-skill "FIELD REPORT" — flavorful, semi-fictional usage notes so the
   inspect card has personality. Hand-written entries for the headliners; a
   deterministic generator covers the rest (no Math.random → hydration-safe).
   -------------------------------------------------------------------------- */
type Lore = { quest: string; deeds: string[]; quote: string };

const SKILL_LORE: Record<string, Lore> = {
  Python: {
    quest: "First language learned, still the daily driver.",
    deeds: ["Wired every ML pipeline, ETL job & daemon I've shipped", "From a 1M-row anomaly detector to an LLM-agent orchestrator", "If it thinks, it probably thinks in Python"],
    quote: "import sampark as me",
  },
  PyTorch: {
    quest: "Weapon of choice for anything that learns.",
    deeds: ["Trained transformers & CNNs from scratch and fine-tuned frontier models", "LoRA/QLoRA runs that cut compute 60% without losing accuracy", "Hand-rolled custom training loops when Trainer wasn't enough"],
    quote: "loss.backward() — and so do I, every night.",
  },
  LangChain: {
    quest: "Backbone of the RAG systems I ship.",
    deeds: ["Production RAG that lifted domain accuracy ~25%", "Multi-stage agent graphs: plan → draft → summarize → validate", "Tamed it when the abstractions fought back (often)"],
    quote: "Chains are easy. Knowing when NOT to chain is the skill.",
  },
  "RAG Pipelines": {
    quest: "My answer to 'the model hallucinates.'",
    deeds: ["Tuned chunking, re-ranking & retrieval until answers were grounded", "ChromaDB / Pinecone vector stores at real query volume", "Built the eval harness that proved it actually helped"],
    quote: "Retrieve first. Generate second. Trust, third.",
  },
  Kafka: {
    quest: "The nervous system of the founding ML stack.",
    deeds: ["Streaming feature pipelines feeding a 92%-accuracy predictor", "Event-driven inference at 10K+ qps", "Grafana drift + latency dashboards bolted on top"],
    quote: "Everything is a log if you're brave enough.",
  },
  "QAOA / VQE": {
    quest: "Where physics meets machine learning.",
    deeds: ["Hybrid quantum-classical circuits for combinatorial optimization", "Explored quantum advantage in feature-space mapping", "Fed the first-authored paper that's under review"],
    quote: "Superposition: doing every internship at once.",
  },
  "Three.js": {
    quest: "How I make the web feel alive.",
    deeds: ["The 3D dragon + war scene on this very site", "WebGPU experiments & shader toys for fun", "Instanced everything so it still hits 60fps"],
    quote: "Yes, I built a fire-breathing dragon for a résumé.",
  },
  WebGPU: {
    quest: "Running real models in the browser, zero backend.",
    deeds: ["Browser-LLM: offline chatbot with sub-second token latency", "Lazy weight streaming + KV-cache wrangling on consumer GPUs", "Quantized GGUF / ONNX in pure client-side JS"],
    quote: "The GPU is right there. Use it.",
  },
};

/* deterministic fallback so every card has content */
function loreFor(skill: Skill): Lore {
  if (SKILL_LORE[skill.name]) return SKILL_LORE[skill.name];
  const r = rarityOf(skill.level);
  const tier =
    r === "LEGENDARY" ? "a core weapon — reached for on instinct"
    : r === "EPIC" ? "battle-tested across real production work"
    : r === "RARE" ? "a sharp, dependable tool in the kit"
    : "solid working knowledge, sharpened on demand";
  return {
    quest: `Part of the ${skill.category} loadout.`,
    deeds: [
      `Used in real ${skill.category.toLowerCase()} work — ${tier}`,
      `Picked up where the problem needed it, kept because it earned its slot`,
      `Mastery ${skill.level}/100 and climbing`,
    ],
    quote: `${skill.name}: applied, not just listed.`,
  };
}

/* ----------------------------------------------------------------------------
   CardFace — visual of one card; `big` swaps to the detailed inspect layout.
   -------------------------------------------------------------------------- */
function CardFace({ skill, big = false }: { skill: Skill; big?: boolean }) {
  const t = THEME[rarityOf(skill.level)];
  const stars = Math.min(5, Math.max(1, Math.round(skill.level / 20)));
  const cells = 10;
  const filled = Math.round(skill.level / 10);

  return (
    <div
      className="relative flex h-full w-full flex-col overflow-hidden rounded-md border-[3px] border-ink nb-shadow"
      style={{ background: t.accent, boxShadow: big ? `0 0 28px -4px ${t.accent}` : undefined }}
    >
      <div className={cn("relative flex items-center justify-between bg-ink px-2 py-1 font-pixel", big ? "text-[9px]" : "text-[6px]")}>
        <span className="tracking-[0.15em]" style={{ color: t.accent }}>{t.label}</span>
        <span className="text-paper/60">{skill.category}</span>
      </div>

      <div className={cn("relative mx-2 mt-2 overflow-hidden nb-border", big ? "h-44" : "h-20")}
        style={{ background: `radial-gradient(120% 100% at 50% 0%, #ffffffcc, ${t.accent} 55%, var(--color-ink) 140%)` }}
      >
        <span aria-hidden className="halftone pointer-events-none absolute inset-0 opacity-25" />
        <div className="absolute inset-0 grid place-items-center">
          <div className={cn("grid place-items-center nb-border", big ? "h-24 w-24" : "h-12 w-12")}
            style={{ background: "var(--color-ink)", clipPath: "polygon(50% 0%, 100% 25%, 100% 75%, 50% 100%, 0% 75%, 0% 25%)" }}>
            <span className={cn("font-comic", big ? "text-3xl" : "text-base")} style={{ color: t.accent }}>{monogram(skill.name)}</span>
          </div>
        </div>
        <div className="absolute right-1 top-1 flex flex-col items-center nb-border bg-ink px-1.5 py-0.5 leading-none">
          <span className={cn("font-pixel text-paper/60", big ? "text-[7px]" : "text-[5px]")}>PWR</span>
          <span className={cn("font-comic", big ? "text-3xl" : "text-base")} style={{ color: t.accent }}>{skill.level}</span>
        </div>
      </div>

      <div className="relative m-2 flex flex-1 flex-col bg-paper nb-border px-2 py-1.5 text-ink">
        <div className={cn("truncate text-center font-comic [-webkit-text-stroke:0.5px_black]", big ? "text-2xl" : "text-[11px]")}>{skill.name}</div>
        <div className="flex items-center justify-center gap-0.5 py-0.5" aria-hidden>
          {Array.from({ length: 5 }).map((_, i) => (
            <span key={i} className="h-1.5 w-1.5" style={{ background: i < stars ? t.accent : "transparent", border: `1.5px solid ${i < stars ? "#0a0a0a" : "#0a0a0a22"}`, clipPath: "polygon(50% 0, 100% 50%, 50% 100%, 0 50%)" }} />
          ))}
        </div>
        {big && (
          <div className="mt-auto">
            <div className="mb-1 flex items-center justify-between font-pixel text-[7px] text-ink/60">
              <span>MASTERY</span><span>{skill.level}/100</span>
            </div>
            <div className="flex gap-0.5">
              {Array.from({ length: cells }).map((_, i) => (
                <span key={i} className="h-2.5 flex-1 border-[2px] border-ink" style={{ background: i < filled ? t.accent : "transparent" }} />
              ))}
            </div>
            <p className="mt-2 font-mono text-[10px] italic leading-snug text-ink/70">“{t.flavor}”</p>
          </div>
        )}
      </div>
    </div>
  );
}

/* ----------------------------------------------------------------------------
   BinderCard — a card sitting in its binder pocket (no overlap; all visible).
   -------------------------------------------------------------------------- */
function BinderCard({ skill, index, onPick }: { skill: Skill; index: number; onPick: (s: Skill) => void }) {
  const t = THEME[rarityOf(skill.level)];
  return (
    <motion.button
      type="button"
      onClick={() => onPick(skill)}
      aria-label={`${skill.name}, power ${skill.level}, ${rarityOf(skill.level).toLowerCase()}. View card.`}
      className="group relative h-52 w-full outline-none [transform-style:preserve-3d]"
      initial={{ opacity: 0, y: 24, rotateX: -8 }}
      whileInView={{ opacity: 1, y: 0, rotateX: 0 }}
      viewport={{ once: true, amount: 0.4 }}
      transition={{ type: "spring", stiffness: 260, damping: 22, delay: index * 0.05 }}
      whileHover={{ y: -8, scale: 1.05, rotateZ: index % 2 ? 1.5 : -1.5, zIndex: 30 }}
      whileFocus={{ y: -8, scale: 1.05, zIndex: 30 }}
      whileTap={{ scale: 1.0 }}
    >
      {/* binder pocket */}
      <span aria-hidden className="absolute inset-0 -z-10 rounded-md border-[2px] border-paper/10 bg-crt/40" style={{ transform: "translate(4px,5px)" }} />
      <CardFace skill={skill} />
      {/* plastic-sleeve sheen (always faint) + foil on hover */}
      <span aria-hidden className="pointer-events-none absolute inset-0 rounded-md opacity-20 mix-blend-screen"
        style={{ background: "linear-gradient(125deg, transparent 40%, rgba(255,255,255,.35) 50%, transparent 60%)" }} />
      <span aria-hidden className="pointer-events-none absolute inset-0 rounded-md opacity-0 mix-blend-color-dodge transition-opacity duration-300 group-hover:opacity-70 group-focus:opacity-70"
        style={{ background: "linear-gradient(115deg, transparent 30%, rgba(255,255,255,.5) 45%, transparent 60%), conic-gradient(from 210deg, #ff3b3b55,#ffd23f55,#39ff1455,#00e5ff55,#ff4fd855,#ff3b3b55)" }} />
      <span aria-hidden className="pointer-events-none absolute -inset-1 -z-20 rounded-md opacity-0 blur-md transition-opacity duration-300 group-hover:opacity-70 group-focus:opacity-70" style={{ background: t.accent }} />
    </motion.button>
  );
}

/* ----------------------------------------------------------------------------
   InspectOverlay — the picked card, flown to center with full holo 3D tilt.
   -------------------------------------------------------------------------- */
function InspectOverlay({ skill, onClose }: { skill: Skill; onClose: () => void }) {
  const t = THEME[rarityOf(skill.level)];
  const lore = loreFor(skill);
  const [mounted, setMounted] = useState(false);
  useEffect(() => {
    setMounted(true);
    const onKey = (e: KeyboardEvent) => e.key === "Escape" && onClose();
    document.addEventListener("keydown", onKey);
    const prev = document.body.style.overflow;
    document.body.style.overflow = "hidden";
    return () => {
      document.removeEventListener("keydown", onKey);
      document.body.style.overflow = prev;
    };
  }, [onClose]);

  // Portal to <body> so the fixed overlay escapes the Stage/section transforms
  // (a transformed ancestor becomes the containing block for position:fixed,
  // which was pushing this modal ~2500px off-screen).
  if (!mounted) return null;
  return createPortal(
    <motion.div
      className="fixed inset-0 z-[85] grid place-items-center bg-crt/80 p-4 backdrop-blur-sm"
      initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} onClick={onClose}
    >
      {/* OPAQUE framed panel — gives the card's blend-mode foil a solid backdrop
          so it can't wash out against the blurred page (the old bug). */}
      <motion.div
        onClick={(e) => e.stopPropagation()}
        initial={{ scale: 0.82, y: 30, opacity: 0 }}
        animate={{ scale: 1, y: 0, opacity: 1 }}
        exit={{ scale: 0.88, y: 16, opacity: 0 }}
        transition={{ type: "spring", stiffness: 240, damping: 22 }}
        className="relative w-[min(94vw,720px)] overflow-hidden nb-border nb-shadow-lg bg-ink"
        style={{ boxShadow: `8px 8px 0 #0a0a0a, 0 0 40px -6px ${t.accent}` }}
      >
        {/* accent header rail */}
        <div className="flex items-center justify-between px-4 py-2" style={{ background: t.accent }}>
          <span className="font-pixel text-[9px] text-ink">FIELD REPORT</span>
          <span className="font-comic text-sm text-ink">{t.label}</span>
        </div>

        <div className="grid gap-5 p-5 sm:grid-cols-[260px_1fr]">
          {/* LEFT — the holo card, now on an opaque dark cell */}
          <div className="mx-auto">
            <HoloCard className="group h-[360px] w-60 rounded-md" intensity={1.2}>
              <CardFace skill={skill} big />
            </HoloCard>
          </div>

          {/* RIGHT — the dossier / facts */}
          <div className="min-w-0 text-paper">
            <h3 className="font-comic text-3xl leading-none [-webkit-text-stroke:0.5px_black]" style={{ color: t.accent }}>
              {skill.name}
            </h3>
            <p className="mt-0.5 font-pixel text-[8px] uppercase tracking-widest text-paper/50">
              {skill.category} · PWR {skill.level}
            </p>
            <p className="mt-3 font-body text-sm text-paper/85">“{lore.quest}”</p>

            <p className="mt-4 mb-1 font-pixel text-[8px] uppercase tracking-widest text-pop-green">Combat Log</p>
            <ul className="space-y-1.5">
              {lore.deeds.map((d) => (
                <li key={d} className="flex items-start gap-2 font-mono text-[12px] leading-snug text-paper/80">
                  <span aria-hidden className="mt-[2px]" style={{ color: t.accent }}>▸</span>
                  <span>{d}</span>
                </li>
              ))}
            </ul>

            {/* mastery meter */}
            <div className="mt-4">
              <div className="mb-1 flex items-center justify-between font-pixel text-[8px] text-paper/55">
                <span>MASTERY</span><span>{skill.level}/100</span>
              </div>
              <div className="flex gap-0.5">
                {Array.from({ length: 20 }).map((_, i) => (
                  <span key={i} className="h-2.5 flex-1 border border-ink"
                    style={{ background: i < Math.round(skill.level / 5) ? t.accent : "transparent" }} />
                ))}
              </div>
            </div>

            <p className="mt-4 border-l-2 pl-3 font-mono text-[12px] italic text-paper/70" style={{ borderColor: t.accent }}>
              {lore.quote}
            </p>
          </div>
        </div>

        <button type="button" onClick={onClose} aria-label="Close card"
          className="absolute right-2 top-1.5 z-[7] grid h-7 w-7 place-items-center nb-border bg-ink font-pixel text-[10px] text-paper hover:bg-pop-red">
          X
        </button>
        <p className="pb-3 text-center font-pixel text-[8px] text-paper/40">CLICK OUTSIDE OR PRESS ESC TO RETURN</p>
      </motion.div>
    </motion.div>,
    document.body,
  );
}

export function Inventory() {
  const decks = portfolio.skills;
  const [picked, setPicked] = useState<Skill | null>(null);

  const loadout = useMemo(() => {
    const all = decks.flatMap((c) => c.skills);
    const total = all.reduce((s, k) => s + k.level, 0);
    const counts = RARITY_ORDER.reduce(
      (acc, r) => ({ ...acc, [r]: all.filter((s) => rarityOf(s.level) === r).length }),
      {} as Record<Rarity, number>,
    );
    return { count: all.length, total, counts };
  }, [decks]);

  return (
    <Stage
      id="skills"
      label="INVENTORY"
      title="SKILL BINDER"
      subtitle="The full collection — every card on the page. Hover to foil, click to inspect."
    >
      {/* rarity legend */}
      <Reveal>
        <div className="mb-6 flex flex-wrap items-center gap-2">
          <span className="font-pixel text-[9px] text-paper/50">RARITY:</span>
          {RARITY_ORDER.map((r) => (
            <span key={r} className={cn("nb-border font-pixel text-[8px] px-2 py-1 inline-flex items-center gap-1.5", THEME[r].chip)}>
              <span aria-hidden className="h-2.5 w-2.5" style={{ background: THEME[r].accent, border: "1.5px solid var(--color-ink)", clipPath: "polygon(50% 0%, 100% 25%, 100% 75%, 50% 100%, 0% 75%, 0% 25%)" }} />
              {r} ×{loadout.counts[r]}
            </span>
          ))}
          <span className="ml-auto font-pixel text-[8px] text-paper/40">{loadout.count} CARDS COLLECTED</span>
        </div>
      </Reveal>

      {/* the binder */}
      <div className="relative nb-border nb-shadow-lg rounded-md bg-crt/60 p-4 pl-9 sm:p-6 sm:pl-12">
        {/* ring holes down the spine */}
        <div aria-hidden className="absolute inset-y-4 left-3 flex flex-col justify-around sm:left-4">
          {Array.from({ length: 7 }).map((_, i) => (
            <span key={i} className="h-3 w-3 rounded-full border-[2px] border-ink bg-crt shadow-inner" />
          ))}
        </div>

        <div className="flex flex-col gap-8">
          {decks.map((cat, ci) => (
            <section key={cat.name} aria-label={cat.name}>
              {/* shelf label */}
              <div className="mb-3 flex items-center gap-3">
                <h3 className={cn("font-comic text-xl [-webkit-text-stroke:0.5px_black]", SHELF_ACCENT[ci % SHELF_ACCENT.length])}>{cat.name}</h3>
                <span className="h-[3px] flex-1 bg-ink/40" />
                <span className="font-pixel text-[8px] text-paper/50">{cat.skills.length} CARDS</span>
              </div>
              {/* card grid — every card visible */}
              <div className="grid grid-cols-2 gap-4 sm:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5">
                {cat.skills.map((s, i) => (
                  <BinderCard key={s.name} skill={s} index={i} onPick={setPicked} />
                ))}
              </div>
            </section>
          ))}
        </div>
      </div>

      {/* collection footer HUD */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        whileInView={{ opacity: 1, y: 0 }}
        viewport={{ once: true, amount: 0.5 }}
        transition={{ type: "spring", stiffness: 240, damping: 20 }}
        className="mt-10 flex flex-wrap items-center justify-between gap-3 nb-border nb-shadow-lg bg-ink px-4 py-3 rotate-[0.4deg]"
      >
        <span className="font-pixel text-[10px] text-pop-yellow">COLLECTION</span>
        <span className="font-pixel text-[9px] text-paper">{loadout.count} CARDS</span>
        <span className="font-pixel text-[9px] text-pop-cyan">TOTAL PWR {loadout.total}</span>
        <span className="font-pixel text-[9px] text-pop-magenta">{loadout.counts.LEGENDARY} LEGENDARY</span>
      </motion.div>

      <AnimatePresence>
        {picked && <InspectOverlay key={picked.name} skill={picked} onClose={() => setPicked(null)} />}
      </AnimatePresence>
    </Stage>
  );
}
