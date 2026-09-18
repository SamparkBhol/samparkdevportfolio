"use client";
import { useCallback, useEffect, useId, useMemo, useRef, useState } from "react";
import type { Flow, FlowNode } from "@/content/types";
import { Caption } from "@/components/print/Caption";
import { Hanko } from "@/components/print/Hanko";
import { Sfx } from "@/components/print/Sfx";
import { cn } from "@/lib/cn";
import { Glyph, Traveller, travellerKind } from "./FlowGlyphs";

/* ============================================================================
   A stage's system as a strip you can send something through. Every node comes
   from role.flow (resume.ts): its glyph, label, fact, log line and the panel it
   jumps to. The traveller starts at the rightmost node and hops leftward at
   12 fps, on a setInterval that exists only while a run is in flight; the
   timeline scrubs the same frames; reduced motion jumps to the end. At the end
   the hanko slams the flow's real figure onto the last node. The frame is a
   crop of the drawing (TOP / VH) so the strip sits shorter on the page.
   ========================================================================== */

const HOP = 5;          // frames per hop
const FRAME_MS = 83;    // 12 fps
const W = 1200, PAD = 60;
const TOP = 30, VH = 320;  // the printed frame: a crop of the 1200×360 drawing (nothing is drawn above y=30 or below y=350)
const GROUND = 250;     // where the glyphs' feet stand
const FLY = 112, ARC = 30;
const CHAR = 8.1;       // Courier Prime advance at 13 px with 0.02em tracking, in viewBox units
const SFX = [{ jp: "ドン", romaji: "DON" }, { jp: "シュッ", romaji: "SHU" }, { jp: "ゴゴゴ", romaji: "GOGOGO" }];

interface Laid { node: FlowNode; i: number; cx: number; lines: string[]; chipW: number }

/** Labels longer than a chip's worth split into two lines, at " · " when there is one. */
function splitLabel(label: string): string[] {
  const s = label.toUpperCase();
  if (s.length <= 15) return [s];
  const dot = s.indexOf(" · ");
  if (dot > 0) return [s.slice(0, dot), s.slice(dot + 3)];
  const mid = s.length / 2;
  let best = -1;
  for (let k = 0; k < s.length; k++) if (s[k] === " " && (best < 0 || Math.abs(k - mid) < Math.abs(best - mid))) best = k;
  return best > 0 ? [s.slice(0, best), s.slice(best + 1)] : [s];
}

function useLayout(flow: Flow) {
  return useMemo(() => {
    const n = flow.nodes.length;
    const slot = (W - 2 * PAD) / n;
    const laid: Laid[] = flow.nodes.map((node, i) => {
      const lines = splitLabel(node.label);
      return { node, i, cx: W - PAD - slot * (i + 0.5), lines, chipW: Math.max(...lines.map((l) => l.length)) * CHAR + 16 };
    });
    const last = Math.max(1, (n - 1) * HOP);
    const sfxAt = [Math.floor(n / 4), Math.floor(n / 2), Math.floor((3 * n) / 4)].map((i) => Math.max(1, Math.min(n - 1, i)));
    return { laid, slot, last, sfxAt };
  }, [flow]);
}

/** Where the traveller is on frame f: a sine arc between neighbouring nodes, nose tilting with the arc. */
function at(laid: Laid[], f: number) {
  const n = laid.length;
  if (n < 2 || f >= (n - 1) * HOP) return { x: laid[n - 1].cx, y: FLY, tilt: 0 };
  const i = Math.floor(f / HOP), t = (f - i * HOP) / HOP;
  const a = laid[i], b = laid[i + 1];
  return { x: a.cx + (b.cx - a.cx) * t, y: FLY - Math.sin(Math.PI * t) * ARC, tilt: Math.cos(Math.PI * t) * 14 };
}

/** A caption chip printed on the ground. */
function Chip({ cx, y, text }: { cx: number; y: number; text: string }) {
  const w = text.length * CHAR + 16;
  return (
    <g aria-hidden="true">
      <rect x={cx - w / 2} y={y} width={w} height={24} className="f-paper ink2" />
      <text x={cx} y={y + 16.5}>{text}</text>
    </g>
  );
}

