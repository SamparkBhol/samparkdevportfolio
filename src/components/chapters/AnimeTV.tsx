"use client";
import { useCallback, useEffect, useRef, useState } from "react";
import type { Cert } from "@/content/types";
import { cn } from "@/lib/cn";
import { Medal } from "./Medal";

/* ============================================================================
   The anime TV: a drawn CRT set with the certifications as episodes. Nothing
   plays by itself. The channel changes when you turn the knob, press PREV /
   NEXT, pick from the select, or use the arrow keys while the set has focus.
   A manual change fires one 500 ms "kira" burst (CSS; none under reduced
   motion). The component is controlled when `index` is given; Extras (v1)
   still mounts it uncontrolled.
   ========================================================================== */

const pad = (v: number) => String(v).padStart(2, "0");
/* Five detents spread over 240°, from -120° to +120°. */
const SWEEP = 240;
const HALF_TURN = 180;
const FULL_TURN = 360;
const CLAIM_PX = 6;

/* Where the sparkles fly from, in % of the screen, and their outward vector. */
const KIRA = [
  { x: 12, y: 18, dx: -18, dy: -14, s: 14, d: 0 },
  { x: 86, y: 14, dx: 16, dy: -16, s: 18, d: 40 },
  { x: 92, y: 62, dx: 18, dy: 8, s: 12, d: 80 },
  { x: 8, y: 70, dx: -16, dy: 10, s: 16, d: 20 },
  { x: 50, y: 6, dx: 0, dy: -18, s: 12, d: 60 },
  { x: 30, y: 88, dx: -8, dy: 16, s: 14, d: 100 },
  { x: 70, y: 90, dx: 10, dy: 16, s: 12, d: 120 },
  { x: 60, y: 40, dx: 6, dy: -6, s: 22, d: 0 },
];

function Kira() {
  return (
    <div className="atv-kira" aria-hidden="true">
      {KIRA.map((k, i) => (
        <svg key={i} className="atv-star" viewBox="0 0 24 24" width={k.s} height={k.s}
          style={{ left: `${k.x}%`, top: `${k.y}%`, "--dx": `${k.dx}px`, "--dy": `${k.dy}px`, animationDelay: `${k.d}ms` } as React.CSSProperties}>
          <path d="M12 1L14.6 9.4L23 12L14.6 14.6L12 23L9.4 14.6L1 12L9.4 9.4Z" />
        </svg>
      ))}
    </div>
  );
}

/* The rotary channel knob. A horizontal drag claims the gesture (vertical stays with the page), then the
   pointer's angle around the knob's centre turns it; crossing a detent changes the channel. A click is NEXT. */
