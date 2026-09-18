import type { MiniGame } from "@/content/types";
export type { MiniGame };

/* ============================================================================
   Five games at 96 × 64 in four colours. Pure: create → step → draw.
   No DOM, no timers, no Math.random: every state carries its own seed, so a
   demo replays the same way twice and a test can drive a game by hand.
   Every game is played with the same five inputs (left, right, up, down,
   action) plus a one-shot relative `turn` that a tap on a screen half sends.
   ========================================================================== */

export const W = 96;
export const H = 64;

export interface Input {
  left: boolean; right: boolean; up: boolean; down: boolean; action: boolean;
  /** One-shot relative turn from a touch on a screen half: -1 left, 1 right. The driver clears it after a step. */
  turn: -1 | 0 | 1;
}
export const IDLE: Readonly<Input> = Object.freeze({ left: false, right: false, up: false, down: false, action: false, turn: 0 });

export interface Palette { bg: string; fg: string; accent: string; danger: string }

export const GAME_NAMES: Record<MiniGame, string> = { pong: "PONG", snake: "SNAKE", breakout: "BREAKOUT", invaders: "INVADERS", runner: "RUNNER" };

interface Base {
  w: number; h: number;
  /** Seconds since create/reset. */
  t: number;
  score: number;
  over: boolean;
  /** true: the built-in player drives and a lost game restarts itself; false: `input` drives. */
  ai: boolean;
  rng: number;
}

/* ---------- tiny helpers ---------- */
const clamp = (v: number, a: number, b: number) => (v < a ? a : v > b ? b : v);
/** mulberry32 on the state's own seed. */
function rand(s: Base): number {
  s.rng = (s.rng + 0x6d2b79f5) | 0;
  let a = s.rng;
  a = Math.imul(a ^ (a >>> 15), a | 1);
  a ^= a + Math.imul(a ^ (a >>> 7), a | 61);
  return ((a ^ (a >>> 14)) >>> 0) / 4294967296;
}
function rect(ctx: CanvasRenderingContext2D, x: number, y: number, w: number, h: number) { ctx.fillRect(Math.round(x), Math.round(y), w, h); }
function blit(ctx: CanvasRenderingContext2D, rows: readonly string[], x: number, y: number) {
  const ox = Math.round(x), oy = Math.round(y);
  for (let r = 0; r < rows.length; r++) for (let c = 0; c < rows[r].length; c++) if (rows[r][c] === "#") ctx.fillRect(ox + c, oy + r, 1, 1);
}
const hit = (ax: number, ay: number, aw: number, ah: number, bx: number, by: number, bw: number, bh: number) => ax < bx + bw && ax + aw > bx && ay < by + bh && ay + ah > by;
function base(w: number, h: number, seed: number): Base { return { w, h, t: 0, score: 0, over: false, ai: true, rng: seed | 0 }; }

/* ============================================================================
   PONG — you hold the bottom paddle, the machine the top one. Left/right.
   ========================================================================== */
