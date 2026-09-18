import { resume } from "@/content/resume";
import { CHAPTERS } from "@/content/chapters";
import { Eyebrow, Kanji, Sfx, VideoPanel } from "@/components/print";
import { IssueFan } from "./IssueFan";
import { VsCards } from "./VsCards";
import "@/styles/boss.css";

/* 03 / BOSS FIGHTS · 対戦 taisen · Projects.
   One printed video panel: the arena loop under the fan and the VS strip. The games live in 05 / ARCADE. */
export function BossFights() {
  const ch = CHAPTERS.find((c) => c.id === "boss") ?? { id: "boss", n: "03", en: "BOSS FIGHTS", jp: "対戦", romaji: "taisen", plain: "Projects" };
  const featured = resume.projects.filter((p) => p.featured);
  const rest = resume.projects.filter((p) => !p.featured);
  return (
    <section id={ch.id} data-chapter={ch.id} className="chapter boss" aria-labelledby="boss-title">
      <VideoPanel video="arena" dim={0.7} className="boss-arena" ariaLabel="Boss fights: the projects">
        <div className="wrap">
          <div className="chapter-head ink-in">
            <Eyebrow n={ch.n}>{ch.en}</Eyebrow>
            <span className="boss-plain">{ch.plain}</span>
          </div>
          <div className="boss-titlerow ink-in">
            <h2 id="boss-title" className="chapter-title">Boss Fights</h2>
            <Kanji en={ch.en} jp={ch.jp} romaji={ch.romaji} />
          </div>
          <p className="boss-intro ink-in">Each fight reveals what it is, what it beat, and where to find it.</p>

          <IssueFan projects={featured} />

          <h3 className="boss-subhead">
            <Sfx size={44}>VS</Sfx>
            <span className="mono-label"><span className="sr-only">Versus</span>· the rest of the roster</span>
          </h3>
          <VsCards projects={rest} />
        </div>
      </VideoPanel>
    </section>
  );
}

export default BossFights;
