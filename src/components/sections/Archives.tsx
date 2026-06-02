"use client";
import { useId, useRef } from "react";
import {
  motion,
  useReducedMotion,
  useScroll,
  useTransform,
  useInView,
} from "motion/react";
import { portfolio } from "@/content/portfolio";
import { Stage } from "@/components/ui/Stage";
import { Tilt } from "@/components/fx/Tilt";
import { cn } from "@/lib/cn";

/* ── Palette ─────────────────────────────────────────────────────────────── */
const INK = "#2a2012"; // warm sepia ink, softer than pure black for manuscript feel
const INK_SOFT = "rgba(42,32,18,0.62)";
const WAX = "#a01828"; // deep sealing-wax red
const WAX_DK = "#5a0d16";
const GOLD = "#c9a227"; // illumination gold
const PARCH_LIGHT = "#f6ecce";
const PARCH = "#ecdcb0";
const PARCH_DK = "#ddc794";

/* A precomputed jagged deckle/torn edge. Points are authored as flat numbers
   (already rounded to 2dp) so SSR and client markup match exactly — no runtime
   trig, no hydration drift. The path is reused as a clip via an SVG <clipPath>. */
const DECKLE_TOP =
  "0.00,10.00 6.00,4.00 13.00,9.00 21.00,3.00 29.00,8.00 38.00,2.50 47.00,7.50 56.00,3.00 65.00,8.50 74.00,3.50 83.00,8.00 91.00,4.00 100.00,9.50";
const DECKLE_BOTTOM =
  "100.00,90.00 93.00,96.50 85.00,91.00 76.00,97.00 67.00,91.50 58.00,97.50 49.00,92.00 40.00,97.00 31.00,91.50 22.00,97.00 14.00,92.00 7.00,96.50 0.00,90.50";

/** Builds a closed polygon path (in a 0..100 / 0..100 viewBox) with torn top &
 *  bottom edges and clean straight sides — used to clip the parchment body. */
function decklePath() {
  return `M ${DECKLE_TOP.split(" ").join(" L ")} L ${DECKLE_BOTTOM.split(" ").join(" L ")} Z`
    .replace(/,/g, " ");
}

/* A turned wooden dowel the parchment hangs from / rolls to. */
function Rod({ flip = false }: { flip?: boolean }) {
  return (
    <div aria-hidden className="relative mx-auto h-[15px] w-[102%] -translate-x-[1%]">
      <div
        className="absolute inset-x-4 inset-y-[2px] rounded-full nb-border"
        style={{
          background: flip
            ? "linear-gradient(180deg,#3f2a16,#5a3d22 45%,#8a6a40)"
            : "linear-gradient(180deg,#8a6a40,#5a3d22 55%,#3f2a16)",
        }}
      />
      {/* grain tick */}
      <div className="absolute inset-x-4 top-1/2 h-px -translate-y-1/2 bg-black/25" />
      {/* end caps */}
      {["left-0", "right-0"].map((side) => (
        <div
          key={side}
          className={cn(
            "absolute top-1/2 h-[26px] w-[26px] -translate-y-1/2 rounded-full nb-border nb-shadow",
            side,
          )}
          style={{ background: "radial-gradient(circle at 35% 30%,#a87f4a,#3f2912)" }}
        />
      ))}
    </div>
  );
}

/* Wax seal stamped on the scroll, with a little drip. Decorative. */
function WaxSeal({ stamp }: { stamp: string }) {
  return (
    <motion.div
      aria-hidden
      whileHover={{ rotate: 10, scale: 1.06 }}
      transition={{ type: "spring", stiffness: 320, damping: 14 }}
      className="relative h-14 w-14 shrink-0 sm:h-16 sm:w-16"
    >
      {/* drip */}
      <span
        className="absolute -bottom-2 left-1/2 h-3.5 w-3.5 -translate-x-1/2 rotate-45 rounded-[3px]"
        style={{ background: WAX, boxShadow: "1px 1px 0 rgba(0,0,0,0.35)" }}
      />
      <svg
        viewBox="0 0 64 64"
        className="relative h-14 w-14 drop-shadow-[2px_2px_0_rgba(0,0,0,0.4)] sm:h-16 sm:w-16"
      >
        <defs>
          <radialGradient id="waxlight" cx="38%" cy="32%" r="70%">
            <stop offset="0%" stopColor="rgba(255,255,255,0.5)" />
            <stop offset="55%" stopColor="rgba(255,255,255,0)" />
          </radialGradient>
        </defs>
        <circle cx="32" cy="32" r="28" fill={WAX} stroke={INK} strokeWidth="2.5" />
        <circle cx="32" cy="32" r="28" fill="url(#waxlight)" />
        <circle cx="32" cy="32" r="21" fill="none" stroke={WAX_DK} strokeWidth="2" strokeDasharray="3 3" />
        <text
          x="32"
          y="40"
          textAnchor="middle"
          fontFamily="ui-serif, Georgia, serif"
          fontWeight="bold"
          fontSize="22"
          fill="#3a0a10"
        >
          {stamp}
        </text>
      </svg>
    </motion.div>
  );
}

