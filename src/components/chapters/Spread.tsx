import type { Flow, Role, RolePanel } from "@/content/types";
import { Caption } from "@/components/print/Caption";
import { cn } from "@/lib/cn";
import { Thumbs } from "./Thumbs";

/* ============================================================================
   A role's spread: its résumé bullets, verbatim, as compact comic panels on a
   twelve-column grid, four to a row, so eight beats make two rows and four
   make one. A role written as a single long bullet is cut at its semicolons
   into beats (the words and their order untouched), and every role with a
   row to spare prints FIELD NOTES: the facts behind its strip's nodes, the
   same text the strip shows on hover. A panel's tags are not printed: every
   term is in its text or in the loadout on the title strip, and the compact
   grid has no room for a third line of chips. Panel ids are "panel-" + id;
   the strip jumps to them (a cut bullet keeps its id on the first beat).
   ========================================================================== */

interface Beat { id: string; label: string; text: string; numeral?: string; thumb?: RolePanel["thumb"] }

const ROMAN = ["i", "ii", "iii", "iv", "v", "vi"];
const PER_ROW = 4;

/** One bullet → its beats at "; " (the semicolons stay, so it still reads as one sentence across the panels). */
function beatsOf(p: RolePanel): Beat[] {
  const parts = p.text.split(/;\s+/);
  if (parts.length < 2) return [p];
  return parts.map((t, i) => ({
    id: i === 0 ? p.id : `${p.id}-${ROMAN[i] ?? i}`,
    label: `${p.label} · ${ROMAN[i] ?? i}`,
    text: i < parts.length - 1 ? `${t};` : t,
    numeral: i === 0 ? p.numeral : undefined,
    thumb: i === 0 ? p.thumb : undefined,
  }));
}

function BeatPanel({ b, span, tone }: { b: Beat; span: number; tone: Role["tone"] }) {
  return (
    <div id={`panel-${b.id}`} className={cn("spread-panel paper ink-border", `span-${span}`, tone === 10 && "tone-10", tone === 25 && "tone-25")}>
      <div className="spread-cap">
        <Caption>{b.label}</Caption>
        {b.numeral ? <span className="numeral spread-num" aria-hidden="true">{b.numeral}</span> : null}
      </div>
      <div className="spread-body">
        {b.thumb ? <div className="spread-thumb"><Thumbs kind={b.thumb} /></div> : null}
        <p className="spread-text">{b.text}</p>
      </div>
    </div>
  );
}

function FieldNotes({ flow, tone }: { flow: Flow; tone: Role["tone"] }) {
  return (
    <div className={cn("spread-panel spread-notes paper ink-border span-12", tone === 10 && "tone-10", tone === 25 && "tone-25")}>
      <div className="spread-cap">
        <Caption>Field notes · from the strip</Caption>
        <span className="mono-label spread-cap-sub">the fact behind each node</span>
      </div>
      <dl className="spread-dl">
        {flow.nodes.map((n) => (
          <div key={n.id}>
            <dt className="mono-label">{n.label}</dt>
            <dd>{n.fact}</dd>
          </div>
        ))}
      </dl>
    </div>
  );
}

export function Spread({ role }: { role: Role }) {
  const beats = role.panels.length === 1 ? beatsOf(role.panels[0]) : role.panels;
  const perRow = Math.min(PER_ROW, beats.length);
  const span = 12 / perRow === Math.floor(12 / perRow) ? 12 / perRow : 3;
  const notes = beats.length <= PER_ROW;
  return (
    <div className="spread" role="group" aria-label={`${role.org} · experience panels`}>
      {beats.map((b) => <BeatPanel key={b.id} b={b} span={span} tone={role.tone} />)}
      {notes ? <FieldNotes flow={role.flow} tone={role.tone} /> : null}
    </div>
  );
}
