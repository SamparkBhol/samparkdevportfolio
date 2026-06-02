import { cn } from "@/lib/cn";
export function SectionHeader({
  kicker, title, subtitle, className,
}: { kicker: string; title: string; subtitle?: string; className?: string }) {
  return (
    <header className={cn("mb-8", className)}>
      <p className="font-pixel text-pop-cyan text-xs mb-2">{kicker}</p>
      <h2 className="font-comic text-4xl md:text-6xl text-pop-yellow [-webkit-text-stroke:2px_black]">{title}</h2>
      {subtitle && <p className="font-body text-paper/80 mt-3 max-w-2xl">{subtitle}</p>}
    </header>
  );
}
