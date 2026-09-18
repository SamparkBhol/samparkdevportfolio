import { resume } from "@/content/resume";
import { Caption, Hanko, SpecList } from "@/components/print";

/* ============================================================================
   ORIGIN · the hometown stage. A stage-select panel for the one school on the
   résumé: an ink drawing of the campus as the stage thumbnail, the degree and
   the period as the stage plate, coursework as chips, a three-sentence bio,
   the two volunteer roles and off-hours as a spec list, and three taped
   polaroids. Every fact is read from resume.ts. No JS: the polaroids lift
   under the pointer only.
   ========================================================================== */

/* ---------- The campus, drawn in the same ink as the avatar ---------- */
function CampusScene() {
  return (
    <svg className="edu-scene" viewBox="0 0 320 210" aria-hidden="true" focusable="false">
      <g strokeLinecap="round" strokeLinejoin="round">
        {/* sun, printed in the second ink */}
        <circle className="r" cx="262" cy="48" r="22" />
        <path className="l" d="M 226 22 L 232 28 M 262 12 L 262 18 M 296 24 L 290 30" />
        {/* hills */}
        <path className="o" d="M 0 150 C 40 128 90 124 130 140 C 170 122 220 122 260 138 C 290 128 310 132 320 140 L 320 156 L 0 156 Z" />
        {/* main block */}
        <rect className="o" x="46" y="98" width="228" height="60" />
        <path className="l" d="M 46 110 L 274 110" />
        {/* tower */}
        <path className="o" d="M 138 44 L 182 44 L 186 100 L 134 100 Z" />
        <path className="o" d="M 132 44 L 188 44 L 160 22 Z" />
        <path className="l" d="M 160 22 L 160 10" />
        <circle className="o" cx="160" cy="70" r="11" />
        <path className="l" d="M 160 70 L 160 63 M 160 70 L 165 73" />
        {/* arch and doors */}
        <path className="o" d="M 148 158 L 148 128 C 148 116 172 116 172 128 L 172 158 Z" />
        <path className="l" d="M 160 128 L 160 158" />
        {/* windows */}
        <rect className="d" x="60" y="120" width="10" height="14" /><rect className="d" x="80" y="120" width="10" height="14" /><rect className="d" x="100" y="120" width="10" height="14" /><rect className="d" x="120" y="120" width="10" height="14" />
        <rect className="d" x="190" y="120" width="10" height="14" /><rect className="d" x="210" y="120" width="10" height="14" /><rect className="d" x="230" y="120" width="10" height="14" /><rect className="d" x="250" y="120" width="10" height="14" />
        {/* palms */}
        <path className="l" d="M 26 158 C 24 132 22 112 26 90" />
        <path className="l" d="M 26 90 C 12 80 4 84 0 96 M 26 90 C 40 78 52 82 56 92 M 26 90 C 18 76 20 66 30 60 M 26 90 C 34 74 46 70 54 74" />
        <path className="l" d="M 296 158 C 298 134 300 116 296 96" />
        <path className="l" d="M 296 96 C 282 86 272 90 268 100 M 296 96 C 308 84 320 88 320 98 M 296 96 C 290 80 294 70 304 66" />
        {/* ground and the road in */}
        <path className="L" d="M 0 158 L 320 158" />
        <path className="l" d="M 132 200 L 148 158 M 188 200 L 172 158" />
        <path className="t" d="M 160 168 L 160 178 M 160 186 L 160 196" />
      </g>
    </svg>
  );
}

/* ---------- Three small scenes for the polaroids ---------- */
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
            <circle className={i === 0 ? "seal" : "o"} cx="104" cy={y + 14} r="3.5" />
          </g>
        ))}
        <path className="l" d="M 138 60 C 164 60 160 96 178 100" />
        <path className="o" d="M 176 94 L 186 94 L 186 106 L 176 106 Z" />
        <path className="l" d="M 56 130 L 62 122" /><path className="l" d="M 144 130 L 138 122" />
      </g>
    </svg>
  );
}

export function Education() {
  const { profile, education, also, classes } = resume;
  const firstName = profile.name.split(" ")[0];
  const build = profile.narration.split(". ")[0];
  const schoolShort = education.school.split(" ")[0];
  const offHours = also.find((a) => a.label.toLowerCase() === "off-hours");
  const rest = also.filter((a) => a !== offHours);

  const polaroids = [
    { id: "games", caption: "built games as a kid", Scene: ConsoleScene },
    { id: "vit", caption: `${schoolShort} and the paper`, Scene: ScholarScene },
    { id: "ships", caption: "ships to production", Scene: RackScene },
  ];

  return (
    <section className="edu paper ink-border hard-shadow graph-paper" aria-labelledby="edu-title">
      <div className="edu-stage">
        <figure className="edu-thumb">
          <div className="edu-thumb-frame ink-border">
            <CampusScene />
          </div>
          <figcaption className="edu-thumb-cap">
            <Caption>Hometown stage</Caption>
            <Hanko romaji={education.period}>Cleared</Hanko>
          </figcaption>
        </figure>

        <div className="edu-plate">
          <p className="mono-label edu-eyebrow">Origin <span aria-hidden="true">·</span> Education</p>
          <h3 id="edu-title" className="display edu-school">{education.school}</h3>
          <p className="edu-degree">{education.degree}</p>
          <p className="mono-label edu-meta">{education.period} <span aria-hidden="true">·</span> {education.location}</p>
          <ul className="edu-chips" aria-label="Coursework">
            {education.coursework.map((c) => (
              <li key={c} className="edu-chip mono-label">{c}</li>
            ))}
          </ul>
        </div>
      </div>

      <div className="edu-story">
        <p className="edu-bio">
          <b>I&rsquo;m {firstName}, a {profile.title.toLowerCase()}.</b> {build}: the {classes.length} classes above are the same person on different days; the stages that follow light up where each one was played. I studied at {education.school} ({education.period}) and work from {profile.location}.
        </p>
        <div className="edu-also">
          <SpecList items={[...rest.map((a) => [a.label, a.text] as [string, React.ReactNode]), ...(offHours ? [[offHours.label, offHours.text] as [string, React.ReactNode]] : [])]} />
        </div>
      </div>

      <ul className="edu-polaroids" aria-label="Three snapshots">
        {polaroids.map((p, i) => (
          <li key={p.id} className="ink-in">
            <div className={`polaroid polaroid-${i + 1}`}>
              <p.Scene />
              <span className="polaroid-caption">{p.caption}</span>
            </div>
          </li>
        ))}
      </ul>
    </section>
  );
}

export default Education;
