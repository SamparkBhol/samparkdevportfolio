"use client";
import { useRef } from "react";
import { motion, useInView } from "motion/react";
import { portfolio } from "@/content/portfolio";
import { Stage } from "@/components/ui/Stage";
import { Panel } from "@/components/ui/Panel";
import { ArcadeButton } from "@/components/ui/ArcadeButton";
import { Badge } from "@/components/ui/Badge";
import { cn } from "@/lib/cn";

/** Ornate corner bracket — four rotated copies frame each tome. */
function CornerBracket({ className }: { className?: string }) {
  return (
    <svg
      aria-hidden
      viewBox="0 0 40 40"
      className={cn("absolute h-7 w-7 text-ink", className)}
    >
      <path
        d="M2 14 V2 H14 M2 6 H8 M6 2 V8"
        fill="none"
        stroke="currentColor"
        strokeWidth="3"
        strokeLinecap="square"
      />
      <circle cx="13" cy="13" r="2.4" fill="currentColor" />
    </svg>
  );
}

/** Wax-seal accent circle stamped onto each tome. */
function WaxSeal({ stamp }: { stamp: string }) {
  return (
    <motion.div
      aria-hidden
      whileHover={{ rotate: 14, scale: 1.08 }}
      transition={{ type: "spring", stiffness: 320, damping: 14 }}
      className="relative grid h-14 w-14 shrink-0 place-items-center"
    >
      {/* drip */}
      <span className="absolute -bottom-1.5 left-1/2 h-3 w-3 -translate-x-1/2 rotate-45 rounded-sm bg-pop-red nb-border border-2" />
      <span className="absolute inset-0 rounded-full bg-pop-red nb-border border-[3px] nb-shadow" />
      <span className="absolute inset-1.5 rounded-full border-2 border-dashed border-paper/70" />
      <span className="relative font-black text-paper text-lg leading-none drop-shadow">
        {stamp}
      </span>
    </motion.div>
  );
}

const SEAL_COLORS = ["magenta", "cyan", "yellow", "green", "red"] as const;
const TILTS = ["-rotate-1", "rotate-1", "-rotate-2", "rotate-2"];

