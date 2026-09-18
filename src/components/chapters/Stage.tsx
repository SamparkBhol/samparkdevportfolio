import { resume } from "@/content/resume";
import type { ClassId, Role } from "@/content/types";
import { Hanko } from "@/components/print/Hanko";
import { cn } from "@/lib/cn";
import { FlowStrip } from "./FlowStrip";
import { Spread } from "./Spread";

/* ============================================================================
   The one stage on screen, built the same way for every role so none outweighs
   another: a title strip (the org in display type, capped; the role; period ·
   location; a NOW hanko only on the current role; the classes it was played
   in; the loadout), the flow strip you can send something through, then the
   spread of beats. Screentone marks time: none now, 10% last year, 25%
   earlier. `pager` is the phone's PREV / NEXT, printed under the strip.
   ========================================================================== */

const CLASS_NAME = new Map(resume.classes.map((c) => [c.id, c.name]));

export function Stage({ role, fig, index, total, playerClass, pager }: {
  role: Role; fig: string; index: number; total: number; playerClass: ClassId | null; pager?: React.ReactNode;
}) {
  const orgId = `stage-${role.id}-org`;
  const tone = cn(role.tone === 10 && "tone-10", role.tone === 25 && "tone-25");
  return (
    <article id={`stage-${role.id}`} className="stage" data-classes={role.classes.join(" ")} data-role={role.id} aria-labelledby={orgId}>
      <header className={cn("stage-title paper ink-border hard-shadow", tone)}>
        <div className="stage-band">
          <span className="mono-label stage-tag">Stage {index + 1} of {total} · role</span>
          <span className="mono-label stage-when">{role.period} · {role.location}</span>
        </div>
        {role.current ? (
          <span className="stage-now"><Hanko romaji="genshoku"><span lang="ja">現職</span> NOW</Hanko></span>
        ) : null}
        <div className="stage-body">
          <div className="stage-org-wrap">
            <h3 id={orgId} className="display stage-org">{role.org}</h3>
            {role.orgNote ? <p className="stage-orgnote mono-label">{role.orgNote}</p> : null}
          </div>
          <div className="stage-side">
            <p className="stage-role">{role.title}</p>
            <ul className="stage-classes" aria-label="Classes played in this role">
              {role.classes.map((c) => (
                <li key={c} data-class={c} className={cn("class-badge", playerClass === c && "is-lit")}>{CLASS_NAME.get(c) ?? c}</li>
              ))}
            </ul>
          </div>
        </div>
        <div className="stage-loadout">
          <span className="mono-label">Loadout · stack</span>
          <ul className="camp-tags" aria-label={`${role.org} stack`}>
            {role.stack.map((t) => <li key={t}>{t}</li>)}
          </ul>
        </div>
      </header>

      <FlowStrip key={role.id} flow={role.flow} fig={fig} tone={role.tone} />
      {pager}
      <Spread role={role} />
    </article>
  );
}
