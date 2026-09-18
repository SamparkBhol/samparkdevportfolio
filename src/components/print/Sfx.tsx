import { cn } from "@/lib/cn";
export function Sfx({ children, romaji, className, size = 48 }: { children: React.ReactNode; romaji?: string; className?: string; size?: number }) {
  return (
    <span className={cn("sfx", className)} aria-hidden="true" style={{ display: "inline-block", fontFamily: "var(--font-sfx)", fontSize: size, lineHeight: 1, color: "#fff", WebkitTextStroke: "2px var(--color-ink)", paintOrder: "stroke fill", transform: "rotate(-8deg)" }}>
      {children}
      {romaji ? <small style={{ display: "block", fontFamily: "var(--font-meta)", fontSize: 12, WebkitTextStroke: 0, color: "var(--color-ink)", letterSpacing: "0.1em" }}>{romaji}</small> : null}
    </span>
  );
}
