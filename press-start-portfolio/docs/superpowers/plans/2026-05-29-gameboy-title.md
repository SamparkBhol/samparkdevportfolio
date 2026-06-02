# Game Boy Title Screen + BLOX Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Replace the 3D-robot title screen with a life-size DMG-style handheld that boots up and plays a real falling-blocks game ("BLOX") on an authentic 160×144 dot-matrix LCD, controllable by its physical buttons and the keyboard.

**Architecture:** Pure, unit-tested game engine (`src/lib/blox.ts`) → a React hook (`useBlox`) that owns state, a gravity loop, input dispatch, and canvas drawing → presentational `Lcd` (160×144 canvas) and `GameBoy` (DMG shell + buttons + boot + cursor-tilt) → `TitleScreen` hosts the device + an "ENTER PORTFOLIO" scroll prompt.

**Tech Stack:** Next.js 15, React 19, TypeScript, Tailwind v4, Motion, HTML Canvas 2D. No new dependencies.

**Spec:** `docs/superpowers/specs/2026-05-29-gameboy-title-design.md`

---

## File Structure
```
src/lib/blox.ts                       # pure engine (CREATE)
src/lib/blox.test.ts                  # engine unit tests (CREATE)
src/hooks/useBlox.ts                  # state + loop + input + canvas draw (CREATE)
src/components/gameboy/Lcd.tsx         # 160x144 canvas + scanline/glare overlays (CREATE)
src/components/gameboy/GameBoy.tsx     # DMG shell, buttons, boot, tilt, a11y status (CREATE)
src/components/gameboy/GameBoy.test.tsx# render/interaction test (CREATE)
src/components/sections/TitleScreen.tsx# rewrite to host <GameBoy/> (MODIFY)
e2e/smoke.spec.ts                      # update "press start" → "enter portfolio" (MODIFY)
```
`src/components/three/HeroScene.tsx` + `HeroBoundary.tsx` are kept but no longer imported.

---

## Task 1: Pure game engine `blox.ts`

**Files:** Create `src/lib/blox.ts`, Test `src/lib/blox.test.ts`

- [ ] **Step 1: Write the failing test** — `src/lib/blox.test.ts`

```ts
import { describe, it, expect } from "vitest";
import {
  COLS, ROWS, SHAPES, rotateCW, rotateCCW, emptyBoard, createBag, spawn,
  collides, merge, clearLines, scoreForLines, gravityMs, levelFor, reduce, createInitialState,
} from "./blox";

describe("blox engine", () => {
  it("rotateCW turns a 3x3 T and is reversible with rotateCCW", () => {
    const t = SHAPES[3];
    expect(rotateCCW(rotateCW(t))).toEqual(t);
    expect(rotateCW(t).length).toBe(t[0].length);
  });
  it("createBag yields all 7 distinct pieces", () => {
    const bag = createBag(() => 0.5);
    expect([...bag].sort()).toEqual([1, 2, 3, 4, 5, 6, 7]);
  });
  it("collides detects walls, floor, and stacked cells", () => {
    const b = emptyBoard();
    expect(collides(b, SHAPES[2], -1, 0)).toBe(true);   // off left
    expect(collides(b, SHAPES[2], COLS - 1, 0)).toBe(true); // off right (O is 2 wide)
    expect(collides(b, SHAPES[2], 0, ROWS - 1)).toBe(true); // off floor
    b[5][0] = 1;
    expect(collides(b, SHAPES[2], 0, 4)).toBe(true);    // overlaps stack
    expect(collides(b, SHAPES[2], 4, 0)).toBe(false);   // free
  });
  it("clearLines removes full rows and compacts from the top", () => {
    const b = emptyBoard();
    b[ROWS - 1] = Array(COLS).fill(1);
    const { board, cleared } = clearLines(b);
    expect(cleared).toBe(1);
    expect(board.length).toBe(ROWS);
    expect(board[ROWS - 1].every((c) => c === 0)).toBe(true);
  });
  it("scoreForLines and gravityMs follow the tables", () => {
    expect(scoreForLines(0, 1)).toBe(0);
    expect(scoreForLines(4, 1)).toBe(1600); // 800 * (1+1)
    expect(levelFor(0)).toBe(1);
    expect(levelFor(25)).toBe(3);
    expect(gravityMs(1)).toBe(800);
    expect(gravityMs(20)).toBe(90); // clamped
  });
  it("reduce: start from ready spawns a piece and enters playing", () => {
    const s = reduce(createInitialState(), "start");
    expect(s.phase).toBe("playing");
    expect(s.piece).not.toBeNull();
  });
  it("reduce: hardDrop locks the piece and spawns the next", () => {
    let s = reduce(createInitialState(), "start");
    const before = s.piece;
    s = reduce(s, "hardDrop");
    expect(s.piece).not.toBe(before); // new piece
    expect(s.board.flat().some((c) => c !== 0)).toBe(true); // something locked
  });
  it("merge writes piece cells into the board", () => {
    const p = spawn(2); // O at top-center
    const b = merge(emptyBoard(), p);
    expect(b.flat().filter((c) => c !== 0).length).toBe(4);
  });
});
```

