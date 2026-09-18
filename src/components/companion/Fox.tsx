"use client";
/* eslint-disable react-hooks/refs, react-hooks/immutability -- the fox runs an imperative rAF engine (a mutable object in a ref) outside the render model; every visible state is mirrored into React state through setters */
import { useEffect, useRef, useState } from "react";
import { CHAPTERS } from "@/content/chapters";
import { Hanko } from "@/components/print/Hanko";
import { cn } from "@/lib/cn";
import { FoxSprite } from "./FoxSprite";
import { FOX_NAME, foxLine, foxTag } from "./foxLines";
import "@/styles/companion.css";

/* Patch, the fox: the guide. It sits at its post in the bottom-left corner and only ever moves
   because you did something: it trots once and says one true line when the chapter changes, its
   pupils follow the pointer, it wags when you hover, flips when you ask, sleeps after 45 s of
   nothing and curls back up on the first input. The one motion without input is a blink (CSS).
   Per-frame work (eyes, the FOLLOW walk) writes transforms straight to the DOM from one rAF that
   exits the moment nothing changes; React state only changes on transitions. */

const QUIET_KEY = "companion.quiet";
const IDLE_MS = 45_000;
const BUBBLE_MS = 4_000;
const FOX_W = 112;
const POST_LEFT = 16;
const KONAMI = ["ArrowUp", "ArrowUp", "ArrowDown", "ArrowDown", "ArrowLeft", "ArrowRight", "ArrowLeft", "ArrowRight", "b", "a"];

type Cmd = "follow" | "sit" | "trick" | "quiet";
/* Chip centres on an arc around the fox (radius ≈ 168 px from its centre), in px from the post's bottom-left. */
const RING: { id: Cmd; label: string; x: number; y: number }[] = [
  { id: "follow", label: "Follow", x: 68, y: 218 },
  { id: "sit", label: "Sit", x: 145, y: 196 },
  { id: "trick", label: "Trick", x: 195, y: 144 },
  { id: "quiet", label: "Quiet", x: 222, y: 73 },
];
/* Deterministic, so the burst is the same every time and hydration-safe. */
const HANKO = [
  { x: 6, d: 0, r0: -30, r1: 14 }, { x: 34, d: 70, r0: 20, r1: -26 }, { x: 62, d: 140, r0: -12, r1: 30 },
  { x: 90, d: 40, r0: 26, r1: -10 }, { x: 118, d: 110, r0: -24, r1: 22 }, { x: 146, d: 180, r0: 10, r1: -32 },
];

type Bubble = { tag: string; line: string; named: boolean };
type Setters = {
  walking: (v: boolean) => void; facing: (v: 1 | -1) => void; asleep: (v: boolean) => void;
  bubble: (v: Bubble) => void; bubbleOpen: (v: boolean) => void; trot: (v: boolean) => void;
};

const isTyping = (t: EventTarget | null) => t instanceof HTMLElement && (t.tagName === "INPUT" || t.tagName === "TEXTAREA" || t.isContentEditable);
const clamp = (v: number, a: number, b: number) => Math.max(a, Math.min(b, v));

