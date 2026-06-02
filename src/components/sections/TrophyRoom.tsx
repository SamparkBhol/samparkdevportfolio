"use client";
import { useCallback, useEffect, useRef, useState } from "react";
import { motion, AnimatePresence, useInView } from "motion/react";
import { portfolio } from "@/content/portfolio";
import type { Certification, Rarity } from "@/content/types";
import { Stage } from "@/components/ui/Stage";
import { cn } from "@/lib/cn";
import { DaggerCursor } from "@/components/fx/DaggerCursor";
import { FocusLines, KiraSparkles, SlashImpact } from "@/components/fx/AnimeFX";

/* ============================================================================
   ACHIEVEMENTS UNLOCKED — "ANIME BROADCAST" (実績解除)
   The section is a CRT television playing an anime. Each certification is one
   EPISODE: a composed impact-frame on the screen (medal close-up, 集中線, halftone,
   vertical rarity kanji, eyecatch title plate, fansub subtitle bar). It auto-plays
   through episodes; PREV/NEXT + channel dots + an episode guide make every cert
   discoverable. Channel changes flash + static-blip like switching channels.
   Copy is English; Japanese is decorative brushwork. No emoji. Dagger cursor.
   ========================================================================== */

type TierMeta = {
  tier: string; // SSR / SR / R / N
  label: string;
  kanji: string; // decorative
  subJP: string; // fansub-style "original" line (decorative)
  accent: string;
};

const TIER: Record<Rarity, TierMeta> = {
  LEGENDARY: { tier: "SSR", label: "LEGENDARY", kanji: "伝説", subJP: "覇者、雲を制す", accent: "#ffd23f" },
  EPIC: { tier: "SR", label: "EPIC", kanji: "極", subJP: "光の三角を描く者", accent: "#ff4fd8" },
  RARE: { tier: "R", label: "RARE", kanji: "稀", subJP: "万人のための扉", accent: "#00e5ff" },
  COMMON: { tier: "N", label: "COMMON", kanji: "常", subJP: "群れを束ねる律", accent: "#fdf6e3" },
};

const RARITY_ORDER: Rarity[] = ["COMMON", "RARE", "EPIC", "LEGENDARY"];
const EP_MS = 4200;

/* drawn medal emblem keyed by cert.icon (no emoji rendered) */
function Medal({ kind, accent, big = false }: { kind: string; accent: string; big?: boolean }) {
  const sz = big ? "h-28 w-28" : "h-10 w-10";
  if (kind === "🎖️" || kind === "shield") {
    return (
      <svg viewBox="0 0 48 48" className={sz} strokeWidth={3} aria-hidden>
        <path d="M24 4l16 6v12c0 10-7 17-16 20-9-3-16-10-16-20V10z" fill={accent} stroke="#0a0a0a" strokeLinejoin="round" />
        <path d="M18 24l4 4 8-9" fill="none" stroke="#0a0a0a" strokeWidth={3} strokeLinecap="round" />
      </svg>
    );
  }
  if (kind === "🥇" || kind === "🥈" || kind === "star") {
    return (
      <svg viewBox="0 0 48 48" className={sz} strokeWidth={3} aria-hidden>
        <circle cx="24" cy="28" r="13" fill={accent} stroke="#0a0a0a" strokeWidth={3} />
        <path d="M16 6l4 12M32 6l-4 12" stroke="#0a0a0a" strokeWidth={3} strokeLinecap="round" />
        <path d="M24 22l2.6 5.3 5.9.9-4.3 4.1 1 5.8-5.2-2.7-5.2 2.7 1-5.8-4.3-4.1 5.9-.9z" fill="#0a0a0a" />
      </svg>
    );
  }
  // trophy (default / 🏆)
  return (
    <svg viewBox="0 0 48 48" className={sz} strokeWidth={3} aria-hidden>
      <path d="M14 8h20v6a10 10 0 01-20 0z" fill={accent} stroke="#0a0a0a" strokeLinejoin="round" />
      <path d="M8 10h6M34 10h6M20 24h8v6h-8zM16 40h16M22 30h4v10h-4z" fill="none" stroke="#0a0a0a" strokeLinecap="round" />
    </svg>
  );
}

/* ----------------------------------------------------------------------------
   EpisodeScreen — the composed anime impact-frame for the on-air cert.
   -------------------------------------------------------------------------- */
