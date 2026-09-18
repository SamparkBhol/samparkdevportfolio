import { resume } from "@/content/resume";
import { CHAPTERS } from "@/content/chapters";
import { Eyebrow, Kanji, VideoPanel } from "@/components/print";
import { QuestLog } from "./QuestLog";
import "@/styles/quests.css";

const ch = CHAPTERS.find((c) => c.id === "quests") ?? { id: "quests", n: "06", en: "SIDE QUESTS", jp: "依頼", romaji: "irai", plain: "Clubs & chapters" };

/* The desk props, drawn in the book's ink: a quill standing in its inkwell, and a wax stick beside
   the guild badge. They live in a column reserved beside the log, so they never sit under text;
   the column collapses on phones and the props go with it. */
function DeskProps() {
  return (
    <div className="q-props" aria-hidden="true">
      <svg className="q-prop q-prop-quill" viewBox="0 0 150 190" focusable="false">
        <ellipse className="q-p-shade" cx="70" cy="180" rx="44" ry="6" />
        <path className="q-p-paper" d="M 38 108 H 100 L 106 168 C 106 178 100 184 90 184 H 48 C 38 184 32 178 32 168 Z" />
        <path className="q-p-ink" d="M 36 138 H 103 L 106 168 C 106 178 100 184 90 184 H 48 C 38 184 32 178 32 168 Z" />
        <rect className="q-p-yellow" x="48" y="118" width="42" height="26" />
        <path className="q-p-line" d="M 56 126 H 82 M 56 134 H 74" />
        <rect className="q-p-paper" x="54" y="94" width="30" height="16" />
        <rect className="q-p-ink" x="48" y="86" width="42" height="10" />
        <path className="q-p-line" d="M 70 90 C 80 66 94 44 120 14" />
        <path className="q-p-paper" d="M 88 72 C 82 50 96 26 126 6 C 128 30 116 54 98 68 C 94 71 91 73 88 72 Z" />
        <path className="q-p-line" d="M 96 62 C 104 50 112 36 122 20 M 92 56 L 104 52 M 98 46 L 110 40 M 104 36 L 114 28" />
      </svg>
      <svg className="q-prop q-prop-seal" viewBox="0 0 200 104" focusable="false">
        <ellipse className="q-p-shade" cx="52" cy="92" rx="48" ry="5" />
        <path className="q-p-wax" d="M 12 84 L 88 44" />
        <path className="q-p-wax-hi" d="M 20 78 L 80 46" />
        <circle className="q-p-wax-tip" cx="95" cy="40" r="9" />
        <path className="q-p-wax-tip" d="M 93 48 C 97 56 91 60 95 66 C 97 69 101 67 100 62" />
        <ellipse className="q-p-shade" cx="158" cy="96" rx="34" ry="5" />
        <path className="q-p-yellow" d="M 158 10 L 192 24 V 50 C 192 70 176 86 158 94 C 140 86 124 70 124 50 V 24 Z" />
        <path className="q-p-line" d="M 138 44 L 158 60 L 178 44" />
        <circle className="q-p-ink" cx="158" cy="30" r="4" />
      </svg>
    </div>
  );
}

/* 06 / SIDE QUESTS · Clubs & chapters. A dark cavern behind, a wood desk in front, and on the desk one
   paper quest log ruled like a ledger: the clubs and chapters as entries, each unfolding its sheet in
   place and taking its status stamp the first time it is opened. */
export function SideQuests() {
  return (
    <VideoPanel video="arena" dim={0.82} id={ch.id} data-chapter={ch.id} className="chapter quests" ariaLabel={`${ch.n} ${ch.en} · ${ch.plain}`}>
      <div className="wrap">
        <div className="chapter-head q-head">
          <h2 className="chapter-title">{ch.en}</h2>
          <div className="q-head-meta">
            <Eyebrow n={ch.n}>{ch.en}</Eyebrow>
            <Kanji en={ch.plain} jp={ch.jp} romaji={ch.romaji} />
          </div>
        </div>
        <div className="q-desk tone-25 ink-in">
          <QuestLog quests={resume.sideQuests} />
          <DeskProps />
        </div>
      </div>
    </VideoPanel>
  );
}

export default SideQuests;
