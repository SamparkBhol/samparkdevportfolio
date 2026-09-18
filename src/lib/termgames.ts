import { resume } from "@/content/resume";

/* ============================================================================
   Four games that run inside the terminal, as pure functions:
   create → (steer | submit | tick | quit) → render → string[].
   No DOM, no timers, no Math.random: every state carries its own seed, so a
   game replays the same way twice and a test can drive one by hand. The
   Terminal component is the runner; it owns the interval and the keys.
   The only résumé fact used here is the hangman word list (skill names).
   ========================================================================== */

export type GameName = "snake" | "hangman" | "tictactoe" | "guess";
export type Dir = "up" | "down" | "left" | "right";

export interface GameInfo { name: GameName; title: string; blurb: string; keys: string }
export const GAMES: readonly GameInfo[] = [
  { name: "snake", title: "SNAKE", blurb: "the arena is small and the walls are honest", keys: "arrows or wasd steer · esc quits" },
  { name: "hangman", title: "HANGMAN", blurb: "a word from my inventory · six misses and it's over", keys: "type a letter or the whole word, enter · esc quits" },
  { name: "tictactoe", title: "TIC-TAC-TOE", blurb: "you are X · I have never lost · a draw counts", keys: "type a square, one to nine, enter · esc quits" },
  { name: "guess", title: "GUESS", blurb: "one to one hundred · I say warmer or colder", keys: "type a number, enter · esc quits" },
];
export const isGameName = (s: string): s is GameName => GAMES.some((g) => g.name === s);
export const gameInfo = (name: GameName): GameInfo => GAMES.find((g) => g.name === name) as GameInfo;

/* ---------- shared ---------- */
interface Base {
  over: boolean;
  won: boolean;
  /** The seed; every random draw advances it on the state it was given. */
  rng: number;
  /** The last thing the game said, for the live region. */
  msg: string;
}
interface Cell { x: number; y: number }

/** mulberry32 on the state's own seed. Mutates `s.rng`, so call it on a fresh copy only. */
function rand(s: { rng: number }): number {
  s.rng = (s.rng + 0x6d2b79f5) | 0;
  let a = s.rng;
  a = Math.imul(a ^ (a >>> 15), a | 1);
  a ^= a + Math.imul(a ^ (a >>> 7), a | 61);
  return ((a ^ (a >>> 14)) >>> 0) / 4294967296;
}
const pick = <T,>(s: { rng: number }, xs: readonly T[]): T => xs[Math.floor(rand(s) * xs.length)];
const plural = (n: number, one: string, many: string) => `${n} ${n === 1 ? one : many}`;

/* ============================================================================
   SNAKE · a 24 × 10 arena. Walls kill; the score is apples eaten.
   ========================================================================== */
export const SNAKE_W = 24;
export const SNAKE_H = 10;
const DELTA: Record<Dir, Cell> = { up: { x: 0, y: -1 }, down: { x: 0, y: 1 }, left: { x: -1, y: 0 }, right: { x: 1, y: 0 } };
const OPPOSITE: Record<Dir, Dir> = { up: "down", down: "up", left: "right", right: "left" };

export interface SnakeState extends Base {
  kind: "snake";
  /** Head first. */
  body: Cell[];
  /** The direction the last tick moved in; a reversal against it is ignored. */
  dir: Dir;
  /** The direction the next tick will move in. */
  next: Dir;
  apple: Cell;
  score: number;
}

function placeApple(s: SnakeState): Cell {
  const free: Cell[] = [];
  for (let y = 0; y < SNAKE_H; y++) for (let x = 0; x < SNAKE_W; x++) if (!s.body.some((c) => c.x === x && c.y === y)) free.push({ x, y });
  return free.length ? pick(s, free) : { x: -1, y: -1 };
}

function createSnake(seed: number): SnakeState {
  const y = Math.floor(SNAKE_H / 2);
  const x = Math.floor(SNAKE_W / 2);
  const s: SnakeState = { kind: "snake", over: false, won: false, rng: seed | 0, msg: "", body: [{ x, y }, { x: x - 1, y }, { x: x - 2, y }], dir: "right", next: "right", apple: { x: -1, y: -1 }, score: 0 };
  s.apple = placeApple(s);
  return s;
}

/** Queue a turn. A reversal into the body is ignored; the next tick applies the turn. */
export function steer(s: SnakeState, dir: Dir): SnakeState {
  if (s.over || dir === OPPOSITE[s.dir] || dir === s.next) return s;
  return { ...s, next: dir };
}

