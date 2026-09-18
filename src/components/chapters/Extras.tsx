import { Fragment } from "react";
import { CHAPTERS, type Chapter } from "@/content/chapters";
import { resume } from "@/content/resume";
import { VideoPanel } from "@/components/print/VideoPanel";
import { Panel } from "@/components/print/Panel";
import { Caption } from "@/components/print/Caption";
import { Eyebrow } from "@/components/print/Eyebrow";
import { Kanji } from "@/components/print/Kanji";
import { BilingualStrip } from "./BilingualStrip";
import { AnimeTV } from "./AnimeTV";
import "@/styles/extras.css";

const ch = CHAPTERS.find((c) => c.id === "extras") as Chapter;

/* 04 / EXTRAS: papers, posts and certifications, over the bedroom loop printed dimmer. */
export function Extras() {
  const { profile, papers, posts, certs } = resume;
  return (
    <VideoPanel video="bedroom" dim={0.85} id={ch.id} data-chapter={ch.id} className="chapter x-extras" ariaLabel={`${ch.en} · ${ch.plain}`}>
      <div className="wrap">
        <div className="chapter-head x-head">
          <Eyebrow n={ch.n} className="x-eyebrow">{ch.en}</Eyebrow>
          <h2 className="chapter-title">{ch.en}</h2>
          <div className="x-head-side">
            <Kanji en={ch.en} jp={ch.jp} romaji={ch.romaji} />
            <span className="x-plain">{ch.plain}</span>
          </div>
        </div>
      </div>

      {/* Between the head and the blocks: sticky and drifting where scroll-driven animations exist, a static centred line otherwise. */}
      <BilingualStrip />

      <div className="wrap">
        <section className="x-block" aria-labelledby="x-papers-h">
          <header className="x-block-head">
            <h3 id="x-papers-h" className="x-block-title">Papers</h3>
            <span className="mono-label x-block-note">Peer-reviewed · chronological</span>
          </header>
          <div className="x-papers">
            {papers.map((p) => (
              <Panel key={p.id} className="hard-shadow ink-in x-paper">
                <div className="x-paper-head">
                  <Caption>Paper</Caption>
                  <span className={p.status === "published" ? "x-status" : "x-status x-status-review"}>{p.status === "published" ? "Published" : "Under review"}</span>
                </div>
                <h4 className="x-paper-title">{p.title}</h4>
                <p className="mono-label x-paper-meta">{p.venue} · {p.year}</p>
                <p className="x-authors">
                  {p.authors.map((a, k) => (
                    <Fragment key={a}>
                      {k > 0 ? ", " : null}
                      {k === p.authorIndex ? <b>{a}</b> : a}
                    </Fragment>
                  ))}
                </p>
                {p.doi || p.href ? (
                  <p className="x-paper-links">
                    {p.doi ? <a href={`https://doi.org/${p.doi}`} target="_blank" rel="noopener">DOI {p.doi}</a> : null}
                    {p.href ? <a href={p.href} target="_blank" rel="noopener">Read ↗</a> : null}
                  </p>
                ) : null}
              </Panel>
            ))}
          </div>
        </section>

        <section className="x-block" aria-labelledby="x-posts-h">
          <header className="x-block-head">
            <h3 id="x-posts-h" className="x-block-title">Posts</h3>
            <span className="mono-label x-block-note">{posts.length} on Medium · <a href={profile.medium} target="_blank" rel="noopener">All posts ↗</a></span>
          </header>
          <div className="paper ink-border hard-shadow ink-in x-posts-panel">
            <ol className="x-posts">
              {posts.map((p) => (
                <li key={p.id}>
                  <time className="x-date" dateTime={p.date}>{p.date}</time>
                  <a className="x-post-title" href={p.href} target="_blank" rel="noopener">{p.title}</a>
                  <span className="x-words">{p.words} words</span>
                  <span className="x-tags">
                    {p.tags.map((t) => <span key={t} className="x-chip">{t}</span>)}
                  </span>
                </li>
              ))}
            </ol>
          </div>
        </section>

        <section className="x-block" aria-labelledby="x-certs-h">
          <header className="x-block-head">
            <h3 id="x-certs-h" className="x-block-title">Certifications</h3>
            <span className="mono-label x-block-note">{certs.length} episodes · dial by hand</span>
          </header>
          <AnimeTV certs={certs} />
        </section>
      </div>
    </VideoPanel>
  );
}