export interface PongState extends Base { kind: "pong"; bx: number; by: number; vx: number; vy: number; px: number; ax: number; pw: number; serve: number }
const PW = 16;
function pongServe(s: PongState, toPlayer: boolean) {
  s.bx = s.w / 2 - 1; s.by = s.h / 2 - 1;
  const a = (rand(s) - 0.5) * 1.3, sp = 44;
  s.vx = Math.sin(a) * sp; s.vy = Math.cos(a) * sp * (toPlayer ? 1 : -1);
  s.serve = 0.7;
}
function pongReset(s: PongState) { s.t = 0; s.score = 0; s.over = false; s.px = s.ax = s.w / 2 - PW / 2; pongServe(s, true); }
function createPong(w: number, h: number, seed: number): PongState {
  const s: PongState = { ...base(w, h, seed), kind: "pong", bx: 0, by: 0, vx: 0, vy: 0, px: 0, ax: 0, pw: PW, serve: 0 };
  pongReset(s);
  return s;
}
function stepPong(s: PongState, inp: Input, dt: number) {
  s.t += dt;
  if (s.over) { if (s.ai || inp.action) pongReset(s); else return; }
  if (s.ai) { const target = s.bx + 1 - s.pw / 2 + Math.sin(s.t * 2.3) * 5; s.px += clamp(target - s.px, -dt * 46, dt * 46); }
  else { if (inp.left) s.px -= 62 * dt; if (inp.right) s.px += 62 * dt; }
  s.px = clamp(s.px, 0, s.w - s.pw);
  { const target = s.bx + 1 - s.pw / 2 + Math.sin(s.t * 1.7 + 1) * 7; s.ax = clamp(s.ax + clamp(target - s.ax, -dt * 40, dt * 40), 0, s.w - s.pw); }
  if (s.serve > 0) { s.serve -= dt; return; }
  const py = s.by;
  s.bx += s.vx * dt; s.by += s.vy * dt;
  if (s.bx <= 0) { s.bx = 0; s.vx = Math.abs(s.vx); } else if (s.bx >= s.w - 2) { s.bx = s.w - 2; s.vx = -Math.abs(s.vx); }
  const topY = 4, botY = s.h - 6;
  if (s.vy < 0 && py >= topY + 2 && s.by <= topY + 2 && s.bx + 2 >= s.ax && s.bx <= s.ax + s.pw) {
    s.by = topY + 2; s.vy = Math.abs(s.vy); s.vx += (s.bx + 1 - (s.ax + s.pw / 2)) * 4;
  }
  if (s.vy > 0 && py + 2 <= botY && s.by + 2 >= botY && s.bx + 2 >= s.px && s.bx <= s.px + s.pw) {
    s.by = botY - 2; s.vy = -Math.abs(s.vy) * 1.04; s.vx = s.vx * 1.04 + (s.bx + 1 - (s.px + s.pw / 2)) * 4; s.score += 1;
  }
  const sp = Math.hypot(s.vx, s.vy);
  if (sp > 92) { s.vx *= 92 / sp; s.vy *= 92 / sp; }
  if (Math.abs(s.vy) < 22) s.vy = 22 * (s.vy < 0 ? -1 : 1);
  if (s.by < -3) { s.score += 1; pongServe(s, true); }
  if (s.by > s.h) { if (s.ai) pongServe(s, false); else s.over = true; }
}
function drawPong(ctx: CanvasRenderingContext2D, s: PongState, p: Palette) {
  ctx.fillStyle = p.fg;
  for (let x = 2; x < s.w; x += 6) rect(ctx, x, s.h / 2 - 1, 3, 1);
  rect(ctx, s.ax, 4, s.pw, 2);
  rect(ctx, s.px, s.h - 6, s.pw, 2);
  ctx.fillStyle = p.accent;
  rect(ctx, s.bx, s.by, 2, 2);
}

/* ============================================================================
   SNAKE — 24 × 16 cells. Arrows are absolute; a tap on a half turns relative.
   ========================================================================== */
