import { VideoPanel } from "@/components/print/VideoPanel";
import { Eyebrow } from "@/components/print/Eyebrow";
import { Kanji } from "@/components/print/Kanji";
import { CHAPTERS } from "@/content/chapters";
import { TraceStrip } from "./TraceStrip";
import { Spread } from "./Spread";
import "@/styles/job.css";

const chapter = CHAPTERS.find((c) => c.id === "job")!;

/** 02 / THE JOB · Experience. The trace strip (one request through the stack) and the Helmit spread, printed over the sunset road. */
export function TheJob() {
  return (
    <VideoPanel video="road" dim={0.75} id={chapter.id} data-chapter={chapter.id} className="chapter job" ariaLabel={`${chapter.n} ${chapter.en} · ${chapter.plain}`}>
      <div className="wrap">
        <div className="chapter-head job-head">
          <h2 className="chapter-title">{chapter.en}</h2>
          <div className="job-head-meta">
            <Eyebrow n={chapter.n}>
              {chapter.en} <span className="job-plain">· {chapter.plain}</span>
            </Eyebrow>
            <Kanji en={chapter.en} jp={chapter.jp} romaji={chapter.romaji} />
          </div>
        </div>
        <TraceStrip />
        <Spread />
      </div>
    </VideoPanel>
  );
}
