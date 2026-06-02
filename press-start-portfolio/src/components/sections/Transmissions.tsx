"use client";
import { useMemo, useRef } from "react";
import { motion, useInView } from "motion/react";
import { portfolio } from "@/content/portfolio";
import { Stage } from "@/components/ui/Stage";
import { ComicPanel } from "@/components/ui/ComicPanel";
import { Badge } from "@/components/ui/Badge";
import { ArcadeButton } from "@/components/ui/ArcadeButton";
import { cn } from "@/lib/cn";

const TILT = ["-rotate-2", "rotate-1", "-rotate-1"] as const;
const NUDGE = ["md:translate-y-3", "md:-translate-y-4", "md:translate-y-6"] as const;
// Full class strings so Tailwind's JIT scanner detects them statically.
const COVER_BG = ["bg-pop-cyan", "bg-pop-magenta", "bg-pop-green"] as const;

function SignalBars({ active }: { active: number }) {
  return (
    <span className="flex items-end gap-[3px]" aria-hidden>
      {[5, 8, 11, 14, 17].map((h, i) => (
        <motion.span
          key={h}
          className={cn(
            "w-[3px] rounded-sm",
            i < active ? "bg-pop-green" : "bg-ink/25"
          )}
          style={{ height: h }}
          initial={{ scaleY: 0.3 }}
          whileInView={{ scaleY: 1 }}
          viewport={{ once: true }}
          transition={{ delay: 0.15 + i * 0.05, type: "spring", stiffness: 500, damping: 14 }}
        />
      ))}
    </span>
  );
}

function TransmissionCard({
  blog,
  index,
  isNew,
}: {
  blog: (typeof portfolio.blogs)[number];
  index: number;
  isNew: boolean;
}) {
  const channel = String(index + 1).padStart(2, "0");
  const tilt = TILT[index % TILT.length];
  const nudge = NUDGE[index % NUDGE.length];
  const coverBg = COVER_BG[index % COVER_BG.length];

  return (
    <motion.div
      className={cn("group relative", tilt, nudge)}
      initial={{ opacity: 0, y: 60, rotate: 0 }}
      whileInView={{ opacity: 1, y: 0 }}
      viewport={{ once: true, amount: 0.3 }}
      transition={{ delay: index * 0.12, type: "spring", stiffness: 120, damping: 16 }}
      whileHover={{
        y: -8,
        rotate: 0,
        x: [0, -2, 2, -1, 0],
        transition: { y: { type: "spring", stiffness: 300 }, x: { duration: 0.22 } },
      }}
    >
      {/* NEW flash on the most recent post */}
      {isNew && (
        <motion.div
          className="absolute -right-3 -top-4 z-30 select-none"
          animate={{ rotate: [10, 16, 10], scale: [1, 1.08, 1] }}
          transition={{ repeat: Infinity, duration: 1.2, ease: "easeInOut" }}
          aria-hidden
        >
          <span className="inline-block nb-border nb-shadow bg-pop-red px-3 py-1 font-bang text-2xl text-pop-yellow [-webkit-text-stroke:1px_black]">
            NEW!
          </span>
        </motion.div>
      )}

      <ComicPanel
        title={`${blog.date} · ${blog.readingMins} MIN`}
        className="relative group-hover:nb-shadow-lg"
      >
        {/* CRT broadcast bar: ON AIR tag + channel + signal bars */}
        <div className="-mx-4 -mt-4 mb-3 flex items-center justify-between gap-2 border-b-[3px] border-ink bg-ink px-3 py-2">
          <span className="flex items-center gap-2">
            <motion.span
              className="h-2.5 w-2.5 rounded-full bg-pop-red"
              animate={{ opacity: [1, 0.2, 1], scale: [1, 0.85, 1] }}
              transition={{ repeat: Infinity, duration: 1, ease: "easeInOut" }}
              aria-hidden
            />
            <span className="font-pixel text-[9px] uppercase tracking-widest text-pop-red">
              On Air
            </span>
          </span>
          <span className="flex items-center gap-2">
            <span className="font-pixel text-[9px] text-pop-cyan">CH{channel}</span>
            <SignalBars active={4 - (index % 3)} />
          </span>
        </div>

        {/* Cover area with scanline overlay */}
        <div
          className={cn(
            "relative mb-3 h-24 overflow-hidden nb-border halftone",
            coverBg
          )}
        >
          {/* scanlines */}
          <div
            aria-hidden
            className="pointer-events-none absolute inset-0 opacity-50 mix-blend-multiply"
            style={{
              backgroundImage:
                "repeating-linear-gradient(0deg, rgba(0,0,0,0.55) 0px, rgba(0,0,0,0.55) 1px, transparent 1px, transparent 4px)",
            }}
          />
          {/* tune-in sweep on hover */}
          <motion.div
            aria-hidden
            className="pointer-events-none absolute inset-x-0 top-0 h-6 bg-paper/40"
            initial={{ y: -28 }}
            animate={{ y: "120%" }}
            transition={{ repeat: Infinity, duration: 3.4, ease: "linear", delay: index * 0.4 }}
          />
          <span className="absolute bottom-1 left-2 font-pixel text-[8px] uppercase text-ink/70">
            ▶ FEED {channel} · {blog.slug}
          </span>
        </div>

        <h3 className="font-comic text-xl leading-tight text-pop-red transition-transform group-hover:-translate-x-0.5">
          {blog.title}
        </h3>
        <p className="mt-2 font-body text-sm text-ink/90">{blog.excerpt}</p>

        <div className="my-3 flex flex-wrap gap-2">
          {blog.tags.map((t) => (
            <Badge key={t} className="-rotate-2 transition-transform group-hover:rotate-0">
              #{t}
            </Badge>
          ))}
        </div>

        <ArcadeButton href={`/blog/${blog.slug}`} color="cyan" className="w-full justify-center">
          READ
        </ArcadeButton>
      </ComicPanel>
    </motion.div>
  );
}

