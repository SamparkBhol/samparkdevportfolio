"use client";
import { useEffect, useMemo, useRef } from "react";
import { motion, useInView } from "motion/react";
import { portfolio } from "@/content/portfolio";
import { Stage } from "@/components/ui/Stage";
import { ComicPanel } from "@/components/ui/ComicPanel";
import { Badge } from "@/components/ui/Badge";
import { ArcadeButton } from "@/components/ui/ArcadeButton";
import { cn } from "@/lib/cn";

/* -------------------------------------------------------------------------- */
/*  GAME BOY MINI-ARCADE                                                       */
/*  Each blog CRT runs an actual live mini-game drawn on a <canvas> at low     */
/*  res in the 4-shade DMG palette. One shared rAF driver ticks every game;    */
/*  each game self-gates on viewport visibility (IntersectionObserver), the    */
/*  shared driver gates on document.hidden, and prefers-reduced-motion renders */
/*  a single static frame (no loop).                                           */
/* -------------------------------------------------------------------------- */

// Classic Game Boy DMG palette, darkest -> lightest.
const GB = ["#0f380f", "#306230", "#8bac0f", "#9bbc0f"] as const;
const GB_DARK = GB[0];
const GB_MID = GB[1];
const GB_LITE = GB[2];
const GB_BG = GB[3];

// Logical canvas resolution (upscaled by CSS, image-rendering: pixelated).
const RES_W = 64;
const RES_H = 40;

const GAME_LABELS = ["PONG", "SNAKE", "BREAKOUT", "INVADERS", "RUNNER"] as const;
function gameFor(index: number) {
  return index % GAME_LABELS.length;
}

/* ----------------------------- shared rAF driver -------------------------- */

type Ticker = (dt: number) => void;
const tickers = new Set<Ticker>();
let driverRaf = 0;
let lastTs = 0;

function driverLoop(ts: number) {
  driverRaf = requestAnimationFrame(driverLoop);
  const prev = lastTs || ts;
  lastTs = ts;
  // Globally pause all game work while the tab is hidden.
  if (typeof document !== "undefined" && document.hidden) return;
  // Clamp dt so a background -> foreground jump never teleports a game.
  const dt = Math.min(50, ts - prev);
  for (const t of tickers) t(dt);
}

function registerTicker(t: Ticker) {
  tickers.add(t);
  if (!driverRaf && typeof window !== "undefined") {
    lastTs = 0;
    driverRaf = requestAnimationFrame(driverLoop);
  }
  return () => {
    tickers.delete(t);
    if (tickers.size === 0 && driverRaf) {
      cancelAnimationFrame(driverRaf);
      driverRaf = 0;
    }
  };
}

/* ------------------------------ pixel helpers ----------------------------- */

function clearScreen(ctx: CanvasRenderingContext2D) {
  ctx.fillStyle = GB_BG;
  ctx.fillRect(0, 0, RES_W, RES_H);
}

function px(
  ctx: CanvasRenderingContext2D,
  x: number,
  y: number,
  w: number,
  h: number,
  color: string
) {
  ctx.fillStyle = color;
  ctx.fillRect(Math.round(x), Math.round(y), Math.round(w), Math.round(h));
}

/* ------------------------------ game machines ----------------------------- */
/* Each returns { step(dt), draw(ctx) }: step advances state, draw paints one  */
/* frame (also used as the reduced-motion static snapshot).                    */

type Game = {
  step: (dt: number) => void;
  draw: (ctx: CanvasRenderingContext2D) => void;
};

function clampStep(cur: number, target: number, speed: number) {
  const d = target - cur;
  return cur + Math.max(-speed, Math.min(speed, d));
}

