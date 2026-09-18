"use client";
import { useCallback, useEffect, useId, useRef, useState } from "react";
import { CHAPTERS } from "@/content/chapters";
import { resume } from "@/content/resume";
import { COVER_ART_POSTER, COVER_ART_SRC } from "@/content/videos";
import { Hanko } from "@/components/print/Hanko";
import { useDragRotate } from "@/components/motion/useDragRotate";
import { Leaves, Pager, useBookPages } from "./BookPages";

/* The issue as an object: CSS faces (front cover, inside cover, four leaves you turn, the last page,
   back, spine, page edges), 26 px thick, on a hinge. Drag turns it, O opens it, arrows step it;
   open, ← → turn the pages (Shift + arrows still rotate). No canvas, no WebGL.
   Desktop opens it flat like a spread; a phone folds the cover back so one page faces you at full size
   and slides the book so the back of a turned leaf does the same. */

const REST = { rx: 6, ry: 24 };
const OPEN_POSE = { rx: 4, ry: -10 };
const OPEN_POSE_PHONE = { rx: 4, ry: -4 };

const { profile, classes } = resume;
const { issue } = profile;
/** "SAMPARK BHOL" as two lines on the cover and on page 1. */
const titleLines = issue.title.split(" ");
const bandLine = `${issue.volume} · ${issue.month} · ${issue.price}`.toUpperCase();
const issueLine = `ISSUE No.${issue.number} · ${issue.month.toUpperCase()} · ${issue.price.toUpperCase()}`;
const spineLine = `${profile.name} · ${issue.volume}`.toUpperCase();
const select = CHAPTERS[1];
const contact = CHAPTERS[CHAPTERS.length - 1];
/** "CONTINUE?" as a word and its mark, so the mark can sit on its own line inside the back cover. */
const backWord = contact.en.replace(/[?？]+$/, "");
const backMark = contact.en.slice(backWord.length);

/** Decorative bars derived from the issue line; aria-hidden, nothing to read. */
function Barcode() {
  const seed = `${issue.title}-${issue.volume}-${issue.month}`;
  const bars: { x: number; w: number }[] = [];
  let x = 0;
  for (let i = 0; i < seed.length * 2 && x < 118; i++) {
    const c = seed.charCodeAt(i % seed.length) + i * 7;
    const w = 1 + (c % 3);
    bars.push({ x, w });
    x += w + 1 + (c % 2);
  }
  return (
    <svg className="book-barcode" viewBox="0 0 120 36" aria-hidden="true" focusable="false">
      {bars.map((b, i) => <rect key={i} x={b.x} y={0} width={b.w} height={36} fill="currentColor" />)}
    </svg>
  );
}

function Seal({ id }: { id: string }) {
  return (
    <svg className="book-seal" viewBox="0 0 100 100" role="img" aria-label="Seal: approved by the code review authority">
      <defs>
        <path id={id} d="M50,50 m-37,0 a37,37 0 1,1 74,0 a37,37 0 1,1 -74,0" />
      </defs>
      <circle cx="50" cy="50" r="47" fill="var(--color-yellow)" stroke="var(--color-ink)" strokeWidth="3" />
      <circle cx="50" cy="50" r="28" fill="none" stroke="var(--color-ink)" strokeWidth="1.5" />
      <text className="book-seal-arc">
        <textPath href={`#${id}`} startOffset="1">APPROVED BY THE CODE REVIEW AUTHORITY</textPath>
      </text>
      <text className="book-seal-ok" x="50" y="58" textAnchor="middle">OK</text>
    </svg>
  );
}

/** Page 1: the player profile, every line from the résumé. */
function PlayerProfile() {
  return (
    <>
      <p className="book-p1-cap">
        <span className="book-p1-caption mono-label">Player profile</span>
        <span className="book-p1-plain">{select.short}</span>
        <span className="book-p1-stamp"><Hanko small>1P</Hanko></span>
      </p>
      <p className="book-p1-name display">{titleLines.map((w) => <span key={w}>{w}</span>)}</p>
      <p className="book-p1-title mono-label">{profile.title}</p>
      <p className="book-p1-class">{profile.classLine}</p>
      <p className="book-p1-meta mono-label">{profile.employer} · {profile.location} · since {profile.since}</p>
      <ul className="book-p1-classes" aria-label="Classes">
        {classes.map((c) => <li key={c.id} className="mono-label">{c.name}</li>)}
      </ul>
      <p className="book-p1-more mono-label"><span>continued in</span> <span className="book-p1-more-ref">{select.n} / {select.en}</span></p>
    </>
  );
}

