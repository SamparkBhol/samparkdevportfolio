"use client";
import { useEffect, useState } from "react";
import { motion, AnimatePresence } from "motion/react";
import { LORE, LORE_CAPSTONE } from "@/lib/lore";
import { useLore } from "@/providers/LoreProvider";
import { useSound } from "@/hooks/useSound";
import { cn } from "@/lib/cn";

/**
 * Codex — the collectible tome of hidden lore. A closed tab pinned to the screen
 * edge shows progress (📜 n/5) so visitors know secrets exist; clicking opens an
 * overlay with five slots that fill as fragments are found. A reveal toast fires
 * on each new find. Complete the set → the capstone + LORE MASTER badge.
 */
export function Codex() {
  const { found, count, total, has, justFound, clearJustFound } = useLore();
  const { play } = useSound();
  const [open, setOpen] = useState(false);
  const complete = count === total;

  // reveal toast + sound on each new find; auto-open the tome on completion
  useEffect(() => {
    if (!justFound) return;
    play(complete ? "powerup" : "coin");
    const t = window.setTimeout(() => clearJustFound(), 3200);
    return () => window.clearTimeout(t);
  }, [justFound, complete, play, clearJustFound]);

  // the next undiscovered fragment, for the single forward hint
  const nextHint = count > 0 && !complete ? LORE.find((l) => !has(l.id))?.hint : null;

  return (
    <>
      {/* edge tab — always visible so the hunt is discoverable */}
      <button
        type="button"
        onClick={() => setOpen(true)}
        aria-label={`Open the Codex — ${count} of ${total} lore fragments found`}
        className={cn(
          "fixed left-0 top-1/2 z-[78] -translate-y-1/2 select-none",
          "nb-border border-l-0 nb-shadow bg-ink px-2 py-3 font-pixel text-[9px] text-pop-yellow",
          "transition-transform hover:translate-x-0.5",
          complete && "text-pop-green",
        )}
        style={{ writingMode: "vertical-rl" }}
      >
        <span aria-hidden>📜</span> CODEX {count}/{total}
      </button>

      {/* reveal toast on a new find */}
      <AnimatePresence>
        {justFound && (
          <motion.div
            key={justFound}
            initial={{ opacity: 0, x: -40, y: "-50%" }}
            animate={{ opacity: 1, x: 0, y: "-50%" }}
            exit={{ opacity: 0, x: -40, y: "-50%" }}
            transition={{ type: "spring", stiffness: 360, damping: 26 }}
            className="fixed left-10 top-1/2 z-[96] w-[min(78vw,300px)] -translate-y-1/2 nb-border nb-shadow-lg bg-paper p-3 text-ink"
            role="status"
            aria-live="polite"
          >
            <div className="font-pixel text-[8px] text-pop-red">
              {complete ? "CODEX COMPLETE" : "LORE FRAGMENT FOUND"}
            </div>
            <div className="mt-1 font-comic text-base [-webkit-text-stroke:0.4px_black]">
              {complete ? LORE_CAPSTONE.title : LORE.find((l) => l.id === justFound)?.title}
            </div>
            <p className="mt-1 font-mono text-[11px] leading-snug text-ink/75">
              {complete ? LORE_CAPSTONE.text : LORE.find((l) => l.id === justFound)?.text}
            </p>
            <button
              type="button"
              onClick={() => setOpen(true)}
              className="mt-2 font-pixel text-[8px] text-pop-magenta underline"
            >
              OPEN CODEX ▸
            </button>
          </motion.div>
        )}
      </AnimatePresence>

      {/* the tome overlay */}
      <AnimatePresence>
        {open && (
          <motion.div
            className="fixed inset-0 z-[97] grid place-items-center bg-crt/85 p-4 backdrop-blur-sm"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            onClick={() => setOpen(false)}
          >
            <motion.div
              onClick={(e) => e.stopPropagation()}
              initial={{ scale: 0.92, y: 24, opacity: 0 }}
              animate={{ scale: 1, y: 0, opacity: 1 }}
              exit={{ scale: 0.94, y: 16, opacity: 0 }}
              transition={{ type: "spring", stiffness: 240, damping: 24 }}
              className="relative w-[min(94vw,640px)] max-h-[86vh] overflow-y-auto nb-border nb-shadow-lg bg-ink p-5"
            >
              <span aria-hidden className="halftone pointer-events-none absolute inset-0 opacity-[0.06]" />
              <div className="relative flex items-center justify-between">
                <div>
                  <h2 className="font-comic text-2xl text-pop-yellow [-webkit-text-stroke:1px_black]">THE CODEX OF MAINLINE</h2>
                  <p className="mt-0.5 font-pixel text-[8px] text-paper/50">
                    {count}/{total} FRAGMENTS RECOVERED {complete && "— ★ LORE MASTER"}
                  </p>
                </div>
                <button
                  type="button"
                  onClick={() => setOpen(false)}
                  aria-label="Close codex"
                  className="grid h-8 w-8 place-items-center nb-border bg-pop-red font-pixel text-xs text-paper"
                >
                  X
                </button>
              </div>

              <ul className="relative mt-4 flex flex-col gap-2.5">
                {LORE.map((f) => {
                  const got = has(f.id);
                  return (
                    <li
                      key={f.id}
                      className={cn(
                        "nb-border p-3 transition-colors",
                        got ? "bg-paper text-ink" : "bg-crt/60 text-paper/45",
                      )}
                    >
                      <div className="flex items-baseline gap-2">
                        <span className={cn("font-comic text-lg", got ? "text-pop-red" : "text-paper/30")}>{f.numeral}</span>
                        <span className="font-comic text-base [-webkit-text-stroke:0.3px_black]">
                          {got ? f.title : "? ? ?"}
                        </span>
                      </div>
                      <p className="mt-1 font-mono text-[12px] leading-snug">
                        {got ? f.text : "An undiscovered fragment. Explore the realm — secrets answer to the curious."}
                      </p>
                    </li>
                  );
                })}
              </ul>

              {complete ? (
                <div className="relative mt-4 nb-border nb-shadow bg-pop-yellow p-3 text-ink -rotate-1">
                  <div className="font-comic text-lg [-webkit-text-stroke:0.4px_black]">{LORE_CAPSTONE.title}</div>
                  <p className="mt-1 font-mono text-[12px]">{LORE_CAPSTONE.text}</p>
                </div>
              ) : (
                nextHint && (
                  <p className="relative mt-4 font-pixel text-[8px] leading-relaxed text-pop-cyan">
                    ▸ HINT: {nextHint}
                  </p>
                )
              )}
              {count === 0 && (
                <p className="relative mt-4 font-pixel text-[8px] leading-relaxed text-paper/40">
                  ▸ Five secrets hide in this realm. The dragon, the war, the fox — each keeps a fragment. Poke around.
                </p>
              )}
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </>
  );
}
