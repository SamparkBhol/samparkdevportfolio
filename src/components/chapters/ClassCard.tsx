import { resume } from "@/content/resume";
import type { CharacterClass } from "@/content/types";
import { Caption, SpecList } from "@/components/print";
import { Portrait } from "./Portrait";

/* The one big card on the select screen: the class's own drawing on the left,
   on the right the class name, its tagline, the blurb and the four real figures
   from resume.ts as a mini spec list. No links, no lists of roles or projects:
   those have their own chapters. */
export function ClassCard({ k, index, total }: { k: CharacterClass; index: number; total: number }) {
  const n = String(index + 1).padStart(2, "0"), of = String(total).padStart(2, "0");
  return (
    <article className="pc paper ink-border hard-shadow" aria-label={`${k.name}, class ${n} of ${of}`}>
      <div className="pc-art">
        <p className="pc-art-tag"><Caption>Player 1</Caption></p>
        <Portrait classId={k.id} />
      </div>
      <div className="pc-body">
        <div className="pc-plate">
          <Caption>Class {n} / {of}</Caption>
          <span className="pc-who">{resume.profile.name}</span>
        </div>
        <h3 className="display pc-name">{k.name}</h3>
        <p className="pc-tagline">{k.tagline}</p>
        <p className="pc-blurb">{k.blurb}</p>
        <div className="pc-spec-wrap">
          <SpecList className="pc-spec" items={k.stats.map(([label, value]) => [label, <b key={label}>{value}</b>])} />
        </div>
      </div>
    </article>
  );
}

export default ClassCard;