- [ ] **Step 2: Run → fails** — Run: `npm run test -- blox` → FAIL (`Cannot find module './blox'`).

- [ ] **Step 3: Write `src/lib/blox.ts`**

```ts
export const COLS = 10;
export const ROWS = 18;

export type Matrix = number[][];
export interface Piece { type: number; x: number; y: number; cells: Matrix }
export type Phase = "ready" | "playing" | "paused" | "gameover";
export interface BloxState {
  board: number[][];
  piece: Piece | null;
  queue: number[];
  score: number;
  lines: number;
  level: number;
  phase: Phase;
}
export type Action =
  | "left" | "right" | "softDrop" | "hardDrop"
  | "rotateCW" | "rotateCCW" | "tick" | "start";

// Each non-zero value is the piece's color index (= its type).
export const SHAPES: Record<number, Matrix> = {
  1: [[0, 0, 0, 0], [1, 1, 1, 1], [0, 0, 0, 0], [0, 0, 0, 0]], // I
  2: [[2, 2], [2, 2]],                                          // O
  3: [[0, 3, 0], [3, 3, 3], [0, 0, 0]],                         // T
  4: [[0, 4, 4], [4, 4, 0], [0, 0, 0]],                         // S
  5: [[5, 5, 0], [0, 5, 5], [0, 0, 0]],                         // Z
  6: [[6, 0, 0], [6, 6, 6], [0, 0, 0]],                         // J
  7: [[0, 0, 7], [7, 7, 7], [0, 0, 0]],                         // L
};

export function rotateCW(m: Matrix): Matrix {
  const n = m.length, w = m[0].length;
  const out: Matrix = Array.from({ length: w }, () => Array(n).fill(0));
  for (let r = 0; r < n; r++) for (let c = 0; c < w; c++) out[c][n - 1 - r] = m[r][c];
  return out;
}
export function rotateCCW(m: Matrix): Matrix {
  const n = m.length, w = m[0].length;
  const out: Matrix = Array.from({ length: w }, () => Array(n).fill(0));
  for (let r = 0; r < n; r++) for (let c = 0; c < w; c++) out[w - 1 - c][r] = m[r][c];
  return out;
}

export function emptyBoard(): number[][] {
  return Array.from({ length: ROWS }, () => Array(COLS).fill(0));
}

export function shuffle<T>(arr: T[], rng: () => number = Math.random): T[] {
  const a = arr.slice();
  for (let i = a.length - 1; i > 0; i--) {
    const j = Math.floor(rng() * (i + 1));
    [a[i], a[j]] = [a[j], a[i]];
  }
  return a;
}
export function createBag(rng: () => number = Math.random): number[] {
  return shuffle([1, 2, 3, 4, 5, 6, 7], rng);
}

export function spawn(type: number): Piece {
  const cells = SHAPES[type].map((r) => r.slice());
  return { type, x: Math.floor((COLS - cells[0].length) / 2), y: 0, cells };
}

export function collides(board: number[][], cells: Matrix, x: number, y: number): boolean {
  for (let r = 0; r < cells.length; r++) {
    for (let c = 0; c < cells[r].length; c++) {
      if (!cells[r][c]) continue;
      const bx = x + c, by = y + r;
      if (bx < 0 || bx >= COLS || by >= ROWS) return true;
      if (by >= 0 && board[by][bx]) return true;
    }
  }
  return false;
}

export function merge(board: number[][], p: Piece): number[][] {
  const out = board.map((row) => row.slice());
  for (let r = 0; r < p.cells.length; r++)
    for (let c = 0; c < p.cells[r].length; c++)
      if (p.cells[r][c]) {
        const by = p.y + r, bx = p.x + c;
        if (by >= 0 && by < ROWS && bx >= 0 && bx < COLS) out[by][bx] = p.cells[r][c];
      }
  return out;
}

export function clearLines(board: number[][]): { board: number[][]; cleared: number } {
  const kept = board.filter((row) => row.some((c) => c === 0));
  const cleared = ROWS - kept.length;
  const empties = Array.from({ length: cleared }, () => Array(COLS).fill(0));
  return { board: [...empties, ...kept], cleared };
}

export function scoreForLines(n: number, level: number): number {
  return [0, 100, 300, 500, 800][n] * (level + 1);
}
export function gravityMs(level: number): number {
  return Math.max(90, 800 - (level - 1) * 70);
}
export function levelFor(lines: number): number {
  return 1 + Math.floor(lines / 10);
}

export function createInitialState(): BloxState {
  return { board: emptyBoard(), piece: null, queue: [], score: 0, lines: 0, level: 1, phase: "ready" };
}

function ensureQueue(q: number[], rng: () => number): number[] {
  return q.length > 1 ? q : [...q, ...createBag(rng)];
}

function newGame(rng: () => number): BloxState {
  const q = ensureQueue([], rng);
  const [type, ...rest] = q;
  return {
    board: emptyBoard(), piece: spawn(type), queue: ensureQueue(rest, rng),
    score: 0, lines: 0, level: 1, phase: "playing",
  };
}

function lockAndNext(state: BloxState, rng: () => number): BloxState {
  if (!state.piece) return state;
  const merged = merge(state.board, state.piece);
  const { board, cleared } = clearLines(merged);
  const lines = state.lines + cleared;
  const score = state.score + scoreForLines(cleared, state.level);
  const q = ensureQueue(state.queue, rng);
  const [type, ...rest] = q;
  const piece = spawn(type);
  if (collides(board, piece.cells, piece.x, piece.y)) {
    return { ...state, board, piece: null, score, lines, level: levelFor(lines), phase: "gameover" };
  }
  return { board, piece, queue: ensureQueue(rest, rng), score, lines, level: levelFor(lines), phase: "playing" };
}

export function reduce(state: BloxState, action: Action, rng: () => number = Math.random): BloxState {
  if (action === "start") {
    if (state.phase === "playing") return { ...state, phase: "paused" };
    if (state.phase === "paused") return { ...state, phase: "playing" };
    return newGame(rng);
  }
  if (state.phase !== "playing" || !state.piece) return state;
  const p = state.piece;
  switch (action) {
    case "left":
      return collides(state.board, p.cells, p.x - 1, p.y) ? state : { ...state, piece: { ...p, x: p.x - 1 } };
    case "right":
      return collides(state.board, p.cells, p.x + 1, p.y) ? state : { ...state, piece: { ...p, x: p.x + 1 } };
    case "softDrop":
    case "tick": {
      if (!collides(state.board, p.cells, p.x, p.y + 1)) {
        const moved = { ...state, piece: { ...p, y: p.y + 1 } };
        return action === "softDrop" ? { ...moved, score: moved.score + 1 } : moved;
      }
      return lockAndNext(state, rng);
    }
    case "hardDrop": {
      let y = p.y;
      while (!collides(state.board, p.cells, p.x, y + 1)) y++;
      return lockAndNext({ ...state, piece: { ...p, y }, score: state.score + (y - p.y) * 2 }, rng);
    }
    case "rotateCW":
    case "rotateCCW": {
      const cells = action === "rotateCW" ? rotateCW(p.cells) : rotateCCW(p.cells);
      for (const dx of [0, -1, 1, -2, 2]) {
        if (!collides(state.board, cells, p.x + dx, p.y)) return { ...state, piece: { ...p, x: p.x + dx, cells } };
      }
      return state;
    }
    default:
      return state;
  }
}
```

