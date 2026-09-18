import { cn } from "@/lib/cn";
export function Caption({ children, className }: { children: React.ReactNode; className?: string }) {
  return <span className={cn("mono-label", className)} style={{ display: "inline-block", background: "var(--color-yellow)", color: "var(--color-ink)", border: "2px solid var(--color-ink)", padding: "1px 8px", fontSize: 12, marginBottom: 8 }}>{children}</span>;
}
