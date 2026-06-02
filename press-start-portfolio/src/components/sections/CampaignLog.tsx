"use client";
import { useRef } from "react";
import { motion, useScroll, useTransform } from "motion/react";
import { portfolio } from "@/content/portfolio";
import { Stage } from "@/components/ui/Stage";
import { Panel } from "@/components/ui/Panel";
import { Badge } from "@/components/ui/Badge";
import { cn } from "@/lib/cn";

const NODE_COLORS = ["bg-pop-green", "bg-pop-cyan", "bg-pop-magenta", "bg-pop-yellow"] as const;
const PANEL_TILT = ["-rotate-1", "rotate-1", "-rotate-2", "rotate-2"] as const;

export function CampaignLog() {
  const trackRef = useRef<HTMLOListElement>(null);
  const { scrollYProgress } = useScroll({
    target: trackRef,
    offset: ["start 80%", "end 40%"],
  });
  // Player marker travels down the world-map path as you scroll.
  const markerTop = useTransform(scrollYProgress, [0, 1], ["0%", "100%"]);

  return (
    <Stage
      id="experience"
      label="CAMPAIGN"
      title="STAGES CLEARED"
      subtitle="World 1: every role is a level conquered. Follow the path."
    >
      <ol ref={trackRef} className="relative mx-auto max-w-5xl py-6">
        {/* ---- The world-map connecting path (dashed) ---- */}
        <div
          aria-hidden
          className="pointer-events-none absolute left-1/2 top-0 bottom-0 hidden -translate-x-1/2 md:block"
        >
          <div className="h-full w-[6px] rounded-full border-x-[3px] border-dashed border-ink/70 bg-paper/40" />
        </div>
        {/* mobile path (left rail) */}
        <div
          aria-hidden
          className="pointer-events-none absolute left-[18px] top-0 bottom-0 md:hidden"
        >
          <div className="h-full w-[5px] rounded-full border-x-[3px] border-dashed border-ink/70 bg-paper/40" />
        </div>

        {/* ---- Traveling player marker that scrubs with scroll ---- */}
        <motion.div
          aria-hidden
          style={{ top: markerTop }}
          className="absolute left-[18px] z-20 hidden -translate-x-1/2 -translate-y-1/2 md:left-1/2 md:block"
        >
          <motion.div
            animate={{ y: [0, -4, 0], rotate: [-6, 6, -6] }}
            transition={{ repeat: Infinity, duration: 1.4, ease: "easeInOut" }}
            className="grid h-9 w-9 place-items-center rounded-full nb-border nb-shadow bg-pop-red font-pixel text-[8px] text-paper"
          >
            P1
          </motion.div>
        </motion.div>

        {portfolio.experience.map((x, i) => {
          const isLeft = i % 2 === 0;
          const nodeColor = NODE_COLORS[i % NODE_COLORS.length];
          const tilt = PANEL_TILT[i % PANEL_TILT.length];
          return (
            <li
              key={x.id}
              className={cn(
                "relative pl-14 md:w-1/2 md:pl-0",
                isLeft ? "md:mr-auto md:pr-12" : "md:ml-auto md:pl-12",
                i === 0 ? "md:mt-0" : "md:-mt-6",
                "mb-12 md:mb-16"
              )}
            >
              {/* ---- Level node sitting on the path ---- */}
              <motion.span
                initial={{ scale: 0, rotate: -45 }}
                whileInView={{ scale: 1, rotate: 0 }}
                viewport={{ once: true, amount: 0.6 }}
                transition={{ type: "spring", stiffness: 420, damping: 14, delay: i * 0.08 }}
                className={cn(
                  "absolute z-20 grid h-12 w-12 place-items-center rounded-full nb-border nb-shadow font-pixel text-[8px] leading-tight text-ink",
                  nodeColor,
                  // sit on the rail: left rail on mobile, center on desktop
                  "left-0 top-1 md:top-2",
                  isLeft
                    ? "md:left-auto md:right-[-24px]"
                    : "md:left-[-24px]"
                )}
              >
                <span className="flex flex-col items-center">
                  <span className="text-[6px] opacity-80">LVL</span>
                  <span className="text-[11px]">{x.level}</span>
                </span>
              </motion.span>

              {/* ---- Connector elbow from node to card ---- */}
              <span
                aria-hidden
                className={cn(
                  "absolute top-6 hidden h-[3px] w-12 bg-ink/70 md:block",
                  isLeft ? "right-0" : "left-0"
                )}
              />

              {/* ---- The role card ---- */}
              <motion.div
                initial={{ opacity: 0, x: isLeft ? -40 : 40, y: 20 }}
                whileInView={{ opacity: 1, x: 0, y: 0 }}
                viewport={{ once: true, amount: 0.3 }}
                transition={{ type: "spring", stiffness: 120, damping: 16, delay: i * 0.08 + 0.05 }}
                whileHover={{ y: -6, rotate: 0, scale: 1.02 }}
                className={cn("relative", tilt)}
              >
                {/* ---- Rotated STAGE CLEARED stamp ---- */}
                <motion.span
                  initial={{ scale: 0, rotate: 30, opacity: 0 }}
                  whileInView={{ scale: 1, rotate: -14, opacity: 1 }}
                  viewport={{ once: true, amount: 0.6 }}
                  transition={{ type: "spring", stiffness: 300, damping: 11, delay: i * 0.08 + 0.25 }}
                  aria-hidden
                  className="absolute -right-3 -top-4 z-30 select-none whitespace-nowrap nb-border bg-pop-red px-2 py-1 font-bang text-sm tracking-wide text-paper [-webkit-text-stroke:0.5px_black]"
                >
                  STAGE CLEARED
                </motion.span>

                <Panel className="p-5">
                  <div className="flex flex-wrap items-baseline gap-x-2 gap-y-1">
                    <h3 className="font-comic text-2xl leading-none">{x.role}</h3>
                    <span className="font-pixel text-[10px] text-pop-red">@ {x.org}</span>
                    <span className="ml-auto inline-block nb-border bg-ink px-2 py-1 font-pixel text-[9px] text-paper">
                      {x.period}
                    </span>
                  </div>

                  {x.location ? (
                    <p className="mt-2 font-pixel text-[8px] uppercase tracking-widest text-ink/60">
                      ◈ {x.location}
                    </p>
                  ) : null}

                  <p className="mt-2 font-body text-sm">{x.summary}</p>

                  <ul className="mt-3 space-y-1.5 font-body text-sm">
                    {x.highlights.map((h, hi) => (
                      <motion.li
                        key={h}
                        initial={{ opacity: 0, x: -10 }}
                        whileInView={{ opacity: 1, x: 0 }}
                        viewport={{ once: true }}
                        transition={{ delay: i * 0.08 + 0.3 + hi * 0.07 }}
                        className="flex items-start gap-2"
                      >
                        <span aria-hidden className="mt-[3px] font-pixel text-[8px] text-pop-green">
                          ▸
                        </span>
                        <span>{h}</span>
                      </motion.li>
                    ))}
                  </ul>

                  <div className="mt-4 flex flex-wrap items-center gap-2 border-t-[3px] border-dashed border-ink/30 pt-3">
                    <span className="font-pixel text-[8px] text-ink/50">LOADOUT:</span>
                    {x.stack.map((s) => (
                      <motion.span
                        key={s}
                        whileHover={{ y: -3, rotate: -3 }}
                        transition={{ type: "spring", stiffness: 500, damping: 12 }}
                        className="inline-block"
                      >
                        <Badge>{s}</Badge>
                      </motion.span>
                    ))}
                  </div>
                </Panel>
              </motion.div>
            </li>
          );
        })}

        {/* ---- Goal flag at the end of the world map ---- */}
        <li className="relative pl-14 md:pl-0">
          <motion.div
            initial={{ scale: 0, y: 20 }}
            whileInView={{ scale: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ type: "spring", stiffness: 300, damping: 12 }}
            className="absolute left-[18px] top-0 z-20 -translate-x-1/2 md:left-1/2"
          >
            <span
              aria-hidden
              className="grid h-12 w-12 place-items-center rounded-full nb-border nb-shadow bg-pop-yellow font-bang text-xl text-ink"
            >
              ★
            </span>
          </motion.div>
          <p className="pt-16 text-center font-pixel text-[10px] text-ink/60 md:pt-20">
            ↑ START &nbsp;•&nbsp; {portfolio.experience.length} STAGES CLEARED &nbsp;•&nbsp; NOW ↑
          </p>
        </li>
      </ol>
    </Stage>
  );
}