/** One step. Called by the runner every tick while the game runs. */
export function tick(s: GameState): GameState {
  if (s.kind !== "snake" || s.over) return s;
  const n: SnakeState = { ...s, dir: s.next };
  const d = DELTA[n.dir];
  const head = { x: n.body[0].x + d.x, y: n.body[0].y + d.y };
  if (head.x < 0 || head.x >= SNAKE_W || head.y < 0 || head.y >= SNAKE_H) return { ...n, over: true, msg: `hit the wall · ${plural(n.score, "apple", "apples")}` };
  const eats = head.x === n.apple.x && head.y === n.apple.y;
  const tail = eats ? n.body : n.body.slice(0, -1);
  if (tail.some((c) => c.x === head.x && c.y === head.y)) return { ...n, over: true, msg: `bit your own tail · ${plural(n.score, "apple", "apples")}` };
  n.body = [head, ...tail];
  if (eats) {
    n.score += 1;
    n.apple = placeApple(n);
    if (n.apple.x < 0) return { ...n, over: true, won: true, msg: `the arena is full · ${plural(n.score, "apple", "apples")}` };
    n.msg = `${plural(n.score, "apple", "apples")}`;
  }
  return n;
}

function renderSnake(s: SnakeState): string[] {
  const grid: string[][] = Array.from({ length: SNAKE_H }, () => Array<string>(SNAKE_W).fill(" "));
  if (s.apple.x >= 0) grid[s.apple.y][s.apple.x] = "*";
  s.body.forEach((c, i) => { grid[c.y][c.x] = i === 0 ? "@" : "o"; });
  const edge = `+${"-".repeat(SNAKE_W)}+`;
  return [
    ` SNAKE · score ${s.score}${s.over ? (s.won ? " · YOU WIN" : " · GAME OVER") : ""}`,
    edge,
    ...grid.map((row) => `|${row.join("")}|`),
    edge,
    s.over ? ` ${s.msg}` : " arrows or wasd steer · esc quits",
  ];
}

/* ============================================================================
   HANGMAN · a word from the inventory, six misses.
   ========================================================================== */
export const HANGMAN_MISSES = 6;
interface HangWord { word: string; slot: string; group: string }
/** Skill names spelt with letters, spaces, dots, hyphens or slashes only, and at least four letters long. */
export const HANGMAN_WORDS: readonly HangWord[] = resume.skills.flatMap((g) =>
  g.items.filter((i) => /^[A-Za-z][A-Za-z .\-/]*$/.test(i.name) && i.name.replace(/[^a-z]/gi, "").length >= 4).map((i) => ({ word: i.name, slot: g.slot, group: g.group })),
);

export interface HangmanState extends Base {
  kind: "hangman";
  word: string;
  slot: string;
  group: string;
  /** Lower-case letters tried, in order. */
  tried: string[];
  misses: number;
}

function createHangman(seed: number): HangmanState {
  const s = { rng: seed | 0 };
  const w = pick(s, HANGMAN_WORDS);
  return { kind: "hangman", over: false, won: false, rng: s.rng, msg: "", word: w.word, slot: w.slot, group: w.group, tried: [], misses: 0 };
}

const solved = (s: HangmanState) => [...s.word.toLowerCase()].every((ch) => !/[a-z]/.test(ch) || s.tried.includes(ch));
const masked = (s: HangmanState) => [...s.word].map((ch) => (/[a-z]/i.test(ch) ? (s.over || s.tried.includes(ch.toLowerCase()) ? ch : "_") : ch)).join(" ");

function submitHangman(s: HangmanState, text: string): HangmanState {
  const t = text.trim().toLowerCase();
  if (!t) return { ...s, msg: "type a letter" };
  if (t.length > 1) {
    if (t === s.word.toLowerCase()) return { ...s, over: true, won: true, msg: `${s.word} · solved with ${plural(s.misses, "miss", "misses")}` };
    const misses = s.misses + 1;
    if (misses >= HANGMAN_MISSES) return { ...s, misses, over: true, msg: `hanged · the word was ${s.word}` };
    return { ...s, misses, msg: `${text.trim()} is not it · ${plural(HANGMAN_MISSES - misses, "miss", "misses")} left` };
  }
  if (!/[a-z]/.test(t)) return { ...s, msg: "letters only" };
  if (s.tried.includes(t)) return { ...s, msg: `${t} · already tried` };
  const n: HangmanState = { ...s, tried: [...s.tried, t] };
  if (n.word.toLowerCase().includes(t)) {
    if (solved(n)) return { ...n, over: true, won: true, msg: `${n.word} · solved with ${plural(n.misses, "miss", "misses")}` };
    return { ...n, msg: `${t} · yes` };
  }
  n.misses += 1;
  if (n.misses >= HANGMAN_MISSES) return { ...n, over: true, msg: `hanged · the word was ${n.word}` };
  return { ...n, msg: `${t} · no · ${plural(HANGMAN_MISSES - n.misses, "miss", "misses")} left` };
}

