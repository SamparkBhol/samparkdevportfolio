import { cn } from "@/lib/cn";
export function HealthBar({
  value, max = 100, label, className,
}: { value: number; max?: number; label?: string; className?: string }) {
  const pct = Math.min(100, Math.max(0, (value / max) * 100));
  const color = pct > 60 ? "bg-pop-green" : pct > 30 ? "bg-pop-yellow" : "bg-pop-red";
  return (
    <div className={cn("w-full", className)}>
      {label && <div className="font-pixel text-[9px] mb-1 flex justify-between"><span>{label}</span><span>{value}/{max}</span></div>}
      <div role="progressbar" aria-valuenow={value} aria-valuemin={0} aria-valuemax={max} aria-label={label}
        className="nb-border h-4 bg-ink/30 overflow-hidden">
        <div className={cn("h-full transition-[width] duration-700", color)} style={{ width: `${pct}%` }} />
      </div>
    </div>
  );
}
