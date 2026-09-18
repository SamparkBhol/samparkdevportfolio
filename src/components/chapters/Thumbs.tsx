"use client";
import { useEffect, useRef, useState } from "react";
import type { ThumbKind } from "@/content/types";
import { cn } from "@/lib/cn";

/* Four storyboard thumbnails for the Helmit panels: drawn 120×80, printed 96×64 as an inset, 2 px ink, flat cel fills.
   Their type is 15 units so it lands at 12 px on the page. */
export function Thumbs({ kind }: { kind: ThumbKind }) {
  switch (kind) {
    case "pods": return <Pods />;
    case "ladder": return <Ladder />;
    case "quarantine": return <Quarantine />;
    case "idem": return <Idem />;
  }
}

const CELL = 14, GAP = 5, X0 = 8, Y0 = 12;

/** A 3×3 pod grid, a crown on the leader, a bracket labelled PDB. */
function Pods() {
  const cells = Array.from({ length: 9 }, (_, i) => ({ x: X0 + (i % 3) * (CELL + GAP), y: Y0 + Math.floor(i / 3) * (CELL + GAP) }));
  const leader = cells[1];
  return (
    <svg className="job-thumb" viewBox="0 0 120 80" width={120} height={80} role="img" aria-label="Nine pods in a grid, one wearing the leader crown, held by a pod disruption budget">
      {cells.map((c, i) => <rect key={i} x={c.x} y={c.y} width={CELL} height={CELL} rx={3} className="f-paper ink2" />)}
      <polygon points={`${leader.x},${leader.y} ${leader.x + 3},${leader.y - 7} ${leader.x + 6.5},${leader.y - 3} ${leader.x + 8},${leader.y - 8} ${leader.x + 9.5},${leader.y - 3} ${leader.x + 13},${leader.y - 7} ${leader.x + CELL},${leader.y}`} className="f-yellow ink2" />
      <path d="M68 12 h6 v52 h-6" className="f-none ink2" />
      <text x={99} y={42} textAnchor="middle">PDB</text>
    </svg>
  );
}

/** 403 → 400 → 200: the rejection ladder, replayable. */
function Ladder() {
  const [step, setStep] = useState(3);
  const timers = useRef<number[]>([]);
  useEffect(() => () => timers.current.forEach(clearTimeout), []);
  const replay = () => {
    timers.current.forEach(clearTimeout);
    timers.current = [];
    if (window.matchMedia("(prefers-reduced-motion: reduce)").matches) { setStep(3); return; }
    setStep(1);
    timers.current = [2, 3].map((s, i) => window.setTimeout(() => setStep(s), 260 * (i + 1)));
  };
  const rungs = [{ code: "403", x: 0 }, { code: "400", x: 44 }, { code: "200", x: 88 }];
  return (
    <button type="button" className="job-thumb-btn" onClick={replay} aria-label="Replay the reverse-engineering ladder">
      <svg className="job-thumb" viewBox="0 0 120 80" width={120} height={80} aria-hidden="true">
        {rungs.map((r, i) => {
          const lit = step > i;
          const ok = i === 2;
          return (
            <g key={r.code}>
              <rect x={r.x + 1} y={24} width={32} height={26} rx={3} className={cn("ink2", lit ? (ok ? "f-cel" : "f-shu") : "f-paper")} />
              <text x={r.x + 17} y={42} textAnchor="middle" style={{ fill: lit ? "var(--color-paper)" : "var(--color-ink)" }}>{r.code}</text>
              {i < 2 ? <path d={`M${r.x + 35} 37 h7 m-3 -3 l3 3 l-3 3`} className="f-none ink2" /> : null}
            </g>
          );
        })}
        <text x={60} y={72} textAnchor="middle" style={{ fill: "var(--color-shu)" }}>REPLAY ↻</text>
      </svg>
    </button>
  );
}

/** The data-quarantine boundary with a three-span trace inside. */
function Quarantine() {
  return (
    <svg className="job-thumb" viewBox="0 0 120 80" width={120} height={80} role="img" aria-label="A dashed quarantine box holding a three-span trace waterfall">
      <rect x={6} y={6} width={108} height={68} rx={3} className="f-none ink2" strokeDasharray="6 4" />
      <rect x={16} y={18} width={52} height={9} className="f-cel ink2" />
      <rect x={30} y={35} width={62} height={9} className="f-cel ink2" />
      <rect x={52} y={52} width={40} height={9} className="f-yellow ink2" />
      <line x1={16} y1={14} x2={16} y2={66} className="ink2" strokeDasharray="2 3" />
    </svg>
  );
}

/** Two envelopes, one key: the replay lands on the same answer. */
function Idem() {
  const env = (x: number) => (
    <g>
      <rect x={x} y={8} width={34} height={24} rx={2} className="f-paper ink2" />
      <path d={`M${x} 8 l17 13 l17 -13`} className="f-none ink2" />
    </g>
  );
  return (
    <svg className="job-thumb" viewBox="0 0 120 80" width={120} height={80} role="img" aria-label="Two requests with the same idempotency key produce the same result">
      {env(8)}
      {env(46)}
      <path d="M84 20 h10 m-3 -3 l3 3 l-3 3" className="f-none ink2" />
      <circle cx={106} cy={20} r={9} className="f-yellow ink2" />
      <path d="M101 20 l4 4 l7 -8" className="f-none ink2" />
      <text x={8} y={57}>IDEM-KEY</text>
      <text x={8} y={75}>×2 → same</text>
    </svg>
  );
}