export function Book3D({ open, onToggle }: { open: boolean; onToggle: () => void }) {
  const sealId = useId().replace(/:/g, "");
  const { bind, ref: rotRef, set, reset, dragging, wasDrag, initialStyle } = useDragRotate({ sensitivity: 0.65, clampX: 40, initial: REST, keyStep: 15 });
  const hoverRef = useRef<HTMLDivElement>(null);
  const videoRef = useRef<HTMLVideoElement>(null);
  const wideRef = useRef(true);
  const [wide, setWide] = useState(true);
  // SSR and phones print the poster; desktops without reduced motion get the 8 s loop.
  const [art, setArt] = useState<"poster" | "video">("poster");
  const pages = useBookPages({ open, wide });

  useEffect(() => {
    const wideQ = window.matchMedia("(min-width: 900px)");
    const reduced = window.matchMedia("(prefers-reduced-motion: reduce)");
    const decide = () => { wideRef.current = wideQ.matches; setWide(wideQ.matches); setArt(wideQ.matches && !reduced.matches ? "video" : "poster"); };
    decide();
    wideQ.addEventListener("change", decide);
    reduced.addEventListener("change", decide);
    return () => { wideQ.removeEventListener("change", decide); reduced.removeEventListener("change", decide); };
  }, []);

  // The book face loop plays only while the cover is on screen (and the tab is visible); the rest of the issue never pays for it.
  useEffect(() => {
    const v = videoRef.current;
    if (!v) return;
    v.muted = true;
    let onScreen = true;
    const sync = () => { if (onScreen && !document.hidden) v.play().catch(() => {}); else v.pause(); };
    const io = new IntersectionObserver((entries) => { onScreen = entries[0].isIntersecting; sync(); }, { threshold: 0 });
    io.observe(v);
    document.addEventListener("visibilitychange", sync);
    sync();
    return () => { io.disconnect(); document.removeEventListener("visibilitychange", sync); };
  }, [art]);

  // Opening turns the book to face you; closing returns it to its resting pose.
  const first = useRef(true);
  useEffect(() => {
    if (first.current) { first.current = false; return; }
    if (open) { const p = wideRef.current ? OPEN_POSE : OPEN_POSE_PHONE; set(p.rx, p.ry); } else reset();
  }, [open, reset, set]);

  const { next, prev, canNext, canPrev } = pages;
  const onKeyDown = useCallback<React.KeyboardEventHandler<HTMLDivElement>>((e) => {
    if (e.target !== e.currentTarget) return;
    if (e.key === "Enter") { e.preventDefault(); onToggle(); return; }
    if (e.key === "Escape") { if (open) { e.preventDefault(); onToggle(); } return; }
    // Open, the horizontal arrows read; held with Shift they still turn the object.
    if (open && !e.shiftKey && !e.altKey && !e.ctrlKey && !e.metaKey && (e.key === "ArrowRight" || e.key === "ArrowLeft")) {
      e.preventDefault();
      if (e.key === "ArrowRight") { if (canNext) next(); } else if (canPrev) prev();
      return;
    }
    bind.onKeyDown(e);
  }, [bind, canNext, canPrev, next, onToggle, open, prev]);

  // Desktop hover: a few degrees toward the pointer, settling back on leave. Never while a button is down.
  const onPointerMove = useCallback<React.PointerEventHandler<HTMLDivElement>>((e) => {
    bind.onPointerMove(e);
    const h = hoverRef.current;
    if (!h || e.pointerType !== "mouse" || e.buttons !== 0) return;
    const r = e.currentTarget.getBoundingClientRect();
    const nx = ((e.clientX - r.left) / r.width) * 2 - 1;
    const ny = ((e.clientY - r.top) / r.height) * 2 - 1;
    h.style.setProperty("--hx", `${(ny * 5).toFixed(2)}deg`);
    h.style.setProperty("--hy", `${(-nx * 7).toFixed(2)}deg`);
  }, [bind]);

  const onPointerLeave = useCallback(() => {
    const h = hoverRef.current;
    if (!h) return;
    h.style.setProperty("--hx", "0deg");
    h.style.setProperty("--hy", "0deg");
  }, []);

  // A tap on the book (no drag) opens or closes it; a tap on a page's outer edge turns it instead (the edge stops the click).
  const onBookClick = useCallback(() => { if (!wasDrag()) onToggle(); }, [wasDrag, onToggle]);
  const edgeNext = useCallback(() => { if (!wasDrag()) next(); }, [next, wasDrag]);
  const edgePrev = useCallback(() => { if (!wasDrag()) prev(); }, [prev, wasDrag]);

  return (
    <div className="book-col">
      <div
        className="book-stage"
        role="group"
        tabIndex={0}
        aria-label="The issue as a book. Drag or use the arrow keys to turn it, O or Enter to open it; open, the left and right arrows turn its pages. Escape closes, Home resets."
        data-open={open ? "" : undefined}
        data-dragging={dragging ? "" : undefined}
        onPointerDown={bind.onPointerDown}
        onPointerMove={onPointerMove}
        onPointerUp={bind.onPointerUp}
        onPointerCancel={bind.onPointerCancel}
        onPointerLeave={onPointerLeave}
        onKeyDown={onKeyDown}
      >
        <div className="book-ground" aria-hidden="true" />
        <div className="book-hover" ref={hoverRef}>
          <div className="book-rot" ref={rotRef} style={initialStyle}>
            <div className="book-shift" data-slid={pages.slid ? "" : undefined}>
              <div className={open ? "book open" : "book"} onClick={onBookClick}>
                {/* the block: four leaves on the hinge, the last page on top of the block */}
                <Leaves pages={pages} profile={<PlayerProfile />} onNext={edgeNext} onPrev={edgePrev} />
                <div className="face back">
                  <p className="book-back-title display"><span>{backWord}</span>{backMark ? <span className="book-back-mark">{backMark}</span> : null}</p>
                  <p className="book-back-plain mono-label">{contact.plain}</p>
                  <p className="book-back-premise">{profile.premise}</p>
                  <ul className="book-back-lines mono-label">
                    <li><span>EMAIL</span><span>{profile.email}</span></li>
                    <li><span>GITHUB</span><span>{profile.github.replace("https://", "")}</span></li>
                    <li><span>LINKEDIN</span><span>{profile.linkedin.replace("https://www.", "")}</span></li>
                    <li><span>CV</span><span>{profile.siteUrl.replace("https://", "")}{profile.cvUrl}</span></li>
                  </ul>
                  <div className="book-back-code">
                    <Barcode />
                    <span className="mono-label">{issueLine}</span>
                  </div>
                </div>
                <div className="face spine"><span className="book-spine-text mono-label">{spineLine}</span></div>
                <div className="face edge" aria-hidden="true" />
                <div className="face etop" aria-hidden="true" />
                <div className="face ebot" aria-hidden="true" />

                {/* the cover on its hinge: front outside, contents inside */}
                <div className="book-cover">
                  <div className="face front">
                    {art === "video"
                      ? <video ref={videoRef} className="book-art" src={COVER_ART_SRC} poster={COVER_ART_POSTER} muted playsInline loop autoPlay preload="auto" aria-hidden="true" tabIndex={-1} />
                      // eslint-disable-next-line @next/next/no-img-element -- static export; the poster is already an encoded webp
                      : <img className="book-art" src={COVER_ART_POSTER} alt="" width={960} height={540} decoding="async"  srcSet="/video/anime-town-rainfall-poster-480.webp 480w, /video/anime-town-rainfall-poster.webp 1280w" sizes="(max-width: 900px) 240px, 300px" />}
                    <div className="halftone book-art-tone" aria-hidden="true" />
                    <p className="book-band mono-label">{bandLine}</p>
                    <p className="book-logo display stroke">{titleLines.map((w) => <span key={w}>{w}</span>)}</p>
                    <Seal id={sealId} />
                    <div className="book-strip">
                      <strong className="display">{profile.title}</strong>
                      <span>{profile.premise}</span>
                    </div>
                  </div>
                  <div className="face inside">
                    <p className="book-inside-title mono-label">Contents</p>
                    <ol className="book-contents">
                      {CHAPTERS.map((c) => (
                        <li key={c.id}>
                          <span className="mono-label book-contents-n">{c.n}</span>
                          <span className="mono-label book-contents-en">{c.en}</span>
                          <span className="book-contents-plain"><span className="bc-long">{c.plain}</span><span className="bc-short">{c.short}</span></span>
                        </li>
                      ))}
                    </ol>
                    <p className="book-inside-note">Every number in this issue is from the résumé. Nothing moves unless you move it.</p>
                    <p className="book-inside-colophon mono-label">{issue.volume} · {issue.month}</p>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
      <Pager pages={pages} open={open} />
      <p className="book-instr mono-label" aria-live="polite">
        <span className="book-instr-fine">{open ? "← → TURN PAGES · SHIFT + ARROWS ROTATE · O CLOSES" : "DRAG TO ROTATE · ARROWS · O OPENS"}</span>
        <span className="book-instr-coarse">{open ? "NEXT / PREV TURN PAGES · TAP A PAGE TO CLOSE" : "DRAG TO TURN · TAP TO OPEN"}</span>
      </p>
    </div>
  );
}
