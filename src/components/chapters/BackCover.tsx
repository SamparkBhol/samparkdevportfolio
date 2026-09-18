import { CHAPTERS, type Chapter } from "@/content/chapters";
import { resume } from "@/content/resume";
import { VideoPanel } from "@/components/print/VideoPanel";
import { Eyebrow } from "@/components/print/Eyebrow";
import { Kanji } from "@/components/print/Kanji";
import { SpecList } from "@/components/print/SpecList";
import "@/styles/extras.css";

const ch = CHAPTERS.find((c) => c.id === "continue") as Chapter;

/* 05 / CONTINUE?: the back of the book. Four real links, the contact console, the colophon. */
export function BackCover() {
  const { profile, contact } = resume;
  const issueYear = profile.issue.month.match(/\d{4}/)?.[0] ?? "";
  return (
    <VideoPanel video="planet" dim={0.55} id={ch.id} data-chapter={ch.id} className="chapter x-continue" ariaLabel={`${ch.en} · ${ch.plain}`}>
      <div className="wrap">
        <div className="chapter-head x-head">
          <Eyebrow n={ch.n} className="x-eyebrow">{ch.en}</Eyebrow>
          <div className="x-head-side">
            <Kanji en={ch.en} jp={ch.jp} romaji={ch.romaji} />
            <span className="x-plain">{ch.plain}</span>
          </div>
        </div>

        <h2 className="display stroke bc-title">{ch.en}</h2>

        <div className="bc-grid">
          <div>
            <nav className="bc-btns" aria-label="Contact">
              <a className="btn btn-red bc-mail" href={`mailto:${profile.email}`}>{profile.email}</a>
              <a className="btn" href={profile.github} target="_blank" rel="noopener">GitHub</a>
              <a className="btn" href={profile.linkedin} target="_blank" rel="noopener">LinkedIn</a>
              <a className="btn" href={profile.cvUrl}>CV.pdf</a>
              <p className="mono-label bc-mirror">Or the <a href={profile.cvMirrorUrl} target="_blank" rel="noopener">Drive mirror ↗</a></p>
            </nav>
          </div>

          <div className="bc-side">
            <div className="bc-console ink-in">
              <p className="mono-label">Contact console</p>
              <SpecList dark items={[["Open to", contact.openTo], ["Where", contact.where], ["Timezone", contact.timezone], ["Response", contact.response]]} />
            </div>
            <aside className="paper ink-border hard-shadow-sm bc-note ink-in">
              <span className="bc-note-stop">STOP!</span>
              <p>You&rsquo;re reading the wrong way. This is the back of the book. It was fine. Everything in it was true.</p>
            </aside>
          </div>
        </div>

        <footer className="bc-colophon mono-label">
          <p>Drawn with ink, paper and one request at a time. No WebGL was harmed.</p>
          <p>© {issueYear} {profile.name} · Issue No.{profile.issue.number}</p>
        </footer>
      </div>
    </VideoPanel>
  );
}