/* 0 — PONG: two paddles rally a bouncing ball; AI tracks it loosely. */
function makePong(): Game {
  const s = {
    bx: RES_W / 2,
    by: RES_H / 2,
    vx: 0.55,
    vy: 0.32,
    lp: RES_H / 2,
    rp: RES_H / 2,
    ph: 12,
    pw: 3,
  };
  return {
    step(dt) {
      const k = dt / 16;
      s.bx += s.vx * k;
      s.by += s.vy * k;
      if (s.by < 2 || s.by > RES_H - 2) s.vy = -s.vy;
      const sp = 0.42 * k;
      // loose AI: chase only when the ball is heading your way.
      s.lp = clampStep(s.lp, s.vx < 0 ? s.by : RES_H / 2, s.vx < 0 ? sp : sp * 0.5);
      s.rp = clampStep(s.rp, s.vx > 0 ? s.by : RES_H / 2, s.vx > 0 ? sp : sp * 0.5);
      const half = s.ph / 2;
      if (s.bx <= 6 && Math.abs(s.by - s.lp) < half + 1) {
        s.vx = Math.abs(s.vx);
        s.vy += (s.by - s.lp) * 0.04;
      }
      if (s.bx >= RES_W - 6 && Math.abs(s.by - s.rp) < half + 1) {
        s.vx = -Math.abs(s.vx);
        s.vy += (s.by - s.rp) * 0.04;
      }
      // missed -> re-serve from center.
      if (s.bx < 1 || s.bx > RES_W - 1) {
        s.bx = RES_W / 2;
        s.by = RES_H / 2;
        s.vx = s.bx < 1 ? 0.55 : -0.55;
        s.vy = (Math.random() - 0.5) * 0.6;
      }
    },
    draw(ctx) {
      clearScreen(ctx);
      for (let y = 2; y < RES_H - 2; y += 5) px(ctx, RES_W / 2 - 0.5, y, 1, 3, GB_LITE);
      px(ctx, 3, s.lp - s.ph / 2, s.pw, s.ph, GB_DARK);
      px(ctx, RES_W - 3 - s.pw, s.rp - s.ph / 2, s.pw, s.ph, GB_DARK);
      px(ctx, s.bx - 1.5, s.by - 1.5, 3, 3, GB_MID);
    },
  };
}

/* 1 — SNAKE: a snake auto-pathfinds toward a dot and grows when it eats. */
function makeSnake(): Game {
  const CELL = 4;
  const COLS = Math.floor(RES_W / CELL);
  const ROWS = Math.floor(RES_H / CELL);
  const snake: { x: number; y: number }[] = [
    { x: 4, y: 4 },
    { x: 3, y: 4 },
    { x: 2, y: 4 },
  ];
  let dir = { x: 1, y: 0 };
  const food = { x: 10, y: 6 };
  let acc = 0;
  function placeFood() {
    food.x = 1 + Math.floor(Math.random() * (COLS - 2));
    food.y = 1 + Math.floor(Math.random() * (ROWS - 2));
  }
  function chooseDir() {
    const head = snake[0];
    const opts = [
      { x: 1, y: 0 },
      { x: -1, y: 0 },
      { x: 0, y: 1 },
      { x: 0, y: -1 },
    ].filter((d) => !(d.x === -dir.x && d.y === -dir.y));
    let best = dir;
    let bestScore = Infinity;
    for (const d of opts) {
      const nx = head.x + d.x;
      const ny = head.y + d.y;
      if (nx < 0 || ny < 0 || nx >= COLS || ny >= ROWS) continue;
      if (snake.some((seg) => seg.x === nx && seg.y === ny)) continue;
      // loose pathfinding: greedy manhattan + a little jitter.
      const score =
        Math.abs(nx - food.x) + Math.abs(ny - food.y) + Math.random() * 0.8;
      if (score < bestScore) {
        bestScore = score;
        best = d;
      }
    }
    dir = best;
  }
  return {
    step(dt) {
      acc += dt;
      if (acc < 130) return;
      acc = 0;
      chooseDir();
      const head = snake[0];
      const nx = head.x + dir.x;
      const ny = head.y + dir.y;
      if (nx < 0 || ny < 0 || nx >= COLS || ny >= ROWS) return; // boxed in: wait
      snake.unshift({ x: nx, y: ny });
      if (nx === food.x && ny === food.y) placeFood();
      else snake.pop();
      if (snake.length > 30) snake.length = 30;
    },
    draw(ctx) {
      clearScreen(ctx);
      px(ctx, food.x * CELL + 1, food.y * CELL + 1, CELL - 2, CELL - 2, GB_MID);
      snake.forEach((seg, i) =>
        px(ctx, seg.x * CELL, seg.y * CELL, CELL - 1, CELL - 1, i === 0 ? GB_DARK : GB_MID)
      );
    },
  };
}

