import { CHAPTERS } from "@/content/chapters";
import { resume } from "@/content/resume";
import type { Post } from "@/content/types";
import { Eyebrow, Kanji, VideoPanel } from "@/components/print";
import { GameScreen } from "./GameScreen";
import "@/styles/transmissions.css";

/* 08 / TRANSMISSIONS · 放送 hōsō · Articles.
   Ten Medium posts as ten channels on a wall of CRT sets. Every set runs a game (a demo while the
   set is on screen, yours the moment you press PLAY); the paper programme card under it carries the
   date, the word count, the tags and the link. The station strip drifts with the page scroll only. */
const MONTHS = ["Jan", "Feb", "Mar", "Apr", "May", "Jun", "Jul", "Aug", "Sep", "Oct", "Nov", "Dec"];
function printed(iso: string) {
  const [y, m, d] = iso.split("-");
  return `${d} ${MONTHS[Number(m) - 1] ?? m} ${y}`;
}

function StationStrip() {
  return (
    <div className="tx-strip" aria-hidden="true">
      <div className="tx-strip-track">
        {[0, 1, 2, 3].map((k) => (
          <span key={k} className="tx-strip-run">
            <Kanji en="POSTS" jp="記事" romaji="kiji" />
            <span className="tx-strip-dot">·</span>
            <Kanji en="ON AIR" jp="放送中" romaji="hōsōchū" />
            <span className="tx-strip-dot">·</span>
          </span>
        ))}
      </div>
    </div>
  );
}

function Channel({ post, n }: { post: Post; n: number }) {
  const ch = String(n).padStart(2, "0");
  return (
    <article className="tx-card" aria-labelledby={`tx-${post.id}`}>
      <GameScreen game={post.game} channel={ch} title={post.title} />
      <div className="tx-info paper ink-border hard-shadow-sm">
        <p className="tx-ch">
          <span className="tx-ch-n display">CH.{ch}</span>
          <span className="mono-label tx-ch-kind">Post</span>
        </p>
        <h3 id={`tx-${post.id}`} className="tx-title">
          <a href={post.href} target="_blank" rel="noopener">{post.title}<span aria-hidden="true"> ↗</span></a>
        </h3>
        <p className="mono-label tx-meta">
          <time dateTime={post.date}>{printed(post.date)}</time>
          <span aria-hidden="true">·</span>
          <span>{post.words} words</span>
        </p>
        <ul className="tx-tags" aria-label="Tags">
          {post.tags.map((t) => <li key={t} className="tx-chip">{t}</li>)}
        </ul>
        <a className="btn btn-sm btn-red tx-read" href={post.href} target="_blank" rel="noopener">
          Read<span className="sr-only"> {post.title} on Medium</span><span aria-hidden="true"> ↗</span>
        </a>
      </div>
    </article>
  );
}

export function Transmissions() {
  const ch = CHAPTERS.find((c) => c.id === "transmissions") ?? { id: "transmissions", n: "08", en: "TRANSMISSIONS", jp: "放送", romaji: "hōsō", plain: "Articles" };
  const { posts, profile } = resume;
  return (
    <VideoPanel video="bedroom" dim={0.82} id={ch.id} data-chapter={ch.id} className="chapter tx" ariaLabel={`${ch.en} · ${ch.plain}`}>
      <div className="wrap">
        <div className="chapter-head ink-in">
          <Eyebrow n={ch.n}>{ch.en}</Eyebrow>
          <span className="tx-plain">{ch.plain}</span>
        </div>
        <div className="tx-titlerow ink-in">
          <h2 className="chapter-title">Transmissions</h2>
          <Kanji en={ch.en} jp={ch.jp} romaji={ch.romaji} />
        </div>
        <p className="tx-intro ink-in">{posts.length} posts on Medium, one per channel. Every set runs a game: watch the demo, or press PLAY and take the controls.</p>
      </div>

      <StationStrip />

      <div className="wrap">
        <ol className="tx-wall">
          {posts.map((p, i) => <li key={p.id}><Channel post={p} n={i + 1} /></li>)}
        </ol>
        <p className="mono-label tx-more"><a href={profile.medium} target="_blank" rel="noopener">All posts on Medium ↗</a></p>
      </div>
    </VideoPanel>
  );
}

export default Transmissions;
