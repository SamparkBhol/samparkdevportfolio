"use client";
import { useEffect, useMemo, useRef, useState } from "react";
import { motion, useInView } from "motion/react";
import { portfolio } from "@/content/portfolio";
import { Stage } from "@/components/ui/Stage";
import { Panel } from "@/components/ui/Panel";
import { ComicPanel } from "@/components/ui/ComicPanel";
import { Sprite } from "@/components/ui/Sprite";
import { Badge } from "@/components/ui/Badge";
import { cn } from "@/lib/cn";

const GEAR_SLOTS = ["WPN", "HEAD", "BODY", "RING"] as const;
const POP_CYCLE = ["text-pop-yellow", "text-pop-cyan", "text-pop-magenta", "text-pop-green"] as const;

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
      {/* animated fill bar — caps "infinite"/non-numeric at full */}
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

export function CharacterSelect() {
  const { about, profile } = portfolio;
  const rootRef = useRef<HTMLDivElement>(null);
  const inView = useInView(rootRef, { amount: 0.25, once: true });

  // Blinking ">SELECT" cursor.
  const [blink, setBlink] = useState(true);
  useEffect(() => {
    const id = setInterval(() => setBlink((b) => !b), 520);
    return () => clearInterval(id);
  }, []);

  return (
    <Stage id="about" label="PLAYER 1" title="CHARACTER SELECT" subtitle={about.blurb}>
      <div ref={rootRef} className="grid gap-8 md:grid-cols-[1fr_1.4fr]">
        {/* ── CHARACTER SHEET CARD (tilts opposite the comic panels) ── */}
        <motion.div
          initial={{ opacity: 0, x: -28, rotate: -4 }}
          animate={inView ? { opacity: 1, x: 0, rotate: -2 } : {}}
          transition={{ type: "spring", stiffness: 220, damping: 20 }}
          whileHover={{ rotate: 0, scale: 1.01 }}
          className="relative"
        >
          {/* blinking ">SELECT" cursor tab */}
          <div
            aria-hidden
            className={cn(
              "absolute -top-4 -left-2 z-20 select-none rotate-[-6deg] font-pixel text-[10px] nb-border nb-shadow bg-pop-yellow px-2 py-1 text-ink transition-opacity",
              blink ? "opacity-100" : "opacity-25",
            )}
          >
            &gt;SELECT
          </div>

          <Panel color="cyan" lg className="relative p-6 text-center">
            {/* "EQUIPPED" header strip */}
            <div className="-mt-2 mb-4 flex items-center justify-between">
              <Badge className="bg-ink text-pop-yellow">EQUIPPED</Badge>
              <span aria-hidden className="font-pixel text-[8px] text-ink/70">
                LV.99
              </span>
            </div>

            {/* gear-slot frame wrapping the avatar */}
            <div className="relative mx-auto w-fit">
              {/* four corner gear slots */}
              {GEAR_SLOTS.map((slot, i) => {
                const pos = [
                  "-top-3 -left-3",
                  "-top-3 -right-3",
                  "-bottom-3 -left-3",
                  "-bottom-3 -right-3",
                ][i];
                return (
                  <motion.div
                    key={slot}
                    aria-hidden
                    initial={{ scale: 0, rotate: -20 }}
                    animate={inView ? { scale: 1, rotate: i % 2 ? 8 : -8 } : {}}
                    transition={{ delay: 0.2 + i * 0.1, type: "spring", stiffness: 400, damping: 14 }}
                    className={cn(
                      "absolute z-10 grid h-9 w-9 place-items-center nb-border nb-shadow bg-paper font-pixel text-[7px] text-ink",
                      pos,
                    )}
                  >
                    {slot}
                  </motion.div>
                );
              })}

              {/* avatar plate */}
              <div className="nb-border nb-shadow-lg bg-paper p-4">
                <div aria-hidden className="absolute inset-0 -z-0 halftone opacity-30" />
                <motion.div
                  initial={{ scale: 0.6, opacity: 0 }}
                  animate={inView ? { scale: 1, opacity: 1 } : {}}
                  transition={{ delay: 0.15, type: "spring", stiffness: 260, damping: 16 }}
                >
                  <Sprite
                    src={profile.avatarSprite}
                    alt={`${profile.name} avatar`}
                    size={120}
                    className="relative z-10 mx-auto"
                  />
                </motion.div>
              </div>
            </div>

            <p className="mt-5 font-comic text-2xl leading-tight">{profile.name}</p>
            <div className="mt-2 inline-block nb-border bg-ink px-2 py-1 font-pixel text-[10px] text-pop-green">
              {profile.title}
            </div>

            {/* stat block — counts/fills on view */}
            <div className="mt-5 grid grid-cols-2 gap-2">
              {about.stats.map((s, i) => (
                <StatCell key={s.label} label={s.label} value={s.value} index={i} active={inView} />
              ))}
            </div>
          </Panel>
        </motion.div>

        {/* ── ORIGIN STORY: comic strip w/ gutters + page-curl corners ── */}
        <div>
          <div className="mb-3 flex items-center gap-2">
            <span className="font-bang text-3xl text-pop-magenta [-webkit-text-stroke:1.5px_black]">
              ORIGIN STORY
            </span>
            <span aria-hidden className="font-pixel text-[8px] text-ink/60">EP.01</span>
          </div>

          {/* gutters: gap between panels reads as a comic gutter */}
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
                  {/* number stamp */}
                  <span
                    aria-hidden
                    className={cn(
                      "absolute right-2 top-9 z-10 font-comic text-4xl leading-none opacity-20",
                      POP_CYCLE[i % POP_CYCLE.length],
                    )}
                  >
                    {i + 1}
                  </span>
                  <Sprite src={p.sprite} alt={p.caption} size={72} className="relative z-10 mx-auto" />
                  <p className="relative z-10 mt-3 font-body text-sm leading-snug">{p.caption}</p>

                  {/* page-curl corner */}
                  <span
                    aria-hidden
                    className="absolute bottom-0 right-0 h-6 w-6 border-l-[3px] border-t-[3px] border-ink bg-crt"
                    style={{ clipPath: "polygon(100% 0, 0 100%, 100% 100%)" }}
                  />
                </ComicPanel>
              </motion.div>
            ))}
          </div>

          {/* closing comic caption */}
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
