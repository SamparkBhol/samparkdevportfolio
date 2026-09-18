import { cn } from "@/lib/cn";
export function SpecList({ items, className, dark }: { items: [string, React.ReactNode][]; className?: string; dark?: boolean }) {
  return (
    <dl className={cn("spec-list", className)} style={{ display: "grid", gridTemplateColumns: "max-content 1fr", gap: "6px 16px", margin: 0, fontSize: 14 }}>
      {items.map(([k, v]) => (
        <div key={k} style={{ display: "contents" }}>
          <dt className="mono-label" style={{ color: dark ? "var(--color-mute)" : "#6A665E", alignSelf: "baseline" }}>{k}</dt>
          <dd style={{ margin: 0 }}>{v}</dd>
        </div>
      ))}
    </dl>
  );
}
