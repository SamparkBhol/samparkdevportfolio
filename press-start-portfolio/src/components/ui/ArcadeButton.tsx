"use client";
import { cn } from "@/lib/cn";
import { useSound } from "@/hooks/useSound";

export function ArcadeButton({
  children, href, onClick, color = "yellow", className,
}: {
  children: React.ReactNode; href?: string; onClick?: () => void;
  color?: "yellow" | "cyan" | "magenta" | "green" | "red"; className?: string;
}) {
  const { play } = useSound();
  const cls = cn(
    "inline-flex items-center gap-2 font-pixel text-xs uppercase nb-border nb-shadow",
    "px-4 py-3 text-ink transition-transform active:translate-x-1 active:translate-y-1 active:shadow-none",
    "hover:-translate-y-0.5",
    { yellow: "bg-pop-yellow", cyan: "bg-pop-cyan", magenta: "bg-pop-magenta",
      green: "bg-pop-green", red: "bg-pop-red text-paper" }[color], className
  );
  const handle = () => { play("select"); onClick?.(); };
  if (href) return <a href={href} onClick={() => play("select")} className={cls}>{children}</a>;
  return <button type="button" onClick={handle} onMouseEnter={() => play("hover")} className={cls}>{children}</button>;
}
