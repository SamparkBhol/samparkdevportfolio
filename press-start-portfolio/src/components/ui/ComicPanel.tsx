import { cn } from "@/lib/cn";
export function ComicPanel({
  children, title, className,
}: { children: React.ReactNode; title?: string; className?: string }) {
  return (
    <div className={cn("nb-border nb-shadow-lg bg-paper text-ink overflow-hidden", className)}>
      {title && (
        <div className="nb-border border-t-0 border-x-0 bg-ink text-paper font-pixel text-[10px] px-3 py-2">
          {title}
        </div>
      )}
      <div className="p-4">{children}</div>
    </div>
  );
}
