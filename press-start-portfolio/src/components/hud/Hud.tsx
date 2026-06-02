"use client";
import { useState } from "react";
import { useScrollProgress } from "@/hooks/useScrollProgress";
import { useActiveSection } from "@/hooks/useActiveSection";
import { useSound } from "@/hooks/useSound";
import { HealthBar } from "@/components/ui/HealthBar";
import { PauseMenu } from "./PauseMenu";
import { SECTION_LABELS } from "@/lib/sfx";

export function Hud() {
  const progress = useScrollProgress();
  const active = useActiveSection();
  const { enabled, toggle } = useSound();
  const [paused, setPaused] = useState(false);
  const level = Math.max(1, Math.round(progress * 24));
  const coins = Math.round(progress * 999);

  return (
    <>
      <header className="fixed top-0 inset-x-0 z-[75] nb-border border-x-0 border-t-0 bg-crt/95 backdrop-blur">
        <div className="mx-auto max-w-7xl flex items-center gap-3 px-3 py-2 font-pixel text-[10px] text-paper">
          <span className="text-pop-red">♥♥♥</span>
          <span className="text-pop-yellow">LVL {level}</span>
          <span className="hidden md:inline text-pop-cyan truncate" aria-live="polite">▸ {SECTION_LABELS[active]}</span>
          <div className="hidden sm:block w-40"><HealthBar value={Math.round(progress * 100)} max={100} label="XP" /></div>
          <span className="ml-auto text-pop-yellow">◎ {coins}</span>
          <button type="button" onClick={toggle} aria-pressed={enabled} aria-label="Toggle sound"
            className="nb-border px-2 py-1 bg-pop-cyan text-ink">{enabled ? "🔊" : "🔇"}</button>
          <button type="button" onClick={() => setPaused(true)} aria-label="Open stage select menu"
            className="nb-border px-2 py-1 bg-pop-yellow text-ink">☰</button>
        </div>
      </header>
      <PauseMenu open={paused} onClose={() => setPaused(false)} />
    </>
  );
}