function Knob({ index, n, onTurn, onNext }: { index: number; n: number; onTurn: (i: number) => void; onNext: () => void }) {
  const step = n > 1 ? SWEEP / (n - 1) : 0;
  const angleOf = (i: number) => -SWEEP / 2 + i * step;
  const knobRef = useRef<HTMLButtonElement>(null);
  const liveRef = useRef(false);
  const g = useRef<{ id: number; x0: number; y0: number; cx: number; cy: number; a0: number; t0: number; claimed: boolean; done: boolean } | null>(null);
  /* The first paint's angle; after that the pointer mark is written imperatively so a drag is never fought by a render. */
  const [initialAngle] = useState(() => `${-SWEEP / 2 + index * (n > 1 ? SWEEP / (n - 1) : 0)}deg`);

  /* The pointer mark follows the channel unless a hand is on the knob. */
  useEffect(() => {
    const el = knobRef.current;
    if (!el || liveRef.current) return;
    el.style.setProperty("--a", `${-SWEEP / 2 + index * step}deg`);
  }, [index, step]);

  const onPointerDown = (e: React.PointerEvent<HTMLButtonElement>) => {
    if (e.pointerType === "mouse" && e.button !== 0) return;
    const r = e.currentTarget.getBoundingClientRect(); // one read per press
    const cx = r.left + r.width / 2, cy = r.top + r.height / 2;
    g.current = { id: e.pointerId, x0: e.clientX, y0: e.clientY, cx, cy, a0: angleOf(index), t0: Math.atan2(e.clientY - cy, e.clientX - cx), claimed: false, done: false };
  };
  const onPointerMove = (e: React.PointerEvent<HTMLButtonElement>) => {
    const s = g.current;
    if (!s || s.done || e.pointerId !== s.id) return;
    const el = e.currentTarget;
    if (!s.claimed) {
      const dx = e.clientX - s.x0, dy = e.clientY - s.y0;
      if (Math.abs(dx) > CLAIM_PX && Math.abs(dx) > Math.abs(dy)) {
        s.claimed = true; liveRef.current = true;
        try { el.setPointerCapture(e.pointerId); } catch {}
        el.dataset.live = "";
      } else if (Math.abs(dy) > CLAIM_PX) { s.done = true; return; } // a vertical gesture belongs to the page
      else return;
    }
    const raw = (Math.atan2(e.clientY - s.cy, e.clientX - s.cx) - s.t0) * HALF_TURN / Math.PI;
    const delta = ((raw % FULL_TURN) + FULL_TURN + HALF_TURN) % FULL_TURN - HALF_TURN; // the short way round
    const a = Math.max(-SWEEP / 2, Math.min(SWEEP / 2, s.a0 + delta));
    el.style.setProperty("--a", `${a.toFixed(1)}deg`);
    const k = step ? Math.round((a + SWEEP / 2) / step) : 0;
    if (k !== index) onTurn(k);
  };
  const end = (e: React.PointerEvent<HTMLButtonElement>) => {
    const s = g.current;
    if (!s || e.pointerId !== s.id) return;
    g.current = null;
    const el = e.currentTarget;
    if (!s.claimed) {
      // A vertical intent was the page's; the click that lands after it is not a click either.
      if (s.done) { el.dataset.moved = ""; window.setTimeout(() => { delete el.dataset.moved; }, 0); }
      return;
    }
    try { el.releasePointerCapture(e.pointerId); } catch {}
    liveRef.current = false;
    delete el.dataset.live;
    el.style.setProperty("--a", `${angleOf(index)}deg`); // settle on the detent
    // The click that follows a drag is not a click.
    el.dataset.moved = "";
    window.setTimeout(() => { delete el.dataset.moved; }, 0);
  };
  const onClick = (e: React.MouseEvent<HTMLButtonElement>) => {
    if ("moved" in e.currentTarget.dataset) return;
    onNext();
  };

  return (
    <button
      ref={knobRef}
      type="button"
      className="atv-knob"
      style={{ "--a": initialAngle } as React.CSSProperties}
      aria-label={`Channel knob: channel ${index + 1} of ${n}. Click for the next channel, drag to turn`}
      onPointerDown={onPointerDown} onPointerMove={onPointerMove} onPointerUp={end} onPointerCancel={end} onClick={onClick}
    >
      <svg viewBox="0 0 100 100" width="84" height="84" aria-hidden="true" focusable="false">
        {Array.from({ length: n }, (_, i) => {
          const a = (angleOf(i) - 90) * Math.PI / HALF_TURN;
          const x1 = 50 + 44 * Math.cos(a), y1 = 50 + 44 * Math.sin(a), x2 = 50 + 49 * Math.cos(a), y2 = 50 + 49 * Math.sin(a);
          return <line key={i} className={cn("atv-tick", i === index && "is-on")} x1={x1} y1={y1} x2={x2} y2={y2} />;
        })}
        <g className="atv-knob-rot">
          <circle className="atv-knob-face" cx="50" cy="50" r="36" />
          <circle className="atv-knob-grip" cx="50" cy="50" r="30" />
          <path className="atv-knob-mark" d="M46 16H54V34H46Z" />
        </g>
      </svg>
    </button>
  );
}

