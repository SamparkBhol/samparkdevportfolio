"use client";
import { useState } from "react";
import { CHAPTERS } from "@/content/chapters";
import { resume } from "@/content/resume";
import { Eyebrow, Kanji } from "@/components/print";
import { Scroll } from "./Scroll";
import "@/styles/archives.css";

/* 07 / ARCHIVES · 書庫 shoko · Research.
   A library: ink-drawn shelves under a reading lamp, a card-catalogue index on the left, and every
   paper in resume.papers as a parchment scroll you unroll. No video here; the shelves are one
   masked layer and the lamp one gradient. */

/* One line per paper, written from its title alone (no figures). */
const LINES: Record<string, string> = {
  wsn: "A hybrid communication protocol for wireless sensor networks spread over a large area: nodes mix communication modes so that carrying data across the network costs less energy.",
  quantum: "How many queries a hybrid classical and quantum procedure needs to verify a hypothesis when the prior is structured and the phase carries bounded noise.",
};

export function Archives() {
  const ch = CHAPTERS.find((c) => c.id === "archives") ?? { id: "archives", n: "07", en: "ARCHIVES", jp: "書庫", romaji: "shoko", plain: "Research" };
  const { papers } = resume;
  const [open, setOpen] = useState<Record<string, boolean>>({});
  const set = (id: string, v: boolean) => setOpen((o) => (o[id] === v ? o : { ...o, [id]: v }));
  const jump = (id: string) => {
    set(id, true);
    const reduced = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
    document.getElementById(`scroll-${id}`)?.scrollIntoView({ block: "nearest", behavior: reduced ? "auto" : "smooth" });
  };
  const published = papers.filter((p) => p.status === "published").length;
  const review = papers.length - published;

  return (
    <section id={ch.id} data-chapter={ch.id} className="chapter arch" aria-labelledby="arch-title">
      <span className="arch-shelves" aria-hidden="true" />
      <span className="arch-lamp" aria-hidden="true" />
      <div className="wrap arch-wrap">
        <div className="chapter-head ink-in">
          <Eyebrow n={ch.n}>{ch.en}</Eyebrow>
          <span className="arch-plain">{ch.plain}</span>
        </div>
        <div className="arch-titlerow ink-in">
          <h2 id="arch-title" className="chapter-title">Archives</h2>
          <Kanji en={ch.en} jp={ch.jp} romaji={ch.romaji} />
        </div>
        <p className="arch-intro ink-in">Every paper is a scroll. Pull its lower rod, tap its title, or pick it from the catalogue card.</p>

        <div className="arch-grid">
          <aside className="arch-index paper ink-border hard-shadow ink-in" aria-label="Catalogue card">
            <p className="mono-label arch-index-head"><span>Shelf {ch.n}</span><span>{ch.plain}</span></p>
            <ol className="arch-index-list">
              {papers.map((p, i) => (
                <li key={p.id}>
                  <button type="button" className="arch-index-btn" aria-expanded={!!open[p.id]} aria-controls={`scroll-${p.id}-body`} onClick={() => jump(p.id)}>
                    <span className="arch-index-n" aria-hidden="true">{i + 1}</span>
                    <span className="arch-index-t">{p.title}</span>
                    <span className="mono-label arch-index-m">{p.year} · {p.status}</span>
                  </button>
                </li>
              ))}
            </ol>
            <p className="mono-label arch-index-sum"><span>{papers.length} scrolls</span> · <span>{published} published</span> · <span>{review} under review</span></p>
            <span className="arch-index-hole" aria-hidden="true" />
          </aside>

          <div className="arch-scrolls">
            {papers.map((p, i) => (
              <Scroll key={p.id} paper={p} n={i + 1} open={!!open[p.id]} onToggle={(v) => set(p.id, v)} line={LINES[p.id] ?? paper_line(p.title)} />
            ))}
          </div>
        </div>
      </div>
    </section>
  );
}

/** Fallback for a paper without a hand-written line: the title, as a sentence. */
function paper_line(title: string) { return `${title}.`; }

export default Archives;
