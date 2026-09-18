"use client";
import { useCallback, useEffect, useMemo, useRef, useState } from "react";

/* Turn an object in your hands. The hook writes `--rx` / `--ry` (degrees) on `ref.current`;
   the CSS does `transform: rotateX(var(--rx)) rotateY(var(--ry))`.

   Rules it keeps: the gesture is claimed only once |dx| > 6 px and |dx| > |dy| (so `touch-action: pan-y`
   keeps vertical scroll on phones); pointer capture while dragging; velocity from the last three
   move events; inertia `v *= 0.92` per frame until |v| < 0.02; arrows step ±15°, Home resets;
   nothing moves unless a pointer or a key moved it. Reduced motion skips the inertia. */

const FRAME = 1000 / 60;
const CLAIM_PX = 6;

export interface DragRotateOptions {
  /** Degrees of yaw per pixel of horizontal drag. */
  sensitivity?: number;
  /** Pitch is clamped to ±clampX degrees. */
  clampX?: number;
  initial?: { rx: number; ry: number };
  /** Degrees per arrow-key press. */
  keyStep?: number;
}

export interface DragRotateBind {
  onPointerDown: React.PointerEventHandler<HTMLElement>;
  onPointerMove: React.PointerEventHandler<HTMLElement>;
  onPointerUp: React.PointerEventHandler<HTMLElement>;
  onPointerCancel: React.PointerEventHandler<HTMLElement>;
  onKeyDown: React.KeyboardEventHandler<HTMLElement>;
}