- [ ] **Step 4: Run → passes** — Run: `npm run test -- blox` → PASS (8 tests).
- [ ] **Step 5: Commit**

```bash
git add src/lib/blox.ts src/lib/blox.test.ts
git commit -m "feat(blox): pure falling-blocks game engine + unit tests"
```

---

## Task 2: `useBlox` hook + canvas renderer

**Files:** Create `src/hooks/useBlox.ts`

- [ ] **Step 1: Write `src/hooks/useBlox.ts`**

```ts
"use client";
import { useEffect, useReducer, useRef, useState } from "react";
import { COLS, ROWS, createInitialState, gravityMs, reduce, type Action, type BloxState } from "@/lib/blox";

const PAL = { bg: "#9bbc0f", grid: "#8bac0f", mid: "#306230", dark: "#0f380f" };
const CELL = 7;
const OX = 4;
const OY = 8;

function drawCell(ctx: CanvasRenderingContext2D, cx: number, cy: number) {
  ctx.fillStyle = PAL.dark;
  ctx.fillRect(cx, cy, CELL, CELL);
  ctx.fillStyle = PAL.mid;
  ctx.fillRect(cx + 1, cy + 1, CELL - 3, CELL - 3);
}

function drawMini(ctx: CanvasRenderingContext2D, cells: number[][], px: number, py: number, size = 5) {
  for (let r = 0; r < cells.length; r++)
    for (let c = 0; c < cells[r].length; c++)
      if (cells[r][c]) {
        ctx.fillStyle = PAL.dark;
        ctx.fillRect(px + c * size, py + r * size, size, size);
      }
}

export function drawBlox(ctx: CanvasRenderingContext2D, state: BloxState, best: number, next?: number[][]) {
  ctx.fillStyle = PAL.bg;
  ctx.fillRect(0, 0, 160, 144);

  const pw = COLS * CELL, ph = ROWS * CELL;
  // playfield well
  ctx.fillStyle = PAL.grid;
  ctx.fillRect(OX - 1, OY - 1, pw + 2, ph + 2);
  ctx.fillStyle = PAL.bg;
  ctx.fillRect(OX, OY, pw, ph);

  for (let r = 0; r < ROWS; r++)
    for (let c = 0; c < COLS; c++)
      if (state.board[r][c]) drawCell(ctx, OX + c * CELL, OY + r * CELL);

  if (state.piece && state.phase !== "gameover") {
    const p = state.piece;
    for (let r = 0; r < p.cells.length; r++)
      for (let c = 0; c < p.cells[r].length; c++)
        if (p.cells[r][c]) drawCell(ctx, OX + (p.x + c) * CELL, OY + (p.y + r) * CELL);
  }

  // side panel
  const panelX = OX + pw + 6;
  ctx.fillStyle = PAL.dark;
  ctx.textBaseline = "top";
  ctx.font = "8px monospace";
  ctx.fillText("NEXT", panelX, OY);
  if (next) drawMini(ctx, next, panelX, OY + 12);
  ctx.fillText("SCORE", panelX, OY + 44);
  ctx.fillText(String(state.score).padStart(6, "0"), panelX, OY + 54);
  ctx.fillText("LINES", panelX, OY + 72);
  ctx.fillText(String(state.lines), panelX, OY + 82);
  ctx.fillText("LV", panelX, OY + 100);
  ctx.fillText(String(state.level), panelX, OY + 110);
  ctx.fillText("BEST", panelX, OY + 122);
  ctx.fillText(String(best).padStart(6, "0"), panelX, OY + 132);

  // overlays
  const overlay = (lines: string[]) => {
    ctx.fillStyle = "rgba(15,56,15,0.82)";
    ctx.fillRect(OX, OY + ph / 2 - 22, pw, 44);
    ctx.fillStyle = PAL.bg;
    ctx.textAlign = "center";
    ctx.font = "9px monospace";
    lines.forEach((l, i) => ctx.fillText(l, OX + pw / 2, OY + ph / 2 - 14 + i * 12));
    ctx.textAlign = "left";
  };
  if (state.phase === "ready") overlay(["PLAYER ONE", "PRESS START"]);
  else if (state.phase === "paused") overlay(["PAUSED"]);
  else if (state.phase === "gameover") overlay(["GAME OVER", "PRESS START"]);
}

export function useBlox(enabled: boolean) {
  const [state, dispatch] = useReducer(
    (s: BloxState, a: Action) => reduce(s, a),
    undefined,
    createInitialState,
  );
  const canvasRef = useRef<HTMLCanvasElement | null>(null);
  const [best, setBest] = useState(0);

  useEffect(() => {
    setBest(Number(localStorage.getItem("blox.best") || 0));
  }, []);
  useEffect(() => {
    if (state.score > best) {
      setBest(state.score);
      localStorage.setItem("blox.best", String(state.score));
    }
  }, [state.score, best]);

  // gravity
  useEffect(() => {
    if (state.phase !== "playing") return;
    const id = setInterval(() => dispatch("tick"), gravityMs(state.level));
    return () => clearInterval(id);
  }, [state.phase, state.level]);

  // keyboard (only when on-screen so arrow-scroll works elsewhere)
  useEffect(() => {
    if (!enabled) return;
    const map: Record<string, Action> = {
      ArrowLeft: "left", ArrowRight: "right", ArrowDown: "softDrop", ArrowUp: "rotateCW",
      x: "rotateCW", X: "rotateCW", z: "rotateCCW", Z: "rotateCCW", " ": "hardDrop", Enter: "start",
    };
    const onKey = (e: KeyboardEvent) => {
      const a = map[e.key];
      if (!a) return;
      e.preventDefault();
      dispatch(a);
    };
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, [enabled]);

  // draw
  useEffect(() => {
    const cv = canvasRef.current;
    const ctx = cv?.getContext("2d");
    if (ctx) drawBlox(ctx, state, best, state.queue[0] !== undefined ? undefined : undefined);
  }, [state, best]);

  return { state, dispatch, canvasRef, best };
}
```

