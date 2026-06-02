import { cn } from "@/lib/cn";
export function Badge({ children, className }: { children: React.ReactNode; className?: string }) {
  return <span className={cn("nb-border bg-ink text-paper font-pixel text-[10px] px-2 py-1 inline-block", className)}>{children}</span>;
}
