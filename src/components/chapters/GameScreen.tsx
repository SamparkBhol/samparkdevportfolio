"use client";
import { useCallback, useEffect, useRef, useState } from "react";
import { GAME_NAMES, H, IDLE, W, create, draw, step, type GameState, type Input, type MiniGame, type Palette } from "@/lib/minigames";

/* ============================================================================
   One driver for every screen on the page.
   - One requestAnimationFrame for all screens, 30 fps, and it stops on its own
     the moment no screen is live (nothing runs offscreen or in a hidden tab).
   - A screen is live while it is being played, or, as a demo, while at least
     half of it is in the viewport. Under 720 px only the most visible demo runs.
   - Nothing here touches React per frame: score and game-over changes are the
     only events that reach state.
   ========================================================================== */
interface Screen {
  root: HTMLElement; canvas: HTMLCanvasElement; ctx: CanvasRenderingContext2D;
  state: GameState; input: Input; ratio: number; playing: boolean; reduced: boolean;
  seen: { score: number; over: boolean };
  onChange: (score: number, over: boolean) => void;
}
const FRAME = 1000 / 30;
const screens = new Set<Screen>();
const byCanvas = new WeakMap<Element, Screen>();
let raf = 0, last = 0, io: IntersectionObserver | null = null, pal: Palette | null = null, listening = false;

function palette(): Palette {
  if (pal) return pal;
  const cs = getComputedStyle(document.documentElement);
  const get = (n: string, f: string) => cs.getPropertyValue(n).trim() || f;
  pal = { bg: get("--color-night", "#0E0F14"), fg: get("--color-paper", "#F3F1EB"), accent: get("--color-yellow", "#FFD23F"), danger: get("--color-shu", "#D0342C") };
  return pal;
}
function live(): Screen[] {
  if (document.hidden) return [];
  const all: Screen[] = [];
  for (const s of screens) if (s.playing || (!s.reduced && s.ratio >= 0.5)) all.push(s);
  if (window.innerWidth >= 720) return all;
  const playing = all.filter((s) => s.playing);
  if (playing.length) return playing;
  let best: Screen | null = null;
  for (const s of all) if (!best || s.ratio > best.ratio) best = s;
  return best ? [best] : [];
}
function leds(act: Screen[]) {
  for (const s of screens) { const v = s.playing ? "play" : act.includes(s) ? "demo" : "off"; if (s.root.dataset.live !== v) s.root.dataset.live = v; }
}
function tick(now: number) {
  const act = live();
  leds(act);
  if (!act.length) { raf = 0; return; }
  if (now - last >= FRAME - 1) {
    const dt = Math.min((now - last) / 1000, 0.1);
    last = now;
    for (const s of act) {
      s.state.ai = !s.playing;
      step(s.state, s.playing ? s.input : IDLE, dt);
      s.input.turn = 0;
      draw(s.ctx, s.state, palette());
      if (s.state.score !== s.seen.score || s.state.over !== s.seen.over) { s.seen = { score: s.state.score, over: s.state.over }; s.onChange(s.state.score, s.state.over); }
    }
  }
  raf = requestAnimationFrame(tick);
}
function wake() { if (raf) return; last = performance.now(); raf = requestAnimationFrame(tick); }
function observe(s: Screen) {
  if (!io) io = new IntersectionObserver((es) => { for (const e of es) { const sc = byCanvas.get(e.target); if (sc) sc.ratio = e.isIntersecting ? e.intersectionRatio : 0; } wake(); }, { threshold: [0, 0.25, 0.5, 0.75, 1] });
  if (!listening) { listening = true; document.addEventListener("visibilitychange", () => { if (document.hidden) leds([]); else wake(); }); }
  byCanvas.set(s.canvas, s); screens.add(s); io.observe(s.canvas);
}
function unobserve(s: Screen) { io?.unobserve(s.canvas); byCanvas.delete(s.canvas); screens.delete(s); }

const KEYS: Record<string, keyof Omit<Input, "turn">> = { ArrowLeft: "left", ArrowRight: "right", ArrowUp: "up", ArrowDown: "down", " ": "action" };

/* The CRT set: a bezel, the 96 × 64 screen scaled in whole pixels, a LED that tells the truth
   (off / demo / play), the PLAY button and the printed controls. */
