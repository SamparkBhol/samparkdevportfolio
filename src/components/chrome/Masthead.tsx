"use client";
import { CHAPTERS } from "@/content/chapters";
import { resume } from "@/content/resume";
import { InkSwatches } from "./InkSwatches";

export function openResume() { window.dispatchEvent(new CustomEvent("open-resume")); }

export function Masthead() {
  const { profile } = resume;
  return (
    <header className="masthead">
      <a href="#cover" className="mast-brand">{profile.issue.title} <span className="mast-vol">· {profile.issue.volume}</span></a>
      <details className="mast-contents">
        <summary className="mono-label">Contents</summary>
        <ol>
          {CHAPTERS.map((c) => (
            <li key={c.id}><a href={`#${c.id}`}><span className="mast-n">{c.n}</span> <span>{c.en}</span> <span className="mast-plain">{c.plain}</span></a></li>
          ))}
          <li><a href="/resume/"><span className="mast-n">R</span> <span>RÉSUMÉ</span> <span className="mast-plain">plain page</span></a></li>
          <li><a href={profile.cvUrl}><span className="mast-n">↓</span> <span>CV.PDF</span> <span className="mast-plain">download</span></a></li>
          <li><a href={profile.linkedin} target="_blank" rel="noopener"><span className="mast-n">in</span> <span>LINKEDIN</span> <span className="mast-plain">profile</span></a></li>
        </ol>
      </details>
      <span className="mast-sp" />
      <nav className="mast-links" aria-label="Links">
        <a href={profile.cvUrl}>CV.pdf</a>
        <a href={profile.github} target="_blank" rel="noopener">GitHub</a>
        <a href={profile.linkedin} target="_blank" rel="noopener">LinkedIn</a>
      </nav>
      <span className="mast-ink"><InkSwatches /></span>
      <button type="button" className="mast-r" onClick={openResume} aria-keyshortcuts="R" title="Read the plain résumé (R)">Résumé · R</button>
    </header>
  );
}
