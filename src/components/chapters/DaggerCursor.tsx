"use client";
import { useEffect, useRef, useSyncExternalStore } from "react";

/* ============================================================================
   The dagger cursor. Fine pointers only, and only while the pointer is inside
   the section it is given. The OS cursor is hidden by [data-dagger] on that
   section; one fixed element follows the pointer through a spring, written as
   a transform in a rAF loop that stops as soon as it settles. Velocity leans
   the blade, pointerdown stabs, and a crosshair appears over anything you
   can press so the affordance is never lost. Touch and reduced motion: the
   component renders nothing and the OS cursor stays.
   No layout reads per pointer event; the section rect is read once per
   scroll frame only while the dagger is active, to catch the pointer leaving
   the section under a scroll.
   ========================================================================== */

const AIM = "a, button, select, input, textarea, summary, [role=button]";
const MEDIA = ["(pointer: fine) and (hover: hover)", "(prefers-reduced-motion: reduce)"];
/* Fine pointer, hover, and no reduced-motion request: the server says no, the client answers for itself. */
const readMedia = () => window.matchMedia(MEDIA[0]).matches && !window.matchMedia(MEDIA[1]).matches;
const subscribeMedia = (cb: () => void) => {
  const qs = MEDIA.map((m) => window.matchMedia(m));
  qs.forEach((q) => q.addEventListener("change", cb));
  return () => qs.forEach((q) => q.removeEventListener("change", cb));
};

export function DaggerCursor({ sectionRef }: { sectionRef: React.RefObject<HTMLElement | null> }) {
  const elRef = useRef<HTMLDivElement>(null);
  const rotRef = useRef<HTMLDivElement>(null);
  const enabled = useSyncExternalStore(subscribeMedia, readMedia, () => false);

  useEffect(() => {
    if (!enabled) return;
    const sec = sectionRef.current, el = elRef.current, rot = rotRef.current;
    if (!sec || !el || !rot) return;

    const s = { active: false, aim: false, tx: 0, ty: 0, x: 0, y: 0, vx: 0, vy: 0, lean: 0, raf: 0, scrollRaf: 0, stab: 0 };

    const paint = () => {
      el.style.transform = `translate3d(${s.x.toFixed(1)}px, ${s.y.toFixed(1)}px, 0)`;
      rot.style.transform = `rotate(${(-40 + s.lean).toFixed(1)}deg)`;
    };
    const tick = () => {
      s.raf = 0;
      // A light spring: the blade trails the hand and settles without a wobble.
      s.vx = (s.vx + (s.tx - s.x) * 0.32) * 0.62;
      s.vy = (s.vy + (s.ty - s.y) * 0.32) * 0.62;
      s.x += s.vx; s.y += s.vy;
      const target = Math.max(-24, Math.min(24, s.vx * 1.4));
      s.lean += (target - s.lean) * 0.3;
      paint();
      const moving = Math.abs(s.tx - s.x) > 0.15 || Math.abs(s.ty - s.y) > 0.15 || Math.abs(s.vx) > 0.05 || Math.abs(s.vy) > 0.05 || Math.abs(s.lean) > 0.2;
      if (moving) s.raf = requestAnimationFrame(tick);
      else { s.x = s.tx; s.y = s.ty; s.vx = s.vy = 0; s.lean = 0; paint(); }
    };
    const kick = () => { if (!s.raf) s.raf = requestAnimationFrame(tick); };

    const activate = (on: boolean) => {
      if (s.active === on) return;
      s.active = on;
      sec.toggleAttribute("data-dagger", on);
      el.classList.toggle("is-on", on);
      if (!on) { if (s.raf) cancelAnimationFrame(s.raf); s.raf = 0; s.aim = false; el.classList.remove("is-aim", "is-stab"); }
    };
    const isMouse = (e: PointerEvent) => e.pointerType === "mouse" || e.pointerType === "pen";
    const snapTo = (e: PointerEvent) => { s.x = s.tx = e.clientX; s.y = s.ty = e.clientY; s.vx = s.vy = 0; s.lean = 0; paint(); };

    const onEnter = (e: PointerEvent) => { if (!isMouse(e)) return; snapTo(e); activate(true); };
    const onMove = (e: PointerEvent) => {
      if (!isMouse(e)) return;
      if (!s.active) { snapTo(e); activate(true); return; }
      s.tx = e.clientX; s.ty = e.clientY;
      kick();
    };
    const onLeave = () => activate(false);
    const onDown = (e: PointerEvent) => {
      if (!s.active || !isMouse(e)) return;
      el.classList.add("is-stab");
      window.clearTimeout(s.stab);
      s.stab = window.setTimeout(() => el.classList.remove("is-stab"), 140);
    };
    const onOver = (e: PointerEvent) => {
      const t = e.target as Element | null;
      const aim = !!(t && t.closest && t.closest(AIM));
      if (aim !== s.aim) { s.aim = aim; el.classList.toggle("is-aim", aim); }
    };
    /* A scroll can carry the section away from a still pointer without any boundary event. */
    const onScroll = () => {
      if (!s.active || s.scrollRaf) return;
      s.scrollRaf = requestAnimationFrame(() => {
        s.scrollRaf = 0;
        const r = sec.getBoundingClientRect();
        if (s.ty < r.top || s.ty > r.bottom) activate(false);
      });
    };
    const onHidden = () => { if (document.hidden) activate(false); };

    sec.addEventListener("pointerenter", onEnter);
    sec.addEventListener("pointermove", onMove, { passive: true });
    sec.addEventListener("pointerleave", onLeave);
    sec.addEventListener("pointerdown", onDown, { passive: true });
    sec.addEventListener("pointerover", onOver, { passive: true });
    window.addEventListener("scroll", onScroll, { passive: true });
    window.addEventListener("blur", onLeave);
    window.addEventListener("open-resume", onLeave);
    document.addEventListener("visibilitychange", onHidden);
    return () => {
      sec.removeEventListener("pointerenter", onEnter);
      sec.removeEventListener("pointermove", onMove);
      sec.removeEventListener("pointerleave", onLeave);
      sec.removeEventListener("pointerdown", onDown);
      sec.removeEventListener("pointerover", onOver);
      window.removeEventListener("scroll", onScroll);
      window.removeEventListener("blur", onLeave);
      window.removeEventListener("open-resume", onLeave);
      document.removeEventListener("visibilitychange", onHidden);
      window.clearTimeout(s.stab);
      if (s.scrollRaf) cancelAnimationFrame(s.scrollRaf);
      activate(false);
    };
  }, [enabled, sectionRef]);

  if (!enabled) return null;
  return (
    <div ref={elRef} className="dagger" aria-hidden="true">
      <div ref={rotRef} className="dagger-rot">
        <div className="dagger-body">
          {/* The tantō, tip at (16, 1): the hotspot. */}
          <svg className="dagger-svg" viewBox="0 0 32 64" width="32" height="64" focusable="false">
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
      {/* The crosshair sits on the hotspot over anything you can press. */}
      <svg className="dagger-aim" viewBox="0 0 24 24" width="24" height="24" focusable="false">
        <circle className="dg-aim-ring" cx="12" cy="12" r="7.5" />
        <path className="dg-aim-cross" d="M12 1V5.5M12 18.5V23M1 12H5.5M18.5 12H23" />
        <circle className="dg-aim-ring2" cx="12" cy="12" r="7.5" />
        <path className="dg-aim-cross2" d="M12 1V5.5M12 18.5V23M1 12H5.5M18.5 12H23" />
      </svg>
    </div>
  );
}
