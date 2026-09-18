"use client";
import { useEffect, useState } from "react";
import { CHAPTERS } from "@/content/chapters";

/** One tick per chapter. The active tick follows the chapter under the middle of the viewport; the URL hash follows it too. */
export function ProgressStrip() {
  const [active, setActive] = useState("cover");
  useEffect(() => {
    const sections = CHAPTERS.map((c) => document.getElementById(c.id)).filter((x): x is HTMLElement => !!x);
    if (!sections.length) return;
    const io = new IntersectionObserver((entries) => {
      entries.forEach((e) => {
        if (e.isIntersecting) {
          setActive(e.target.id);
          window.dispatchEvent(new CustomEvent("chapter-change", { detail: e.target.id }));
          const hash = e.target.id === "cover" ? " " : `#${e.target.id}`;
          if (location.hash !== hash.trim()) history.replaceState(null, "", hash.trim() || location.pathname);
        }
      });
    }, { rootMargin: "-42% 0px -42% 0px", threshold: 0 });
    sections.forEach((s) => io.observe(s));
    return () => io.disconnect();
  }, []);
  return (
    <nav className="strip" aria-label="Chapters">
      {CHAPTERS.map((c) => (
        <a key={c.id} href={`#${c.id}`} className={active === c.id ? "strip-tick cur" : "strip-tick"} aria-current={active === c.id ? "true" : undefined} title={`${c.n} ${c.en} · ${c.plain}`}>
          <span className="strip-n">{c.n}</span><span className="strip-l">{c.short}</span>
        </a>
      ))}
    </nav>
  );
}
