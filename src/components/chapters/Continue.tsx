import { CHAPTERS, type Chapter } from "@/content/chapters";
import { resume } from "@/content/resume";
import { VideoPanel } from "@/components/print/VideoPanel";
import { Eyebrow } from "@/components/print/Eyebrow";
import { Kanji } from "@/components/print/Kanji";
import { Caption } from "@/components/print/Caption";
import { Hanko } from "@/components/print/Hanko";
import { SpecList } from "@/components/print/SpecList";
import { Terminal } from "./Terminal";
import "@/styles/continue.css";

const ch = CHAPTERS.find((c) => c.id === "continue") as Chapter;

/* 11 / CONTINUE? · Contact. The arcade asks; the contact card is the YES. Under it, the terminal
   reads the whole issue by command; under that, the back-of-the-book joke and the colophon. */
export function Continue() {
  const { profile, contact } = resume;
  const issueYear = profile.issue.month.match(/\d{4}/)?.[0] ?? "";
  return (
    <VideoPanel video="planet" dim={0.55} id={ch.id} data-chapter={ch.id} className="chapter ct" ariaLabel={`${ch.n} ${ch.en} · ${ch.plain}`}>
      <div className="wrap">
        <div className="chapter-head ct-head">
          <Eyebrow n={ch.n}>{ch.en} <span className="ct-plain">· {ch.plain}</span></Eyebrow>
          <p className="ct-hand">The issue ends here. Your move.</p>
        </div>
        <h2 className="display stroke ct-title">{ch.en}</h2>
        <p className="ct-sub">
          <Kanji en={ch.en} jp={ch.jp} romaji={ch.romaji} />
          <span className="ct-plain">· {ch.plain}</span>
        </p>

        <div className="ct-grid">
          <div className="paper ink-border hard-shadow ct-yes">
            <Caption>Yes · {ch.plain}</Caption>
            <Hanko className="ct-hanko" romaji="insert coin">YES</Hanko>
            <nav className="ct-btns" aria-label="Contact">
              <a className="btn btn-red ct-mail" href={`mailto:${profile.email}`}>{profile.email}</a>
              <a className="btn" href={profile.github} target="_blank" rel="noopener">GitHub</a>
              <a className="btn" href={profile.linkedin} target="_blank" rel="noopener">LinkedIn</a>
              <a className="btn ct-cv" href={profile.cvUrl}>CV.pdf</a>
            </nav>
            <p className="mono-label ct-mirror"><a href={profile.cvMirrorUrl} target="_blank" rel="noopener">Or the Drive mirror ↗</a></p>
          </div>

          <div className="ct-console">
            <p className="mono-label ct-console-label">Contact console</p>
            <SpecList dark items={[["Open to", contact.openTo], ["Where", contact.where], ["Timezone", contact.timezone], ["Response", contact.response]]} />
          </div>
        </div>

        <Terminal />

        <div className="ct-foot">
          <aside className="paper ink-border hard-shadow-sm ct-stop">
            <span className="ct-stop-word">STOP!</span>
            <p>You&rsquo;re reading the wrong way. This is the back of the book. Everything in it was true.</p>
          </aside>
          <footer className="ct-colophon mono-label">
            <p>Drawn with ink, paper and one request at a time. No WebGL was harmed.</p>
            <p>© {issueYear} {profile.name} · Issue No.{profile.issue.number}</p>
          </footer>
        </div>
      </div>
    </VideoPanel>
  );
}