function Node({ l, slot, lit, burst, onJump, onHot }: { l: Laid; slot: number; lit: boolean; burst: boolean; onJump: (panel?: string) => void; onHot: (id: string | null) => void }) {
  const { node, cx, lines, chipW } = l;
  const chipH = lines.length === 1 ? 24 : 40;
  return (
    <g role="button" tabIndex={0} className="flow-node"
      onClick={() => onJump(node.panel)}
      onKeyDown={(e) => { if (e.key === "Enter" || e.key === " ") { e.preventDefault(); e.stopPropagation(); onJump(node.panel); } }}
      onMouseEnter={() => onHot(node.id)} onMouseLeave={() => onHot(null)} onFocus={() => onHot(node.id)} onBlur={() => onHot(null)}>
      <title>{node.fact}</title>
      <rect className="flow-hit" x={cx - slot / 2 + 4} y={GROUND - 128} width={slot - 8} height={190} rx={8} />
      <g transform={`translate(${(cx - 60).toFixed(1)} ${GROUND - 120})`}><Glyph name={node.glyph} active={lit} burst={burst} /></g>
      <rect x={cx - chipW / 2} y={GROUND + 12} width={chipW} height={chipH} className={cn("ink2", lit ? "f-yellow" : "f-paper")} />
      {lines.map((t, k) => <text key={k} x={cx} y={GROUND + 28.5 + k * 16}>{t}</text>)}
    </g>
  );
}