export function useDragRotate({ sensitivity = 0.65, clampX = 40, initial = { rx: 0, ry: 0 }, keyStep = 15 }: DragRotateOptions = {}) {
  const ref = useRef<HTMLDivElement | null>(null);
  const [dragging, setDragging] = useState(false);

  const rot = useRef({ rx: initial.rx, ry: initial.ry });
  const gesture = useRef<{ id: number; x0: number; y0: number; x: number; y: number; claimed: boolean; done: boolean } | null>(null);
  const samples = useRef<{ t: number; dx: number }[]>([]);
  const raf = useRef(0);
  const lastWasDrag = useRef(false);

  const write = useCallback(() => {
    const el = ref.current;
    if (!el) return;
    el.style.setProperty("--rx", `${rot.current.rx.toFixed(2)}deg`);
    el.style.setProperty("--ry", `${rot.current.ry.toFixed(2)}deg`);
  }, []);

  const live = useCallback((on: boolean) => {
    const el = ref.current;
    if (!el) return;
    if (on) el.dataset.live = "";
    else delete el.dataset.live;
  }, []);

  const stopInertia = useCallback(() => {
    if (raf.current) cancelAnimationFrame(raf.current);
    raf.current = 0;
  }, []);

  const clamp = useCallback((v: number) => Math.max(-clampX, Math.min(clampX, v)), [clampX]);

  /** Jump (with the CSS transition, since the element is not "live") to a pose. */
  const set = useCallback((rx: number, ry: number) => {
    stopInertia();
    live(false);
    rot.current = { rx: clamp(rx), ry };
    write();
  }, [clamp, live, stopInertia, write]);

  /** Turn by `dy` degrees of yaw (arrow keys). */
  const step = useCallback((dy: number) => set(rot.current.rx, rot.current.ry + dy), [set]);
  const pitch = useCallback((dx: number) => set(rot.current.rx + dx, rot.current.ry), [set]);
  const reset = useCallback(() => set(initial.rx, initial.ry), [initial.rx, initial.ry, set]);

  const startInertia = useCallback((v0: number) => {
    if (window.matchMedia("(prefers-reduced-motion: reduce)").matches) { live(false); return; }
    let v = v0;
    const tick = () => {
      rot.current.ry += v;
      v *= 0.92;
      write();
      if (Math.abs(v) < 0.02) { raf.current = 0; live(false); return; }
      raf.current = requestAnimationFrame(tick);
    };
    raf.current = requestAnimationFrame(tick);
  }, [live, write]);

  const onPointerDown = useCallback<React.PointerEventHandler<HTMLElement>>((e) => {
    if (e.button !== 0 && e.pointerType === "mouse") return;
    stopInertia();
    live(false);
    lastWasDrag.current = false;
    gesture.current = { id: e.pointerId, x0: e.clientX, y0: e.clientY, x: e.clientX, y: e.clientY, claimed: false, done: false };
    samples.current = [];
  }, [live, stopInertia]);

  const onPointerMove = useCallback<React.PointerEventHandler<HTMLElement>>((e) => {
    const g = gesture.current;
    if (!g || g.done || e.pointerId !== g.id) return;
    if (!g.claimed) {
      const dx0 = e.clientX - g.x0, dy0 = e.clientY - g.y0;
      if (Math.abs(dx0) <= CLAIM_PX || Math.abs(dx0) <= Math.abs(dy0)) {
        // A vertical intent is the page's: let it go (pan-y) and never claim this gesture.
        if (Math.abs(dy0) > CLAIM_PX && Math.abs(dy0) > Math.abs(dx0)) g.done = true;
        return;
      }
      g.claimed = true;
      g.x = e.clientX; g.y = e.clientY;
      try { e.currentTarget.setPointerCapture(e.pointerId); } catch {}
      live(true);
      setDragging(true);
      lastWasDrag.current = true;
    }
    const dx = e.clientX - g.x, dy = e.clientY - g.y;
    g.x = e.clientX; g.y = e.clientY;
    rot.current.ry += dx * sensitivity;
    rot.current.rx = clamp(rot.current.rx - dy * 0.3);
    const s = samples.current;
    s.push({ t: e.timeStamp, dx: dx * sensitivity });
    if (s.length > 3) s.shift();
    write();
  }, [clamp, live, sensitivity, write]);

  const finish = useCallback<React.PointerEventHandler<HTMLElement>>((e) => {
    const g = gesture.current;
    if (!g || e.pointerId !== g.id) return;
    gesture.current = null;
    if (!g.claimed) return;
    try { e.currentTarget.releasePointerCapture(e.pointerId); } catch {}
    setDragging(false);
    const s = samples.current;
    const idle = s.length ? e.timeStamp - s[s.length - 1].t : Infinity;
    let v = 0;
    if (e.type !== "pointercancel" && s.length >= 2 && idle < 80) {
      const span = s[s.length - 1].t - s[0].t;
      const sum = s.slice(1).reduce((a, x) => a + x.dx, 0);
      if (span > 0) v = (sum / span) * FRAME;
    }
    samples.current = [];
    if (Math.abs(v) >= 0.02) startInertia(v);
    else live(false);
  }, [live, startInertia]);

  const onKeyDown = useCallback<React.KeyboardEventHandler<HTMLElement>>((e) => {
    if (e.altKey || e.ctrlKey || e.metaKey) return;
    switch (e.key) {
      case "ArrowLeft": e.preventDefault(); step(-keyStep); break;
      case "ArrowRight": e.preventDefault(); step(keyStep); break;
      case "ArrowUp": e.preventDefault(); pitch(-Math.round(keyStep * 0.6)); break;
      case "ArrowDown": e.preventDefault(); pitch(Math.round(keyStep * 0.6)); break;
      case "Home": e.preventDefault(); reset(); break;
    }
  }, [keyStep, pitch, reset, step]);

  useEffect(() => () => stopInertia(), [stopInertia]);

  /** Whether the pointer sequence that just ended was a drag (so a click after it should be ignored). */
  const wasDrag = useCallback(() => lastWasDrag.current, []);

  const bind = useMemo<DragRotateBind>(() => ({ onPointerDown, onPointerMove, onPointerUp: finish, onPointerCancel: finish, onKeyDown }), [onPointerDown, onPointerMove, finish, onKeyDown]);

  return {
    bind,
    ref,
    set,
    step,
    reset,
    dragging,
    wasDrag,
    /** Inline style for the first paint, so SSR and the hook agree before any input. */
    initialStyle: { "--rx": `${initial.rx}deg`, "--ry": `${initial.ry}deg` } as React.CSSProperties,
  };
}
