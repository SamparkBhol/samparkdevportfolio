"use client";
import { useCallback, useEffect, useRef, useState } from "react";
import { CHAPTERS } from "@/content/chapters";
import { resume } from "@/content/resume";
import type { ClassId } from "@/content/types";
import { Eyebrow, VideoPanel } from "@/components/print";
import { cn } from "@/lib/cn";
import { ClassCard } from "./ClassCard";
import { Education } from "./Education";
import { classById } from "./Portrait";
import "@/styles/select.css";

/* ============================================================================
   01 / CHARACTER SELECT · About & education. A fighting-game select screen
   over the bedroom loop: one class at a time on a big card, each with its own
   full drawing. PREV / NEXT, the four named dots, ← → while the stage has
   focus, and a horizontal swipe on touch all turn the carousel; the card
   changes behind a diagonal ink slash (320 ms, four hard steps). The visible
   class is the chosen one: it is written to <html data-player-class> and
   announced with a "class-select" event, and the stages in the next chapter
   answer it. READY is a link to the campaign. Below, ORIGIN: education as the
   hometown stage. Nothing moves unless a pointer or a key moved it.
   ========================================================================== */

const CHAPTER_ID = "select";
const chapter = CHAPTERS.find((c) => c.id === CHAPTER_ID)!;
const next = CHAPTERS[CHAPTERS.indexOf(chapter) + 1];
const IDS: ClassId[] = resume.classes.map((c) => c.id);
/** The empty state was worse than a default: the card is the About page and must read without a click. */
const DEFAULT: ClassId = "software";
const CUT_MS = 320;
/** A swipe is claimed once it is clearly horizontal, and turns the page once the finger has travelled this far. */
const CLAIM_PX = 6;
const FLIP_PX = 48;
const SETTLE_MS = 200;

const reduced = () => typeof window !== "undefined" && window.matchMedia("(prefers-reduced-motion: reduce)").matches;
const pad = (n: number) => String(n).padStart(2, "0");

type Gesture = { id: number; x0: number; y0: number; claimed: boolean; done: boolean };