/* Ornate corner flourish — sits in the margin of the inner frame so it never
   overlaps the text column. */
function Corner({ className }: { className?: string }) {
  return (
    <svg
      aria-hidden
      viewBox="0 0 40 40"
      className={cn("absolute h-7 w-7", className)}
      style={{ color: INK }}
    >
      <path d="M4 36 C4 18 18 4 36 4" fill="none" stroke="currentColor" strokeWidth="2.4" />
      <path d="M4 28 C4 14 14 4 28 4" fill="none" stroke={GOLD} strokeWidth="1.4" />
      <circle cx="9" cy="9" r="2.4" fill="currentColor" />
      <path d="M4 20 q6 0 8 -6 q2 8 -8 8" fill={GOLD} opacity="0.85" />
    </svg>
  );
}

/* A single research paper as an unfurling parchment scroll. */
function ScrollItem({
  data,
  index,
  open,
}: {
  data: (typeof portfolio.research)[number];
  index: number;
  open: boolean;
}) {
  const reduce = useReducedMotion();
  const uid = useId().replace(/:/g, "");
  const dropCap = data.title.charAt(0);
  const rest = data.title.slice(1);
  const tilt = index % 2 ? "sm:rotate-[0.5deg]" : "sm:-rotate-[0.5deg]";
  const seriesNum = portfolio.research.length - index;
  const scrollNo = String(seriesNum).padStart(2, "0");

  // Under reduced motion we show the final state immediately (one static frame).
  const stagger = reduce ? 0 : index * 0.12;

  return (
    <motion.div
      initial={reduce ? false : { opacity: 0, y: 36 }}
      animate={open ? { opacity: 1, y: 0 } : undefined}
      transition={{ duration: 0.55, delay: stagger, ease: [0.22, 1, 0.36, 1] }}
      className={cn("group relative mx-auto w-full max-w-3xl", tilt)}
    >
      {/* SVG mask defs — gives the parchment its torn deckle edge */}
      <svg aria-hidden className="absolute h-0 w-0">
        <defs>
          <clipPath id={`deckle-${uid}`} clipPathUnits="objectBoundingBox">
            {/* normalise the 0..100 polygon into a 0..1 clip box */}
            <path
              d={decklePath()
                .split(" ")
                .map((tok) => {
                  const n = Number(tok);
                  return Number.isNaN(n) ? tok : (n / 100).toFixed(4);
                })
                .join(" ")}
            />
          </clipPath>
          <filter id={`grain-${uid}`}>
            <feTurbulence type="fractalNoise" baseFrequency="0.9" numOctaves="2" seed="7" stitchTiles="stitch" />
            <feColorMatrix type="saturate" values="0" />
            <feComponentTransfer>
              <feFuncA type="linear" slope="0.12" intercept="0" />
            </feComponentTransfer>
            <feComposite operator="in" in2="SourceGraphic" />
          </filter>
        </defs>
      </svg>

      {/* hanging ribbon bookmark (tucked behind the rod, clear of the heading) */}
      <motion.div
        aria-hidden
        whileHover={reduce ? undefined : { y: 5 }}
        className="absolute left-8 top-1 z-0 h-24 w-6 nb-border"
        style={{
          background: `linear-gradient(180deg, ${WAX}, ${WAX_DK})`,
          clipPath: "polygon(0 0,100% 0,100% 100%,50% 82%,0 100%)",
          boxShadow: "2px 2px 0 rgba(0,0,0,0.28)",
        }}
      />

      <div className="relative z-10">
        <Rod />
      </div>

      {/* the parchment unrolls downward — a clean maxHeight/opacity reveal so the
          text never distorts; sequenced after the row appears. */}
      <motion.div
        initial={reduce ? false : { maxHeight: 0, opacity: 0.35 }}
        animate={open ? { maxHeight: 1400, opacity: 1 } : undefined}
        transition={{ duration: reduce ? 0 : 1.05, ease: [0.22, 1, 0.36, 1], delay: stagger + 0.1 }}
        className="relative -mt-[7px] overflow-hidden"
      >
        <Tilt max={4} glare={false} className="[transform-style:preserve-3d]">
          {/* outer torn-edge plate */}
          <div
            className="relative px-[3px] py-[6px]"
            style={{ clipPath: `url(#deckle-${uid})`, background: PARCH_DK }}
          >
            {/* parchment body */}
            <div
              className="relative overflow-hidden px-7 py-9 transition-transform duration-300 group-hover:-translate-y-1 sm:px-10"
              style={{
                background:
                  `radial-gradient(135% 90% at 50% 0,${PARCH_LIGHT},${PARCH} 58%,${PARCH_DK}),` +
                  "radial-gradient(60% 50% at 16% 92%,rgba(120,90,40,0.20),transparent)," +
                  "radial-gradient(52% 42% at 86% 26%,rgba(120,90,40,0.16),transparent)",
                boxShadow:
                  "inset 16px 0 26px -18px rgba(60,40,15,0.75), inset -16px 0 26px -18px rgba(60,40,15,0.75), inset 0 18px 24px -22px rgba(60,40,15,0.6), inset 0 -18px 24px -22px rgba(60,40,15,0.6)",
              }}
            >
              {/* turbulence grain (subtle, masked to the body) */}
              <div
                aria-hidden
                className="pointer-events-none absolute inset-0 opacity-70"
                style={{ filter: `url(#grain-${uid})` }}
              />
              {/* faint ruled manuscript lines */}
              <div
                aria-hidden
                className="pointer-events-none absolute inset-0 opacity-[0.08]"
                style={{
                  background:
                    "repeating-linear-gradient(180deg,transparent 0 27px,rgba(60,40,15,0.6) 27px 28px)",
                }}
              />
              {/* fine dotted tooth */}
              <div
                aria-hidden
                className="pointer-events-none absolute inset-0 opacity-[0.05]"
                style={{
                  background: "radial-gradient(rgba(60,40,15,1) 0.6px,transparent 0.7px)",
                  backgroundSize: "4px 4px",
                }}
              />

              {/* ornate inner frame — pushed into the margin so it clears the column */}
              <div
                aria-hidden
                className="pointer-events-none absolute inset-4 rounded-[2px] border-[1.5px]"
                style={{ borderColor: "rgba(42,32,18,0.42)" }}
              />
              <Corner className="left-2 top-2" />
              <Corner className="right-2 top-2 rotate-90" />
              <Corner className="bottom-2 right-2 rotate-180" />
              <Corner className="bottom-2 left-2 -rotate-90" />

              {/* CONTENT */}
              <div className="relative">
                {/* volume tag */}
                <p
                  className="font-pixel text-[9px] uppercase tracking-[0.28em]"
                  style={{ color: INK_SOFT }}
                >
                  Scroll {scrollNo} &middot; Lex Arcana
                </p>

                {/* heading row: blackletter drop-cap aligned with the title baseline */}
                <h3 className="mt-2 flex items-start gap-3" style={{ color: INK }}>
                  <span
                    aria-hidden
                    className="font-black leading-[0.72] text-[3.4rem] sm:text-[4rem]"
                    style={{ color: WAX, textShadow: `2px 2px 0 ${GOLD}` }}
                  >
                    {dropCap}
                  </span>
                  <span className="min-w-0 pt-1.5 font-black text-2xl leading-[1.08] sm:text-3xl">
                    <span className="sr-only">{dropCap}</span>
                    {rest}
                  </span>
                </h3>

                {/* provenance: venue / year / authors */}
                <div className="mt-3 flex flex-wrap items-center gap-x-2.5 gap-y-1.5 font-pixel text-[10px] uppercase">
                  <span
                    className="nb-border px-2 py-1 tracking-wide"
                    style={{ background: INK, color: PARCH_LIGHT }}
                  >
                    {data.venue}
                  </span>
                  <span className="font-black" style={{ color: WAX }}>
                    Anno {data.year}
                  </span>
                  <span
                    className="normal-case italic"
                    style={{ color: "rgba(42,32,18,0.82)" }}
                  >
                    by {data.authors.join(" & ")}
                  </span>
                </div>

                {/* illuminated rule */}
                <div aria-hidden className="my-5 flex items-center gap-2.5">
                  <span className="h-[2px] flex-1" style={{ background: INK }} />
                  <span className="font-black text-sm" style={{ color: GOLD }}>
                    &#10086;
                  </span>
                  <span className="h-[2px] flex-1" style={{ background: INK }} />
                </div>

                {/* body row: seal sits beside the abstract, never over the title */}
                <div className="flex items-start gap-4 sm:gap-5">
                  <WaxSeal stamp={String(seriesNum)} />
                  <p
                    className="min-w-0 flex-1 font-body text-[15px] italic leading-relaxed"
                    style={{ color: "#3a2c16" }}
                  >
                    &ldquo;{data.abstract}&rdquo;
                  </p>
                </div>

                {/* link seals */}
                <div className="mt-6 flex flex-wrap gap-3">
                  {data.links.map((l) => (
                    <a
                      key={l.label}
                      href={l.href}
                      className="inline-flex items-center gap-2 nb-border nb-shadow px-3 py-2 font-pixel text-[10px] uppercase transition-transform hover:-translate-y-0.5 active:translate-y-0.5 active:shadow-none"
                      style={{ background: PARCH_LIGHT, color: INK }}
                    >
                      <span
                        aria-hidden
                        className="inline-block h-2.5 w-2.5 rounded-full"
                        style={{ background: WAX, boxShadow: `inset 0 0 0 1px ${WAX_DK}` }}
                      />
                      {l.label}
                    </a>
                  ))}
                </div>
              </div>
            </div>
          </div>
        </Tilt>

        {/* bottom rod (revealed last as the scroll unrolls) */}
        <div className="relative z-10 mt-[-7px]">
          <Rod flip />
        </div>
      </motion.div>
    </motion.div>
  );
}

