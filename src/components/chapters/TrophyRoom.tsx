"use client";
import { useState } from "react";
import { CHAPTERS } from "@/content/chapters";
import { resume } from "@/content/resume";
import { Eyebrow } from "@/components/print/Eyebrow";
import { Kanji } from "@/components/print/Kanji";
import { Caption } from "@/components/print/Caption";
import { cn } from "@/lib/cn";
import { AnimeTV } from "./AnimeTV";
import { Medal } from "./Medal";
import "@/styles/trophies.css";

/* ============================================================================
   10 / TROPHY ROOM · 実績 jisseki · Certifications.
   A dark room: the anime TV on the left with the certifications as episodes,
   the episode guide and a rail of five medals on the right. The site cursor
   (chrome/Cursor.tsx) turns into the tantō dagger while the pointer is in here.
   ========================================================================== */

const CHAPTER_ID = "trophies";
const pad = (v: number) => String(v).padStart(2, "0");
const shortIssuer = (s: string) => s.split(" (")[0];

export function TrophyRoom() {
  const ch = CHAPTERS.find((c) => c.id === CHAPTER_ID) ?? CHAPTERS[10];
  const { certs } = resume;
  const [i, setI] = useState(0);

  return (
    <section id={CHAPTER_ID} data-chapter={CHAPTER_ID} className="chapter tr" aria-label={`${ch.n} ${ch.en} · ${ch.plain}`}>
      <div className="wrap">
        <header className="chapter-head tr-head">
          <div className="tr-head-row">
            <Eyebrow n={ch.n}>{ch.en}</Eyebrow>
            <span className="mono-label tr-plain">{ch.plain}</span>
          </div>
          <h2 className="chapter-title tr-title">{ch.en}</h2>
          <Kanji en={ch.en} jp={ch.jp} romaji={ch.romaji} />
          <p className="tr-lede">Five certifications, one episode each. Turn the knob; nothing plays by itself.</p>
        </header>

        <div className="tr-grid">
          <AnimeTV certs={certs} index={i} onChange={setI} className="ink-in" />

          <aside className="tr-side">
            <div className="paper ink-border hard-shadow tr-guide ink-in">
              <div className="tr-guide-head">
                <Caption>Episode guide</Caption>
                <span className="mono-label tr-guide-note">{certs.length} episodes · pick one</span>
              </div>
              <ol className="tr-eps">
                {certs.map((c, k) => (
                  <li key={c.id}>
                    <button type="button" className={cn("tr-ep", k === i && "is-on")} aria-current={k === i ? "true" : undefined} onClick={() => setI(k)}>
                      <span className="tr-ep-n">EP.{pad(c.ep)}</span>
                      <span className="tr-ep-body">
                        <span className="tr-ep-t">{c.title}</span>
                        <span className="mono-label tr-ep-m">{c.issuer} · {c.year}</span>
                      </span>
                      <span className="tr-ep-mark" aria-hidden="true">{k === i ? "▶" : ""}</span>
                    </button>
                  </li>
                ))}
              </ol>
            </div>

            <div className="tr-rail ink-in" role="group" aria-label="Medals, one per certification">
              {certs.map((c, k) => (
                <button key={c.id} type="button" className={cn("tr-medal", k === i && "is-on")} aria-pressed={k === i} aria-label={`${shortIssuer(c.issuer)}, episode ${pad(c.ep)}: ${c.title}`} onClick={() => setI(k)}>
                  <span className="tr-nail" aria-hidden="true" />
                  <Medal initial={c.issuer[0]} active={k === i} size={56} />
                  <span className="mono-label tr-medal-l">{shortIssuer(c.issuer)}</span>
                </button>
              ))}
            </div>
          </aside>
        </div>
      </div>
    </section>
  );
}
