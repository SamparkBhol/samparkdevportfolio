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

// Hand-placed rotations / pin colors so the board feels physically pinned, not gridded.
const PIN_TONES = ["bg-pop-red", "bg-pop-cyan", "bg-pop-magenta", "bg-pop-yellow"] as const;
const CARD_TILT = ["-rotate-2", "rotate-1", "rotate-2", "-rotate-1"] as const;
const TAPE_TONE = ["bg-pop-yellow/80", "bg-pop-cyan/80"] as const;
const MARKERS = ["!", "?"] as const;

function Pushpin({ tone }: { tone: string }) {
  return (
    <span aria-hidden className="absolute -top-3 left-1/2 z-20 -translate-x-1/2">
      <span className="relative block">
        <span className={cn("block h-5 w-5 rounded-full nb-border", tone)} />
        <span className="absolute left-1/2 top-1 h-1.5 w-1.5 -translate-x-1/2 rounded-full bg-paper/80" />
        <span className="absolute left-1/2 top-4 h-3 w-[3px] -translate-x-1/2 bg-ink" />
      </span>
    </span>
  );
}

function QuestCard({ v, index }: { v: (typeof portfolio.volunteer)[number]; index: number }) {
  const ref = useRef<HTMLDivElement>(null);
  const inView = useInView(ref, { once: true, amount: 0.3 });
  const tilt = CARD_TILT[index % CARD_TILT.length];
  const pin = PIN_TONES[index % PIN_TONES.length];
  const marker = MARKERS[index % MARKERS.length];

  return (
    <motion.div
      ref={ref}
      initial={{ opacity: 0, y: 50, rotate: 0 }}
      animate={inView ? { opacity: 1, y: 0 } : {}}
      transition={{ type: "spring", stiffness: 120, damping: 14, delay: index * 0.12 }}
      whileHover={{ scale: 1.03, rotate: 0, zIndex: 30 }}
      className={cn("relative", tilt, index % 2 === 0 ? "md:mt-2" : "md:mt-8")}
    >
      <Pushpin tone={pin} />

      {/* Tape corners */}
      <span
        aria-hidden
        className={cn(
          "absolute -left-3 -top-2 z-20 h-6 w-16 -rotate-45 nb-border opacity-90",
          TAPE_TONE[index % TAPE_TONE.length]
        )}
      />
      <span
        aria-hidden
        className={cn(
          "absolute -bottom-2 -right-3 z-20 h-6 w-16 -rotate-45 nb-border opacity-90",
          TAPE_TONE[(index + 1) % TAPE_TONE.length]
        )}
      />

      {/* Quest marker bubble */}
      <span
        aria-hidden
        className="absolute -right-4 -top-4 z-30 flex h-11 w-11 items-center justify-center rounded-full nb-border nb-shadow bg-pop-yellow font-bang text-3xl text-ink [-webkit-text-stroke:1px_black]"
      >
        {marker}
      </span>

      <Panel color="green" lg className="relative z-10 p-5">
        <div className="flex items-baseline justify-between gap-3">
          <h3 className="font-comic text-2xl leading-none">{v.role}</h3>
          <Badge className="shrink-0 rotate-2">{v.period}</Badge>
        </div>

        <p className="mt-2 inline-block bg-ink px-2 py-0.5 font-pixel text-[10px] text-pop-yellow">
          @ {v.org}
        </p>

        <p className="mt-3 font-body text-sm">{v.summary}</p>

        {/* Reward chips for each impact item */}
        <div className="mt-4">
          <p className="font-pixel text-[9px] uppercase tracking-wide text-ink/70">Rewards</p>
          <ul className="mt-2 flex flex-wrap gap-2">
            {v.impact.map((i, ix) => (
              <motion.li
                key={i}
                initial={{ opacity: 0, scale: 0.6 }}
                animate={inView ? { opacity: 1, scale: 1 } : {}}
                transition={{
                  type: "spring",
                  stiffness: 300,
                  damping: 16,
                  delay: index * 0.12 + 0.25 + ix * 0.08,
                }}
                whileHover={{ y: -3, rotate: -2 }}
                className={cn(
                  "inline-flex items-center gap-1 nb-border nb-shadow bg-paper px-2.5 py-1",
                  ix % 2 === 0 ? "rotate-1" : "-rotate-1"
                )}
              >
                <span aria-hidden className="font-bang text-pop-magenta text-base leading-none">
                  ★
                </span>
                <span className="font-pixel text-[9px] text-ink">{i}</span>
              </motion.li>
            ))}
          </ul>
        </div>

        <div className="mt-5 flex items-center justify-between">
          <span className="font-pixel text-[8px] uppercase text-ink/60">
            Quest #{String(index + 1).padStart(2, "0")}
          </span>
          <ArcadeButton color="red" className="text-[10px]">
            Accept Quest
          </ArcadeButton>
        </div>
      </Panel>
    </motion.div>
  );
}

export function SideQuests() {
  return (
    <Stage
      id="volunteer"
      label="SIDE QUESTS"
      title="CO-OP MISSIONS"
      subtitle="Pinned to the guild quest-board — take one on."
    >
      {/* Cork quest-board */}
      <div className="relative">
        {/* Cork texture + frame */}
        <div
          aria-hidden
          className="absolute inset-0 -m-3 rounded-sm nb-border nb-shadow-lg bg-[#c8975a] [background-image:radial-gradient(circle_at_1px_1px,rgba(0,0,0,0.18)_1px,transparent_0)] [background-size:9px_9px]"
        />

        {/* Board header banner */}
        <div className="relative z-10 mb-8 flex flex-wrap items-center justify-between gap-4 px-3 pt-3">
          <div className="flex items-center gap-3">
            <PowBurst word="QUEST BOARD" className="text-base md:text-xl" />
            <span className="hidden font-pixel text-[10px] text-paper sm:inline">
              {portfolio.volunteer.length} missions available
            </span>
          </div>
          <span className="rotate-2 nb-border bg-pop-yellow px-3 py-1 font-pixel text-[9px] uppercase text-ink">
            Co-op // bring a friend
          </span>
        </div>

        <div className="relative z-10 grid gap-x-8 gap-y-12 px-4 pb-6 md:grid-cols-2">
          {portfolio.volunteer.map((v, index) => (
            <QuestCard key={v.id} v={v} index={index} />
          ))}
        </div>
      </div>
    </Stage>
  );
}