> Note: the `next` preview uses the upcoming type's shape. Replace the draw line with the real next shape lookup:
> in the draw effect, compute `const nextCells = state.queue[0] ? SHAPES[state.queue[0]] : undefined;` and pass it. Update the import to include `SHAPES`.

- [ ] **Step 2: Apply the next-preview fix** — edit the draw effect:

```ts
import { COLS, ROWS, SHAPES, createInitialState, gravityMs, reduce, type Action, type BloxState } from "@/lib/blox";
// ...
  useEffect(() => {
    const cv = canvasRef.current;
    const ctx = cv?.getContext("2d");
    if (!ctx) return;
    const nextCells = state.queue[0] ? SHAPES[state.queue[0]] : undefined;
    drawBlox(ctx, state, best, nextCells);
  }, [state, best]);
```

- [ ] **Step 3: Typecheck** — Run: `npm run typecheck` → no errors.
- [ ] **Step 4: Commit**

```bash
git add src/hooks/useBlox.ts
git commit -m "feat(blox): useBlox hook — state, gravity loop, input, canvas renderer"
```

---

## Task 3: `Lcd` component

**Files:** Create `src/components/gameboy/Lcd.tsx`

- [ ] **Step 1: Write `src/components/gameboy/Lcd.tsx`**

```tsx
"use client";
import { forwardRef } from "react";

export const Lcd = forwardRef<HTMLCanvasElement, { className?: string }>(function Lcd(
  { className = "" },
  ref,
) {
  return (
    <div className={`relative ${className}`}>
      <canvas
        ref={ref}
        width={160}
        height={144}
        aria-label="Game screen"
        className="block h-full w-full [image-rendering:pixelated]"
      />
      {/* scanlines */}
      <div
        aria-hidden
        className="pointer-events-none absolute inset-0"
        style={{ background: "repeating-linear-gradient(0deg, rgba(0,0,0,0.14) 0 1px, transparent 1px 3px)" }}
      />
      {/* glass glare */}
      <div aria-hidden className="pointer-events-none absolute inset-0 bg-gradient-to-br from-white/25 via-transparent to-transparent" />
      {/* inner vignette */}
      <div aria-hidden className="pointer-events-none absolute inset-0 shadow-[inset_0_0_18px_rgba(0,0,0,0.45)]" />
    </div>
  );
});
```

