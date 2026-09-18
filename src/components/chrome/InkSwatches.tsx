"use client";
import { useInk } from "@/components/motion/InkProvider";
import type { Ink } from "@/content/types";
const INKS: { id: Ink; label: string; hex: string }[] = [
  { id: "cel", label: "Cel blue", hex: "#3F6FB5" },
  { id: "shu", label: "Shu red", hex: "#D0342C" },
  { id: "yellow", label: "Yellow", hex: "#FFD23F" },
];
/** "Try an ink": recolours every printed video and stamp through one CSS variable. */
export function InkSwatches() {
  const { ink, setInk } = useInk();
  return (
    <div role="radiogroup" aria-label="Try an ink" style={{ display: "inline-flex", gap: 6, alignItems: "center" }}>
      <span className="mono-label" style={{ fontSize: 10, color: "var(--color-mute)" }}>Ink</span>
      {INKS.map((i) => (
        <button key={i.id} type="button" role="radio" aria-checked={ink === i.id} aria-label={i.label} title={i.label} onClick={() => setInk(i.id)}
          style={{ width: 24, height: 24, borderRadius: 0, border: ink === i.id ? "2px solid var(--color-paper)" : "2px solid var(--color-line)", background: i.hex, cursor: "pointer", padding: 0 }} />
      ))}
    </div>
  );
}