/* 2 — BREAKOUT: paddle tracks the ball; ball chips away brick rows. */
function makeBreakout(): Game {
  const COLS = 8;
  const BW = RES_W / COLS;
  const ROWS = 3;
  let bricks: boolean[] = [];
  const reset = () => {
    bricks = new Array(COLS * ROWS).fill(true);
  };
  reset();
  const s = { bx: RES_W / 2, by: RES_H - 8, vx: 0.5, vy: -0.5, pad: RES_W / 2, pw: 12 };
  return {
    step(dt) {
      const k = dt / 16;
      s.bx += s.vx * k;
      s.by += s.vy * k;
      if (s.bx < 1 || s.bx > RES_W - 1) s.vx = -s.vx;
      if (s.by < 1) s.vy = -s.vy;
      s.pad += clampStep(0, s.bx - s.pad, 0.6 * k); // paddle follows ball
      s.pad = Math.max(s.pw / 2, Math.min(RES_W - s.pw / 2, s.pad));
      if (s.by >= RES_H - 4 && Math.abs(s.bx - s.pad) < s.pw / 2 + 1) {
        s.vy = -Math.abs(s.vy);
        s.vx += (s.bx - s.pad) * 0.05;
      }
      if (s.by > RES_H) {
        s.bx = RES_W / 2;
        s.by = RES_H - 8;
        s.vy = -0.5;
      }
      const col = Math.floor(s.bx / BW);
      const row = Math.floor((s.by - 2) / 4);
      if (row >= 0 && row < ROWS && col >= 0 && col < COLS) {
        const idx = row * COLS + col;
        if (bricks[idx]) {
          bricks[idx] = false;
          s.vy = -s.vy;
        }
      }
      if (!bricks.some(Boolean)) reset();
    },
    draw(ctx) {
      clearScreen(ctx);
      bricks.forEach((alive, i) => {
        if (!alive) return;
        const c = i % COLS;
        const r = Math.floor(i / COLS);
        px(ctx, c * BW + 0.5, 2 + r * 4, BW - 1, 3, r === 0 ? GB_DARK : GB_MID);
      });
      px(ctx, s.pad - s.pw / 2, RES_H - 3, s.pw, 2, GB_DARK);
      px(ctx, s.bx - 1, s.by - 1, 2, 2, GB_DARK);
    },
  };
}

/* 3 — SPACE INVADERS: a marching alien grid + the ship's rising shots. */
function makeInvaders(): Game {
  const COLS = 6;
  const ROWS = 3;
  let aliens: boolean[] = new Array(COLS * ROWS).fill(true);
  const s = {
    ox: 6,
    oy: 4,
    dir: 1,
    ship: RES_W / 2,
    shots: [] as { x: number; y: number }[],
    acc: 0,
    fire: 0,
  };
  const reset = () => {
    aliens = new Array(COLS * ROWS).fill(true);
  };
  return {
    step(dt) {
      const k = dt / 16;
      s.acc += dt;
      if (s.acc > 240) {
        s.acc = 0;
        s.ox += s.dir * 2;
        if (s.ox < 2 || s.ox > 16) {
          s.dir = -s.dir;
          s.oy += 2;
          if (s.oy > 14) {
            s.oy = 4;
            reset();
          }
        }
      }
      // ship slides toward leftmost living column.
      let targetCol = COLS / 2;
      for (let c = 0; c < COLS; c++) {
        if (aliens.some((a, i) => a && i % COLS === c)) {
          targetCol = c;
          break;
        }
      }
      s.ship += clampStep(0, s.ox + targetCol * 8 + 3 - s.ship, 0.5 * k);
      s.ship = Math.max(4, Math.min(RES_W - 4, s.ship));
      s.fire += dt;
      if (s.fire > 500 && s.shots.length < 3) {
        s.fire = 0;
        s.shots.push({ x: s.ship, y: RES_H - 6 });
      }
      s.shots = s.shots.filter((sh) => {
        sh.y -= 0.9 * k;
        for (let i = 0; i < aliens.length; i++) {
          if (!aliens[i]) continue;
          const ax = s.ox + (i % COLS) * 8;
          const ay = s.oy + Math.floor(i / COLS) * 6;
          if (sh.x > ax - 1 && sh.x < ax + 6 && sh.y > ay - 1 && sh.y < ay + 5) {
            aliens[i] = false;
            return false;
          }
        }
        return sh.y > 0;
      });
      if (!aliens.some(Boolean)) reset();
    },
    draw(ctx) {
      clearScreen(ctx);
      aliens.forEach((alive, i) => {
        if (!alive) return;
        const ax = s.ox + (i % COLS) * 8;
        const ay = s.oy + Math.floor(i / COLS) * 6;
        px(ctx, ax, ay, 5, 3, GB_DARK);
        px(ctx, ax - 1, ay + 3, 2, 1, GB_MID);
        px(ctx, ax + 4, ay + 3, 2, 1, GB_MID);
      });
      s.shots.forEach((sh) => px(ctx, sh.x, sh.y, 1, 3, GB_DARK));
      px(ctx, s.ship - 3, RES_H - 4, 6, 2, GB_DARK);
      px(ctx, s.ship - 1, RES_H - 6, 2, 2, GB_DARK);
    },
  };
}