- [ ] **Step 2: Typecheck + commit**

Run: `npm run typecheck` → no errors.
```bash
git add src/components/gameboy/Lcd.tsx
git commit -m "feat(gameboy): LCD canvas with scanline/glare/vignette overlays"
```

---

## Task 4: `GameBoy` shell + controls + boot + tilt

**Files:** Create `src/components/gameboy/GameBoy.tsx`, Test `src/components/gameboy/GameBoy.test.tsx`

- [ ] **Step 1: Write `src/components/gameboy/GameBoy.tsx`**

```tsx
"use client";
import { useEffect, useRef, useState } from "react";
import { motion, AnimatePresence } from "motion/react";
import { useBlox } from "@/hooks/useBlox";
import { useInView } from "@/hooks/useInView";
import { useSound } from "@/hooks/useSound";
import { Lcd } from "./Lcd";
import { cn } from "@/lib/cn";
import type { Action } from "@/lib/blox";

const PHASE_LABEL: Record<string, string> = {
  ready: "READY", playing: "PLAYING", paused: "PAUSED", gameover: "GAME OVER",
};

const dpadCls =
  "absolute grid place-items-center bg-[#1c1c1c] text-[#9bbc0f] font-pixel text-[8px] " +
  "active:translate-y-[1px] active:brightness-110 transition";
const abCls =
  "h-12 w-12 rounded-full bg-[#7a1f3d] text-paper font-pixel text-sm nb-border nb-shadow " +
  "grid place-items-center active:translate-y-[2px] active:shadow-none transition";
const ssCls =
  "h-4 w-12 rounded-full bg-[#5a5a52] text-[#2a2a2a] font-pixel text-[7px] grid place-items-center " +
  "-rotate-[20deg] nb-border active:translate-y-[1px] transition";

export function GameBoy() {
  const { ref, inView } = useInView<HTMLDivElement>({ threshold: 0.25 });
  const { state, dispatch, canvasRef } = useBlox(inView);
  const { play } = useSound();
  const [reduced, setReduced] = useState(false);
  const [booted, setBooted] = useState(false);
  const [tilt, setTilt] = useState({ rx: 0, ry: 0 });

  useEffect(() => {
    setReduced(window.matchMedia?.("(prefers-reduced-motion: reduce)").matches ?? false);
  }, []);

  useEffect(() => {
    if (!inView || booted) return;
    if (reduced) { setBooted(true); return; }
    const t = setTimeout(() => setBooted(true), 1700);
    return () => clearTimeout(t);
  }, [inView, booted, reduced]);

  useEffect(() => {
    if (reduced) return;
    const onMove = (e: MouseEvent) => {
      const el = ref.current;
      if (!el) return;
      const r = el.getBoundingClientRect();
      const cx = r.left + r.width / 2, cy = r.top + r.height / 2;
      setTilt({
        ry: Math.max(-8, Math.min(8, ((e.clientX - cx) / r.width) * 16)),
        rx: Math.max(-6, Math.min(6, -((e.clientY - cy) / r.height) * 12)),
      });
    };
    window.addEventListener("mousemove", onMove, { passive: true });
    return () => window.removeEventListener("mousemove", onMove);
  }, [reduced, ref]);

  const press = (a: Action) => () => { play("select"); dispatch(a); };

  return (
    <div ref={ref} className="select-none" style={{ perspective: 900 }}>
      <motion.div
        animate={{ rotateX: tilt.rx, rotateY: tilt.ry, y: reduced ? 0 : [0, -4, 0] }}
        transition={{
          rotateX: { type: "spring", stiffness: 120, damping: 14 },
          rotateY: { type: "spring", stiffness: 120, damping: 14 },
          y: { repeat: Infinity, duration: 5, ease: "easeInOut" },
        }}
        style={{ transformStyle: "preserve-3d" }}
        className="relative w-[300px] max-w-[86vw] rounded-[16px_16px_56px_16px] bg-[#c9c9bd] nb-border nb-shadow-lg p-5 pb-7"
      >
        {/* top strip */}
        <div className="mb-2 flex items-center gap-2">
          <span className={cn("h-2 w-2 rounded-full", inView ? "bg-pop-red" : "bg-pop-red/40")} aria-hidden />
          <span className="font-pixel text-[7px] text-ink/60">BATTERY</span>
          <span className="ml-auto font-pixel text-[8px] text-ink/70">PLAYER ONE · PB-01</span>
        </div>

        {/* screen */}
        <div className="rounded-[10px] bg-[#4a4a44] p-3 pb-4 nb-border">
          <p className="mb-1 text-center font-pixel text-[6px] text-[#c9c9bd]">DOT MATRIX WITH STEREO SOUND</p>
          <div className="relative aspect-[160/144] overflow-hidden rounded-sm ring-2 ring-black/70">
            <Lcd ref={canvasRef} className="h-full w-full" />
            <AnimatePresence>
              {!booted && (
                <motion.div
                  initial={{ y: -80, opacity: 0 }}
                  animate={{ y: 0, opacity: 1 }}
                  exit={{ opacity: 0, transition: { duration: 0.3 } }}
                  transition={{ type: "spring", stiffness: 140, damping: 12 }}
                  className="absolute inset-0 grid place-items-center bg-[#9bbc0f]"
                >
                  <span className="font-pixel text-[11px] text-[#0f380f]">PLAYER ONE™</span>
                </motion.div>
              )}
            </AnimatePresence>
          </div>
        </div>

        <span className="sr-only" aria-live="polite">
          Status: {PHASE_LABEL[state.phase]}. Score {state.score}, level {state.level}.
        </span>

        {/* controls */}
        <div className="mt-5 flex items-center justify-between">
          {/* D-pad */}
          <div className="relative h-[78px] w-[78px]">
            <div aria-hidden className="absolute left-[27px] top-0 h-[78px] w-[24px] rounded bg-[#1c1c1c]" />
            <div aria-hidden className="absolute left-0 top-[27px] h-[24px] w-[78px] rounded bg-[#1c1c1c]" />
            <button aria-label="Rotate clockwise (Up)" onClick={press("rotateCW")} className={cn(dpadCls, "left-[27px] top-0 h-[26px] w-[24px]")}>▲</button>
            <button aria-label="Soft drop (Down)" onClick={press("softDrop")} className={cn(dpadCls, "left-[27px] top-[52px] h-[26px] w-[24px]")}>▼</button>
            <button aria-label="Move left" onClick={press("left")} className={cn(dpadCls, "left-0 top-[27px] h-[24px] w-[26px]")}>◀</button>
            <button aria-label="Move right" onClick={press("right")} className={cn(dpadCls, "left-[52px] top-[27px] h-[24px] w-[26px]")}>▶</button>
          </div>
          {/* A / B */}
          <div className="flex -rotate-[18deg] gap-3">
            <button aria-label="Rotate counter-clockwise (B)" onClick={press("rotateCCW")} className={abCls}>B</button>
            <button aria-label="Rotate clockwise (A)" onClick={press("rotateCW")} className={abCls}>A</button>
          </div>
        </div>

        {/* start / select */}
        <div className="mt-5 flex justify-center gap-4">
          <button aria-label="Hard drop (Select)" onClick={press("hardDrop")} className={ssCls}>SELECT</button>
          <button aria-label="Start, pause or restart" onClick={press("start")} className={ssCls}>START</button>
        </div>

        {/* speaker grille */}
        <div
          aria-hidden
          className="mt-4 ml-auto h-7 w-16 -rotate-[25deg] rounded"
          style={{ background: "radial-gradient(circle, rgba(0,0,0,0.4) 1px, transparent 1.6px)", backgroundSize: "6px 6px" }}
        />
      </motion.div>
    </div>
  );
}
```