export function FlowStrip({ flow, fig, tone = 0 }: { flow: Flow; fig: string; tone?: 0 | 10 | 25 }) {
  const { laid, slot, last, sfxAt } = useLayout(flow);
  const kind = travellerKind(flow.traveller);
  const pid = `flow-tone-${useId().replace(/[^a-zA-Z0-9]/g, "")}`;
  const [frame, setFrame] = useState(0);
  const [running, setRunning] = useState(false);
  const [sends, setSends] = useState(0);
  const [burst, setBurst] = useState(false);
  const [hot, setHot] = useState<string | null>(null);
  const timer = useRef<number | null>(null);
  const burstTimer = useRef<number | null>(null);
  const sendTimes = useRef<number[]>([]);
  const wheelAt = useRef(0);
  const scroller = useRef<HTMLDivElement>(null);
  const stage = useRef<HTMLDivElement>(null);

  const stop = useCallback(() => {
    if (timer.current !== null) { window.clearInterval(timer.current); timer.current = null; }
    setRunning(false);
  }, []);
  useEffect(() => () => {
    if (timer.current !== null) window.clearInterval(timer.current);
    if (burstTimer.current !== null) window.clearTimeout(burstTimer.current);
  }, []);
  useEffect(() => {
    const onVis = () => { if (document.hidden) stop(); };
    document.addEventListener("visibilitychange", onVis);
    return () => document.removeEventListener("visibilitychange", onVis);
  }, [stop]);

  const send = useCallback(() => {
    stop();
    const now = Date.now();
    const b = flow.burst;
    if (b) {
      sendTimes.current = [...sendTimes.current.filter((t) => now - t < b.within * 1000), now];
      if (sendTimes.current.length >= b.after) {
        sendTimes.current = [];
        setBurst(true);
        if (burstTimer.current !== null) window.clearTimeout(burstTimer.current);
        burstTimer.current = window.setTimeout(() => { setBurst(false); burstTimer.current = null; }, 6000);
      }
    }
    setSends((n) => n + 1);
    if (window.matchMedia("(prefers-reduced-motion: reduce)").matches) { setFrame(last); return; }
    setFrame(0);
    setRunning(true);
    let f = 0;
    timer.current = window.setInterval(() => {
      if (document.hidden) { stop(); return; }
      f += 1;
      setFrame(f);
      if (f >= last) stop();
    }, FRAME_MS);
  }, [flow.burst, last, stop]);

  const scrub = useCallback((f: number) => { stop(); setFrame(Math.min(last, Math.max(0, f))); }, [last, stop]);

  const jump = useCallback((panel?: string) => {
    if (!panel) return;
    const el = document.getElementById(panel);
    if (!el) return;
    el.scrollIntoView({ behavior: window.matchMedia("(prefers-reduced-motion: reduce)").matches ? "auto" : "smooth", block: "center" });
    el.classList.add("camp-hit");
    window.setTimeout(() => el.classList.remove("camp-hit"), 1400);
  }, []);

  const pos = at(laid, frame);

  /* On phones the strip is wider than its panel; the camera follows the traveller. */
  useEffect(() => {
    const sc = scroller.current, st = stage.current;
    if (!sc || !st || sc.scrollWidth <= sc.clientWidth + 2) return;
    sc.scrollTo({ left: Math.max(0, (pos.x / W) * st.clientWidth - sc.clientWidth / 2), behavior: "auto" });
  }, [pos.x]);

  const onStripKey = (e: React.KeyboardEvent<SVGSVGElement>) => {
    if (e.target !== e.currentTarget) return;
    if (e.key === "Enter" || e.key === " ") { e.preventDefault(); send(); }
    else if (e.key === "ArrowRight" || e.key === "ArrowUp") { e.preventDefault(); scrub(frame + 1); }
    else if (e.key === "ArrowLeft" || e.key === "ArrowDown") { e.preventDefault(); scrub(frame - 1); }
    else if (e.key === "Home") { e.preventDefault(); scrub(0); }
    else if (e.key === "End") { e.preventDefault(); scrub(last); }
  };

  const reached = frame > 0 || sends > 0 ? Math.min(laid.length - 1, Math.floor(frame / HOP)) : -1;
  const log = reached >= 0 ? laid.slice(0, reached + 1) : [];
  const current = reached >= 0 ? laid[reached].node : null;
  const done = frame >= last;
  const status = done
    ? `${flow.stamp}${flow.stampNote ? ` · ${flow.stampNote}` : ""} · ${sends > 0 ? `send #${sends}` : "scrubbed to the end"}`
    : running ? `in flight · ${current?.label ?? ""}`
    : reached < 0 ? "ready · press send"
    : `paused · ${current?.label ?? ""}`;
  const sfxIdx = frame > 0 ? sfxAt.findIndex((i) => frame >= i * HOP && frame < i * HOP + HOP) : -1;
  const sfxNode = sfxIdx >= 0 ? laid[sfxAt[sfxIdx]] : null;
  const hotNode = hot ? laid.find((l) => l.node.id === hot)?.node : undefined;
  const burstNode = laid.find((l) => l.node.glyph === "pods") ?? laid[Math.floor(laid.length / 2)];
  const lastNode = laid[laid.length - 1];
  const pct = (v: number, of: number) => `${((v / of) * 100).toFixed(2)}%`;
  const groundText = `${flow.traveller} travels right → left`.toUpperCase();

  return (
    <div className="flow paper ink-border hard-shadow ink-in">
      <div className="flow-head">
        <span className="mono-label">Fig. {fig} · {flow.caption}</span>
        <span className="mono-label flow-hint">
          <span className="flow-hint-long">Send · drag the timeline · click a node to read its panel</span>
          <span className="flow-hint-short">Send · drag · tap a node</span>
        </span>
      </div>

      <div className={cn("flow-scroll", tone === 10 && "tone-10", tone === 25 && "tone-25")} ref={scroller}>
        <div className="flow-stage" ref={stage}>
          <svg className="flow-svg" viewBox={`0 ${TOP} ${W} ${VH}`} preserveAspectRatio="xMidYMid meet" width="100%" tabIndex={0} role="group"
            aria-label={`${flow.caption}. Enter sends ${flow.traveller}; arrow keys scrub it; Tab reaches each node.`} onKeyDown={onStripKey}>
            <defs>
              <pattern id={pid} width={6} height={6} patternUnits="userSpaceOnUse"><circle cx={3} cy={3} r={1} className="f-ink" opacity={0.28} /></pattern>
            </defs>

            {/* ground */}
            <rect x={0} y={GROUND} width={W} height={58} fill={`url(#${pid})`} />
            <line x1={0} y1={GROUND} x2={W} y2={GROUND} className="ink" />
            <g aria-hidden="true">
              <line x1={W - PAD} y1={334} x2={PAD + 20} y2={334} className="ink" />
              <polygon points={`${PAD},334 ${PAD + 22},324 ${PAD + 22},344`} className="f-ink ink" />
              <Chip cx={W / 2} y={322} text={groundText} />
            </g>

            {laid.map((l) => (
              <Node key={l.node.id} l={l} slot={slot} lit={reached >= l.i} burst={burst && l.node.glyph === "pods"} onJump={jump} onHot={setHot} />
            ))}

            {/* the traveller */}
            <g transform={`translate(${pos.x.toFixed(1)} ${pos.y.toFixed(1)})`} aria-hidden="true">
              {running ? (
                <g className="ink2">
                  <line x1={24} y1={-8} x2={46} y2={-10} />
                  <line x1={22} y1={2} x2={56} y2={2} />
                  <line x1={24} y1={12} x2={42} y2={13} />
                </g>
              ) : null}
              <Traveller kind={kind} tilt={pos.tilt} />
            </g>
          </svg>

          {sfxNode ? (
            <span key={`${sfxIdx}-${sends}`} className="flow-over flow-sfx" style={{ left: pct(sfxNode.cx + slot * 0.4, W), top: pct(62 - TOP, VH) }}>
              <Sfx romaji={SFX[sfxIdx].romaji}>{SFX[sfxIdx].jp}</Sfx>
            </span>
          ) : null}
          {burst && flow.burst ? (
            <span className="flow-over flow-burst" style={{ left: pct(burstNode.cx, W), top: pct(44 - TOP, VH) }}><Caption>{flow.burst.label}</Caption></span>
          ) : null}
          {done ? (
            <span key={sends} className="flow-over flow-hanko" aria-hidden="true" style={{ left: pct(lastNode.cx, W), top: pct(100 - TOP, VH) }}>
              <Hanko>{flow.stamp}</Hanko>
              {flow.stampNote ? <span className="flow-hanko-note mono-label">{flow.stampNote}</span> : null}
            </span>
          ) : null}
        </div>
      </div>

      <div className="flow-controls">
        <button type="button" className="btn btn-red flow-send" onClick={send}>Send {flow.traveller} ▶</button>
        <label className="flow-timeline">
          <span className="mono-label">Timeline</span>
          <input type="range" min={0} max={last} step={1} value={frame} aria-label={`Scrub ${flow.traveller}`}
            aria-valuetext={`frame ${frame} of ${last}${current ? ` · ${current.label}` : ""}`}
            onWheel={() => { wheelAt.current = Date.now(); }}
            onChange={(e) => { if (Date.now() - wheelAt.current > 80) scrub(+e.target.value); }} />
        </label>
        <p className="flow-status mono-label" role="status" aria-live="polite">{status}</p>
        <p className="flow-fact" aria-live="polite">
          {hotNode ? <><b className="mono-label">{hotNode.label}</b>{hotNode.fact}</> : <span className="flow-fact-hint">Hover or focus a node to read the fact behind it. Click or tap it to jump to its panel.</span>}
        </p>
      </div>

      <div className="flow-log-wrap" style={{ "--log-rows": Math.ceil(laid.length / 2) } as React.CSSProperties}>
        {log.length ? (
          <ol className="flow-log" aria-label={`${flow.traveller} log`}>
            {log.map((l) => <li key={l.node.id}>{l.node.log}</li>)}
          </ol>
        ) : (
          <p className="flow-log flow-log-empty" aria-label={`${flow.traveller} log`}>log · empty · send {flow.traveller} or drag the timeline</p>
        )}
      </div>
    </div>
  );
}