export function Archives() {
  const railRef = useRef<HTMLDivElement>(null);
  const railInView = useInView(railRef, { amount: 0.4, once: true });

  return (
    <Stage
      id="research"
      label="ARCHIVES"
      title="SCROLLS OF LORE"
      subtitle="Ancient tomes of research, recovered from the vaults."
    >
      {/* Illuminated header strip */}
      <div
        ref={railRef}
        className="mb-8 flex flex-wrap items-center justify-between gap-3"
      >
        <motion.p
          initial={{ opacity: 0, x: -24 }}
          animate={railInView ? { opacity: 1, x: 0 } : {}}
          transition={{ duration: 0.5 }}
          className="font-black text-lg tracking-wide text-ink"
        >
          ❧ Codex Vol. MMXXIV · {portfolio.research.length} bound volumes ❧
        </motion.p>
        <motion.div
          initial={{ opacity: 0, x: 24 }}
          animate={railInView ? { opacity: 1, x: 0 } : {}}
          transition={{ duration: 0.5, delay: 0.1 }}
        >
          <Badge className="bg-pop-red text-paper">PEER-REVIEWED RELICS</Badge>
        </motion.div>
      </div>

      <div className="space-y-10">
        {portfolio.research.map((r, i) => {
          const dropCap = r.title.charAt(0);
          const restTitle = r.title.slice(1);
          const tilt = TILTS[i % TILTS.length];
          const seal = SEAL_COLORS[i % SEAL_COLORS.length];
          const seriesNum = `${portfolio.research.length - i}`;

          return (
            <motion.div
              key={r.id}
              initial={{ opacity: 0, y: 60, rotate: i % 2 ? -3 : 3 }}
              whileInView={{ opacity: 1, y: 0, rotate: 0 }}
              viewport={{ once: true, amount: 0.3 }}
              transition={{
                type: "spring",
                stiffness: 90,
                damping: 14,
                delay: i * 0.12,
              }}
              className={cn("group relative", i % 2 ? "md:pl-12" : "md:pr-12")}
            >
              {/* Ribbon bookmark hanging off the top edge */}
              <div
                aria-hidden
                className="absolute -top-4 left-8 z-20 flex flex-col items-center"
              >
                <motion.div
                  whileHover={{ y: 4 }}
                  className="h-12 w-7 bg-pop-red nb-border border-[3px] nb-shadow [clip-path:polygon(0_0,100%_0,100%_100%,50%_78%,0_100%)]"
                />
              </div>

              <Panel
                color="paper"
                lg
                className={cn(
                  "relative overflow-hidden p-7 pt-9 transition-transform duration-300",
                  tilt,
                  "group-hover:rotate-0 group-hover:-translate-y-1",
                )}
              >
                {/* aged parchment vignette + halftone wash */}
                <div
                  aria-hidden
                  className="pointer-events-none absolute inset-0 opacity-[0.07] halftone"
                />
                <div
                  aria-hidden
                  className="pointer-events-none absolute inset-0 bg-gradient-to-br from-transparent via-transparent to-ink/15"
                />

                {/* Ornate corner brackets */}
                <CornerBracket className="left-2 top-2" />
                <CornerBracket className="right-2 top-2 rotate-90" />
                <CornerBracket className="bottom-2 right-2 rotate-180" />
                <CornerBracket className="bottom-2 left-2 -rotate-90" />

                {/* Spine ornament with volume number */}
                <div
                  aria-hidden
                  className="absolute inset-y-6 left-0 hidden w-3 flex-col items-center justify-between border-r-[3px] border-dashed border-ink/40 md:flex"
                >
                  <span className="font-pixel text-[8px] -rotate-90 whitespace-nowrap text-ink/60">
                    VOL {seriesNum}
                  </span>
                </div>

                <div className="relative z-10 flex items-start gap-5 md:pl-6">
                  <WaxSeal stamp={seriesNum} />

                  <div className="min-w-0 flex-1">
                    {/* Title with blackletter drop-cap */}
                    <h3 className="flex items-start gap-1 leading-none text-ink">
                      <span
                        aria-hidden
                        className="font-black text-6xl leading-[0.78] text-pop-red drop-shadow-[3px_3px_0_rgba(0,0,0,1)]"
                      >
                        {dropCap}
                      </span>
                      <span className="font-black text-2xl md:text-3xl leading-tight pt-1">
                        {restTitle}
                      </span>
                    </h3>

                    {/* Provenance line */}
                    <div className="mt-3 flex flex-wrap items-center gap-x-2 gap-y-1 font-pixel text-[10px] uppercase tracking-tight text-ink/80">
                      <span className="bg-ink px-2 py-1 text-paper">{r.venue}</span>
                      <span>·</span>
                      <span className="text-pop-magenta">Anno {r.year}</span>
                      <span>·</span>
                      <span className="normal-case italic">
                        {r.authors.join(" & ")}
                      </span>
                    </div>

                    {/* Illuminated rule */}
                    <div
                      aria-hidden
                      className="my-4 flex items-center gap-2"
                    >
                      <span className="h-[3px] flex-1 bg-ink" />
                      <span className="font-black text-ink">✦</span>
                      <span className="h-[3px] flex-1 bg-ink" />
                    </div>

                    {/* Abstract as an illuminated manuscript quote */}
                    <p className="font-body text-sm md:text-base italic leading-relaxed text-ink/90">
                      <span aria-hidden className="font-black text-2xl text-pop-cyan align-top mr-1">
                        “
                      </span>
                      {r.abstract}
                      <span aria-hidden className="font-black text-2xl text-pop-cyan align-bottom ml-1">
                        ”
                      </span>
                    </p>

                    {/* Links as wax-sealed dispatches */}
                    <div className="mt-5 flex flex-wrap items-center gap-3">
                      {r.links.map((l, li) => (
                        <motion.div
                          key={l.label}
                          whileHover={{ rotate: li % 2 ? 3 : -3, y: -2 }}
                          whileTap={{ scale: 0.95 }}
                          transition={{ type: "spring", stiffness: 400, damping: 12 }}
                        >
                          <ArcadeButton
                            href={l.href}
                            color={li === 0 ? "magenta" : "cyan"}
                          >
                            ✦ {l.label}
                          </ArcadeButton>
                        </motion.div>
                      ))}
                    </div>
                  </div>
                </div>
              </Panel>
            </motion.div>
          );
        })}
      </div>

      {/* Footer colophon */}
      <motion.p
        initial={{ opacity: 0 }}
        whileInView={{ opacity: 1 }}
        viewport={{ once: true }}
        transition={{ delay: 0.2 }}
        className="mt-10 text-center font-black text-ink/60 tracking-widest"
      >
        ❦ Hic sunt dracones — here the archive ends ❦
      </motion.p>
    </Stage>
  );
}