- [ ] **Step 2: Write `src/components/gameboy/GameBoy.test.tsx`**

```tsx
import { describe, it, expect } from "vitest";
import { render, screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { GameBoy } from "./GameBoy";

describe("GameBoy", () => {
  it("renders the device with controls and the LCD", () => {
    render(<GameBoy />);
    expect(screen.getByLabelText("Move left")).toBeInTheDocument();
    expect(screen.getByLabelText("Rotate clockwise (A)")).toBeInTheDocument();
    expect(screen.getByLabelText("Start, pause or restart")).toBeInTheDocument();
    expect(screen.getByLabelText("Game screen")).toBeInTheDocument();
  });

  it("starts the game when START is pressed", async () => {
    const user = userEvent.setup();
    render(<GameBoy />);
    expect(screen.getByText(/Status: READY/i)).toBeInTheDocument();
    await user.click(screen.getByLabelText("Start, pause or restart"));
    expect(screen.getByText(/Status: PLAYING/i)).toBeInTheDocument();
  });
});
```

- [ ] **Step 3: Run → PASS** — Run: `npm run test -- GameBoy` → PASS (2 tests).
- [ ] **Step 4: Commit**

```bash
git add src/components/gameboy/GameBoy.tsx src/components/gameboy/GameBoy.test.tsx
git commit -m "feat(gameboy): DMG shell, working buttons, boot sequence, cursor-tilt, a11y status"
```