/* 4 — RUNNER: a pixel hero auto-jumps scrolling obstacles. */
function makeRunner(): Game {
  const GROUND = RES_H - 8;
  const s = {
    y: GROUND,
    vy: 0,
    jumping: false,
    obstacles: [] as { x: number; w: number; h: number }[],
    spawn: 0,
    scroll: 0,
  };
  return {
    step(dt) {
      const k = dt / 16;
      s.scroll = (s.scroll + 0.8 * k) % 8;
      if (s.jumping) {
        s.vy += 0.12 * k;
        s.y += s.vy * k;
        if (s.y >= GROUND) {
          s.y = GROUND;
          s.jumping = false;
          s.vy = 0;
        }
      }
      s.spawn += dt;
      if (s.spawn > 900 + Math.random() * 600) {
        s.spawn = 0;
        s.obstacles.push({ x: RES_W + 2, w: 3, h: 4 + Math.floor(Math.random() * 4) });
      }
      s.obstacles = s.obstacles.filter((o) => {
        o.x -= 0.9 * k;
        if (!s.jumping && o.x > 8 && o.x < 16) {
          s.jumping = true;
          s.vy = -1.7;
        }
        return o.x > -4;
      });
    },
    draw(ctx) {
      clearScreen(ctx);
      px(ctx, 0, GROUND + 4, RES_W, 1, GB_MID);
      for (let x = -8 + s.scroll; x < RES_W; x += 8) px(ctx, x, GROUND + 6, 3, 1, GB_LITE);
      s.obstacles.forEach((o) => px(ctx, o.x, GROUND + 4 - o.h, o.w, o.h, GB_DARK));
      const hx = 8;
      px(ctx, hx, s.y - 2, 4, 6, GB_DARK);
      px(ctx, hx, s.y - 5, 4, 3, GB_DARK);
    },
  };
}

const GAME_FACTORIES = [makePong, makeSnake, makeBreakout, makeInvaders, makeRunner];

/* ----------------------------- <ScreenGame /> ----------------------------- */

function ScreenGame({ index, reduce }: { index: number; reduce: boolean }) {
  const canvasRef = useRef<HTMLCanvasElement>(null);

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    // jsdom (tests) throws on getContext rather than returning null; guard it.
    let ctx: CanvasRenderingContext2D | null = null;
    try {
      ctx = canvas.getContext("2d");
    } catch {
      return;
    }
    if (!ctx) return;
    ctx.imageSmoothingEnabled = false;

    const game = GAME_FACTORIES[gameFor(index)]();

    // Reduced motion: paint ONE representative frame, never animate.
    if (reduce) {
      game.step(16);
      game.step(16);
      game.draw(ctx);
      return;
    }

    let visible = false;
    const tick: Ticker = (dt) => {
      if (!visible) return;
      game.step(dt);
      game.draw(ctx);
    };

    // Self-gate on viewport visibility; shared driver gates on hidden tab.
    const io = new IntersectionObserver(
      ([entry]) => {
        visible = entry.isIntersecting;
        if (visible) game.draw(ctx);
      },
      { threshold: 0.01 }
    );
    io.observe(canvas);

    game.draw(ctx); // never blank before first tick
    const unregister = registerTicker(tick);

    return () => {
      unregister();
      io.disconnect();
    };
  }, [index, reduce]);

  return (
    <canvas
      ref={canvasRef}
      width={RES_W}
      height={RES_H}
      aria-hidden
      className="absolute inset-0 h-full w-full"
      style={{ imageRendering: "pixelated" }}
    />
  );
}

