"use client";
import { useCallback, useEffect, useRef, useState } from "react";
import { ResumeDoc } from "@/components/resume/ResumeDoc";

const isTyping = (t: EventTarget | null) => t instanceof HTMLElement && (t.tagName === "INPUT" || t.tagName === "TEXTAREA" || t.isContentEditable);

/** The plain résumé, one keypress away from anywhere. R opens, Esc closes. */
export function RecruiterOverlay() {
  const [open, setOpen] = useState(false);
  const closeRef = useRef<HTMLButtonElement>(null);
  const restore = useRef<HTMLElement | null>(null);

  const swap = useCallback((next: boolean) => {
    const run = () => setOpen(next);
    const d = document as Document & { startViewTransition?: (cb: () => void) => void };
    if (d.startViewTransition && !window.matchMedia("(prefers-reduced-motion: reduce)").matches) d.startViewTransition(run); else run();
  }, []);

  useEffect(() => {
    const onKey = (e: KeyboardEvent) => {
      if (isTyping(e.target)) return;
      if ((e.key === "r" || e.key === "R") && !e.metaKey && !e.ctrlKey && !e.altKey) { e.preventDefault(); swap(!open); }
      if (e.key === "Escape" && open) swap(false);
    };
    const onOpen = () => swap(true);
    window.addEventListener("keydown", onKey);
    window.addEventListener("open-resume", onOpen);
    return () => { window.removeEventListener("keydown", onKey); window.removeEventListener("open-resume", onOpen); };
  }, [open, swap]);

  useEffect(() => {
    if (open) { restore.current = document.activeElement as HTMLElement; document.body.style.overflow = "hidden"; closeRef.current?.focus(); }
    else { document.body.style.overflow = ""; restore.current?.focus?.(); }
  }, [open]);

  if (!open) return null;
  return (
    <div className="rm" role="dialog" aria-modal="true" aria-label="Plain résumé" data-lenis-prevent>
      <div className="rm-bar">
        <span className="mono-label">Recruiter mode · the same facts, flat</span>
        <span style={{ flex: 1 }} />
        <a className="btn btn-sm" href="/resume/">Open as a page</a>
        <button ref={closeRef} type="button" className="btn btn-sm btn-red" onClick={() => swap(false)}>Back to the issue · Esc</button>
      </div>
      <ResumeDoc compact />
    </div>
  );
}
