import type { Project } from "@/content/types";
import { Caption, SpecList } from "@/components/print";
import { cn } from "@/lib/cn";

/* One glyph per project, drawn in ink on the accent field. Paper fills, 6-unit strokes, 200×200 box. */
function Glyph({ kind }: { kind: Project["glyph"] }) {
  const ink = { fill: "var(--color-paper)", stroke: "var(--color-ink)", strokeWidth: 6, strokeLinejoin: "round" as const, strokeLinecap: "round" as const };
  const line = { fill: "none", stroke: "var(--color-ink)", strokeWidth: 6, strokeLinejoin: "round" as const, strokeLinecap: "round" as const };
  const solid = { fill: "var(--color-ink)", stroke: "var(--color-ink)", strokeWidth: 6, strokeLinejoin: "round" as const };
  switch (kind) {
    case "cairn":
      return (<>
        <rect x="28" y="150" width="144" height="34" rx="17" {...ink} />
        <rect x="46" y="116" width="106" height="32" rx="16" {...ink} />
        <rect x="64" y="86" width="78" height="28" rx="14" {...ink} />
        <rect x="74" y="58" width="50" height="24" rx="12" {...ink} />
        <circle cx="102" cy="36" r="14" {...ink} />
      </>);
    case "terminal":
      return (<>
        <rect x="18" y="36" width="164" height="128" rx="8" {...solid} />
        <circle cx="36" cy="52" r="4" fill="var(--color-paper)" /><circle cx="50" cy="52" r="4" fill="var(--color-paper)" /><circle cx="64" cy="52" r="4" fill="var(--color-paper)" />
        <path d="M46 88 l24 20 l-24 20" fill="none" stroke="var(--color-paper)" strokeWidth="9" strokeLinecap="round" strokeLinejoin="round" />
        <rect x="88" y="90" width="22" height="34" fill="var(--color-paper)" />
        <path d="M122 124 h40" stroke="var(--color-paper)" strokeWidth="9" strokeLinecap="round" />
      </>);
    case "browser":
      return (<>
        <rect x="16" y="32" width="168" height="136" rx="6" {...ink} />
        <path d="M16 58 H184" {...line} />
        <circle cx="34" cy="45" r="4" fill="var(--color-ink)" /><circle cx="48" cy="45" r="4" fill="var(--color-ink)" /><circle cx="62" cy="45" r="4" fill="var(--color-ink)" />
        <path d="M58 78 h84 a12 12 0 0 1 12 12 v34 a12 12 0 0 1 -12 12 h-46 l-22 18 v-18 h-16 a12 12 0 0 1 -12 -12 v-34 a12 12 0 0 1 12 -12 z" {...solid} />
        <circle cx="80" cy="107" r="6" fill="var(--color-paper)" /><circle cx="100" cy="107" r="6" fill="var(--color-paper)" /><circle cx="120" cy="107" r="6" fill="var(--color-paper)" />
      </>);
    case "quark":
      return (<>
        <ellipse cx="100" cy="100" rx="72" ry="26" {...line} strokeWidth="5" />
        <ellipse cx="100" cy="100" rx="72" ry="26" transform="rotate(60 100 100)" {...line} strokeWidth="5" />
        <ellipse cx="100" cy="100" rx="72" ry="26" transform="rotate(120 100 100)" {...line} strokeWidth="5" />
        <circle cx="100" cy="100" r="15" {...solid} />
        <circle cx="172" cy="100" r="9" {...ink} />
        <circle cx="75" cy="39" r="9" {...ink} />
        <circle cx="102" cy="142" r="9" {...ink} />
      </>);
    case "shield":
      return (<>
        <path d="M100 20 L166 44 V96 C166 138 136 168 100 182 C64 168 34 138 34 96 V44 Z" {...ink} />
        <path d="M68 100 l22 22 l44 -48" {...line} strokeWidth="9" />
      </>);
    case "plumb":
      return (<>
        <rect x="52" y="18" width="96" height="16" rx="3" {...solid} />
        <path d="M100 34 V112" {...line} strokeWidth="4" />
        <path d="M34 150 H62 M138 150 H166" {...line} strokeWidth="4" strokeDasharray="8 8" />
        <rect x="78" y="106" width="44" height="22" rx="3" {...ink} />
        <path d="M78 128 H122 L100 178 Z" {...ink} />
      </>);
    case "chart":
      return (<>
        <path d="M24 170 H176" {...line} />
        <rect x="38" y="112" width="26" height="58" {...ink} />
        <rect x="76" y="82" width="26" height="88" {...ink} />
        <rect x="114" y="126" width="26" height="44" {...ink} />
        <rect x="152" y="46" width="26" height="124" {...ink} />
      </>);
    case "veil":
      return (<>
        <path d="M100 22 C58 22 42 68 42 112 V178 H158 V112 C158 68 142 22 100 22 Z" {...ink} />
        <path d="M100 58 C78 58 68 84 68 112 V150 H132 V112 C132 84 122 58 100 58 Z" {...solid} />
        <circle cx="86" cy="112" r="4" fill="var(--color-paper)" /><circle cx="114" cy="112" r="4" fill="var(--color-paper)" />
      </>);
    case "graph":
      return (<>
        <path d="M44 62 L120 42 L160 110 L92 122 Z M92 122 L52 162 M160 110 L142 170 M44 62 L92 122" {...line} strokeWidth="5" />
        <circle cx="44" cy="62" r="14" {...ink} /><circle cx="120" cy="42" r="14" {...ink} /><circle cx="160" cy="110" r="14" {...ink} />
        <circle cx="92" cy="122" r="14" {...solid} /><circle cx="52" cy="162" r="14" {...ink} /><circle cx="142" cy="170" r="14" {...ink} />
      </>);
  }
}

