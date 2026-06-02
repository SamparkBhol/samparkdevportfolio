"use client";
import { useEffect } from "react";
import { motion, AnimatePresence } from "motion/react";
import { SECTION_IDS, SECTION_LABELS } from "@/lib/sfx";
import { ArcadeButton } from "@/components/ui/ArcadeButton";

export function PauseMenu({ open, onClose }: { open: boolean; onClose: () => void }) {
  // Close on Escape while the menu is open.
  useEffect(() => {
    if (!open) return;
    const onKey = (e: KeyboardEvent) => {
      if (e.key === "Escape") onClose();
    };
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, [open, onClose]);

  return (
    <AnimatePresence>
      {open && (
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          onClick={onClose} // click the backdrop to dismiss
          className="fixed inset-0 z-[80] grid place-items-center bg-crt/90 backdrop-blur-sm p-4"
        >
          <motion.nav
            aria-label="Stage select"
            onClick={(e) => e.stopPropagation()} // clicks inside shouldn't close
            initial={{ scale: 0.9, y: 20 }}
            animate={{ scale: 1, y: 0 }}
            exit={{ scale: 0.9, opacity: 0 }}
            className="relative nb-border nb-shadow-lg bg-paper text-ink p-6 w-[min(92vw,520px)]"
          >
            {/* Close button */}
            <button
              type="button"
              onClick={onClose}
              aria-label="Close menu"
              className="absolute -top-4 -right-4 z-10 h-10 w-10 nb-border nb-shadow bg-pop-red text-paper font-pixel text-sm grid place-items-center hover:-translate-y-0.5 active:translate-y-0.5 active:shadow-none transition-transform"
            >
              ✕
            </button>

            <p className="font-comic text-3xl text-pop-red mb-1">PAUSE</p>
            <p className="font-pixel text-[10px] text-ink/60 mb-4">SELECT A STAGE · [ESC] TO CLOSE</p>
            <ul className="grid grid-cols-2 gap-3">
              {SECTION_IDS.map((id) => (
                <li key={id}>
                  <ArcadeButton href={`#${id}`} onClick={onClose} color="cyan" className="w-full justify-center">
                    {SECTION_LABELS[id]}
                  </ArcadeButton>
                </li>
              ))}
            </ul>

            <button
              type="button"
              onClick={onClose}
              className="mt-5 w-full nb-border nb-shadow bg-pop-yellow text-ink font-pixel text-xs py-3 hover:-translate-y-0.5 active:translate-y-0.5 active:shadow-none transition-transform"
            >
              ▶ RESUME
            </button>
          </motion.nav>
        </motion.div>
      )}
    </AnimatePresence>
  );
}