const CELL = 4;
export interface SnakeState extends Base { kind: "snake"; body: { x: number; y: number }[]; dx: number; dy: number; qx: number; qy: number; fx: number; fy: number; acc: number; interval: number }
function snakeOn(s: SnakeState, x: number, y: number, skipTail: boolean) {
  const n = skipTail ? s.body.length - 1 : s.body.length;
  for (let i = 0; i < n; i++) if (s.body[i].x === x && s.body[i].y === y) return true;
  return false;
}
function snakeFood(s: SnakeState) {
  const cols = s.w / CELL, rows = s.h / CELL;
  for (let k = 0; k < 64; k++) { const x = Math.floor(rand(s) * cols), y = Math.floor(rand(s) * rows); if (!snakeOn(s, x, y, false)) { s.fx = x; s.fy = y; return; } }
  s.fx = 0; s.fy = 0;
}
function snakeReset(s: SnakeState) {
  s.t = 0; s.score = 0; s.over = false; s.acc = 0; s.interval = 0.13;
  const cx = Math.floor(s.w / CELL / 2), cy = Math.floor(s.h / CELL / 2);
  s.body = [{ x: cx, y: cy }, { x: cx - 1, y: cy }, { x: cx - 2, y: cy }, { x: cx - 3, y: cy }];
  s.dx = s.qx = 1; s.dy = s.qy = 0;
  snakeFood(s);
}
function createSnake(w: number, h: number, seed: number): SnakeState {
  const s: SnakeState = { ...base(w, h, seed), kind: "snake", body: [], dx: 1, dy: 0, qx: 1, qy: 0, fx: 0, fy: 0, acc: 0, interval: 0.13 };
  snakeReset(s);
  return s;
}
function snakeSafe(s: SnakeState, x: number, y: number) { return x >= 0 && y >= 0 && x < s.w / CELL && y < s.h / CELL && !snakeOn(s, x, y, true); }
function snakeThink(s: SnakeState) {
  const head = s.body[0];
  const dirs = [[s.dx, s.dy], [s.dy, -s.dx], [-s.dy, s.dx]];
  let best: number[] | null = null, bestCost = Infinity;
  for (const [dx, dy] of dirs) {
    const x = head.x + dx, y = head.y + dy;
    if (!snakeSafe(s, x, y)) continue;
    let escape = false;
    for (const [ex, ey] of [[dx, dy], [dy, -dx], [-dy, dx]]) if (snakeSafe(s, x + ex, y + ey)) { escape = true; break; }
    const cost = Math.abs(x - s.fx) + Math.abs(y - s.fy) + (escape ? 0 : 100) + rand(s) * 0.5;
    if (cost < bestCost) { bestCost = cost; best = [dx, dy]; }
  }
  if (best) { s.qx = best[0]; s.qy = best[1]; }
}
function stepSnake(s: SnakeState, inp: Input, dt: number) {
  s.t += dt;
  if (s.over) { if (s.ai || inp.action) snakeReset(s); else return; }
  if (!s.ai) {
    if (inp.turn === -1) { s.qx = s.dy; s.qy = -s.dx; }
    else if (inp.turn === 1) { s.qx = -s.dy; s.qy = s.dx; }
    else if (inp.up && s.dy === 0) { s.qx = 0; s.qy = -1; }
    else if (inp.down && s.dy === 0) { s.qx = 0; s.qy = 1; }
    else if (inp.left && s.dx === 0) { s.qx = -1; s.qy = 0; }
    else if (inp.right && s.dx === 0) { s.qx = 1; s.qy = 0; }
  }
  s.acc += dt;
  while (s.acc >= s.interval) {
    s.acc -= s.interval;
    if (s.ai) snakeThink(s);
    s.dx = s.qx; s.dy = s.qy;
    const head = s.body[0], x = head.x + s.dx, y = head.y + s.dy;
    const eating = x === s.fx && y === s.fy;
    if (x < 0 || y < 0 || x >= s.w / CELL || y >= s.h / CELL || snakeOn(s, x, y, !eating)) {
      if (s.ai) snakeReset(s); else s.over = true;
      return;
    }
    s.body.unshift({ x, y });
    if (eating) { s.score += 1; s.interval = Math.max(0.075, s.interval * 0.96); snakeFood(s); }
    else s.body.pop();
  }
}
function drawSnake(ctx: CanvasRenderingContext2D, s: SnakeState, p: Palette) {
  ctx.fillStyle = p.fg;
  for (let i = 1; i < s.body.length; i++) rect(ctx, s.body[i].x * CELL, s.body[i].y * CELL, 3, 3);
  ctx.fillStyle = p.accent;
  rect(ctx, s.body[0].x * CELL, s.body[0].y * CELL, 3, 3);
  ctx.fillStyle = p.danger;
  rect(ctx, s.fx * CELL, s.fy * CELL, 3, 3);
}

/* ============================================================================
   BREAKOUT — 12 × 4 bricks. Left/right; action launches.
   ========================================================================== */