const gallows = (m: number) => [
  "  +---+",
  "  |   |",
  `  ${m > 0 ? "O" : " "}   |`,
  ` ${m > 2 ? "/" : " "}${m > 1 ? "|" : " "}${m > 3 ? "\\" : " "}  |`,
  ` ${m > 4 ? "/" : " "} ${m > 5 ? "\\" : " "}  |`,
  "      |",
  "=========",
];

function renderHangman(s: HangmanState): string[] {
  return [
    ` HANGMAN · a ${s.slot} item · ${s.group}`,
    ...gallows(s.misses),
    "",
    ` ${masked(s)}`,
    ` tried: ${s.tried.length ? s.tried.join(" ") : "nothing yet"} · misses: ${s.misses} of ${HANGMAN_MISSES}`,
    s.over ? ` ${s.won ? "YOU WIN" : "GAME OVER"} · ${s.msg}` : ` ${s.msg || "type a letter or the whole word, then enter · esc quits"}`,
  ];
}

/* ============================================================================
   TIC-TAC-TOE · you are X and move first; the terminal plays O by minimax.
   ========================================================================== */
export type Mark = "X" | "O" | " ";
const LINES = [[0, 1, 2], [3, 4, 5], [6, 7, 8], [0, 3, 6], [1, 4, 7], [2, 5, 8], [0, 4, 8], [2, 4, 6]] as const;

export interface TttState extends Base { kind: "tictactoe"; board: Mark[] }

function createTtt(seed: number): TttState {
  return { kind: "tictactoe", over: false, won: false, rng: seed | 0, msg: "", board: Array<Mark>(9).fill(" ") };
}

const winnerOf = (b: Mark[]): Mark => { for (const [a, c, d] of LINES) if (b[a] !== " " && b[a] === b[c] && b[a] === b[d]) return b[a]; return " "; };
const full = (b: Mark[]) => b.every((m) => m !== " ");

/** Score from O's side: a win is worth more the sooner it comes; a loss less the later it comes. */
function minimax(b: Mark[], turn: Mark, depth: number): number {
  const w = winnerOf(b);
  if (w === "O") return 10 - depth;
  if (w === "X") return depth - 10;
  if (full(b)) return 0;
  let best = turn === "O" ? -Infinity : Infinity;
  for (let i = 0; i < 9; i++) {
    if (b[i] !== " ") continue;
    b[i] = turn;
    const v = minimax(b, turn === "O" ? "X" : "O", depth + 1);
    b[i] = " ";
    best = turn === "O" ? Math.max(best, v) : Math.min(best, v);
  }
  return best;
}

/** The best square for O; ties break on the seed so two games do not play out the same. */
function replyO(s: TttState): number {
  const b = s.board.slice();
  let best = -Infinity;
  let picks: number[] = [];
  for (let i = 0; i < 9; i++) {
    if (b[i] !== " ") continue;
    b[i] = "O";
    const v = minimax(b, "X", 1);
    b[i] = " ";
    if (v > best) { best = v; picks = [i]; } else if (v === best) picks.push(i);
  }
  return pick(s, picks);
}

function submitTtt(s: TttState, text: string): TttState {
  const n = Number(text.trim());
  if (!Number.isInteger(n) || n < 1 || n > 9) return { ...s, msg: "type a square, one to nine" };
  if (s.board[n - 1] !== " ") return { ...s, msg: `square ${n} is taken` };
  const st: TttState = { ...s, board: s.board.slice() };
  st.board[n - 1] = "X";
  if (winnerOf(st.board) === "X") return { ...st, over: true, won: true, msg: "you won · I demand a rematch" };
  if (full(st.board)) return { ...st, over: true, msg: "a draw · the classic ending" };
  const o = replyO(st);
  st.board[o] = "O";
  if (winnerOf(st.board) === "O") return { ...st, over: true, msg: `O takes ${o + 1} · the terminal keeps its record` };
  if (full(st.board)) return { ...st, over: true, msg: "a draw · the classic ending" };
  return { ...st, msg: `you took ${n} · I took ${o + 1}` };
}

function renderTtt(s: TttState): string[] {
  const c = (i: number) => (s.board[i] === " " ? String(i + 1) : s.board[i]);
  const row = (a: number) => `  ${c(a)} | ${c(a + 1)} | ${c(a + 2)}`;
  return [
    " TIC-TAC-TOE · you are X · I am O",
    row(0),
    " ---+---+---",
    row(3),
    " ---+---+---",
    row(6),
    s.over ? ` ${s.won ? "YOU WIN" : "GAME OVER"} · ${s.msg}` : ` ${s.msg || "type a square and press enter · esc quits"}`,
  ];
}

