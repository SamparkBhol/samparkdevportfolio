/** Decorative halftone dot field. Static — no scroll-bound transform (kept cheap
 *  so 11 instances don't add scroll jank). */
export function HalftoneBg({ className = "" }: { className?: string }) {
  return <div aria-hidden className={`halftone opacity-20 absolute inset-0 -z-10 ${className}`} />;
}
