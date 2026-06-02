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