const BCOLS = 12, BROWS = 4, BW = 8, BH = 4, BTOP = 6;
export interface BreakoutState extends Base { kind: "breakout"; bricks: Uint8Array; px: number; pw: number; bx: number; by: number; vx: number; vy: number; stuck: boolean; sp: number; level: number; launch: number }
function breakoutReset(s: BreakoutState) {
  s.t = 0; s.score = 0; s.over = false; s.level = 1; s.sp = 48; s.bricks.fill(1); s.px = s.w / 2 - s.pw / 2; s.stuck = true; s.launch = 0.6; s.vx = 0; s.vy = 0;
}
function createBreakout(w: number, h: number, seed: number): BreakoutState {
  const s: BreakoutState = { ...base(w, h, seed), kind: "breakout", bricks: new Uint8Array(BCOLS * BROWS), px: 0, pw: 16, bx: 0, by: 0, vx: 0, vy: 0, stuck: true, sp: 48, level: 1, launch: 0.6 };
  breakoutReset(s);
  return s;
}
function stepBreakout(s: BreakoutState, inp: Input, dt: number) {
  s.t += dt;
  if (s.over) { if (s.ai || inp.action) breakoutReset(s); else return; }
  if (s.ai) { const target = s.stuck ? s.px : s.bx + 1 - s.pw / 2 + Math.sin(s.t * 3) * 3; s.px += clamp(target - s.px, -dt * 54, dt * 54); }
  else { if (inp.left) s.px -= 66 * dt; if (inp.right) s.px += 66 * dt; }
  s.px = clamp(s.px, 0, s.w - s.pw);
  if (s.stuck) {
    s.bx = s.px + s.pw / 2 - 1; s.by = s.h - 8;
    const go = s.ai ? (s.launch -= dt) <= 0 : inp.action;
    if (go) { s.stuck = false; const a = (rand(s) - 0.5) * 1.4; s.vx = Math.sin(a) * s.sp; s.vy = -Math.cos(a) * s.sp; s.launch = 0.6; }
    return;
  }
  const py = s.by;
  s.bx += s.vx * dt; s.by += s.vy * dt;
  if (s.bx <= 0) { s.bx = 0; s.vx = Math.abs(s.vx); } else if (s.bx >= s.w - 2) { s.bx = s.w - 2; s.vx = -Math.abs(s.vx); }
  if (s.by <= 0) { s.by = 0; s.vy = Math.abs(s.vy); }
  const padY = s.h - 6;
  if (s.vy > 0 && py + 2 <= padY && s.by + 2 >= padY && s.bx + 2 >= s.px && s.bx <= s.px + s.pw) {
    s.by = padY - 2; s.vy = -Math.abs(s.vy); s.vx += (s.bx + 1 - (s.px + s.pw / 2)) * 3.5;
    const sp = Math.hypot(s.vx, s.vy); if (sp > 0) { s.vx *= s.sp / sp; s.vy *= s.sp / sp; }
    if (Math.abs(s.vy) < s.sp * 0.35) s.vy = -s.sp * 0.35;
  }
  const cx = s.bx + 1, cy = s.by + 1;
  if (cy >= BTOP && cy < BTOP + BROWS * BH) {
    const col = clamp(Math.floor(cx / BW), 0, BCOLS - 1), row = Math.floor((cy - BTOP) / BH), i = row * BCOLS + col;
    if (s.bricks[i]) {
      s.bricks[i] = 0; s.score += 1; s.vy = -s.vy;
      let left = 0; for (let k = 0; k < s.bricks.length; k++) left += s.bricks[k];
      if (!left) { s.level += 1; s.bricks.fill(1); s.sp = Math.min(80, s.sp * 1.12); s.stuck = true; }
    }
  }
  if (s.by > s.h) { if (s.ai) s.stuck = true; else s.over = true; }
}
function drawBreakout(ctx: CanvasRenderingContext2D, s: BreakoutState, p: Palette) {
  for (let r = 0; r < BROWS; r++) {
    ctx.fillStyle = r < 2 ? p.danger : p.accent;
    for (let c = 0; c < BCOLS; c++) if (s.bricks[r * BCOLS + c]) rect(ctx, c * BW, BTOP + r * BH, BW - 1, BH - 1);
  }
  ctx.fillStyle = p.fg;
  rect(ctx, s.px, s.h - 6, s.pw, 2);
  rect(ctx, s.bx, s.by, 2, 2);
}