export function Transmissions() {
  const ref = useRef<HTMLDivElement>(null);
  const inView = useInView(ref, { once: true, amount: 0.2 });

  // Most recent post (by date) gets the NEW flash.
  const newestSlug = useMemo(() => {
    return [...portfolio.blogs].sort(
      (a, b) => new Date(b.date).getTime() - new Date(a.date).getTime()
    )[0]?.slug;
  }, []);

  return (
    <Stage
      id="blogs"
      label="TRANSMISSIONS"
      title="LATEST ISSUES"
      subtitle="Dispatches from the field — broadcasting live."
    >
      <div ref={ref} className="relative">
        {/* Broadcast status ticker */}
        <motion.div
          className="mb-8 flex flex-wrap items-center gap-3 nb-border nb-shadow bg-ink px-4 py-2 font-pixel text-[9px] uppercase text-pop-green"
          initial={{ opacity: 0, x: -24 }}
          animate={inView ? { opacity: 1, x: 0 } : {}}
          transition={{ duration: 0.5 }}
        >
          <motion.span
            className="h-2 w-2 rounded-full bg-pop-red"
            animate={{ opacity: [1, 0.15, 1] }}
            transition={{ repeat: Infinity, duration: 0.9 }}
            aria-hidden
          />
          <span className="text-pop-red">REC</span>
          <span className="text-pop-cyan">
            {portfolio.blogs.length} CHANNELS LIVE
          </span>
          <span className="hidden text-pop-yellow sm:inline">
            ::: SIGNAL STRONG ::: TUNE IN :::
          </span>
        </motion.div>

        <div className="grid gap-7 md:grid-cols-3">
          {portfolio.blogs.map((b, i) => (
            <TransmissionCard
              key={b.slug}
              blog={b}
              index={i}
              isNew={b.slug === newestSlug}
            />
          ))}
        </div>
      </div>
    </Stage>
  );
}