const bare = (href: string) => href.replace(/^https?:\/\//, "").replace(/\/$/, "");

/** The inside page: the fixed keys, the spec sheet, and the links as the first row of buttons. */
export function IssueInside({ project, onClose, id, className }: { project: Project; onClose?: () => void; id?: string; className?: string }) {
  const { links } = project;
  return (
    <article id={id} className={cn("issue-inside paper ink-border", className)} aria-label={`${project.name}, inside page`}>
      <header className="inside-head">
        <span className="mono-label inside-meta">No. {project.year} · {project.stamp}</span>
        <h4 className="display inside-name">{project.name}</h4>
      </header>
      <div className="inside-btns" role="group" aria-label="Links">
        {links.live ? <a className="btn btn-red" href={links.live} target="_blank" rel="noopener">Live ↗</a> : null}
        <a className="btn" href={links.code} target="_blank" rel="noopener">Code ↗</a>
        {links.npm ? <a className="btn" href={links.npm} target="_blank" rel="noopener">npm ↗</a> : null}
        {onClose ? <button type="button" className="btn btn-sm inside-close" onClick={onClose}>Close · Esc</button> : null}
      </div>
      <div className="inside-body">
        <div className="inside-key"><Caption>The idea</Caption><p>{project.idea}</p></div>
        <div className="inside-key"><Caption>The system</Caption><p>{project.system}</p></div>
        <div className="inside-key"><Caption>The result</Caption><p>{project.result}</p></div>
      </div>
      <SpecList className="inside-spec" items={[
        ["Year", project.year],
        ["Stack", project.stack.join(" · ")],
        ["Source", <a key="src" href={links.code} target="_blank" rel="noopener">{bare(links.code)}</a>],
      ]} />
    </article>
  );
}

/** A 2:3 comic cover: accent field under a halftone, the glyph, the name, the two-word stamp, No. + year, a publisher mark in the corner.
    With `open`, the cover and its inside page sit side by side as a spread. */
export function IssueCover({ project, open = false, className }: { project: Project; open?: boolean; className?: string }) {
  const cover = (
    <div className={cn("issue-cover ink-border hard-shadow", !open && className)} style={{ "--accent": project.accent } as React.CSSProperties}>
      <div className="issue-field" aria-hidden="true" />
      <div className="issue-field halftone" aria-hidden="true" />
      <div className="issue-top">
        <span className="issue-mark mono-label">SB</span>
        <span className="issue-no mono-label">No. {project.year}</span>
      </div>
      <svg className="issue-glyph" viewBox="0 0 200 200" aria-hidden="true" focusable="false"><Glyph kind={project.glyph} /></svg>
      <div className="issue-foot">
        <span className="issue-name display">{project.name}</span>
        <span className="issue-stamp mono-label">{project.stamp}</span>
      </div>
    </div>
  );
  if (!open) return cover;
  return (
    <div className={cn("issue is-open", className)}>
      {cover}
      <IssueInside project={project} />
    </div>
  );
}
