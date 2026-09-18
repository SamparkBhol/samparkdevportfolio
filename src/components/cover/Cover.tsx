"use client";
import { useCallback, useEffect, useRef, useState } from "react";
import { resume } from "@/content/resume";
import { CHAPTERS } from "@/content/chapters";
import { VideoPanel } from "@/components/print/VideoPanel";
import { Eyebrow } from "@/components/print/Eyebrow";
import { Panel } from "@/components/print/Panel";
import { Book3D } from "./Book3D";
import "@/styles/cover.css";

/* 00 / COVER · Start. The city loop printed full-bleed, the kicker, the name, the narration box,
   two buttons and the book (the masthead menu and the progress strip are the map). Scrolling on,
   the backdrop zooms 1 → 1.12 and darkens (CSS scroll timeline). */

const { profile } = resume;
const { issue } = profile;
const cover = CHAPTERS[0];
const nameLines = profile.name.split(" ");
const isTyping = (t: EventTarget | null) => t instanceof HTMLElement && (t.tagName === "INPUT" || t.tagName === "TEXTAREA" || t.tagName === "SELECT" || t.isContentEditable);

export function Cover() {
  const [open, setOpen] = useState(false);
  const bookRef = useRef<HTMLDivElement>(null);
  const toggle = useCallback(() => setOpen((o) => !o), []);

  const openIssue = useCallback(() => {
    setOpen((o) => !o);
    const el = bookRef.current;
    if (!el) return;
    const r = el.getBoundingClientRect();
    const fits = r.top >= 0 && r.bottom <= window.innerHeight;
    if (!fits) el.scrollIntoView({ block: "center", behavior: window.matchMedia("(prefers-reduced-motion: reduce)").matches ? "instant" : "smooth" });
  }, []);

  // O opens the issue from anywhere on the page, like R opens the résumé.
  useEffect(() => {
    const onKey = (e: KeyboardEvent) => {
      if (isTyping(e.target) || e.metaKey || e.ctrlKey || e.altKey) return;
      if (e.key === "o" || e.key === "O") { e.preventDefault(); openIssue(); }
    };
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, [openIssue]);

  const readResume = useCallback(() => window.dispatchEvent(new CustomEvent("open-resume")), []);

  return (
    <VideoPanel video="city" priority dim={0.6} id={cover.id} data-chapter={cover.id} className="chapter cover" ariaLabel={`${cover.n} / ${cover.en} · ${cover.plain}`}>
      <div className="trim-guide" aria-hidden="true" />
      <i className="reg-cross rc-tl" aria-hidden="true" /><i className="reg-cross rc-tr" aria-hidden="true" />
      <i className="reg-cross rc-bl" aria-hidden="true" /><i className="reg-cross rc-br" aria-hidden="true" />

      <div className="wrap cover-grid">
        <div className="cover-head">
          <Eyebrow n={cover.n}>ISSUE No.{issue.number} · {issue.month.toUpperCase()} · {issue.price.toUpperCase()}</Eyebrow>
          <h1 className="cover-name display stroke">{nameLines.map((w) => <span key={w} className="cover-name-line">{w}</span>)}</h1>
          <p className="cover-class mono-label">{profile.classLine}</p>
        </div>

        <div className="cover-book" ref={bookRef}>
          <Book3D open={open} onToggle={toggle} />
        </div>

        <div className="cover-body">
          <Panel className="cover-narration hard-shadow">
            <strong className="cover-narration-lead">{profile.title} · {profile.employer} · {profile.location}</strong>
            <span>{profile.narration}</span>
          </Panel>
          <div className="cover-actions">
            <button type="button" className="btn btn-red" onClick={openIssue} aria-pressed={open} aria-keyshortcuts="O">
              {open ? "CLOSE THE ISSUE ◀" : "OPEN THE ISSUE ▶"}
            </button>
            <button type="button" className="btn" onClick={readResume} aria-keyshortcuts="R">READ AS RÉSUMÉ · R</button>
          </div>
        </div>
      </div>
    </VideoPanel>
  );
}