/* Everything that runs between renders lives here, created once per mount. */
function createEngine(root: () => HTMLElement | null, pupils: () => SVGGElement | null, set: Setters) {
  const st = {
    compact: false, reduced: false, quiet: false, mode: "sit" as "sit" | "follow", asleep: false,
    chapter: "cover", pending: "", introduced: false, seen: new Set<string>(), trotting: false,
    x: 0, target: 0, maxX: 0, baseLeft: POST_LEFT, baseTop: 0, raf: 0, eyeRaf: 0, mx: -1, my: -1,
    facing: 1 as 1 | -1, walking: false, far: false, lastInput: 0, idle: 0, hide: 0, konami: 0, hankoDone: 0,
    spokeAt: 0, lastScroll: 0, settle: 0,
  };

  const paint = () => {
    const el = root();
    if (!el) return;
    el.style.transform = st.x > 0.01 ? `translate3d(${st.x.toFixed(1)}px, 0, 0)` : "";
    // The balloon (≤ 300 px, 76 px in from the post) flips to the fox's left only when it would overflow the viewport.
    const far = st.x > 0 && st.x + POST_LEFT + 76 + 300 > window.innerWidth;
    if (far !== st.far) { st.far = far; el.classList.toggle("is-far", far); }
  };

  const stopLoop = () => {
    if (st.raf) cancelAnimationFrame(st.raf);
    st.raf = 0;
    root()?.classList.remove("is-moving");
    if (st.walking) { st.walking = false; set.walking(false); }
  };

  const tick = () => {
    const d = st.target - st.x;
    if (Math.abs(d) < 0.5) {
      st.x = st.target; paint(); stopLoop();
      if (st.x === 0 && st.facing !== 1) { st.facing = 1; set.facing(1); }
      return;
    }
    st.x += d * 0.12;
    paint();
    const w = Math.abs(d) > 6;
    if (w !== st.walking) { st.walking = w; set.walking(w); }
    const f: 1 | -1 = d > 0 ? 1 : -1;
    if (w && f !== st.facing) { st.facing = f; set.facing(f); }
    st.raf = requestAnimationFrame(tick);
  };

  const startLoop = () => {
    if (st.raf || st.reduced || st.compact || document.hidden) return;
    root()?.classList.add("is-moving");
    st.raf = requestAnimationFrame(tick);
  };

  /* The strip owns the bottom-right; the fox never walks under it. */
  const measure = () => {
    const el = root();
    const strip = document.querySelector<HTMLElement>(".strip");
    const stripW = strip ? strip.getBoundingClientRect().width : 0;
    st.maxX = Math.max(0, window.innerWidth - POST_LEFT - FOX_W - stripW - 40);
    if (el) { const r = el.getBoundingClientRect(); st.baseLeft = r.left - st.x; st.baseTop = r.top; }
  };

  const aimEyes = () => {
    const g = pupils();
    if (!g || st.compact || st.reduced || st.asleep || st.mx < 0) return;
    const cx = st.baseLeft + st.x + FOX_W * (st.facing === 1 ? 0.58 : 0.42);
    const cy = st.baseTop + 38;
    const px = clamp((st.mx - cx) / 140, -1, 1) * 2.6 * st.facing;
    const py = clamp((st.my - cy) / 140, -1, 1) * 2.2;
    g.style.transform = `translate(${px.toFixed(2)}px, ${py.toFixed(2)}px)`;
  };

  const speak = (id: string) => {
    const tag = foxTag(id);
    if (!tag) return;
    const named = !st.introduced;
    st.introduced = true;
    set.bubble({ tag, line: foxLine(id), named });
    set.bubbleOpen(true);
    st.spokeAt = window.scrollY;
    window.clearTimeout(st.hide);
    st.hide = window.setTimeout(() => { st.hide = 0; set.bubbleOpen(false); }, BUBBLE_MS);
  };

  const hush = () => { window.clearTimeout(st.hide); st.hide = 0; set.bubbleOpen(false); };

  /* A pending line is spoken only once the page has stopped scrolling, so the balloon never
     flashes past a visitor who is still moving; and it yields as soon as they scroll on. */
  const trySpeak = () => {
    window.clearTimeout(st.settle); st.settle = 0;
    if (!st.pending) return;
    if (performance.now() - st.lastScroll < 320) { st.settle = window.setTimeout(trySpeak, 320); return; }
    const id = st.pending; st.pending = ""; speak(id);
  };
  const onScroll = () => {
    st.lastScroll = performance.now();
    noteInput();
    if (st.hide && Math.abs(window.scrollY - st.spokeAt) > 90) hush();
  };

  const wake = () => { if (st.asleep) { st.asleep = false; set.asleep(false); aimEyes(); } };

  const armIdle = () => {
    window.clearTimeout(st.idle);
    st.idle = window.setTimeout(() => { st.idle = 0; if (st.compact || st.reduced) return; st.asleep = true; set.asleep(true); }, IDLE_MS);
  };

  /* Called on every input; the timer is re-armed at most once a second. */
  const noteInput = () => {
    wake();
    const now = performance.now();
    if (st.idle && now - st.lastInput < 1000) return;
    st.lastInput = now;
    armIdle();
  };

  const onPointerMove = (e: PointerEvent) => {
    st.mx = e.clientX; st.my = e.clientY;
    noteInput();
    if (st.compact || st.reduced) return;
    if (!st.eyeRaf) st.eyeRaf = requestAnimationFrame(() => { st.eyeRaf = 0; aimEyes(); });
    if (st.mode === "follow" && !st.asleep) {
      st.target = clamp(e.clientX - POST_LEFT - FOX_W / 2, 0, st.maxX);
      if (Math.abs(st.target - st.x) > 1) startLoop();
    }
  };

  const onChapter = (id: string) => {
    if (!CHAPTERS.some((c) => c.id === id)) return;
    st.chapter = id;
    if (st.compact) return;
    // The cover keeps its own call to action clear: the fox only trots there and introduces itself on the first chapter.
    const say = id !== "cover" && !st.quiet && !st.seen.has(id);
    if (say) st.seen.add(id);
    if (st.reduced) { if (say) speak(id); return; }
    if (say) st.pending = id;
    if (!st.trotting) { st.trotting = true; set.trot(true); }
  };

  const trotEnded = () => {
    st.trotting = false;
    set.trot(false);
    if (st.pending) trySpeak();
  };

  const follow = () => { st.mode = "follow"; measure(); if (st.mx >= 0) onPointerMove({ clientX: st.mx, clientY: st.my } as PointerEvent); };
  const sit = () => { st.mode = "sit"; st.target = 0; startLoop(); };

  const onResize = () => {
    measure();
    st.target = clamp(st.target, 0, st.maxX);
    if (st.x > st.maxX) { st.x = st.maxX; paint(); }
  };

  const destroy = () => {
    stopLoop();
    if (st.eyeRaf) cancelAnimationFrame(st.eyeRaf);
    window.clearTimeout(st.idle);
    window.clearTimeout(st.hide);
    window.clearTimeout(st.settle);
  };

  return { st, paint, stopLoop, startLoop, measure, aimEyes, speak, hush, wake, armIdle, noteInput, onScroll, onPointerMove, onChapter, trotEnded, follow, sit, onResize, destroy };
}

