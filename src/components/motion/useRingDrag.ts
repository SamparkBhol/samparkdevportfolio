"use client";
import { useCallback, useEffect, useMemo, useRef, useState } from "react";

/* A horizontal pointer drag that turns into one angle, written as --ry on `ref`.
   Local to the cartridge ring (Task 5 owns the canonical useDragRotate).
   - Claims the gesture only once it is clearly horizontal (|dx| > 6 px and |dx| > |dy|); until then the
     browser keeps the touch for vertical scrolling (the stage sets touch-action: pan-y) and a plain
     click on a cartridge stays a click.
   - Captures the pointer only after claiming, so clicks never get re-targeted.
   - Decays with inertia on release (v *= friction per frame) and stops on its own; no idle loop.
   - `set`/`by` animate through a CSS transition class (.is-easing) the stylesheet defines; reduced motion
     skips both the transition and the inertia. */
export function useRingDrag({ sensitivity = 0.35, friction = 0.93, initial = 0 }: { sensitivity?: number; friction?: number; initial?: number } = {}) {
  const ref = useRef<HTMLDivElement | null>(null);
  const s = useRef({ ry: initial, v: 0, down: false, claimed: false, moved: false, id: -1, x0: 0, y0: 0, lx: 0, lt: 0, raf: 0, ease: 0 });
  const [dragging, setDragging] = useState(false);

  const reduced = () => typeof window !== "undefined" && window.matchMedia("(prefers-reduced-motion: reduce)").matches;
  const paint = useCallback(() => { ref.current?.style.setProperty("--ry", `${s.current.ry}deg`); }, []);
  const stopInertia = useCallback(() => { if (s.current.raf) cancelAnimationFrame(s.current.raf); s.current.raf = 0; }, []);

  useEffect(() => {
    const st = s.current;
    paint();
    return () => { stopInertia(); window.clearTimeout(st.ease); };
  }, [paint, stopInertia]);

  const set = useCallback((ry: number, animate = false) => {
    stopInertia();
    const el = ref.current;
    s.current.ry = ry;
    if (el && animate && !reduced()) {
      el.classList.add("is-easing");
      window.clearTimeout(s.current.ease);
      s.current.ease = window.setTimeout(() => el.classList.remove("is-easing"), 560);
    }
    paint();
  }, [paint, stopInertia]);

  const by = useCallback((delta: number, animate = true) => set(s.current.ry + delta, animate), [set]);

  const inertia = useCallback(() => {
    const tick = () => {
      const st = s.current;
      st.ry += st.v;
      st.v *= friction;
      paint();
      if (Math.abs(st.v) < 0.02) { st.raf = 0; return; }
      st.raf = requestAnimationFrame(tick);
    };
    s.current.raf = requestAnimationFrame(tick);
  }, [friction, paint]);

  const onPointerDown = useCallback((e: React.PointerEvent<HTMLElement>) => {
    if (e.pointerType === "mouse" && e.button !== 0) return;
    const st = s.current;
    stopInertia();
    ref.current?.classList.remove("is-easing");
    st.down = true; st.claimed = false; st.moved = false; st.id = e.pointerId; st.v = 0;
    st.x0 = st.lx = e.clientX; st.y0 = e.clientY; st.lt = e.timeStamp;
  }, [stopInertia]);

  const onPointerMove = useCallback((e: React.PointerEvent<HTMLElement>) => {
    const st = s.current;
    if (!st.down || e.pointerId !== st.id) return;
    const dx = e.clientX - st.x0, dy = e.clientY - st.y0;
    if (!st.claimed) {
      if (Math.abs(dx) > 6 && Math.abs(dx) > Math.abs(dy)) {
        st.claimed = true; st.moved = true;
        try { e.currentTarget.setPointerCapture(e.pointerId); } catch {}
        setDragging(true);
        st.lx = e.clientX; st.lt = e.timeStamp;
      } else if (Math.abs(dy) > 6) {
        st.down = false; // a vertical gesture belongs to the page
      }
      return;
    }
    const step = (e.clientX - st.lx) * sensitivity;
    const dt = Math.max(1, e.timeStamp - st.lt);
    const perFrame = Math.max(-18, Math.min(18, step * (16 / dt)));
    st.v = st.v === 0 ? perFrame : 0.65 * perFrame + 0.35 * st.v;
    st.ry += step;
    st.lx = e.clientX; st.lt = e.timeStamp;
    paint();
  }, [paint, sensitivity]);

  const end = useCallback((e: React.PointerEvent<HTMLElement>) => {
    const st = s.current;
    if (!st.down || e.pointerId !== st.id) return;
    st.down = false;
    if (!st.claimed) return;
    st.claimed = false;
    try { e.currentTarget.releasePointerCapture(e.pointerId); } catch {}
    setDragging(false);
    if (e.timeStamp - st.lt > 90) st.v = 0; // the hand stopped before letting go
    if (!reduced() && Math.abs(st.v) >= 0.02) inertia(); else st.v = 0;
  }, [inertia]);

  const bind = useMemo(() => ({ onPointerDown, onPointerMove, onPointerUp: end, onPointerCancel: end }), [onPointerDown, onPointerMove, end]);
  const moved = useCallback(() => s.current.moved, []);
  const get = useCallback(() => s.current.ry, []);
  return { ref, bind, set, by, get, moved, dragging };
}