export function Select() {
  const { profile, classes } = resume;

  const [sel, setSel] = useState<ClassId>(DEFAULT);
  const [prev, setPrev] = useState<ClassId | null>(null);
  const selRef = useRef<ClassId>(DEFAULT);
  const viewport = useRef<HTMLDivElement>(null);
  const dots = useRef<Partial<Record<ClassId, HTMLButtonElement | null>>>({});
  const focusDot = useRef(false);
  const gesture = useRef<Gesture | null>(null);
  const dragged = useRef(false);
  const settle = useRef(0);

  /* ---------- The choice is an external store for the rest of the page ---------- */
  const choose = useCallback((id: ClassId) => {
    if (selRef.current === id) return;
    const from = selRef.current;
    selRef.current = id;
    setPrev(reduced() ? null : from);
    setSel(id);
    document.documentElement.dataset.playerClass = id;
    window.dispatchEvent(new CustomEvent("class-select", { detail: id }));
  }, []);
  const go = useCallback((d: number) => {
    const i = IDS.indexOf(selRef.current);
    choose(IDS[(i + d + IDS.length) % IDS.length]);
  }, [choose]);

  /* The default is announced to the page as an attribute; the event fires for a real pick. */
  useEffect(() => { document.documentElement.dataset.playerClass ||= DEFAULT; }, []);

  /* The old card leaves when the slash has finished (animationend); the timer is only a fallback for a lost event. */
  const cutDone = useCallback(() => setPrev(null), []);
  useEffect(() => {
    if (!prev) return;
    const t = window.setTimeout(cutDone, CUT_MS * 3);
    return () => window.clearTimeout(t);
  }, [prev, sel, cutDone]);

  /* When the arrows were pressed on a dot, focus follows the selection (roving tabindex). */
  useEffect(() => {
    if (!focusDot.current) return;
    focusDot.current = false;
    dots.current[sel]?.focus({ preventScroll: true });
  }, [sel]);
  useEffect(() => () => window.clearTimeout(settle.current), []);

  /* ---------- Keys: ← → Home End anywhere on the stage ---------- */
  const onKeyDown = (e: React.KeyboardEvent) => {
    if (e.altKey || e.ctrlKey || e.metaKey) return;
    let target: ClassId | null = null;
    switch (e.key) {
      case "ArrowRight": target = IDS[(IDS.indexOf(selRef.current) + 1) % IDS.length]; break;
      case "ArrowLeft": target = IDS[(IDS.indexOf(selRef.current) - 1 + IDS.length) % IDS.length]; break;
      case "Home": target = IDS[0]; break;
      case "End": target = IDS[IDS.length - 1]; break;
      default: return;
    }
    e.preventDefault();
    focusDot.current = !!(e.target as HTMLElement).closest?.(".sel-dot");
    choose(target);
  };

  /* ---------- Touch: a horizontal swipe turns the page; a vertical one belongs to the scroll ---------- */
  const onPointerDown = (e: React.PointerEvent<HTMLDivElement>) => {
    if (e.pointerType === "mouse") return; // the mouse clicks and selects text; the swipe is for fingers and pens
    dragged.current = false;
    gesture.current = { id: e.pointerId, x0: e.clientX, y0: e.clientY, claimed: false, done: false };
  };
  const onPointerMove = (e: React.PointerEvent<HTMLDivElement>) => {
    const g = gesture.current;
    if (!g || g.done || e.pointerId !== g.id) return;
    const dx = e.clientX - g.x0, dy = e.clientY - g.y0;
    const el = e.currentTarget;
    if (!g.claimed) {
      if (Math.abs(dy) > CLAIM_PX && Math.abs(dy) > Math.abs(dx)) { g.done = true; return; }
      if (Math.abs(dx) <= CLAIM_PX || Math.abs(dx) <= Math.abs(dy)) return;
      g.claimed = true;
      dragged.current = true;
      try { el.setPointerCapture(e.pointerId); } catch {}
      window.clearTimeout(settle.current);
      el.classList.remove("is-settling");
      el.classList.add("is-dragging");
    }
    if (!reduced()) el.style.setProperty("--dx", `${Math.max(-140, Math.min(140, dx))}px`);
  };
  const onPointerEnd = (e: React.PointerEvent<HTMLDivElement>) => {
    const g = gesture.current;
    if (!g || e.pointerId !== g.id) return;
    gesture.current = null;
    if (!g.claimed) return;
    const el = e.currentTarget;
    try { el.releasePointerCapture(e.pointerId); } catch {}
    el.classList.remove("is-dragging");
    el.classList.add("is-settling");
    el.style.setProperty("--dx", "0px");
    settle.current = window.setTimeout(() => el.classList.remove("is-settling"), SETTLE_MS);
    const dx = e.clientX - g.x0;
    if (e.type !== "pointercancel" && Math.abs(dx) >= FLIP_PX) go(dx < 0 ? 1 : -1);
  };
  /* A click that ends a swipe is not a click. */
  const onClickCapture = (e: React.MouseEvent) => {
    if (!dragged.current) return;
    dragged.current = false;
    e.preventDefault();
    e.stopPropagation();
  };

  const k = classById(sel);
  const index = IDS.indexOf(sel);

  return (
    <VideoPanel video="bedroom" dim={0.7} id={CHAPTER_ID} data-chapter={CHAPTER_ID} className="chapter sel" ariaLabel={`${chapter.n} ${chapter.en} · ${chapter.plain}`}>
      <div className="wrap">
        <header className="chapter-head sel-head">
          <Eyebrow n={chapter.n}>{chapter.plain}</Eyebrow>
          <div className="sel-titlerow">
            <h2 className="chapter-title sel-title">{chapter.en}</h2>
            <span className="kanji sel-kanji"><span lang="ja">{chapter.jp}</span> <span style={{ opacity: 0.8 }}>{chapter.romaji}</span></span>
          </div>
          <p className="sel-lede">{profile.classLine}</p>
        </header>

        <div className="sel-stage" onKeyDown={onKeyDown}>
          <div className="sel-bar mono-label">
            <span>Choose your class <span className="sel-bar-who"><span aria-hidden="true">·</span> one player, four builds</span></span>
            <span className="sel-bar-count"><b>{pad(index + 1)}</b> / {pad(classes.length)}</span>
          </div>

          <div
            ref={viewport}
            className="sel-viewport"
            role="group"
            aria-roledescription="carousel"
            aria-label="Character select: one class at a time. Left and right arrow keys or a swipe change the class."
            tabIndex={0}
            onPointerDown={onPointerDown}
            onPointerMove={onPointerMove}
            onPointerUp={onPointerEnd}
            onPointerCancel={onPointerEnd}
            onClickCapture={onClickCapture}
          >
            {prev ? <div className="sel-slide sel-slide-prev" aria-hidden="true"><ClassCard k={classById(prev)} index={IDS.indexOf(prev)} total={classes.length} /></div> : null}
            {prev ? <span key={`slash-${sel}`} className="sel-slash" aria-hidden="true" /> : null}
            <div key={`cur-${sel}`} className={cn("sel-slide sel-slide-cur", prev && "is-cut")} onAnimationEnd={(e) => { if (e.target === e.currentTarget) cutDone(); }}>
              <ClassCard k={k} index={index} total={classes.length} />
            </div>
          </div>

          <div className="sel-controls">
            <button type="button" className="btn btn-ghost sel-nav sel-nav-prev" onClick={() => go(-1)} aria-label="Previous class">
              <span aria-hidden="true">◀</span> Prev
            </button>
            <div role="radiogroup" aria-label="Classes" className="sel-dots">
              {classes.map((c) => (
                <button
                  key={c.id}
                  ref={(el) => { dots.current[c.id] = el; }}
                  type="button"
                  role="radio"
                  aria-checked={sel === c.id}
                  tabIndex={sel === c.id ? 0 : -1}
                  data-class={c.id}
                  className="sel-dot"
                  onClick={() => choose(c.id)}
                >
                  <i aria-hidden="true" />
                  <span>{c.name}</span>
                </button>
              ))}
            </div>
            <button type="button" className="btn btn-ghost sel-nav sel-nav-next" onClick={() => go(1)} aria-label="Next class">
              Next <span aria-hidden="true">▶</span>
            </button>
            <a className="btn btn-red sel-ready" href={`#${next.id}`}>
              <span className="sel-ready-main">Ready <span aria-hidden="true">▶</span></span>
              <small className="sel-ready-to">{next.n} / {next.en} <span aria-hidden="true">·</span> {next.plain}</small>
            </a>
          </div>
          <p className="mono-label sel-hint">
            <span className="sel-hint-desk">← → switch class <span aria-hidden="true">·</span> click a name <span aria-hidden="true">·</span> ready starts the campaign</span>
            <span className="sel-hint-touch">Swipe the card <span aria-hidden="true">·</span> tap a name</span>
          </p>
          <p className="sr-only" aria-live="polite">Selected class: {k.name}</p>
        </div>

        <Education />
      </div>
    </VideoPanel>
  );
}

export default Select;
