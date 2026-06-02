"use client";

/**
 * StageTransition — a thin, STATIC arcade seam between sections: a torn
 * comic-panel edge with a small "▸ NEXT" tag. Pure CSS/SVG, no scroll listeners
 * and no animation loops (kept cheap so 10 seams never cost a scroll frame).
 * Decorative only: aria-hidden + pointer-events-none.
 */

// Deterministic torn lower edge — Math rounded so SSR/client serialize identically.
function tornEdgePath(): string {
  const pts: string[] = ["M 0 0", "L 100 0"];
  const seed = [0.0, 1.7, 3.1, 4.6, 6.0, 7.4, 9.0, 10.5, 12.0, 13.3];
  for (let i = 0; i <= 20; i++) {
    const x = (100 - i * 5).toFixed(2);
    const jag = (4 + Math.sin(seed[i % seed.length] + i * 0.9) * 2.4).toFixed(2);
    pts.push(`L ${x} ${jag}`);
  }
  pts.push("Z");
  return pts.join(" ");
}
const TORN_PATH = tornEdgePath();
const ACCENTS = ["var(--pop-cyan)", "var(--pop-yellow)", "var(--pop-magenta)"] as const;

export function StageTransition({
  next,
  index = 0,
}: {
  next?: string;
  index?: number;
}) {
  const accent = ACCENTS[index % ACCENTS.length];
  return (
    <div
      aria-hidden
      className="relative z-10 -my-px select-none overflow-hidden pointer-events-none"
      style={{ height: "clamp(34px, 5vw, 56px)" }}
    >
      {/* torn comic-panel edge bleeding down from the section above */}
      <svg
        className="absolute inset-x-0 top-0 h-full w-full"
        viewBox="0 0 100 14"
        preserveAspectRatio="none"
      >
        <path d={TORN_PATH} fill="var(--crt)" />
        <path d={TORN_PATH} fill="none" stroke={accent} strokeWidth={0.3} opacity={0.6} />
      </svg>

      {/* small centered tag */}
      <div className="absolute inset-0 flex items-center justify-center gap-1.5 font-pixel uppercase">
        <span className="text-[9px]" style={{ color: accent }}>▸</span>
        <span className="text-[8px] tracking-[0.3em] text-paper/55">
          {next ? `NEXT · ${next}` : "NEXT STAGE"}
        </span>
      </div>
    </div>
  );
}

export default StageTransition;