/* ============================================================================
   INVADERS — 6 × 3 in formation. Left/right; action fires (one shot at a time).
   ========================================================================== */
const IC = 6, IR = 3, IW = 7, IH = 5, ISX = 12, ISY = 8;
const INVADER: readonly (readonly string[])[] = [
  [".#...#.", "..###..", ".##.##.", "#######", "#.#.#.#"],
  [".#...#.", "..###..", ".##.##.", "#######", ".#...#."],
];
const SHIP: readonly string[] = ["...#...", ".#####.", "#######", "#######"];
export interface InvadersState extends Base { kind: "invaders"; alive: Uint8Array; ox: number; oy: number; dir: number; march: number; every: number; px: number; shotX: number; shotY: number; bombs: number[]; bombT: number; cool: number; wave: number; anim: number }
function invadersWave(s: InvadersState) { s.alive.fill(1); s.ox = 8; s.oy = 6; s.dir = 1; s.march = 0; s.shotY = -1; s.bombs = []; s.bombT = 1.4; s.anim = 0; }
function invadersReset(s: InvadersState) { s.t = 0; s.score = 0; s.over = false; s.wave = 1; s.every = 0.5; s.px = s.w / 2 - 3; s.cool = 0; invadersWave(s); }
function createInvaders(w: number, h: number, seed: number): InvadersState {
  const s: InvadersState = { ...base(w, h, seed), kind: "invaders", alive: new Uint8Array(IC * IR), ox: 8, oy: 6, dir: 1, march: 0, every: 0.5, px: 0, shotX: 0, shotY: -1, bombs: [], bombT: 1.4, cool: 0, wave: 1, anim: 0 };
  invadersReset(s);
  return s;
}
function stepInvaders(s: InvadersState, inp: Input, dt: number) {
  s.t += dt;
  if (s.over) { if (s.ai || inp.action) invadersReset(s); else return; }
  s.cool -= dt;
  let aliveN = 0, minC = IC, maxC = -1, maxR = -1;
  for (let r = 0; r < IR; r++) for (let c = 0; c < IC; c++) if (s.alive[r * IC + c]) { aliveN++; if (c < minC) minC = c; if (c > maxC) maxC = c; if (r > maxR) maxR = r; }
  if (!aliveN) { s.wave += 1; s.every = Math.max(0.16, s.every * 0.85); invadersWave(s); return; }
  const shipC = s.px + 3.5;
  if (s.ai) {
    let best = -1, bestD = Infinity;
    for (let c = 0; c < IC; c++) for (let r = IR - 1; r >= 0; r--) if (s.alive[r * IC + c]) { const cx = s.ox + c * ISX + IW / 2, d = Math.abs(cx - shipC); if (d < bestD) { bestD = d; best = c; } break; }
    const target = s.ox + best * ISX + IW / 2 - 3.5 + s.dir * 4;
    s.px += clamp(target - s.px, -dt * 44, dt * 44);
    if (s.shotY < 0 && s.cool <= 0 && bestD < 6) { s.shotX = Math.round(s.px + 3); s.shotY = s.h - 9; s.cool = 0.3; }
  } else {
    if (inp.left) s.px -= 58 * dt; if (inp.right) s.px += 58 * dt;
    if (inp.action && s.shotY < 0 && s.cool <= 0) { s.shotX = Math.round(s.px + 3); s.shotY = s.h - 9; s.cool = 0.3; }
  }
  s.px = clamp(s.px, 0, s.w - IW);
  s.march += dt;
  const every = s.every * (0.3 + 0.7 * aliveN / (IC * IR));
  if (s.march >= every) {
    s.march -= every; s.anim ^= 1;
    const nx = s.ox + s.dir * 3;
    if (nx + maxC * ISX + IW > s.w - 1 || nx + minC * ISX < 1) { s.oy += 3; s.dir = -s.dir; } else s.ox = nx;
    if (s.oy + maxR * ISY + IH >= s.h - 8) { if (s.ai) invadersReset(s); else s.over = true; return; }
  }
  if (s.shotY >= 0) {
    s.shotY -= 92 * dt;
    if (s.shotY < -3) s.shotY = -1;
    else for (let r = 0; r < IR && s.shotY >= 0; r++) for (let c = 0; c < IC; c++) {
      if (!s.alive[r * IC + c]) continue;
      if (hit(s.shotX, s.shotY, 1, 3, s.ox + c * ISX, s.oy + r * ISY, IW, IH)) { s.alive[r * IC + c] = 0; s.shotY = -1; s.score += 1; break; }
    }
  }
  s.bombT -= dt;
  if (s.bombT <= 0) {
    s.bombT = 0.8 + rand(s) * 0.9;
    const c = Math.floor(rand(s) * IC);
    for (let r = IR - 1; r >= 0; r--) if (s.alive[r * IC + c]) { s.bombs.push(s.ox + c * ISX + 3, s.oy + r * ISY + IH); break; }
  }
  for (let i = s.bombs.length - 2; i >= 0; i -= 2) {
    s.bombs[i + 1] += 42 * dt;
    if (s.bombs[i + 1] > s.h) { s.bombs.splice(i, 2); continue; }
    if (hit(s.bombs[i], s.bombs[i + 1], 1, 2, s.px, s.h - 7, IW, 4)) { if (s.ai) invadersReset(s); else s.over = true; return; }
  }
}
function drawInvaders(ctx: CanvasRenderingContext2D, s: InvadersState, p: Palette) {
  const frame = INVADER[s.anim];
  for (let r = 0; r < IR; r++) {
    ctx.fillStyle = r === 0 ? p.danger : r === 1 ? p.accent : p.fg;
    for (let c = 0; c < IC; c++) if (s.alive[r * IC + c]) blit(ctx, frame, s.ox + c * ISX, s.oy + r * ISY);
  }
  ctx.fillStyle = p.fg;
  blit(ctx, SHIP, s.px, s.h - 7);
  rect(ctx, 0, s.h - 1, s.w, 1);
  ctx.fillStyle = p.accent;
  if (s.shotY >= 0) rect(ctx, s.shotX, s.shotY, 1, 3);
  ctx.fillStyle = p.danger;
  for (let i = 0; i < s.bombs.length; i += 2) rect(ctx, s.bombs[i], s.bombs[i + 1], 1, 2);
}

