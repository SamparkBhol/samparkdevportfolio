"use client";
import { useEffect, useRef, useSyncExternalStore } from "react";
import "@/styles/cursor.css";

/* ============================================================================
   The ink cursor. Site-wide, fine pointers only, never under reduced motion,
   never on touch. Mounted once from page.tsx.
   - The OS cursor is hidden by html[data-cursor="ink"] (set here, styled in
     cursor.css); one fixed element follows the pointer through a transform
     written at most once per frame.
   - It leans with the pointer's speed and settles by a CSS transition, so
     nothing runs at rest. Pointer down shrinks it to a dot (drags); a single
     pointerover listener on the document classifies the target with closest()
     into arrow, crosshair (anything you can press), I-beam (text) or the tantō
     dagger (inside #trophies, where a press stabs).
   - A scroll can carry a section under a still pointer, so one hit-test per
     scroll frame re-reads the target. It hides when the pointer leaves the
     window, the tab blurs or a touch happens; the next mouse move shows it.
   ========================================================================== */

const FINE = "(pointer: fine)";
const REDUCED = "(prefers-reduced-motion: reduce)";
const readMedia = () => window.matchMedia(FINE).matches && !window.matchMedia(REDUCED).matches;
const subscribeMedia = (cb: () => void) => {
  const qs = [FINE, REDUCED].map((m) => window.matchMedia(m));
  qs.forEach((q) => q.addEventListener("change", cb));
  return () => qs.forEach((q) => q.removeEventListener("change", cb));
};

/* A region can declare itself text with data-cursor="text" (the terminal's log does: it is focusable, so it would read as a target). */
const TEXT = '[data-cursor="text"], textarea, [contenteditable]:not([contenteditable=false]), input:not([type=range]):not([type=checkbox]):not([type=radio]):not([type=button]):not([type=submit]):not([type=reset]):not([type=file]):not([type=color])';
const AIM = 'a, button, select, summary, [role=button], [role=radio], [role=slider], input[type=range], [tabindex]:not([tabindex="-1"])';
const ROOM = "#trophies";
const STAB_MS = 140;
const SETTLE_MS = 90;

