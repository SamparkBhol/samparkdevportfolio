"use client";
import { useRef, useState } from "react";
import type { Project } from "@/content/types";
import { Sfx } from "@/components/print";

/* The non-featured projects as two-face flip cards. Front: NAME vs the problem it beats. Back: the idea and the links.
   The card flips on click, Enter or Space (the whole front is a button); the back carries FLIP BACK.
   3D: .vs-card is the perspective container, .vs-inner preserves 3D, both faces hide their backface. The hidden
   face is `inert`, so nothing behind the card can be tabbed to or clicked. */
function VsCard({ project }: { project: Project }) {
  const [flipped, setFlipped] = useState(false);
  const front = useRef<HTMLButtonElement>(null);
  const back = useRef<HTMLButtonElement>(null);
  const flip = (to: boolean) => {
    setFlipped(to);
    requestAnimationFrame(() => (to ? back : front).current?.focus({ preventScroll: true }));
  };
  return (
    <div className="vs-card" data-flipped={flipped ? "true" : undefined} style={{ "--accent": project.accent } as React.CSSProperties}>
      <div className="vs-inner">
        <div className="vs-face vs-front paper ink-border" inert={flipped} aria-hidden={flipped}>
          <button ref={front} type="button" className="vs-flip" onClick={() => flip(true)} aria-expanded={flipped}>
            <span className="mono-label vs-stamp">{project.stamp}</span>
            <span className="display vs-name">{project.name}</span>
            <span className="vs-vsrow"><Sfx size={34}>vs</Sfx><span className="sr-only">versus</span></span>
            <span className="vs-foe">{project.vs}</span>
            <span className="mono-label vs-hint">Click to flip</span>
          </button>
        </div>
        <div className="vs-face vs-back paper ink-border" inert={!flipped} aria-hidden={!flipped}>
          <div className="vs-band" aria-hidden="true" />
          <p className="mono-label vs-meta">{project.name} · No. {project.year}</p>
          <p className="vs-idea">{project.idea}</p>
          <div className="vs-links">
            {project.links.live ? <a className="btn btn-sm btn-red" href={project.links.live} target="_blank" rel="noopener">Live ↗</a> : null}
            <a className="btn btn-sm" href={project.links.code} target="_blank" rel="noopener">Code ↗</a>
            <button ref={back} type="button" className="btn btn-sm vs-unflip" onClick={() => flip(false)}>Flip back</button>
          </div>
        </div>
      </div>
    </div>
  );
}

export function VsCards({ projects }: { projects: Project[] }) {
  return (
    <div className="vs-grid" role="list" aria-label="The rest of the roster">
      {projects.map((p) => (
        <div key={p.id} role="listitem"><VsCard project={p} /></div>
      ))}
    </div>
  );
}