---

## Task 5: Rewrite `TitleScreen` to host the Game Boy

**Files:** Modify `src/components/sections/TitleScreen.tsx`

- [ ] **Step 1: Replace the entire file** `src/components/sections/TitleScreen.tsx`

```tsx
"use client";
import { motion } from "motion/react";
import { portfolio } from "@/content/portfolio";
import { ArcadeButton } from "@/components/ui/ArcadeButton";
import { Marquee } from "@/components/ui/Marquee";
import { GameBoy } from "@/components/gameboy/GameBoy";

export function TitleScreen() {
  const { profile } = portfolio;
  return (
    <section id="title" aria-label="Title screen" className="relative min-h-screen w-full overflow-hidden px-5 py-24 md:px-12">
      <div className="relative z-10 mx-auto grid min-h-[78vh] max-w-6xl items-center gap-10 md:grid-cols-2">
        <div>
          <motion.h1
            initial={{ scale: 0.85, opacity: 0 }}
            animate={{ scale: 1, opacity: 1 }}
            transition={{ type: "spring", stiffness: 200, damping: 14 }}
            className="font-comic text-5xl md:text-7xl text-pop-yellow [-webkit-text-stroke:2px_black] drop-shadow-[6px_6px_0_#000]"
          >
            {profile.name.toUpperCase()}
          </motion.h1>
          <p className="mt-4 font-pixel text-xs md:text-sm text-pop-cyan">{profile.title}</p>
          <p className="mt-4 max-w-md font-body text-paper/90">{profile.tagline}</p>
          <div className="mt-8">
            <ArcadeButton href="#about" color="red" className="text-base animate-pulse">▼ ENTER PORTFOLIO</ArcadeButton>
          </div>
          <p className="mt-4 font-pixel text-[10px] text-paper/60">
            ↳ playable: press <span className="text-pop-yellow">START</span> · move with the D-pad or ← → ↓ · rotate Z/X
          </p>
        </div>
        <div className="grid place-items-center">
          <GameBoy />
        </div>
      </div>
      <div className="absolute bottom-0 inset-x-0 z-10">
        <Marquee items={["INSERT COIN", "1 PLAYER", "HIGH SCORE: 999999", "PRESS START", ...profile.socials.map((s) => s.label)]} />
      </div>
    </section>
  );
}
```

