import { cn } from "@/lib/cn";
export function Eyebrow({ n, children, className }: { n: string; children: React.ReactNode; className?: string }) {
  return <p className={cn("mono-label", className)} style={{ margin: 0, color: "var(--color-yellow)" }}><span style={{ opacity: 0.8 }}>{n} /</span> {children}</p>;
}
