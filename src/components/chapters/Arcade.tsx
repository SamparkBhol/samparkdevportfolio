import { resume } from "@/content/resume";
import { CHAPTERS } from "@/content/chapters";
import { Eyebrow, Kanji, VideoPanel } from "@/components/print";
import { CartridgeRing } from "./CartridgeRing";
import "@/styles/arcade.css";

const ch = CHAPTERS.find((c) => c.id === "arcade") ?? { id: "arcade", n: "05", en: "ARCADE", jp: "遊技場", romaji: "yūgijō", plain: "Games" };

/* 05 / ARCADE · Games. The gold loop, a bulb-bordered INSERT COIN sign that does not chase, and the cartridge ring
   on its shelf. Nothing plays by itself: the ring turns under a drag or the arrow keys, a click opens a cartridge. */
export function Arcade() {
  return (
    <VideoPanel video="gold" dim={0.6} id={ch.id} data-chapter={ch.id} className="chapter arcade" ariaLabel={`${ch.n} ${ch.en} · ${ch.plain}`}>
      <div className="wrap">
        <div className="chapter-head arc-head">
          <h2 className="chapter-title">{ch.en}</h2>
          <div className="arc-head-meta">
            <Eyebrow n={ch.n}>{ch.en} <span className="arc-plain">· {ch.plain}</span></Eyebrow>
            <Kanji en={ch.en} jp={ch.jp} romaji={ch.romaji} />
          </div>
        </div>

        <div className="arc-marquee ink-in">
          <div className="arc-sign ink-border hard-shadow" role="img" aria-label="Insert coin">
            <span className="arc-bulbs arc-bulbs-top" aria-hidden="true" />
            <span className="arc-sign-text display">INSERT COIN</span>
            <span className="arc-bulbs arc-bulbs-bottom" aria-hidden="true" />
          </div>
          <p className="arc-line">Games are how I learn game feel.</p>
        </div>

        <CartridgeRing games={resume.games} />
      </div>
    </VideoPanel>
  );
}

export default Arcade;
