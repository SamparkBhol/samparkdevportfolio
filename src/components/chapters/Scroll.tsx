"use client";
import { Fragment, useRef, type CSSProperties } from "react";
import type { Paper } from "@/content/types";
import { cn } from "@/lib/cn";

/* A paper as a parchment scroll: two turned rods, a deckled sheet, a wax seal carrying the author
   count, a ribbon for the status. Rolled, it shows the rods and the title band. Pull the lower rod
   down (or press Enter on it, or click the title) and the sheet unrolls; the only animated
   properties are the body's grid rows (700 ms), one transform and one opacity. */

/* A deterministic torn edge, so the server and the client print the same polygon: 24 notches down
   each side from a tiny LCG seeded by the paper's index; the top and bottom edges stay straight,
   tucked under the rods. */
function deckle(seed: number): string {
  let s = seed * 7919 + 13;
  const r = () => { s = (s * 1103515245 + 12345) & 0x7fffffff; return s / 0x7fffffff; };
  const N = 24, pts: string[] = [];
  for (let i = 0; i <= N; i++) { const y = ((i / N) * 100).toFixed(1); const x = i === 0 || i === N ? 0 : 1 + r() * 5; pts.push(`${x.toFixed(1)}px ${y}%`); }
  for (let i = N; i >= 0; i--) { const y = ((i / N) * 100).toFixed(1); const x = i === 0 || i === N ? 0 : 1 + r() * 5; pts.push(`calc(100% - ${x.toFixed(1)}px) ${y}%`); }
  return `polygon(${pts.join(", ")})`;
}
const SEAL_PATH = (() => {
  const pts: string[] = [];
  for (let i = 0; i < 44; i++) { const a = (i / 44) * Math.PI * 2, r = i % 2 ? 30 : 27.5; pts.push(`${(32 + Math.cos(a) * r).toFixed(1)},${(32 + Math.sin(a) * r).toFixed(1)}`); }
  return `M${pts.join("L")}Z`;
})();

function Rod() {
  return (
    <span className="rod" aria-hidden="true">
      <svg className="rod-cap" viewBox="0 0 28 28"><circle cx="14" cy="14" r="11" className="rod-knob" /><circle cx="14" cy="14" r="4.5" className="rod-knob-in" /></svg>
      <span className="rod-shaft" />
      <svg className="rod-cap" viewBox="0 0 28 28"><circle cx="14" cy="14" r="11" className="rod-knob" /><circle cx="14" cy="14" r="4.5" className="rod-knob-in" /></svg>
    </span>
  );
}

function Seal({ n }: { n: number }) {
  return (
    <svg className="seal" viewBox="0 0 64 64" aria-hidden="true">
      <ellipse cx="41" cy="57" rx="3.5" ry="4.5" className="seal-wax" />
      <path d={SEAL_PATH} className="seal-wax" />
      <circle cx="32" cy="32" r="21" className="seal-ring" />
      <text x="32" y="37" textAnchor="middle" className="seal-n">{n}</text>
      <text x="32" y="48" textAnchor="middle" className="seal-unit">{n === 1 ? "AUTHOR" : "AUTHORS"}</text>
    </svg>
  );
}

const CLAIM = 6, COMMIT = 40;

