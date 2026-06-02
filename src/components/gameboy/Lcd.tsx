"use client";
import { forwardRef } from "react";

export const Lcd = forwardRef<HTMLCanvasElement, { className?: string }>(function Lcd(
  { className = "" },
  ref,
) {
  return (
    <div className={`relative ${className}`}>
      <canvas
        ref={ref}
        width={160}
        height={144}
        aria-label="Game screen"
        className="block h-full w-full [image-rendering:pixelated]"
      />
      {/* scanlines */}
      <div
        aria-hidden
        className="pointer-events-none absolute inset-0"
        style={{ background: "repeating-linear-gradient(0deg, rgba(0,0,0,0.14) 0 1px, transparent 1px 3px)" }}
      />
      {/* glass glare */}
      <div aria-hidden className="pointer-events-none absolute inset-0 bg-gradient-to-br from-white/25 via-transparent to-transparent" />
      {/* inner vignette */}
      <div aria-hidden className="pointer-events-none absolute inset-0 shadow-[inset_0_0_18px_rgba(0,0,0,0.45)]" />
    </div>
  );
});
