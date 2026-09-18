import { CHAPTERS } from "@/content/chapters";
import { resume } from "@/content/resume";
import { Eyebrow, Kanji, SpecList, VideoPanel } from "@/components/print";
import { Avatar } from "./Avatar";
import "@/styles/prologue.css";

/* ============================================================================
   01 / ORIGIN · Prologue · About. A graph-paper spread over the bedroom loop:
   the ink avatar as a die-cut, a three-sentence bio, three taped polaroids, a
   spec sheet and one handwritten margin note. Every fact is read from
   resume.ts; the chapter words come from chapters.ts. No JS: reveals are the
   .ink-in class, the polaroids lift on hover only.
   ========================================================================== */

const CHAPTER_ID = "prologue";
const WORDS = ["zero", "one", "two", "three", "four", "five", "six", "seven", "eight", "nine"];
const asWord = (n: number) => WORDS[n] ?? String(n);

/* ---------- Three small scenes, drawn in the same ink as the avatar ---------- */
function ConsoleScene() {
  return (
    <svg className="polaroid-scene" viewBox="0 0 200 140" aria-hidden="true" focusable="false">
      <g strokeLinecap="round" strokeLinejoin="round">
        <rect className="o" x="60" y="12" width="80" height="116" rx="9" />
        <rect className="o" x="70" y="22" width="60" height="46" rx="4" />
        <rect className="l" x="77" y="28" width="46" height="34" />
        <rect className="d" x="93" y="35" width="5" height="5" /><rect className="d" x="103" y="35" width="5" height="5" />
        <rect className="d" x="88" y="40" width="25" height="5" /><rect className="d" x="93" y="45" width="15" height="5" /><rect className="d" x="98" y="50" width="5" height="5" />
        <rect className="d" x="76" y="92" width="24" height="7" rx="1" /><rect className="d" x="84.5" y="83.5" width="7" height="24" rx="1" />
        <circle className="o" cx="115" cy="103" r="6" /><circle className="o" cx="129" cy="93" r="6" />
        <path className="l" d="M 118 116 L 110 124" /><path className="l" d="M 125 116 L 117 124" /><path className="l" d="M 132 116 L 124 124" />
        <circle className="seal" cx="66" cy="48" r="2.5" />
        <path className="l" d="M 84 116 L 96 116" />
      </g>
    </svg>
  );
}
function ScholarScene() {
  return (
    <svg className="polaroid-scene" viewBox="0 0 200 140" aria-hidden="true" focusable="false">
      <g strokeLinecap="round" strokeLinejoin="round">
        <path className="o" d="M 108 26 L 158 26 L 172 40 L 172 116 L 108 116 Z" />
        <path className="l" d="M 158 26 L 158 40 L 172 40" />
        <path className="l" d="M 118 52 L 156 52" /><path className="l" d="M 118 62 L 160 62" /><path className="l" d="M 118 72 L 150 72" /><path className="l" d="M 118 82 L 158 82" />
        <path className="l" d="M 118 100 C 124 90 128 108 136 96 C 140 90 144 100 150 94" />
        <circle className="seal" cx="160" cy="102" r="6" />
        <path className="o" d="M 30 84 C 30 100 82 100 82 84 L 82 76 L 30 76 Z" />
        <path className="o" d="M 16 70 L 56 54 L 96 70 L 56 86 Z" />
        <circle className="d" cx="56" cy="70" r="2.5" />
        <path className="l" d="M 56 70 L 62 74 L 62 98" />
        <path className="l" d="M 58 104 L 62 98 L 66 104" /><path className="l" d="M 62 98 L 62 106" />
      </g>
    </svg>
  );
}
function RackScene() {
  const units = [18, 46, 74, 102];
  return (
    <svg className="polaroid-scene" viewBox="0 0 200 140" aria-hidden="true" focusable="false">
      <g strokeLinecap="round" strokeLinejoin="round">
        <rect className="o" x="62" y="10" width="76" height="120" rx="3" />
        {units.map((y, i) => (
          <g key={y}>
            {i > 0 ? <path className="l" d={`M 62 ${y} L 138 ${y}`} /> : null}
            <rect className="l" x="70" y={y + 8} width="26" height="12" rx="1" />
            <path className="l" d={`M 112 ${y + 8} L 112 ${y + 20}`} /><path className="l" d={`M 119 ${y + 8} L 119 ${y + 20}`} /><path className="l" d={`M 126 ${y + 8} L 126 ${y + 20}`} />
            <circle className={i === 0 ? "led" : "o"} cx="104" cy={y + 14} r="3.5" />
          </g>
        ))}
        <path className="l" d="M 138 60 C 164 60 160 96 178 100" />
        <path className="o" d="M 176 94 L 186 94 L 186 106 L 176 106 Z" />
        <path className="l" d="M 56 130 L 62 122" /><path className="l" d="M 144 130 L 138 122" />
      </g>
    </svg>
  );
}