/* ------------------------------ cabinet chrome ---------------------------- */

function SignalBars({ active }: { active: number }) {
  return (
    <span className="flex items-end gap-[3px]" aria-hidden>
      {[5, 8, 11, 14, 17].map((h, i) => (
        <motion.span
          key={h}
          className={cn("w-[3px] rounded-sm", i < active ? "bg-pop-green" : "bg-pop-green/25")}
          style={{ height: h }}
          initial={{ scaleY: 0.3 }}
          whileInView={{ scaleY: 1 }}
          viewport={{ once: true }}
          transition={{ delay: 0.15 + i * 0.05, type: "spring", stiffness: 500, damping: 14 }}
        />
      ))}
    </span>
  );
}

/* ------------------------------ section card ------------------------------ */

function TransmissionCard({
  blog,
  index,
  isNew,
  reduce,
}: {
  blog: (typeof portfolio.blogs)[number];
  index: number;
  isNew: boolean;
  reduce: boolean;
}) {
  const channel = String(index + 1).padStart(2, "0");
  const tilt = ["-rotate-2", "rotate-1", "-rotate-1"][index % 3];
  const nudge = ["md:translate-y-3", "md:-translate-y-4", "md:translate-y-6"][index % 3];
  const strength = 5 - (index % 3); // 5,4,3 deterministic per card

  return (
    <motion.div
      className={cn("group relative", tilt, nudge)}
      initial={{ opacity: 0, y: 60, rotate: 0 }}
      whileInView={{ opacity: 1, y: 0 }}
      viewport={{ once: true, amount: 0.3 }}
      transition={{ delay: index * 0.12, type: "spring", stiffness: 120, damping: 16 }}
      whileHover={{
        y: -8,
        rotate: 0,
        x: [0, -2, 2, -1, 0],
        transition: { y: { type: "spring", stiffness: 300 }, x: { duration: 0.22 } },
      }}
    >
      {/* NEW flash on the most recent post */}
      {isNew && (
        <motion.div
          className="absolute -right-3 -top-4 z-30 select-none"
          animate={{ rotate: [10, 16, 10], scale: [1, 1.08, 1] }}
          transition={{ repeat: Infinity, duration: 1.2, ease: "easeInOut" }}
          aria-hidden
        >
          <span className="inline-block nb-border nb-shadow bg-pop-red px-3 py-1 font-bang text-2xl text-pop-yellow [-webkit-text-stroke:1px_black]">
            NEW!
          </span>
        </motion.div>
      )}

      <ComicPanel
        title={`${blog.date} · ${blog.readingMins} MIN`}
        className="relative group-hover:nb-shadow-lg"
      >
        {/* CRT broadcast bar: ON AIR + channel + signal bars */}
        <div className="-mx-4 -mt-4 mb-3 flex items-center justify-between gap-2 border-b-[3px] border-ink bg-ink px-3 py-2">
          <span className="flex items-center gap-2">
            <motion.span
              className="h-2.5 w-2.5 rounded-full bg-pop-red"
              animate={reduce ? undefined : { opacity: [1, 0.2, 1], scale: [1, 0.85, 1] }}
              transition={{ repeat: Infinity, duration: 1, ease: "easeInOut" }}
              aria-hidden
            />
            <span className="font-pixel text-[9px] uppercase tracking-widest text-pop-red">
              On Air
            </span>
          </span>
          <span className="flex items-center gap-2">
            <span className="font-pixel text-[9px] text-pop-cyan">CH{channel}</span>
            <SignalBars active={strength - 1} />
          </span>
        </div>

        {/* LIVE Game Boy mini-game running inside the CRT screen */}
        <div
          className={cn(
            "relative mb-3 h-28 overflow-hidden nb-border bg-crt",
            !reduce && "crt-flicker"
          )}
        >
          <ScreenGame index={index} reduce={reduce} />

          {/* hover "tune-in" green tint */}
          <div
            className="pointer-events-none absolute inset-0 z-[5] bg-pop-green/0 transition-colors duration-300 group-hover:bg-pop-green/10"
            aria-hidden
          />

          {/* scanline overlay */}
          <div
            className="pointer-events-none absolute inset-0 z-10 opacity-30"
            style={{
              backgroundImage:
                "repeating-linear-gradient(0deg, transparent, transparent 2px, rgba(0,0,0,0.45) 2px, rgba(0,0,0,0.45) 3px)",
            }}
            aria-hidden
          />

          {/* CRT tube vignette */}
          <div
            className="pointer-events-none absolute inset-0 z-10"
            style={{ boxShadow: "inset 0 0 18px 4px rgba(0,0,0,0.5)" }}
            aria-hidden
          />

          {/* now-playing game label + feed channel (reveals on hover) */}
          <span className="absolute bottom-1 left-2 z-20 font-pixel text-[8px] uppercase text-pop-yellow opacity-70 transition-opacity group-hover:opacity-100 [text-shadow:1px_1px_0_#0a0a0a]">
            ▶ {GAME_LABELS[gameFor(index)]} · FEED {channel}
          </span>

          {/* signal bars overlay */}
          <span className="absolute bottom-1 right-2 z-20">
            <SignalBars active={strength} />
          </span>
        </div>

        <h3 className="font-comic text-xl leading-tight text-pop-red transition-transform group-hover:-translate-x-0.5">
          {blog.title}
        </h3>
        <p className="mt-2 font-body text-sm text-ink/90">{blog.excerpt}</p>

        <div className="my-3 flex flex-wrap gap-2">
          {blog.tags.map((t) => (
            <Badge key={t} className="-rotate-2 transition-transform group-hover:rotate-0">
              #{t}
            </Badge>
          ))}
        </div>

        <ArcadeButton
          href={`/blog/${blog.slug}`}
          color="cyan"
          className="w-full justify-center"
        >
          READ
          <span className="sr-only"> transmission: {blog.title}</span>
        </ArcadeButton>
      </ComicPanel>
    </motion.div>
  );
}

