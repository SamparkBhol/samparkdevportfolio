"use client";
import { useCallback, useEffect, useRef, useState } from "react";
import type { Project } from "@/content/types";
import { IssueCover, IssueInside } from "./IssueCover";

const ROT = ["-22deg", "-9deg", "13deg", "24deg"];
const DX = ["-45%", "-15%", "15%", "45%"];

/* Four featured projects as a hand of comic issues. Hover lifts one; click or Enter opens it as a two-page
   spread (cover left, inside page right) while the rest dim; ← / → page between issues; Esc or CLOSE returns.
   On phones the hand becomes a scroll-snap row and the inside page opens below it. */
export function IssueFan({ projects }: { projects: Project[] }) {
  const [focus, setFocus] = useState<string | null>(null);
  const [phone, setPhone] = useState(false);
  const btns = useRef<(HTMLButtonElement | null)[]>([]);
  const sheet = useRef<HTMLDivElement>(null);
  const idx = projects.findIndex((p) => p.id === focus);
  const open = idx >= 0 ? projects[idx] : null;

  useEffect(() => {
    const mq = window.matchMedia("(max-width: 720px)");
    const sync = () => setPhone(mq.matches);
    sync();
    mq.addEventListener("change", sync);
    return () => mq.removeEventListener("change", sync);
  }, []);

  const close = useCallback(() => {
    const i = projects.findIndex((p) => p.id === focus);
    setFocus(null);
    btns.current[i]?.focus({ preventScroll: true });
  }, [focus, projects]);

  useEffect(() => {
    if (!focus) return;
    const onKey = (e: KeyboardEvent) => { if (e.key === "Escape") { e.preventDefault(); close(); } };
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, [focus, close]);

  useEffect(() => {
    if (!focus || !phone) return;
    const reduced = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
    sheet.current?.scrollIntoView({ block: "nearest", behavior: reduced ? "auto" : "smooth" });
  }, [focus, phone]);

  const go = (i: number) => {
    const next = projects[(i + projects.length) % projects.length];
    setFocus(next.id);
    btns.current[(i + projects.length) % projects.length]?.focus({ preventScroll: true });
  };

  const onKeyDown = (e: React.KeyboardEvent) => {
    if (e.key !== "ArrowLeft" && e.key !== "ArrowRight") return;
    const dir = e.key === "ArrowRight" ? 1 : -1;
    e.preventDefault();
    if (open) { go(idx + dir); return; }
    const cur = btns.current.findIndex((b) => b === document.activeElement);
    if (cur >= 0) btns.current[(cur + dir + projects.length) % projects.length]?.focus();
  };

  const toggle = (p: Project) => setFocus((cur) => (cur === p.id ? null : p.id));
  const pageId = open ? `issue-page-${open.id}` : undefined;

  return (
    <div className="fan" onKeyDown={onKeyDown}>
      <div className="fan-stage" role="group" aria-label="Back issues: the featured projects. Enter opens an issue, the arrow keys page between issues, Escape closes." data-focus={focus ?? undefined}>
        {projects.map((p, i) => (
          <div key={p.id} className="fan-slot" data-on={focus === p.id ? "true" : undefined} style={{ "--rot": ROT[i % ROT.length], "--dx": DX[i % DX.length], "--z": i + 1 } as React.CSSProperties}>
            <button
              ref={(el) => { btns.current[i] = el; }}
              type="button"
              className="fan-btn"
              aria-expanded={focus === p.id}
              aria-controls={focus === p.id ? pageId : undefined}
              onClick={() => toggle(p)}
              title={`${p.name}: open the issue`}
            >
              <IssueCover project={p} />
            </button>
          </div>
        ))}
        {open && !phone ? (
          <div className="fan-inside" key={open.id}>
            <IssueInside id={pageId} project={open} onClose={close} />
          </div>
        ) : null}
      </div>
      <p className="mono-label fan-help" aria-hidden="true">{phone ? "Swipe · tap to open · ← → · Esc" : "Hover to lift · click to open · ← → page · Esc"}</p>
      {open && phone ? (
        <div className="fan-sheet" ref={sheet} key={`sheet-${open.id}`}>
          <IssueInside id={pageId} project={open} onClose={close} />
        </div>
      ) : null}
    </div>
  );
}