export function Archives() {
  const ref = useRef<HTMLDivElement>(null);
  const reduce = useReducedMotion();
  const open = useInView(ref, { amount: 0.12, once: true });
  const { scrollYProgress } = useScroll({ target: ref, offset: ["start end", "end start"] });
  // banner drifts subtly with scroll for parallax depth (disabled when reduced)
  const rawBannerY = useTransform(scrollYProgress, [0, 1], [-12, 12]);
  const bannerY = reduce ? 0 : rawBannerY;

  return (
    <Stage
      id="research"
      label="ARCHIVES"
      title="SCROLLS OF LORE"
      subtitle="Ancient tomes of research, recovered from the vaults — each one unrolls as you descend."
    >
      <div ref={ref} className="relative">
        {/* warm candlelight glow behind the archive */}
        <div
          aria-hidden
          className="pointer-events-none absolute left-1/2 top-1/3 -z-10 h-[420px] w-[620px] max-w-[120%] -translate-x-1/2 rounded-full blur-3xl"
          style={{ background: "radial-gradient(circle, rgba(201,162,39,0.16), transparent 70%)" }}
        />

        {/* illuminated banner */}
        <motion.div
          style={{ y: bannerY }}
          className="mb-12 flex flex-wrap items-center justify-center gap-3 text-center"
        >
          <span aria-hidden className="font-black text-lg tracking-wide" style={{ color: GOLD }}>
            &#10087;
          </span>
          <p className="font-black text-xl tracking-wide text-paper">
            Codex Vol. MMXXIV — {portfolio.research.length} bound scrolls
          </p>
          <span aria-hidden className="font-black text-lg tracking-wide" style={{ color: GOLD }}>
            &#10087;
          </span>
          <span
            className="nb-border nb-shadow px-2 py-1 font-pixel text-[8px] uppercase tracking-widest"
            style={{ background: WAX, color: PARCH_LIGHT }}
          >
            Peer-reviewed relics
          </span>
        </motion.div>

        {/* the scrolls */}
        <div className="space-y-20">
          {portfolio.research.map((r, i) => (
            <ScrollItem key={r.id} data={r} index={i} open={open} />
          ))}
        </div>
      </div>
    </Stage>
  );
}
