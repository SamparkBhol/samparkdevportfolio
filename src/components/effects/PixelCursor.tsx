"use client";
import { useCursor } from "@/hooks/useCursor";
export function PixelCursor() {
  const { pos, down } = useCursor();
  return (
    <div aria-hidden className="pointer-events-none fixed z-[70] hidden md:block"
      style={{ left: pos.x, top: pos.y, transform: "translate(-50%,-50%)" }}>
      <div className="nb-border bg-pop-cyan"
        style={{ width: down ? 10 : 16, height: down ? 10 : 16, transition: "all .08s" }} />
    </div>
  );
}
