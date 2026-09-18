import { cn } from "@/lib/cn";

/* A ribbon medal drawn in ink: two shu tails, a hanging loop and a disc carrying the issuer's initial.
   The active one is struck in yellow; the rest rest on paper. Colours come from trophies.css (.medal-*). */
export function Medal({ initial, active = false, size = 64, className }: { initial: string; active?: boolean; size?: number; className?: string }) {
  return (
    <svg className={cn("medal", active && "is-on", className)} viewBox="0 0 64 84" width={size} height={size * 84 / 64} aria-hidden="true" focusable="false">
      <rect className="medal-tail medal-tail-l" x="23" y="-2" width="18" height="40" transform="rotate(-16 32 0)" />
      <rect className="medal-tail medal-tail-r" x="23" y="-2" width="18" height="40" transform="rotate(16 32 0)" />
      <rect className="medal-loop" x="26" y="31" width="12" height="8" rx="2" />
      <circle className="medal-disc" cx="32" cy="58" r="22" />
      <circle className="medal-ring" cx="32" cy="58" r="16.5" />
      <text className="medal-letter" x="32" y="66" textAnchor="middle">{initial}</text>
    </svg>
  );
}
