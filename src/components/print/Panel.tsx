import { cn } from "@/lib/cn";
import { Caption } from "./Caption";

export function Panel({ label, numeral, tone = 0, thumb, className, children, id }: {
  label?: string; numeral?: string; tone?: 0 | 10 | 25; thumb?: React.ReactNode; className?: string; children: React.ReactNode; id?: string;
}) {
  return (
    <div id={id} className={cn("paper ink-border relative", tone === 10 && "tone-10", tone === 25 && "tone-25", className)} style={{ padding: "14px 16px", fontSize: 15, lineHeight: 1.45 }}>
      {label ? <Caption>{label}</Caption> : null}
      {thumb ? <div className="panel-thumb" style={{ float: "right", marginLeft: 12, marginBottom: 6 }}>{thumb}</div> : null}
      <div>{children}</div>
      {numeral ? <span className="numeral" aria-hidden="true" style={{ position: "absolute", right: 12, bottom: 2, fontSize: "clamp(40px, 5vw, 72px)" }}>{numeral}</span> : null}
    </div>
  );
}