export function Fox() {
  const rootRef = useRef<HTMLDivElement>(null);
  const btnRef = useRef<HTMLButtonElement>(null);
  const ringRef = useRef<HTMLDivElement>(null);
  const pupilsRef = useRef<SVGGElement>(null);

  const [ringOpen, setRingOpen] = useState(false);
  const [mode, setMode] = useState<"sit" | "follow">("sit");
  const [quiet, setQuiet] = useState(false);
  const [reduced, setReduced] = useState(false);
  const [bubble, setBubble] = useState<Bubble | null>(null);
  const [bubbleOpen, setBubbleOpen] = useState(false);
  const [asleep, setAsleep] = useState(false);
  const [trot, setTrot] = useState(false);
  const [walking, setWalking] = useState(false);
  const [facing, setFacing] = useState<1 | -1>(1);
  const [trick, setTrick] = useState(false);
  const [star, setStar] = useState(false);
  const [dance, setDance] = useState(false);
  const [burst, setBurst] = useState(0);

  /* The engine is an imperative animation object created once and kept in a ref; React only mirrors its states. */
  const engineRef = useRef<ReturnType<typeof createEngine> | null>(null);
  if (!engineRef.current) {
    engineRef.current = createEngine(() => rootRef.current, () => pupilsRef.current, {
      walking: setWalking, facing: setFacing, asleep: setAsleep, bubble: setBubble, bubbleOpen: setBubbleOpen, trot: setTrot,
    });
  }
  const eng = engineRef.current;

  useEffect(() => {
    const st = eng.st;
    const mqCompact = window.matchMedia("(max-width: 719px)");
    const mqReduced = window.matchMedia("(prefers-reduced-motion: reduce)");
    const sync = () => {
      st.compact = mqCompact.matches;
      st.reduced = mqReduced.matches;
      setReduced(mqReduced.matches);
      if (st.compact || st.reduced) {
        eng.stopLoop(); st.x = 0; st.target = 0; eng.paint();
        const g = pupilsRef.current; if (g) g.style.transform = "";
        if (st.asleep) { st.asleep = false; setAsleep(false); }
      }
      eng.measure();
    };
    sync();
    mqCompact.addEventListener("change", sync);
    mqReduced.addEventListener("change", sync);
    // eslint-disable-next-line react-hooks/set-state-in-effect -- a persisted preference read once after hydration
    try { const q = localStorage.getItem(QUIET_KEY) === "1"; st.quiet = q; setQuiet(q); } catch {}

    const onChapter = (e: Event) => eng.onChapter(String((e as CustomEvent<string>).detail));
    const onMove = (e: PointerEvent) => eng.onPointerMove(e);
    const onInput = () => eng.noteInput();
    const onKey = (e: KeyboardEvent) => {
      eng.noteInput();
      if (e.key === "Escape") eng.hush();
      if (isTyping(e.target) || e.metaKey || e.ctrlKey || e.altKey) return;
      const k = e.key.length === 1 ? e.key.toLowerCase() : e.key;
      st.konami = k === KONAMI[st.konami] ? st.konami + 1 : k === KONAMI[0] ? 1 : 0;
      if (st.konami === KONAMI.length) {
        st.konami = 0;
        if (!st.reduced && !st.compact) { st.hankoDone = 0; setDance(true); setBurst((b) => b + 1); }
      }
    };
    const onVisibility = () => { if (document.hidden) { eng.stopLoop(); window.clearTimeout(eng.st.idle); eng.st.idle = 0; } else eng.noteInput(); }; // no falling asleep in a background tab
    window.addEventListener("chapter-change", onChapter);
    window.addEventListener("pointermove", onMove, { passive: true });
    window.addEventListener("pointerdown", onInput, { passive: true });
    const onScroll = () => eng.onScroll();
    window.addEventListener("scroll", onScroll, { passive: true });
    window.addEventListener("keydown", onKey);
    window.addEventListener("resize", eng.onResize);
    document.addEventListener("visibilitychange", onVisibility);
    eng.armIdle();
    return () => {
      mqCompact.removeEventListener("change", sync);
      mqReduced.removeEventListener("change", sync);
      window.removeEventListener("chapter-change", onChapter);
      window.removeEventListener("pointermove", onMove);
      window.removeEventListener("pointerdown", onInput);
      window.removeEventListener("scroll", onScroll);
      window.removeEventListener("keydown", onKey);
      window.removeEventListener("resize", eng.onResize);
      document.removeEventListener("visibilitychange", onVisibility);
      eng.destroy();
    };
  }, [eng]);

  /* The ring: focus moves in when it opens, out when it closes; outside clicks close it. */
  useEffect(() => {
    if (!ringOpen) return;
    ringRef.current?.querySelector<HTMLButtonElement>("button:not([disabled])")?.focus({ preventScroll: true });
    const onDown = (e: PointerEvent) => { if (!rootRef.current?.contains(e.target as Node)) setRingOpen(false); };
    document.addEventListener("pointerdown", onDown, true);
    return () => document.removeEventListener("pointerdown", onDown, true);
  }, [ringOpen]);

  const closeRing = (refocus: boolean) => {
    setRingOpen(false);
    if (refocus) btnRef.current?.focus({ preventScroll: true });
  };

  const onFoxClick = () => {
    const st = eng.st;
    if (st.compact) {
      if (bubbleOpen) eng.hush(); else eng.speak(st.chapter);
      return;
    }
    if (!ringOpen) eng.hush(); // the balloon yields to a command
    setRingOpen((o) => !o);
  };

  const runCmd = (id: Cmd) => {
    const st = eng.st;
    if (id === "follow") { setMode("follow"); eng.follow(); }
    else if (id === "sit") { setMode("sit"); eng.sit(); }
    else if (id === "trick") { if (!st.reduced) setTrick(true); }
    else if (id === "quiet") {
      const q = !st.quiet;
      st.quiet = q; setQuiet(q);
      try { localStorage.setItem(QUIET_KEY, q ? "1" : "0"); } catch {}
      if (q) eng.hush();
    }
    closeRing(true);
  };

  const onRingKey = (e: React.KeyboardEvent) => {
    const items = Array.from(ringRef.current?.querySelectorAll<HTMLButtonElement>("button:not([disabled])") ?? []);
    const i = items.indexOf(document.activeElement as HTMLButtonElement);
    const go = (n: number) => { e.preventDefault(); items[(n + items.length) % items.length]?.focus(); };
    switch (e.key) {
      case "ArrowRight": case "ArrowDown": go(i + 1); break;
      case "ArrowLeft": case "ArrowUp": go(i - 1); break;
      case "Home": go(0); break;
      case "End": go(items.length - 1); break;
      case "Escape": e.preventDefault(); e.stopPropagation(); closeRing(true); break;
    }
  };

  const onRootBlur = (e: React.FocusEvent) => {
    if (ringOpen && !rootRef.current?.contains(e.relatedTarget as Node | null)) setRingOpen(false);
  };

  const onAnimEnd = (e: React.AnimationEvent) => {
    const st = eng.st;
    switch (e.animationName) {
      case "fox-bob": if (st.trotting) eng.trotEnded(); break;
      case "fox-flip": setTrick(false); setStar(true); break;
      case "fox-pop": setStar(false); break;
      case "fox-dance": setDance(false); break;
      case "fox-fall": if (++st.hankoDone >= HANKO.length) { st.hankoDone = 0; setBurst(0); } break;
    }
  };

  const pressed = (id: Cmd) => (id === "follow" ? mode === "follow" : id === "sit" ? mode === "sit" : id === "quiet" ? quiet : undefined);

  return (
    <div
      ref={rootRef}
      className={cn("fox", trot && "is-trot", walking && "is-walking", asleep && "is-asleep", trick && "is-trick", dance && "is-dance")}
      data-facing={facing}
      style={{ "--face": facing } as React.CSSProperties}
      onAnimationEnd={onAnimEnd}
      onBlur={onRootBlur}
    >
      <button ref={btnRef} type="button" className="fox-btn" aria-label={`Companion: ${FOX_NAME}`} aria-haspopup="true" aria-expanded={ringOpen} aria-controls="fox-ring" title={`${FOX_NAME} · the guide`} onClick={onFoxClick}>
        <div className="fox-stage">
          <FoxSprite uid="fox-full" className="fox-sprite fox-sprite-full" pupilsRef={pupilsRef} />
          <FoxSprite uid="fox-head" variant="head" className="fox-sprite fox-sprite-head" />
        </div>
      </button>

      {asleep ? <span className="fox-zz" aria-hidden="true"><i>z</i>Z</span> : null}
      {star ? <span className="fox-star" aria-hidden="true">★</span> : null}
      {burst > 0
        ? HANKO.map((h, i) => (
            <span key={`${burst}-${i}`} className="fox-hanko" aria-hidden="true" style={{ "--x": `${h.x}px`, "--d": `${h.d}ms`, "--r0": `${h.r0}deg`, "--r1": `${h.r1}deg` } as React.CSSProperties}>
              <Hanko small>OK</Hanko>
            </span>
          ))
        : null}

      <div className={cn("fox-bubble", bubbleOpen && "is-open")} role="status" aria-live="polite">
        {bubble ? (
          <>
            {bubble.named ? <span className="fox-bubble-name">{FOX_NAME}</span> : null}
            <span className="fox-bubble-tag">{bubble.tag}</span>
            <p className="fox-bubble-line">{bubble.line}</p>
          </>
        ) : null}
      </div>

      <div id="fox-ring" ref={ringRef} className={cn("fox-ring", ringOpen && "is-open")} role="group" aria-label="Patch, commands" aria-hidden={!ringOpen} onKeyDown={onRingKey}>
        {RING.map((c, i) => (
          <button
            key={c.id}
            type="button"
            className="btn btn-sm fox-cmd"
            style={{ "--x": `${c.x}px`, "--y": `${c.y}px`, "--i": i } as React.CSSProperties}
            aria-pressed={pressed(c.id)}
            disabled={reduced && (c.id === "follow" || c.id === "trick")}
            tabIndex={ringOpen ? 0 : -1}
            onClick={() => runCmd(c.id)}
          >
            {c.label}
          </button>
        ))}
        <span className="mono-label fox-ring-hint" aria-hidden="true">Arrows · Enter · Esc</span>
      </div>
    </div>
  );
}