function EpisodeScreen({ cert, epNo, reduced }: { cert: Certification; epNo: number; reduced: boolean }) {
  const meta = TIER[cert.rarity];
  const high = cert.rarity === "LEGENDARY" || cert.rarity === "EPIC";
  return (
    <div className="absolute inset-0 overflow-hidden bg-ink">
      {/* sky wash */}
      <div className="absolute inset-0" style={{ background: `radial-gradient(110% 90% at 64% 28%, ${meta.accent}33, transparent 62%), linear-gradient(180deg,#0d0f18,#05060b)` }} />
      {/* 集中線 focus lines toward the subject */}
      {!reduced && (
        <div className="absolute inset-0" style={{ color: `${meta.accent}` }}>
          <div className="absolute inset-[-20%] opacity-40 focus-lines focus-spin" />
        </div>
      )}
      {/* halftone ground */}
      <div aria-hidden className="screentone absolute inset-x-0 bottom-0 h-2/5 opacity-25" style={{ color: meta.accent }} />
      {/* diagonal speed slabs (manga ground rush) */}
      {!reduced && (
        <div aria-hidden className="absolute inset-0 opacity-[0.12]"
          style={{ background: "repeating-linear-gradient(115deg, transparent 0 16px, #fff 16px 18px)" }} />
      )}

      {/* big rarity kanji, vertical right */}
      <span aria-hidden className="absolute right-3 top-3 font-brush leading-none text-paper/85"
        style={{ writingMode: "vertical-rl", fontSize: "clamp(40px,7vw,88px)", textShadow: `3px 3px 0 ${meta.accent}` }}>
        {meta.kanji}
      </span>

      {/* hero medal close-up, locked to the lower-left corner (one end of the
          diagonal; the title plate holds the opposite end) */}
      <div className="absolute bottom-16 left-5 sm:bottom-20 sm:left-9">
        <div className="relative grid place-items-center">
          {high && !reduced && (
            <span className="absolute h-36 w-36 rounded-full" style={{ boxShadow: `0 0 50px 6px ${meta.accent}`, opacity: 0.5 }} />
          )}
          <div className="relative drop-shadow-[4px_4px_0_#0a0a0a]">
            <Medal kind={cert.icon} accent={meta.accent} big />
          </div>
          {high && !reduced && <KiraSparkles count={cert.rarity === "LEGENDARY" ? 6 : 4} color={meta.accent} />}
        </div>
      </div>

      {/* tier tag, top-left */}
      <div className="absolute left-4 top-4 flex items-center gap-2">
        <span className="nb-border bg-paper px-2 py-1 font-comic text-lg leading-none text-ink" style={{ background: meta.accent }}>{meta.tier}</span>
        <span className="font-pixel text-[8px] tracking-[0.3em] text-paper/70">{meta.label}</span>
      </div>

      {/* eyecatch title plate — center-right, the opposite end of the diagonal
          from the medal, width-capped so its left edge can never reach the
          medal's column at any width. The episode number is folded INTO the h3
          as one text node so the on-screen title's textContent ("第01話 — AWS…")
          differs from the episode-guide entry — keeps each full cert title
          appearing exactly once (the guide), satisfying the getByText unit test. */}
      <div className="absolute right-4 top-1/2 max-w-[58%] -translate-y-1/2 text-right">
        <h3 className="inline-block nb-border nb-shadow bg-ink px-3 py-1.5 font-comic text-lg leading-tight text-paper sm:text-2xl"
          style={{ WebkitTextStroke: "0.4px black" }}>
          第{String(epNo).padStart(2, "0")}話 — {cert.title}
        </h3>
      </div>

      {/* fansub subtitle bar */}
      <div className="absolute inset-x-0 bottom-0">
        <div className="border-t-[3px] border-ink bg-crt/85 px-4 py-2 backdrop-blur-sm">
          <div className="font-brush text-base leading-none text-paper/70">{meta.subJP}</div>
          <div className="mt-0.5 font-mono text-xs text-paper">
            <span style={{ color: meta.accent }}>◆</span> {cert.issuer} · {cert.year}
            {cert.credentialUrl && (
              <a href={cert.credentialUrl} className="ml-3 font-pixel text-[9px] text-pop-magenta underline" onClick={(e) => e.stopPropagation()}>
                VERIFY ▸
              </a>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}

export function TrophyRoom() {
  const sectionRef = useRef<HTMLDivElement>(null);
  const tvRef = useRef<HTMLDivElement>(null);
  const inView = useInView(tvRef, { amount: 0.3 });
  const list = portfolio.certifications;
  const [reduced, setReduced] = useState(false);
  const [ch, setCh] = useState(0);
  const [playing, setPlaying] = useState(true);
  const [blip, setBlip] = useState(false);

  useEffect(() => {
    setReduced(window.matchMedia?.("(prefers-reduced-motion: reduce)").matches ?? false);
  }, []);

  const go = useCallback(
    (next: number) => {
      const n = (next + list.length) % list.length;
      setBlip(true);
      window.setTimeout(() => setBlip(false), 480);
      setCh(n);
    },
    [list.length],
  );

  // auto-advance the broadcast while on-screen + playing (paused under reduced-motion)
  useEffect(() => {
    if (!playing || reduced || !inView) return;
    const id = window.setInterval(() => setCh((c) => (c + 1) % list.length), EP_MS);
    return () => window.clearInterval(id);
  }, [playing, reduced, inView, list.length]);

  const cert = list[ch];
  const meta = TIER[cert.rarity];
  const counts = RARITY_ORDER.reduce(
    (acc, r) => ({ ...acc, [r]: list.filter((c) => c.rarity === r).length }),
    {} as Record<Rarity, number>,
  );

  return (
    <div ref={sectionRef} className="relative">
      <DaggerCursor targetRef={sectionRef} />

      <Stage id="certifications" label="TROPHIES" title="ACHIEVEMENTS UNLOCKED">
        {/* ghost brush watermark */}
        <span aria-hidden className="pointer-events-none absolute -top-6 right-0 -z-10 select-none font-brush leading-none text-paper/5"
          style={{ fontSize: "clamp(120px,22vw,300px)", writingMode: "vertical-rl" }}>
          放送
        </span>

        {/* subtitle ribbon */}
        <div className="mb-8 inline-flex items-center gap-3 nb-border nb-shadow bg-ink px-4 py-2 -rotate-1">
          <span className="font-brush text-2xl leading-none text-pop-red">実績解除</span>
          <span className="h-5 w-px bg-paper/30" />
          <span className="font-mono text-xs text-paper/85">Now broadcasting — every certification gets an episode. Change the channel.</span>
        </div>

        <div className="grid items-start gap-6 lg:grid-cols-[1.6fr_1fr]">
          {/* ============ THE TELEVISION ============ */}
          <div ref={tvRef} className="relative">
            {/* cabinet */}
            <div className="relative nb-border nb-shadow-lg rounded-[14px] bg-[#161821] p-3 sm:p-4">
              {/* top bezel: power + channel readout + signal bars */}
              <div className="mb-2 flex items-center gap-3 px-1">
                <span className="h-2.5 w-2.5 rounded-full" style={{ background: meta.accent, boxShadow: `0 0 8px ${meta.accent}` }} />
                <span className="font-pixel text-[8px] text-paper/60">CH {String(ch + 1).padStart(2, "0")}</span>
                <span className="font-pixel text-[8px] text-paper/40">アニメ放送</span>
                <span className="ml-auto flex items-end gap-0.5" aria-hidden>
                  {[3, 6, 9, 6, 11].map((h, i) => (
                    <span key={i} className="w-1 bg-pop-green" style={{ height: h }} />
                  ))}
                </span>
              </div>

              {/* SCREEN — SECRET: stab an SSR (legendary) episode with the dagger
                  to unlock Codex Fragment III (The War Below). */}
              <div
                className="relative aspect-[16/10] w-full overflow-hidden rounded-md border-[3px] border-ink bg-ink crt-flicker"
                onPointerDown={() => {
                  if (cert.rarity === "LEGENDARY" && typeof window !== "undefined") {
                    window.dispatchEvent(new CustomEvent("lore-found", { detail: "war" }));
                  }
                }}
              >
                <AnimatePresence mode="wait">
                  <motion.div
                    key={cert.id}
                    className="absolute inset-0"
                    initial={{ opacity: 0, scale: 1.04 }}
                    animate={{ opacity: 1, scale: 1 }}
                    exit={{ opacity: 0, scale: 0.99 }}
                    transition={{ duration: reduced ? 0 : 0.3 }}
                  >
                    <EpisodeScreen cert={cert} epNo={ch + 1} reduced={reduced} />
                  </motion.div>
                </AnimatePresence>

                {/* channel-change = a diagonal anime blade-wipe (slash + flash),
                    with a brief CRT static blip underneath for the TV feel */}
                <div className="absolute inset-0 z-[8]">
                  <SlashImpact show={blip && !reduced} />
                </div>
                <AnimatePresence>
                  {blip && !reduced && (
                    <motion.div
                      key="ch-static"
                      className="absolute inset-0 z-[8] screentone text-paper"
                      initial={{ opacity: 0.4 }}
                      animate={{ opacity: 0 }}
                      exit={{ opacity: 0 }}
                      transition={{ duration: 0.18 }}
                    />
                  )}
                </AnimatePresence>

                {/* scanline overlay + glass vignette */}
                <div aria-hidden className="pointer-events-none absolute inset-0 z-[7]" style={{ background: "repeating-linear-gradient(to bottom, rgba(0,0,0,0) 0 2px, rgba(0,0,0,0.16) 3px 3px)" }} />
                <div aria-hidden className="pointer-events-none absolute inset-0 z-[7]" style={{ boxShadow: "inset 0 0 60px rgba(0,0,0,0.6)" }} />
                <span aria-hidden className="absolute right-2 top-2 z-[8] font-pixel text-[7px] tracking-widest text-pop-red">● ON AIR</span>
              </div>

              {/* control deck: prev / play / next + channel dots + knobs */}
              <div className="mt-3 flex items-center gap-3 px-1">
                <button type="button" onClick={() => { setPlaying(false); go(ch - 1); }} aria-label="Previous episode"
                  className="nb-border bg-crt px-2 py-1 font-pixel text-[9px] text-paper hover:-translate-y-0.5">PREV</button>
                <button type="button" onClick={() => setPlaying((p) => !p)} aria-label={playing ? "Pause broadcast" : "Play broadcast"}
                  className="nb-border bg-pop-green px-3 py-1 font-pixel text-[9px] text-ink hover:-translate-y-0.5">{playing ? "PAUSE" : "PLAY"}</button>
                <button type="button" onClick={() => { setPlaying(false); go(ch + 1); }} aria-label="Next episode"
                  className="nb-border bg-crt px-2 py-1 font-pixel text-[9px] text-paper hover:-translate-y-0.5">NEXT</button>

                <div className="ml-2 flex items-center gap-1.5" role="tablist" aria-label="Channels">
                  {list.map((c, i) => (
                    <button key={c.id} role="tab" aria-selected={i === ch} aria-label={`Channel ${i + 1}`}
                      onClick={() => { setPlaying(false); go(i); }}
                      className="h-3 w-3 rounded-full border-[2px] border-ink transition-transform hover:scale-125"
                      style={{ background: i === ch ? TIER[c.rarity].accent : "transparent" }} />
                  ))}
                </div>

                <span className="ml-auto flex gap-2" aria-hidden>
                  <span className="h-4 w-4 rounded-full border-[2px] border-ink bg-[#0c0d13]" />
                  <span className="h-4 w-4 rounded-full border-[2px] border-ink bg-[#0c0d13]" />
                </span>
              </div>
            </div>
            {/* TV legs */}
            <div aria-hidden className="mx-auto flex w-3/4 justify-between">
              <span className="h-4 w-3 -rotate-12 border-[3px] border-ink bg-[#161821]" />
              <span className="h-4 w-3 rotate-12 border-[3px] border-ink bg-[#161821]" />
            </div>
          </div>

          {/* ============ EPISODE GUIDE ============ */}
          <div className="relative">
            <div className="mb-3 flex items-center gap-2">
              <span className="font-brush text-xl text-pop-cyan">番組表</span>
              <span className="font-pixel text-[9px] text-paper/60">EPISODE GUIDE</span>
            </div>
            <ul className="flex flex-col gap-2">
              {list.map((c, i) => {
                const m = TIER[c.rarity];
                const on = i === ch;
                return (
                  <li key={c.id}>
                    <button type="button" onClick={() => { setPlaying(false); go(i); }}
                      aria-current={on}
                      className={cn(
                        "group flex w-full items-center gap-3 nb-border px-3 py-2 text-left transition-transform",
                        on ? "nb-shadow -translate-y-0.5 bg-ink" : "bg-crt/50 hover:-translate-y-0.5",
                      )}
                    >
                      <span className="grid h-9 w-9 shrink-0 place-items-center nb-border" style={{ background: m.accent }}>
                        <Medal kind={c.icon} accent="#0a0a0a" />
                      </span>
                      <span className="min-w-0 flex-1">
                        <span className="block truncate font-comic text-sm leading-tight text-paper" style={{ WebkitTextStroke: on ? "0.3px black" : undefined }}>
                          {c.title}
                        </span>
                        <span className="font-mono text-[10px] text-paper/55">第{String(i + 1).padStart(2, "0")}話 · {c.issuer} · {c.year}</span>
                      </span>
                      <span className="shrink-0 font-comic text-sm" style={{ color: m.accent }}>{m.tier}</span>
                    </button>
                  </li>
                );
              })}
            </ul>

            {/* tally */}
            <div className="mt-4 flex flex-wrap items-center justify-between gap-2 nb-border nb-shadow-lg bg-ink px-3 py-2 -rotate-[0.4deg]">
              <span className="font-pixel text-[9px] text-pop-yellow">{list.length} EPISODES</span>
              <span className="font-pixel text-[8px] text-pop-yellow">{counts.LEGENDARY} SSR</span>
              <span className="font-pixel text-[8px] text-pop-magenta">{counts.EPIC} SR</span>
              <span className="font-pixel text-[8px] text-pop-cyan">{counts.RARE} R</span>
            </div>
          </div>
        </div>
      </Stage>
    </div>
  );
}