export function Scroll({ paper, n, open, onToggle, line }: { paper: Paper; n: number; open: boolean; onToggle: (open: boolean) => void; line: string }) {
  const handle = useRef<HTMLButtonElement>(null);
  const g = useRef<{ id: number; x0: number; y0: number; claimed: boolean; done: boolean } | null>(null);
  const dragged = useRef(false);
  const reduced = () => window.matchMedia("(prefers-reduced-motion: reduce)").matches;
  const published = paper.status === "published";
  const id = `scroll-${paper.id}`;

  const article = (el: HTMLElement) => el.closest<HTMLElement>(".scroll");
  const onPointerDown = (e: React.PointerEvent<HTMLButtonElement>) => {
    if (e.pointerType === "mouse" && e.button !== 0) return;
    article(e.currentTarget)?.classList.remove("is-snapping");
    g.current = { id: e.pointerId, x0: e.clientX, y0: e.clientY, claimed: false, done: false };
  };
  const onPointerMove = (e: React.PointerEvent<HTMLButtonElement>) => {
    const s = g.current;
    if (!s || s.done || e.pointerId !== s.id) return;
    const dx = e.clientX - s.x0, dy = e.clientY - s.y0;
    if (!s.claimed) {
      if (Math.abs(dy) > CLAIM && Math.abs(dy) > Math.abs(dx)) { s.claimed = true; dragged.current = true; try { e.currentTarget.setPointerCapture(e.pointerId); } catch {} }
      else { if (Math.abs(dx) > CLAIM) s.done = true; return; }
    }
    if (reduced()) return;
    // Pulling down lengthens the parchment itself (the rod, roll and hint ride on its foot); pushing up on an open scroll nudges the roll.
    const pull = open ? Math.max(-24, Math.min(0, dy * 0.6)) : Math.max(0, Math.min(56, dy * 0.6));
    article(e.currentTarget)?.style.setProperty("--pull", `${pull.toFixed(1)}px`);
  };
  const onPointerEnd = (e: React.PointerEvent<HTMLButtonElement>) => {
    const s = g.current;
    if (!s || e.pointerId !== s.id) return;
    g.current = null;
    if (!s.claimed) return;
    try { e.currentTarget.releasePointerCapture(e.pointerId); } catch {}
    const a = article(e.currentTarget);
    a?.classList.add("is-snapping");
    a?.style.setProperty("--pull", "0px");
    if (e.type === "pointercancel") return;
    const dy = e.clientY - s.y0;
    if (!open && dy > COMMIT) onToggle(true);
    else if (open && dy < -COMMIT) onToggle(false);
  };
  const onClick = () => { if (dragged.current) { dragged.current = false; return; } onToggle(!open); };
  const onKeyDown = (e: React.KeyboardEvent<HTMLButtonElement>) => {
    if (e.key === "ArrowDown") { e.preventDefault(); onToggle(true); }
    else if (e.key === "ArrowUp") { e.preventDefault(); onToggle(false); }
  };

  return (
    <article id={id} className={cn("scroll", open && "is-open")} style={{ "--deckle": deckle(n) } as CSSProperties} aria-labelledby={`${id}-t`}>
      <Rod />
      <div className="scroll-sheet-wrap">
        <div className="scroll-sheet">
          <div className="scroll-band">
            <p className="mono-label scroll-no">Scroll {n}&nbsp;·&nbsp;Paper&nbsp;·&nbsp;{paper.year}</p>
            <h3 id={`${id}-t`} className="scroll-title">
              <button type="button" className="scroll-open" aria-expanded={open} aria-controls={`${id}-body`} onClick={() => onToggle(!open)}>{paper.title}</button>
            </h3>
            <div className="scroll-seal-wrap">
              <Seal n={paper.authors.length} />
              <span className="sr-only">{paper.authors.length} {paper.authors.length === 1 ? "author" : "authors"}.</span>
              <span className={cn("scroll-ribbon", published ? "is-gold" : "is-wax")}>{published ? "Published" : "In review"}</span>
            </div>
          </div>
          <div id={`${id}-body`} className="scroll-body">
            <div className="scroll-body-in">
              <div className="scroll-body-text">
                <hr className="scroll-rule" />
                <p className="mono-label scroll-venue">{paper.venue}</p>
                <p className="scroll-authors">
                  {paper.authors.map((a, k) => (
                    <Fragment key={a}>{k > 0 ? ", " : null}{k === paper.authorIndex ? <b>{a}</b> : a}</Fragment>
                  ))}
                </p>
                <p className="mono-label scroll-key">In one line</p>
                <p className="scroll-abs">{line}</p>
                <p className="scroll-links">
                  {paper.doi ? <a href={`https://doi.org/${paper.doi}`} target="_blank" rel="noopener">DOI {paper.doi}</a> : null}
                  {paper.href ? <a href={paper.href} target="_blank" rel="noopener">Read at the publisher ↗</a> : null}
                  {!paper.doi && !paper.href ? <span className="scroll-nolink">{published ? "Published" : "Under review"} · no public link yet</span> : null}
                </p>
              </div>
            </div>
          </div>
          <span className="scroll-tone" aria-hidden="true" />
        </div>
      </div>
      <div className="scroll-foot">
        <span className="scroll-roll" aria-hidden="true" />
        <button ref={handle} type="button" className="scroll-handle" aria-expanded={open} aria-controls={`${id}-body`}
          aria-label={`${open ? "Roll up" : "Unroll"} the scroll: ${paper.title}`}
          onPointerDown={onPointerDown} onPointerMove={onPointerMove} onPointerUp={onPointerEnd} onPointerCancel={onPointerEnd} onClick={onClick} onKeyDown={onKeyDown}>
          <Rod />
        </button>
        <p className="mono-label scroll-hint" aria-hidden="true">
          <span className="scroll-hint-fine">{open ? "Push the rod up · Enter rolls it" : "Pull the rod down · Enter unrolls it"}</span>
          <span className="scroll-hint-coarse">{open ? "Push the rod up · tap to roll" : "Pull the rod down · tap to unroll"}</span>
        </p>
      </div>
    </article>
  );
}