export function GameScreen({ game, channel, title }: { game: MiniGame; channel: string; title: string }) {
  const rootRef = useRef<HTMLDivElement>(null);
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const playRef = useRef<HTMLButtonElement>(null);
  const sRef = useRef<Screen | null>(null);
  const [mode, setMode] = useState<"demo" | "play">("demo");
  const [score, setScore] = useState(0);
  const [over, setOver] = useState(false);
  const [reduced, setReduced] = useState(false);
  const name = GAME_NAMES[game];
  const seed = (parseInt(channel, 10) || 1) * 7919 + 17;

  useEffect(() => {
    const root = rootRef.current, canvas = canvasRef.current;
    const ctx = canvas?.getContext("2d");
    if (!root || !canvas || !ctx) return;
    const red = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
    setReduced(red);
    const s: Screen = { root, canvas, ctx, state: create(game, W, H, seed), input: { ...IDLE }, ratio: 0, playing: false, reduced: red, seen: { score: 0, over: false }, onChange: (sc, ov) => { setScore(sc); setOver(ov); } };
    draw(ctx, s.state, palette());
    sRef.current = s;
    observe(s);
    return () => { unobserve(s); sRef.current = null; };
  }, [game, seed]);

  const start = useCallback(() => {
    const s = sRef.current;
    if (!s || s.playing) return;
    s.state = create(game, W, H, seed + 1); s.state.ai = false; s.input = { ...IDLE }; s.playing = true; s.seen = { score: 0, over: false };
    setMode("play"); setScore(0); setOver(false);
    wake();
  }, [game, seed]);
  const stop = useCallback(() => {
    const s = sRef.current;
    if (!s || !s.playing) return;
    s.playing = false; s.input = { ...IDLE }; // the machine picks the game up where you left it
    setMode("demo");
    wake();
  }, []);
  const toggle = () => { if (sRef.current?.playing) stop(); else { start(); canvasRef.current?.focus({ preventScroll: true }); } };
  // Focus leaving the set (screen or its button) stops the game; between the two it keeps running so Stop stays reachable.
  const onBlur = (e: React.FocusEvent) => { if (e.relatedTarget === playRef.current) return; stop(); };
  const onButtonBlur = (e: React.FocusEvent) => { if (e.relatedTarget === canvasRef.current) return; stop(); };
  const key = (e: React.KeyboardEvent<HTMLCanvasElement>, down: boolean) => {
    const s = sRef.current;
    if (!s) return;
    if (e.key === "Escape") { if (down && s.playing) { stop(); playRef.current?.focus(); } return; }
    const k = KEYS[e.key];
    if (!k || !s.playing) return;
    e.preventDefault(); // the focused game owns its arrows and space; the wheel is never touched
    s.input[k] = down;
  };
  const onKeyDown = (e: React.KeyboardEvent<HTMLCanvasElement>) => key(e, true);
  const onKeyUp = (e: React.KeyboardEvent<HTMLCanvasElement>) => key(e, false);
  const onPointerDown = (e: React.PointerEvent<HTMLCanvasElement>) => {
    const s = sRef.current;
    if (!s || !s.playing) return; // the first tap focuses the screen, which starts the game
    const r = e.currentTarget.getBoundingClientRect();
    const leftHalf = e.clientX - r.left < r.width / 2;
    s.input.turn = leftHalf ? -1 : 1;
    if (game !== "snake") { s.input.left = leftHalf; s.input.right = !leftHalf; }
    s.input.action = true;
    try { e.currentTarget.setPointerCapture(e.pointerId); } catch {}
  };
  const release = () => { const s = sRef.current; if (s) { s.input.left = s.input.right = s.input.action = false; } };

  const status = mode === "play" ? (over ? "GAME OVER · SPACE RETRIES" : "PLAYING · ESC STOPS") : reduced ? `${name} · PRESS PLAY` : `DEMO · ${name}`;
  return (
    <div ref={rootRef} className="crt" data-live="off">
      <div className="crt-bezel">
        <div className="crt-screen">
          <canvas ref={canvasRef} width={W} height={H} tabIndex={0} role="application"
            aria-label={`${name}, the game on channel ${channel}. Arrow keys and space play it, Escape stops.`}
            onFocus={start} onBlur={onBlur} onKeyDown={onKeyDown} onKeyUp={onKeyUp}
            onPointerDown={onPointerDown} onPointerUp={release} onPointerCancel={release} />
          <span className="crt-scan" aria-hidden="true" />
          {mode === "play" && over ? <span className="crt-over" aria-hidden="true">GAME OVER</span> : null}
        </div>
        <div className="crt-panel">
          <span className="crt-led" aria-hidden="true" />
          <span className="crt-knob" aria-hidden="true" /><span className="crt-knob" aria-hidden="true" />
          <button ref={playRef} type="button" className="btn btn-sm crt-play" aria-pressed={mode === "play"} onClick={toggle} onBlur={onButtonBlur} title={mode === "play" ? "Stop" : `Play ${name}`}>
            {mode === "play" ? "■ Stop" : "▶ Play"}<span className="sr-only"> {name} on channel {channel}: {title}</span>
          </button>
        </div>
      </div>
      <p className="mono-label crt-status">
        <span>{status}</span>
        {mode === "play" ? <span className="crt-score">Score {score}</span> : null}
      </p>
      <p className="mono-label crt-help" aria-hidden="true">← → · space · tap · esc</p>
    </div>
  );
}