export function AnimeTV({ certs, index, onChange, className }: { certs: Cert[]; index?: number; onChange?: (i: number) => void; className?: string }) {
  const n = certs.length;
  const [own, setOwn] = useState(0);
  const i = index ?? own;
  const cur = certs[i];
  const [burst, setBurst] = useState(0);
  const burstTimer = useRef(0);

  const go = useCallback((next: number) => {
    const k = ((next % n) + n) % n;
    if (k === i) return;
    if (index === undefined) setOwn(k);
    onChange?.(k);
    setBurst((b) => b + 1);
  }, [i, index, n, onChange]);

  /* The sparkles are removed once they have landed, so the screen holds no idle layers. */
  useEffect(() => {
    if (!burst) return;
    window.clearTimeout(burstTimer.current);
    burstTimer.current = window.setTimeout(() => setBurst(0), 620);
    return () => window.clearTimeout(burstTimer.current);
  }, [burst]);

  const onKey = (e: React.KeyboardEvent<HTMLDivElement>) => {
    if (e.target instanceof HTMLSelectElement) return; // the select owns its arrow keys
    if (e.altKey || e.ctrlKey || e.metaKey) return;
    switch (e.key) {
      case "ArrowRight": case "ArrowDown": e.preventDefault(); go(i + 1); break;
      case "ArrowLeft": case "ArrowUp": e.preventDefault(); go(i - 1); break;
      case "Home": e.preventDefault(); go(0); break;
      case "End": e.preventDefault(); go(n - 1); break;
    }
  };

  if (!cur) return null;
  return (
    <div className={cn("atv", className)} tabIndex={0} role="group" aria-label="Certifications, as episodes on a television. Arrow keys change the channel." onKeyDown={onKey}>
      <div className="atv-set ink-border hard-shadow">
        <div className="atv-screen-frame">
          <div className="atv-screen">
            <div className="atv-scan" aria-hidden="true" />
            <article className="atv-card" key={cur.id} aria-live="polite" aria-label={`Episode ${pad(cur.ep)} of ${pad(n)}: ${cur.title}`}>
              <div className="atv-card-top">
                <p className="mono-label atv-ch">CH {pad(i + 1)} / {pad(n)}</p>
                <p className="mono-label atv-onair"><span className="atv-dot" aria-hidden="true" />No autoplay</p>
              </div>
              <p className="atv-ep display">EP.{pad(cur.ep)}</p>
              <h3 className="atv-title">{cur.title}</h3>
              <div className="atv-card-foot">
                <p className="mono-label atv-meta">{cur.issuer} · {cur.year}</p>
                {cur.verifyUrl ? <a className="btn btn-sm atv-verify" href={cur.verifyUrl} target="_blank" rel="noopener">Verify ↗</a> : null}
              </div>
              <span className="atv-card-medal"><Medal initial={cur.issuer[0]} active size={44} /></span>
            </article>
            {burst ? <Kira key={burst} /> : null}
            {burst ? <div className="atv-blip" key={`b${burst}`} aria-hidden="true" /> : null}
          </div>
          <p className="mono-label atv-plate" aria-hidden="true">Certifications · {n} episodes</p>
        </div>

        <div className="atv-deck">
          <div className="atv-knob-wrap">
            <Knob index={i} n={n} onTurn={go} onNext={() => go(i + 1)} />
            <span className="mono-label atv-knob-label">Channel</span>
          </div>
          <div className="atv-btns">
            <button type="button" className="btn btn-sm atv-prev" onClick={() => go(i - 1)} aria-label="Previous episode">◀ Prev</button>
            <button type="button" className="btn btn-sm atv-next" onClick={() => go(i + 1)} aria-label="Next episode">Next ▶</button>
          </div>
          <select className="atv-select" aria-label="Episode" value={cur.id} onChange={(e) => { const k = certs.findIndex((c) => c.id === e.target.value); if (k >= 0) go(k); }}>
            {certs.map((c) => <option key={c.id} value={c.id}>EP.{pad(c.ep)} · {c.title}</option>)}
          </select>
          <p className="mono-label atv-help"><span>Turn the knob</span><span><b>← →</b> change channel</span></p>
        </div>
      </div>
      <div className="atv-legs" aria-hidden="true"><span /><span /></div>
    </div>
  );
}
