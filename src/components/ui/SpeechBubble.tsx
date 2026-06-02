import { cn } from "@/lib/cn";
export function SpeechBubble({ children, className }: { children: React.ReactNode; className?: string }) {
  return (
    <div className={cn("relative nb-border nb-shadow bg-paper text-ink px-4 py-3 font-body", className)}>
      {children}
      <span aria-hidden className="absolute -bottom-3 left-8 h-0 w-0 border-x-[10px] border-x-transparent border-t-[14px] border-t-ink" />
      <span aria-hidden className="absolute -bottom-[7px] left-[34px] h-0 w-0 border-x-[8px] border-x-transparent border-t-[11px] border-t-paper" />
    </div>
  );
}