export function Transmissions() {
  const ref = useRef<HTMLDivElement>(null);
  const inView = useInView(ref, { once: true, amount: 0.2 });

  // prefers-reduced-motion -> render static frames, no game loops.
  const reduce = useMemo(() => {
    if (typeof window === "undefined" || !window.matchMedia) return false;
    return window.matchMedia("(prefers-reduced-motion: reduce)").matches;
  }, []);

  // Most recent post (by date) gets the NEW flash.
  const newestSlug = useMemo(() => {
    return [...portfolio.blogs].sort(
      (a, b) => new Date(b.date).getTime() - new Date(a.date).getTime()
    )[0]?.slug;
  }, []);

  return (
    <Stage
      id="blogs"
      label="TRANSMISSIONS"
      title="LATEST ISSUES"
      subtitle="Dispatches from the field — broadcasting live."
    >
      <div ref={ref} className="relative">
        {/* Broadcast status ticker */}
        <motion.div
          className="mb-8 flex flex-wrap items-center gap-3 nb-border nb-shadow bg-ink px-4 py-2 font-pixel text-[9px] uppercase text-pop-green"
          initial={{ opacity: 0, x: -24 }}
          animate={inView ? { opacity: 1, x: 0 } : {}}
          transition={{ duration: 0.5 }}
        >
          <motion.span
            className="h-2 w-2 rounded-full bg-pop-red"
            animate={reduce ? undefined : { opacity: [1, 0.15, 1] }}
            transition={{ repeat: Infinity, duration: 0.9 }}
            aria-hidden
          />
          <span className="text-pop-red">REC</span>
          <span className="text-pop-cyan">{portfolio.blogs.length} CHANNELS LIVE</span>
          <span className="hidden text-pop-yellow sm:inline">
            ::: SIGNAL STRONG ::: TUNE IN :::
          </span>
        </motion.div>

        <div className="grid gap-7 md:grid-cols-3">
          {portfolio.blogs.map((b, i) => (
            <TransmissionCard
              key={b.slug}
              blog={b}
              index={i}
              isNew={b.slug === newestSlug}
              reduce={reduce}
            />
          ))}
        </div>
      </div>
    </Stage>
  );
}