export function Cursor() {
  const enabled = useSyncExternalStore(subscribeMedia, readMedia, () => false);
  const elRef = useRef<HTMLDivElement>(null);
  const tiltRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (!enabled) return;
    const el = elRef.current, tilt = tiltRef.current;
    if (!el || !tilt) return;
    const html = document.documentElement;
    html.dataset.cursor = "ink";

    const s = { x: 0, y: 0, t: 0, raf: 0, scrollRaf: 0, on: false, room: false, settle: 0, stab: 0 };
    const paint = () => { s.raf = 0; el.style.transform = `translate3d(${s.x}px, ${s.y}px, 0)`; };
    const show = (on: boolean) => { if (s.on === on) return; s.on = on; el.classList.toggle("is-on", on); if (!on) el.classList.remove("is-down", "is-stab"); };
    const mouse = (e: PointerEvent) => e.pointerType === "mouse" || e.pointerType === "pen";

    /* What is under the pointer decides the shape; closest() only, no layout read. When both a text
       region and a target contain the pointer, the deeper one wins (a link inside the log is a target). */
    const classify = (t: EventTarget | null) => {
      const n = t instanceof Element ? t : null;
      const room = !!n?.closest(ROOM);
      const textEl = n?.closest(TEXT) ?? null;
      const aimEl = n?.closest(AIM) ?? null;
      const text = !!textEl && (!aimEl || aimEl.contains(textEl));
      const aim = !!aimEl && !text;
      s.room = room;
      el.classList.toggle("is-room", room);
      el.classList.toggle("is-text", text);
      el.classList.toggle("is-aim", aim);
    };

    const onMove = (e: PointerEvent) => {
      if (!mouse(e)) { show(false); return; }
      const dt = Math.max(8, e.timeStamp - s.t);
      const vx = s.on ? (e.clientX - s.x) / dt : 0; // px per ms; the first move after a hide does not lean
      s.x = e.clientX; s.y = e.clientY; s.t = e.timeStamp;
      const lean = Math.max(-16, Math.min(16, vx * 12));
      tilt.style.setProperty("--tilt", `${lean.toFixed(1)}deg`);
      window.clearTimeout(s.settle);
      s.settle = window.setTimeout(() => tilt.style.setProperty("--tilt", "0deg"), SETTLE_MS);
      if (!s.raf) s.raf = requestAnimationFrame(paint);
      show(true);
    };
    const onOver = (e: PointerEvent) => { if (mouse(e)) classify(e.target); };
    const onDown = (e: PointerEvent) => {
      if (!mouse(e) || !s.on) return;
      el.classList.add("is-down");
      if (s.room) {
        el.classList.add("is-stab");
        window.clearTimeout(s.stab);
        s.stab = window.setTimeout(() => el.classList.remove("is-stab"), STAB_MS);
      }
    };
    const onUp = () => el.classList.remove("is-down");
    const onOut = (e: PointerEvent) => { if (!e.relatedTarget) show(false); }; // left the window
    const onHide = () => show(false);
    const onVis = () => { if (document.hidden) show(false); };
    const onScroll = () => {
      if (!s.on || s.scrollRaf) return;
      s.scrollRaf = requestAnimationFrame(() => { s.scrollRaf = 0; classify(document.elementFromPoint(s.x, s.y)); });
    };

    document.addEventListener("pointermove", onMove, { passive: true });
    document.addEventListener("pointerover", onOver, { passive: true });
    document.addEventListener("pointerdown", onDown, { passive: true });
    window.addEventListener("pointerup", onUp, { passive: true });
    window.addEventListener("pointercancel", onUp, { passive: true });
    document.addEventListener("pointerout", onOut, { passive: true });
    window.addEventListener("blur", onHide);
    document.addEventListener("visibilitychange", onVis);
    window.addEventListener("scroll", onScroll, { passive: true });
    return () => {
      document.removeEventListener("pointermove", onMove);
      document.removeEventListener("pointerover", onOver);
      document.removeEventListener("pointerdown", onDown);
      window.removeEventListener("pointerup", onUp);
      window.removeEventListener("pointercancel", onUp);
      document.removeEventListener("pointerout", onOut);
      window.removeEventListener("blur", onHide);
      document.removeEventListener("visibilitychange", onVis);
      window.removeEventListener("scroll", onScroll);
      if (s.raf) cancelAnimationFrame(s.raf);
      if (s.scrollRaf) cancelAnimationFrame(s.scrollRaf);
      window.clearTimeout(s.settle);
      window.clearTimeout(s.stab);
      delete html.dataset.cursor;
    };
  }, [enabled]);

  if (!enabled) return null;
  return (
    <div ref={elRef} className="icur" aria-hidden="true" data-testid="ink-cursor">
      <div ref={tiltRef} className="icur-tilt">
        {/* The arrow: paper with a screentone, an ink line, and the red plate printed a hair off. Tip at (1, 1). */}
        <svg className="icur-arrow" viewBox="0 0 26 28" width="26" height="28" focusable="false">
          <defs>
            <pattern id="icur-tone" width="3" height="3" patternUnits="userSpaceOnUse"><circle cx="1.5" cy="1.5" r="0.75" /></pattern>
          </defs>
          <path className="icur-red" d="M1 1L1 21.5 6.6 16.6 10.4 25 14.6 23.1 10.8 14.9 18.2 14.3Z" transform="translate(2.2 1.6)" />
          <path className="icur-paper" d="M1 1L1 21.5 6.6 16.6 10.4 25 14.6 23.1 10.8 14.9 18.2 14.3Z" />
          <path className="icur-tonefill" d="M1 1L1 21.5 6.6 16.6 10.4 25 14.6 23.1 10.8 14.9 18.2 14.3Z" fill="url(#icur-tone)" />
          <path className="icur-ink" d="M1 1L1 21.5 6.6 16.6 10.4 25 14.6 23.1 10.8 14.9 18.2 14.3Z" />
        </svg>
        {/* The dot it shrinks to while the button is down. */}
        <svg className="icur-dot" viewBox="0 0 14 14" width="14" height="14" focusable="false">
          <circle className="icur-red" cx="8.2" cy="8" r="4" />
          <circle className="icur-dot-ink" cx="7" cy="7" r="4" />
        </svg>
        {/* The crosshair over anything you can press. */}
        <svg className="icur-aim" viewBox="0 0 26 26" width="26" height="26" focusable="false">
          <circle className="icur-aim-red" cx="14.4" cy="14.2" r="8" />
          <circle className="icur-aim-ring" cx="13" cy="13" r="8" />
          <path className="icur-aim-cross" d="M13 1V6M13 20V25M1 13H6M20 13H25" />
          <circle className="icur-aim-ring2" cx="13" cy="13" r="8" />
          <path className="icur-aim-cross2" d="M13 1V6M13 20V25M1 13H6M20 13H25" />
          <circle className="icur-aim-dot" cx="13" cy="13" r="1.6" />
        </svg>
        {/* The I-beam over text. */}
        <svg className="icur-beam" viewBox="0 0 14 24" width="14" height="24" focusable="false">
          <path className="icur-beam-red" d="M3 2H11M7 2V22M3 22H11" transform="translate(1.4 1.2)" />
          <path className="icur-beam-ink" d="M3 2H11M7 2V22M3 22H11" />
          <path className="icur-beam-paper" d="M3 2H11M7 2V22M3 22H11" />
        </svg>
        {/* The tantō, inside the trophy room. Tip at (16, 1): the hotspot. */}
        <div className="icur-dagger">
          <div className="icur-dg-rot">
            <div className="icur-dg-body">
              <svg className="icur-dg-svg" viewBox="0 0 32 64" width="32" height="64" focusable="false">
                <path className="dg-blade" d="M16 1C20 10 21.2 19 21.2 26.5H10.8C10.8 19 12.4 10 16 1Z" />
                <path className="dg-hamon" d="M16.5 8.5C18.4 14.5 19 20 19 26" />
                <path className="dg-glint" d="M14.6 7L13.9 14" />
                <rect className="dg-tsuba" x="7.5" y="26.5" width="17" height="4.5" rx="1" />
                <rect className="dg-tsuka" x="12" y="31" width="8" height="25" rx="2" />
                <path className="dg-ito" d="M12 35L20 41M20 35L12 41M12 43L20 49M20 43L12 49" />
                <rect className="dg-kashira" x="11" y="56" width="10" height="5.5" rx="1.2" />
              </svg>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
