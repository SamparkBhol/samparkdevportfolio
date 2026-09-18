"use client";
import { useEffect, useRef, useState } from "react";
import type { Game } from "@/content/types";
import { Sfx } from "@/components/print";
import { useRingDrag } from "@/components/motion/useRingDrag";

const kind = (g: Game) => (g.install || /npmjs\.com/.test(g.href) ? "npm" : /github\.com/.test(g.href) ? "source" : "live");
const linkLabel = (g: Game) => ({ npm: "Open on npm ↗", source: "Source ↗", live: "Play ↗" }[kind(g)]);

/* ---------- Label art: one small ink drawing per game, printed on the cartridge label ---------- */
const GEAR = (() => {
  const pts: string[] = [];
  for (let i = 0; i < 16; i++) {
    const r = i % 2 === 0 ? 15 : 10.5;
    const a = (i / 16) * Math.PI * 2 - Math.PI / 2;
    pts.push(`${(24 + Math.cos(a) * r).toFixed(1)},${(26 + Math.sin(a) * r).toFixed(1)}`);
  }
  return pts.join(" ");
})();

function LabelArt({ id }: { id: string }) {
  switch (id) {
    case "cli-legend": // ASCII rooms: walls, a door, the @ in the middle
      return (
        <svg className="cart-art" viewBox="0 0 80 48" aria-hidden="true" focusable="false">
          <rect className="a-paper" x="3" y="3" width="74" height="42" />
          {[3, 15, 27, 51, 63].map((x) => <rect key={`t${x}`} className="a-ink" x={x} y="3" width="11" height="9" />)}
          {[3, 15, 51, 63].map((x) => <rect key={`b${x}`} className="a-ink" x={x} y="36" width="11" height="9" />)}
          <rect className="a-ink" x="3" y="12" width="10" height="24" /><rect className="a-ink" x="27" y="24" width="11" height="12" />
          <rect className="a-shu" x="66" y="16" width="11" height="17" />
          <text className="a-text" x="49" y="30" textAnchor="middle">@</text>
        </svg>
      );
    case "pixel-legends": // a pad: d-pad and two buttons
      return (
        <svg className="cart-art" viewBox="0 0 80 48" aria-hidden="true" focusable="false">
          <rect className="a-paper" x="4" y="9" width="72" height="30" rx="9" />
          <rect className="a-ink" x="19" y="14" width="7" height="20" /><rect className="a-ink" x="12.5" y="20.5" width="20" height="7" />
          <circle className="a-shu" cx="55" cy="27" r="5" /><circle className="a-yellow" cx="66" cy="20" r="5" />
          <rect className="a-ink" x="38" y="23" width="6" height="3" />
        </svg>
      );
    case "zelda": // a sword and a shield
      return (
        <svg className="cart-art" viewBox="0 0 80 48" aria-hidden="true" focusable="false">
          <path className="a-shu" d="M 52 5 L 74 10 L 72 27 C 70 37 62 42 52 45 C 42 42 34 37 32 27 L 30 10 Z" />
          <path className="a-line" d="M 52 12 L 52 38 M 40 22 L 64 22" />
          <path className="a-paper" d="M 8 41 L 27 12 L 33 16 L 14 45 Z" />
          <path className="a-ink" d="M 18 30 L 25 25 L 33 35 L 27 40 Z" />
          <path className="a-line" d="M 27 12 L 32 5" />
        </svg>
      );
    case "gamedev-utils": // a gear and an easing curve
      return (
        <svg className="cart-art" viewBox="0 0 80 48" aria-hidden="true" focusable="false">
          <polygon className="a-paper" points={GEAR} />
          <circle className="a-ink" cx="24" cy="26" r="4" />
          <path className="a-curve" d="M 44 40 C 60 40 58 8 76 8" />
          <circle className="a-yellow" cx="44" cy="40" r="3.5" /><circle className="a-yellow" cx="76" cy="8" r="3.5" />
        </svg>
      );
    case "dev-toolkit": // a prompt and a wrench
      return (
        <svg className="cart-art" viewBox="0 0 80 48" aria-hidden="true" focusable="false">
          <rect className="a-ink" x="4" y="6" width="72" height="36" rx="3" />
          <text className="a-text a-on-ink" x="12" y="31">&gt;_</text>
          <rect className="a-yellow" x="40" y="18" width="7" height="14" />
          <path className="a-wrench" d="M 56 34 L 66 24 M 68 22 a 5 5 0 1 0 -4 -4 l -2 2" />
        </svg>
      );
    default:
      return (
        <svg className="cart-art" viewBox="0 0 80 48" aria-hidden="true" focusable="false">
          <path className="a-paper" d="M 40 6 L 47 20 L 62 22 L 51 33 L 54 48 L 40 41 L 26 48 L 29 33 L 18 22 L 33 20 Z" />
        </svg>
      );
  }
}

/* The games as cartridges on a ring, on a shelf. Drag anywhere on the stage to spin it (pointer capture, touch-action
   pan-y, claimed only for a clearly horizontal gesture); ← / → step one cartridge; Home resets; a click (not a drag)
   opens the paper card with the install line, a copy button and the real link. Each cartridge is a box: front, back
   and two side faces inside a preserve-3d button; the front carries the label art for its game. */
