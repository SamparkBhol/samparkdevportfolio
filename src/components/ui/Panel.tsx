import { cn } from "@/lib/cn";
type PanelColor = "paper" | "yellow" | "cyan" | "magenta" | "green" | "red";
const BG: Record<PanelColor, string> = {
  paper: "bg-paper text-ink", yellow: "bg-pop-yellow text-ink", cyan: "bg-pop-cyan text-ink",
  magenta: "bg-pop-magenta text-ink", green: "bg-pop-green text-ink", red: "bg-pop-red text-paper",
};
export function Panel({
  children, className, color = "paper", lg = false,
}: { children: React.ReactNode; className?: string; color?: PanelColor; lg?: boolean }) {
  return (
    <div className={cn("nb-border", lg ? "nb-shadow-lg" : "nb-shadow", BG[color], className)}>
      {children}
    </div>
  );
}