/* ============================================================================
   GUESS · a number from one to one hundred, warmer or colder.
   ========================================================================== */
export const GUESS_MAX = 100;
interface Guess { n: number; heat: string; trend: string }
export interface GuessState extends Base { kind: "guess"; target: number; tries: number; history: Guess[] }

function createGuess(seed: number): GuessState {
  const s = { rng: seed | 0 };
  const target = 1 + Math.floor(rand(s) * GUESS_MAX);
  return { kind: "guess", over: false, won: false, rng: s.rng, msg: "", target, tries: 0, history: [] };
}

const heatOf = (d: number) => (d === 0 ? "got it" : d <= 2 ? "boiling" : d <= 5 ? "hot" : d <= 12 ? "warm" : d <= 25 ? "cool" : "cold");

function submitGuess(s: GuessState, text: string): GuessState {
  const n = Number(text.trim());
  if (!Number.isInteger(n) || n < 1 || n > GUESS_MAX) return { ...s, msg: "a whole number, one to one hundred" };
  const d = Math.abs(n - s.target);
  const last = s.history[s.history.length - 1];
  const lastD = last ? Math.abs(last.n - s.target) : undefined;
  const trend = lastD === undefined ? "" : d < lastD ? "warmer" : d > lastD ? "colder" : "same";
  const tries = s.tries + 1;
  const g: Guess = { n, heat: heatOf(d), trend };
  const st: GuessState = { ...s, tries, history: [...s.history, g] };
  if (d === 0) return { ...st, over: true, won: true, msg: `${n} · got it in ${plural(tries, "try", "tries")}` };
  return { ...st, msg: `${n} · ${g.heat}${trend ? ` · ${trend}` : ""}` };
}

function renderGuess(s: GuessState): string[] {
  const shown = s.history.slice(-8);
  return [
    " GUESS · a number between one and one hundred",
    ...(shown.length ? shown.map((g) => `  ${String(g.n).padStart(3)}  ${g.heat}${g.trend ? ` · ${g.trend}` : ""}`) : ["  no guesses yet"]),
    ` tries: ${s.tries}`,
    s.over ? ` ${s.won ? "YOU WIN" : "GAME OVER"} · ${s.msg}` : " type a number and press enter · esc quits",
  ];
}

/* ============================================================================
   The shared surface the runner uses.
   ========================================================================== */
export type GameState = SnakeState | HangmanState | TttState | GuessState;

export function create(name: GameName, seed: number): GameState {
  switch (name) {
    case "snake": return createSnake(seed);
    case "hangman": return createHangman(seed);
    case "tictactoe": return createTtt(seed);
    case "guess": return createGuess(seed);
  }
}

/** A typed line and Enter. Snake ignores typed text (its input is the arrows). */
export function submit(s: GameState, text: string): GameState {
  if (s.over) return s;
  switch (s.kind) {
    case "snake": return text.trim() ? { ...s, msg: "arrows or wasd steer · esc quits" } : s;
    case "hangman": return submitHangman(s, text);
    case "tictactoe": return submitTtt(s, text);
    case "guess": return submitGuess(s, text);
  }
}

/** Escape, or `quit`: the game ends and says where it stood. */
export function quit(s: GameState): GameState {
  if (s.over) return s;
  switch (s.kind) {
    case "snake": return { ...s, over: true, msg: `quit · ${plural(s.score, "apple", "apples")}` };
    case "hangman": return { ...s, over: true, msg: `quit · the word was ${s.word}` };
    case "tictactoe": return { ...s, over: true, msg: "quit · I will call it a draw" };
    case "guess": return { ...s, over: true, msg: `quit · it was ${s.target}` };
  }
}

/** Whether the runner should keep a tick going for this state. Only a live snake moves on its own. */
export const needsTick = (s: GameState) => s.kind === "snake" && !s.over;

/** The whole frame, redrawn in place by the runner. */
export function render(s: GameState): string[] {
  switch (s.kind) {
    case "snake": return renderSnake(s);
    case "hangman": return renderHangman(s);
    case "tictactoe": return renderTtt(s);
    case "guess": return renderGuess(s);
  }
}

/** The lines printed under the frame once a game is over. */
export function endLines(s: GameState): string[] {
  const title = gameInfo(s.kind).title;
  return [`${title} · ${s.won ? "YOU WIN" : "GAME OVER"} · ${s.msg}`, `play ${s.kind} again, or type games`];
}