const SCENES = { console: ConsoleScene, scholar: ScholarScene, rack: RackScene } as const;

export function Prologue() {
  const chapter = CHAPTERS.find((c) => c.id === CHAPTER_ID) ?? CHAPTERS[1];
  const next = CHAPTERS[CHAPTERS.findIndex((c) => c.id === chapter.id) + 1];
  const { profile, roles, papers, education, also } = resume;

  /* The bio, sentence by sentence, from the résumé. */
  const firstName = profile.name.split(" ")[0];
  const build = profile.narration.split(". ")[0];
  const earlier = roles[1];
  const earlierTitle = earlier.title.toLowerCase().replace("machine learning", "ML").replace(" intern", "");
  const internships = roles.length - 2;
  const published = papers.filter((p) => p.status === "published").length;
  const papersWord = published === 1 ? "a paper" : `${asWord(published)} papers`;

  const offHours = also.find((a) => a.label.toLowerCase() === "off-hours");
  const others = also.filter((a) => a !== offHours);
  const schoolShort = education.school.split(" ")[0];

  const polaroids: { id: string; caption: string; scene: keyof typeof SCENES }[] = [
    { id: "games", caption: "built games as a kid", scene: "console" },
    { id: "vit", caption: `${schoolShort} and the paper`, scene: "scholar" },
    { id: "ships", caption: `ships production at ${roles[0].org}`, scene: "rack" },
  ];

  return (
    <VideoPanel video="bedroom" dim={0.7} id={CHAPTER_ID} data-chapter={CHAPTER_ID} className="chapter prologue" ariaLabel={`${chapter.n} ${chapter.en} · ${chapter.plain}`}>
      <div className="wrap">
        <header className="chapter-head prologue-head">
          <div className="prologue-head-row">
            <Eyebrow n={chapter.n}>{chapter.en}</Eyebrow>
            <span className="mono-label prologue-plain">{chapter.plain}</span>
          </div>
          <h2 className="chapter-title prologue-title">
            <Kanji className="prologue-kanji" en="PROLOGUE" jp={chapter.jp} romaji={chapter.romaji} />
          </h2>
        </header>

        <div className="paper ink-border hard-shadow graph-paper prologue-spread">
          <figure className="prologue-avatar ink-in">
            <Avatar />
            <figcaption className="prologue-fig">
              <span className="mono-label prologue-fig-cap">FIG. {chapter.n} / {chapter.en}</span>
              <span className="mono-label prologue-fig-note">ink and one red · die-cut</span>
            </figcaption>
          </figure>

          <p className="prologue-bio ink-in">
            <b>I&rsquo;m {firstName}.</b> {build}, at {profile.employer}. Before that I was the {earlierTitle} at {earlier.org}; before that, {asWord(internships)} internships and {papersWord}.
          </p>

          <ul className="prologue-polaroids" aria-label="Three snapshots">
            {polaroids.map((p, i) => {
              const Scene = SCENES[p.scene];
              return (
                <li key={p.id} className="ink-in">
                  <div className={`polaroid polaroid-${i + 1}`}>
                    <Scene />
                    <span className="polaroid-caption">{p.caption}</span>
                  </div>
                </li>
              );
            })}
          </ul>

          <div className="prologue-spec ink-in">
            <SpecList
              items={[
                ["Based", profile.location],
                ["Currently", `${profile.title} · ${profile.employer} · since ${profile.since}`],
                ["Education", `${education.degree} · ${education.school} · ${education.period}`],
                ["Off-hours", offHours?.text ?? ""],
                [
                  "Also",
                  <ul key="also" className="prologue-also">
                    {others.map((a) => (
                      <li key={a.label}><b>{a.label}</b> · {a.text}</li>
                    ))}
                  </ul>,
                ],
              ]}
            />
          </div>

          <div className="prologue-note-wrap ink-in">
            <p className="prologue-note">Every model is an opinion. Every system is a promise. <em>I try to keep both honest.</em></p>
          </div>

          {next ? (
            <a href={`#${next.id}`} className="mono-label prologue-next">Continued in {next.n} / {next.en} <span aria-hidden="true">→</span></a>
          ) : null}
        </div>
      </div>
    </VideoPanel>
  );
}

export default Prologue;