export function CartridgeRing({ games }: { games: Game[] }) {
  const n = Math.max(1, games.length);
  const step = 360 / n;
  const { ref: ringRef, bind, set, by, get, moved, dragging } = useRingDrag({ sensitivity: 0.35, friction: 0.93 });
  const [sel, setSel] = useState<Game | null>(null);
  const [copied, setCopied] = useState(false);
  const timer = useRef(0);
  useEffect(() => () => window.clearTimeout(timer.current), []);

  /** Rotate the ring so cartridge i faces the viewer, the short way round. */
  const face = (i: number) => {
    const cur = get();
    let d = (((-i * step - cur) % 360) + 540) % 360 - 180;
    if (Math.abs(d) < 0.01) d = 0;
    set(cur + d, true);
  };

  const pick = (g: Game, i: number) => {
    if (moved()) return; // that was a drag, not a click
    face(i);
    setCopied(false);
    setSel((cur) => (cur?.id === g.id ? null : g));
  };

  const onKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === "ArrowLeft") { e.preventDefault(); by(step); }
    else if (e.key === "ArrowRight") { e.preventDefault(); by(-step); }
    else if (e.key === "Home") { e.preventDefault(); set(0, true); }
    else if (e.key === "Escape" && sel) { e.preventDefault(); setSel(null); }
  };

  const copy = (text: string) => {
    const done = () => {
      setCopied(true);
      window.clearTimeout(timer.current);
      timer.current = window.setTimeout(() => setCopied(false), 900);
    };
    if (navigator.clipboard?.writeText) navigator.clipboard.writeText(text).then(done).catch(() => {});
  };

  return (
    <div className="ring-block" onKeyDown={onKeyDown}>
      <div
        className="ring-stage"
        {...bind}
        tabIndex={0}
        role="group"
        aria-label="Games: a ring of cartridges on a shelf. Drag to spin, or use the arrow keys."
        data-dragging={dragging ? "true" : undefined}
      >
        <div className="ring-shelf" aria-hidden="true"><span className="ring-shelf-line" /></div>
        <div className="ring" ref={ringRef} style={{ "--n": n } as React.CSSProperties}>
          {games.map((g, i) => (
            <button
              key={g.id}
              type="button"
              className="cart"
              style={{ "--i": i, "--accent": g.accent } as React.CSSProperties}
              onClick={() => pick(g, i)}
              onFocus={(e) => { if (e.currentTarget.matches(":focus-visible")) face(i); }}
              aria-expanded={sel?.id === g.id}
            >
              <span className="cart-face cart-front">
                <span className="cart-notch" aria-hidden="true" />
                <span className="cart-label">
                  <span className="cart-gloss" aria-hidden="true" />
                  <LabelArt id={g.id} />
                  <span className="cart-name display">{g.name}</span>
                  <span className="cart-sub">{g.sub}</span>
                </span>
                <span className="cart-meta mono-label"><span>{g.year}</span><span>{kind(g) === "npm" ? "npm" : "LIVE"}</span></span>
              </span>
              <span className="cart-face cart-side cart-right" aria-hidden="true" />
              <span className="cart-face cart-side cart-left" aria-hidden="true" />
              <span className="cart-face cart-back" aria-hidden="true"><span className="mono-label">SB · ARCADE</span><span className="cart-back-name">{g.name}</span></span>
            </button>
          ))}
        </div>
      </div>
      <p className="mono-label ring-help" aria-hidden="true">Drag to spin · click to open · ← → · Home</p>
      <div className="ring-nav" role="group" aria-label="Turn the ring">
        <button type="button" className="btn btn-ghost btn-sm ring-nav-btn" onClick={() => by(step)} aria-label="Previous cartridge">◀ PREV</button>
        <button type="button" className="btn btn-ghost btn-sm ring-nav-btn" onClick={() => by(-step)} aria-label="Next cartridge">NEXT ▶</button>
      </div>

      {sel ? (
        <div className="ring-card paper ink-border hard-shadow" role="region" aria-label={`${sel.name} card`} key={sel.id} style={{ "--accent": sel.accent } as React.CSSProperties}>
          <div className="ring-card-band" aria-hidden="true" />
          <div className="ring-card-head">
            <LabelArt id={sel.id} />
            <div>
              <p className="mono-label ring-card-meta">{sel.year} · {kind(sel) === "npm" ? "npm" : kind(sel) === "source" ? "source" : "live"}</p>
              <h4 className="display ring-card-name">{sel.name}</h4>
              <p className="ring-card-sub">{sel.sub}</p>
            </div>
          </div>
          {sel.install ? (
            <div className="ring-install">
              <code className="ring-code">{sel.install}</code>
              <button type="button" className="btn btn-sm" onClick={() => copy(sel.install!)} aria-label={`Copy ${sel.install} to the clipboard`}>Copy</button>
              <span className="ring-copied" aria-hidden="true">{copied ? <Sfx size={24}>COPIED</Sfx> : null}</span>
            </div>
          ) : null}
          <div className="ring-card-btns">
            <a className="btn btn-red" href={sel.href} target="_blank" rel="noopener">{linkLabel(sel)}</a>
            <button type="button" className="btn btn-sm" onClick={() => setSel(null)}>Close · Esc</button>
          </div>
        </div>
      ) : null}
      <span className="sr-only" aria-live="polite">{copied ? "Copied" : ""}</span>
    </div>
  );
}