/* ============================================================================
   RUNNER — jump the blocks. Action or up jumps; a tap anywhere jumps.
   ========================================================================== */
const GROUND = 52, RX = 12, RW = 6, RH = 8;
const RUNNER: readonly (readonly string[])[] = [
  [".####.", ".#.##.", ".####.", "..##..", ".####.", "#.##.#", "..##..", ".#..#."],
  [".####.", ".#.##.", ".####.", "..##..", ".####.", "#.##.#", "..##..", "..##.."],
];
export interface RunnerState extends Base { kind: "runner"; y: number; vy: number; obs: number[]; speed: number; spawn: number; dots: number[] }
function runnerReset(s: RunnerState) {
  s.t = 0; s.score = 0; s.over = false; s.y = GROUND - RH; s.vy = 0; s.obs = []; s.speed = 44; s.spawn = 1.1;
  s.dots = []; for (let i = 0; i < 9; i++) s.dots.push(rand(s) * s.w, 4 + rand(s) * 30);
}
function createRunner(w: number, h: number, seed: number): RunnerState {
  const s: RunnerState = { ...base(w, h, seed), kind: "runner", y: GROUND - RH, vy: 0, obs: [], speed: 44, spawn: 1.1, dots: [] };
  runnerReset(s);
  return s;
}
function stepRunner(s: RunnerState, inp: Input, dt: number) {
  s.t += dt;
  if (s.over) { if (s.ai || inp.action) runnerReset(s); else return; }
  const onGround = s.y >= GROUND - RH - 0.01;
  let jump = false;
  if (s.ai) {
    for (let i = 0; i < s.obs.length; i += 4) { const d = s.obs[i] - (RX + RW); if (d > -2 && d < s.speed * 0.34 + 2) { jump = true; break; } }
  } else jump = inp.action || inp.up;
  if (jump && onGround) s.vy = -108;
  s.vy += 310 * dt; s.y += s.vy * dt;
  if (s.y >= GROUND - RH) { s.y = GROUND - RH; s.vy = 0; }
  s.speed = Math.min(92, 44 + s.score * 1.6);
  s.spawn -= dt;
  if (s.spawn <= 0) {
    const w = 3 + Math.floor(rand(s) * 3), h = 5 + Math.floor(rand(s) * 5);
    s.obs.push(s.w + 2, w, h, 0);
    s.spawn = (0.75 + rand(s) * 0.9) * (44 / s.speed) + 0.25;
  }
  for (let i = s.obs.length - 4; i >= 0; i -= 4) {
    s.obs[i] -= s.speed * dt;
    const x = s.obs[i], w = s.obs[i + 1], h = s.obs[i + 2];
    if (!s.obs[i + 3] && x + w < RX) { s.obs[i + 3] = 1; s.score += 1; }
    if (x + w < -2) { s.obs.splice(i, 4); continue; }
    if (hit(RX + 1, s.y + 1, RW - 2, RH - 1, x, GROUND - h, w, h)) { if (s.ai) runnerReset(s); else s.over = true; return; }
  }
  for (let i = 0; i < s.dots.length; i += 2) { s.dots[i] -= s.speed * 0.22 * dt; if (s.dots[i] < -1) { s.dots[i] = s.w + rand(s) * 12; s.dots[i + 1] = 4 + rand(s) * 30; } }
}
function drawRunner(ctx: CanvasRenderingContext2D, s: RunnerState, p: Palette) {
  ctx.fillStyle = p.fg;
  for (let i = 0; i < s.dots.length; i += 2) rect(ctx, s.dots[i], s.dots[i + 1], 1, 1);
  rect(ctx, 0, GROUND, s.w, 1);
  for (let x = ((-s.t * s.speed) % 8 + 8) % 8; x < s.w; x += 8) rect(ctx, x, GROUND + 3, 2, 1);
  ctx.fillStyle = p.accent;
  const onGround = s.y >= GROUND - RH - 0.01;
  blit(ctx, RUNNER[onGround ? Math.floor(s.t * 12) % 2 : 1], RX, s.y);
  ctx.fillStyle = p.danger;
  for (let i = 0; i < s.obs.length; i += 4) rect(ctx, s.obs[i], GROUND - s.obs[i + 2], s.obs[i + 1], s.obs[i + 2]);
}