- [ ] **Step 2: Build to verify the title compiles without the 3D import**

Run: `npm run build`
Expected: success; `/` builds; `RobotExpressive` no longer in the title chunk.

- [ ] **Step 3: Commit**

```bash
git add src/components/sections/TitleScreen.tsx
git commit -m "feat: title screen is now the playable Game Boy (BLOX) + ENTER PORTFOLIO"
```

---

## Task 6: Update the e2e smoke test

**Files:** Modify `e2e/smoke.spec.ts`

- [ ] **Step 1: Update the home assertion** — replace the PRESS START check with the new enter control.

In `e2e/smoke.spec.ts`, change:
```ts
  await expect(page.getByRole("link", { name: /press start/i })).toBeVisible();
```
to:
```ts
  await expect(page.getByRole("link", { name: /enter portfolio/i })).toBeVisible();
```

- [ ] **Step 2: Run e2e**

Run: `npm run test:e2e`
Expected: all 3 tests pass (home loads + all stages, menu opens, 404).

- [ ] **Step 3: Commit**

```bash
git add e2e/smoke.spec.ts
git commit -m "test(e2e): assert ENTER PORTFOLIO control on the new title"
```

---

## Task 7: Full green gate

- [ ] **Step 1:** `npm run typecheck` → no errors.
- [ ] **Step 2:** `npm run test` → all unit tests pass (blox 8 + GameBoy 2 + existing).
- [ ] **Step 3:** `npm run build` → success.
- [ ] **Step 4:** `npm run test:e2e` → 3 pass.
- [ ] **Step 5:** Commit any fixes: `git commit -am "chore: green gate for Game Boy title"`.

---

## Self-Review (against the spec)

**1. Spec coverage:**
- Game "BLOX" (7 pieces, rotate/kick, soft+hard drop, line clears, score/level/lines, next, best, states) → Task 1 (`blox.ts`) + Task 2 (loop/draw). ✓
- Controls (D-pad/A/B/START/SELECT + keyboard map) → Task 2 (keys) + Task 4 (buttons). ✓
- DMG-gray shell, LCD 160×144 4-green, scanlines/glare, boot, cursor-tilt, power LED → Tasks 3–4. ✓
- Title replaces robot; "ENTER PORTFOLIO" scroll prompt → Task 5. ✓
- Reduced-motion (skip boot/tilt/float) → Task 4 (`reduced`). ✓
- localStorage best → Task 2. ✓
- Arrow capture only in view → Task 2 (`enabled` from `useInView` in Task 4). ✓
- Tests (unit blox, render GameBoy, e2e) → Tasks 1, 4, 6. ✓
- No new deps → confirmed (canvas + Motion only). ✓

**2. Placeholder scan:** none — all steps contain real code/commands. (Task 2 includes an explicit follow-up edit for the next-preview; both the initial and corrected `drawBlox` call are shown.)

**3. Type consistency:** `Action`, `BloxState`, `Piece`, `SHAPES`, `reduce`, `createInitialState`, `gravityMs`, `COLS/ROWS` are defined in Task 1 and imported with the same names in Tasks 2/4. `useBlox` returns `{ state, dispatch, canvasRef, best }`; `GameBoy` consumes exactly those. `Lcd` is `forwardRef<HTMLCanvasElement>`; `canvasRef` matches. ✓

---

## Execution note
Tasks are sequential: 1 (engine) → 2 (hook, imports engine) → 3 (LCD) → 4 (shell, imports hook+LCD) → 5 (title, imports shell) → 6 (e2e) → 7 (gate). Not parallelizable (each builds on the prior).
