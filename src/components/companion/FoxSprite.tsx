/* Patch, drawn the way the rest of the issue is printed: paper fill, 3-unit ink line, screentone
   dots only in the shading and the ground shadow, and one colour, the scarf in --ink-current so
   "Try an ink" recolours it. Every part that moves is its own <g> with a class the stylesheet
   animates (transform only): ears, eyes' lids and pupils, legs, tail, scarf tail, whole body.
   No JavaScript runs in here. The pupils group takes a ref so the companion can aim them. */

const INK = "var(--color-ink)";
const PAPER = "var(--color-paper)";

const LINE = { fill: PAPER, stroke: INK, strokeWidth: 3, strokeLinejoin: "round" as const, strokeLinecap: "round" as const };
const STROKE = { fill: "none", stroke: INK, strokeWidth: 3, strokeLinejoin: "round" as const, strokeLinecap: "round" as const };

function Tone({ id }: { id: string }) {
  return (
    <defs>
      <pattern id={id} width="3.2" height="3.2" patternUnits="userSpaceOnUse">
        <rect width="3.2" height="3.2" fill={PAPER} />
        <circle cx="1.6" cy="1.6" r="0.85" fill={INK} />
      </pattern>
    </defs>
  );
}

function Head({ tone, pupilsRef }: { tone: string; pupilsRef?: React.Ref<SVGGElement> }) {
  return (
    <g className="fox-head">
      <g className="fox-ear fox-ear-a">
        <path d="M43 27 L33 3 L59 16 Z" {...LINE} />
        <path d="M45 23 L39 10 L53 17 Z" fill={tone} />
      </g>
      <g className="fox-ear fox-ear-b">
        <path d="M65 15 L77 1 L86 23 Z" {...LINE} />
        <path d="M68 15 L76 7 L80 20 Z" fill={tone} />
      </g>
      <path d="M58 14 C 42 14, 34 30, 38 46 C 42 58, 58 62, 74 60 L 94 54 C 100 52, 100 44, 94 42 C 90 28, 76 14, 58 14 Z" {...LINE} />
      <path d="M58 14 C 47 14, 41 24, 40 33 C 52 25, 72 25, 89 40 C 84 27, 74 14, 58 14 Z" fill={tone} />
      <path d="M40 43 L 31 47 L 39 50 L 32 56 L 42 55" {...LINE} />
      <ellipse cx="60" cy="39" rx="6.5" ry="7" {...LINE} strokeWidth={2.5} />
      <ellipse cx="80" cy="41" rx="6.5" ry="7" {...LINE} strokeWidth={2.5} />
      <g className="fox-pupils" ref={pupilsRef}>
        <circle cx="60" cy="40" r="3.1" fill={INK} />
        <circle cx="58.9" cy="38.6" r="1" fill={PAPER} />
        <circle cx="80" cy="42" r="3.1" fill={INK} />
        <circle cx="78.9" cy="40.6" r="1" fill={PAPER} />
      </g>
      <g className="fox-lid fox-lid-a">
        <ellipse cx="60" cy="39" rx="8.2" ry="8.7" fill={PAPER} />
        <path d="M53.5 40 Q 60 47 66.5 40" {...STROKE} strokeWidth={2.5} />
      </g>
      <g className="fox-lid fox-lid-b">
        <ellipse cx="80" cy="41" rx="8.2" ry="8.7" fill={PAPER} />
        <path d="M73.5 42 Q 80 49 86.5 42" {...STROKE} strokeWidth={2.5} />
      </g>
      <circle cx="97" cy="48" r="3.4" fill={INK} />
      <path d="M92.5 54.5 Q 88 58 84 55" {...STROKE} strokeWidth={2.5} />
    </g>
  );
}

export function FoxSprite({ uid, variant = "full", pupilsRef, className }: { uid: string; variant?: "full" | "head"; pupilsRef?: React.Ref<SVGGElement>; className?: string }) {
  const toneId = `${uid}-tone`;
  const tone = `url(#${toneId})`;

  if (variant === "head") {
    return (
      <svg className={className} viewBox="28 -2 76 68" aria-hidden="true" focusable="false">
        <Tone id={toneId} />
        <Head tone={tone} pupilsRef={pupilsRef} />
      </svg>
    );
  }

  return (
    <svg className={className} viewBox="0 0 128 112" aria-hidden="true" focusable="false">
      <Tone id={toneId} />
      <ellipse className="fox-shadow" cx="64" cy="103" rx="46" ry="4.5" fill={tone} />
      <g className="fox-body">
        <g className="fox-tail">
          <path d="M44 90 C 22 94, 4 78, 8 58 C 10 44, 22 36, 30 42 C 36 48, 28 56, 28 64 C 28 74, 36 82, 48 84 Z" {...LINE} fill={tone} />
          <path d="M8 58 C 10 44, 22 36, 30 42 C 33 46, 30 52, 26 54 C 18 58, 10 60, 8 58 Z" fill={PAPER} />
        </g>
        <ellipse cx="44" cy="84" rx="16" ry="15" {...LINE} fill={tone} />
        <path d="M50 60 C 34 64, 30 82, 40 98 L 92 98 C 98 86, 96 68, 82 60 Z" {...LINE} />
        <g className="fox-leg fox-leg-a">
          <rect x="63" y="72" width="10" height="28" rx="4.5" {...LINE} />
        </g>
        <g className="fox-leg fox-leg-b">
          <rect x="77" y="72" width="10" height="28" rx="4.5" {...LINE} />
        </g>
        <g className="fox-scarf">
          <path className="fox-scarf-tail" d="M48 62 L 30 68 L 34 80 L 50 72 Z" {...LINE} fill="var(--ink-current)" />
          <path d="M48 58 C 58 66, 78 68, 90 60 L 92 66 C 78 76, 56 76, 44 66 Z" {...LINE} fill="var(--ink-current)" />
        </g>
        <Head tone={tone} pupilsRef={pupilsRef} />
      </g>
    </svg>
  );
}