/* ============================================================================
   The public surface.
   ========================================================================== */
export type GameState = PongState | SnakeState | BreakoutState | InvadersState | RunnerState;

export function create(kind: MiniGame, w = W, h = H, seed = 1): GameState {
  switch (kind) {
    case "pong": return createPong(w, h, seed);
    case "snake": return createSnake(w, h, seed);
    case "breakout": return createBreakout(w, h, seed);
    case "invaders": return createInvaders(w, h, seed);
    case "runner": return createRunner(w, h, seed);
  }
}

/** Advances `state` by `dt` seconds (clamp it to ≤ 0.1 before calling) and returns the same object. */
export function step(state: GameState, input: Input, dt: number): GameState {
  switch (state.kind) {
    case "pong": stepPong(state, input, dt); break;
    case "snake": stepSnake(state, input, dt); break;
    case "breakout": stepBreakout(state, input, dt); break;
    case "invaders": stepInvaders(state, input, dt); break;
    case "runner": stepRunner(state, input, dt); break;
  }
  return state;
}

export function draw(ctx: CanvasRenderingContext2D, state: GameState, pal: Palette): void {
  ctx.fillStyle = pal.bg;
  ctx.fillRect(0, 0, state.w, state.h);
  switch (state.kind) {
    case "pong": drawPong(ctx, state, pal); break;
    case "snake": drawSnake(ctx, state, pal); break;
    case "breakout": drawBreakout(ctx, state, pal); break;
    case "invaders": drawInvaders(ctx, state, pal); break;
    case "runner": drawRunner(ctx, state, pal); break;
  }
}
