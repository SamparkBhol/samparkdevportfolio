"use client";
import { useEffect, useMemo, useState } from "react";
import { motion, AnimatePresence } from "motion/react";
import { SECTION_IDS, SECTION_LABELS } from "@/lib/sfx";
import { scrollToId } from "@/providers/SmoothScroll";
import { portfolio } from "@/content/portfolio";
import { cn } from "@/lib/cn";

type Cmd = { id: string; label: string; hint: string; run: () => void };

export function CommandPalette() {
  const [open, setOpen] = useState(false);
  const [q, setQ] = useState("");
  const [active, setActive] = useState(0);

  const commands = useMemo<Cmd[]>(() => {
    const nav: Cmd[] = SECTION_IDS.map((id) => ({
      id, label: SECTION_LABELS[id], hint: "Jump to stage", run: () => scrollToId(id),
    }));
    const actions: Cmd[] = [
      { id: "cv", label: "Download CV", hint: "Resume", run: () => window.open(portfolio.profile.resumeUrl ?? "#", "_blank") },
      { id: "email", label: "Email me", hint: "Contact", run: () => { window.location.href = `mailto:${portfolio.contact.email}`; } },
      ...portfolio.contact.socials.map((s) => ({ id: `s-${s.label}`, label: s.label, hint: "Social", run: () => window.open(s.href, "_blank") })),
    ];
    return [...nav, ...actions];
  }, []);

  const filtered = useMemo(
    () => (q ? commands.filter((c) => (c.label + c.hint).toLowerCase().includes(q.toLowerCase())) : commands),
    [q, commands],
  );

  useEffect(() => {
    const onKey = (e: KeyboardEvent) => {
      if ((e.key === "k" && (e.metaKey || e.ctrlKey)) || (e.key === "/" && !/INPUT|TEXTAREA/.test((e.target as HTMLElement)?.tagName))) {
        e.preventDefault();
        setOpen((o) => !o);
      }
      if (e.key === "Escape") setOpen(false);
    };
    const openEvt = () => setOpen(true);
    window.addEventListener("keydown", onKey);
    window.addEventListener("open-cmdk", openEvt);
    return () => {
      window.removeEventListener("keydown", onKey);
      window.removeEventListener("open-cmdk", openEvt);
    };
  }, []);

  useEffect(() => { setActive(0); }, [q, open]);

  const choose = (c: Cmd) => { setOpen(false); setQ(""); setTimeout(c.run, 60); };

  return (
    <AnimatePresence>
      {open && (
        <motion.div
          initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
          onClick={() => setOpen(false)}
          className="fixed inset-0 z-[95] grid place-items-start justify-center bg-crt/80 px-4 pt-[12vh] backdrop-blur-sm"
        >
          <motion.div
            initial={{ scale: 0.96, y: -12 }} animate={{ scale: 1, y: 0 }} exit={{ scale: 0.96, opacity: 0 }}
            onClick={(e) => e.stopPropagation()}
            className="w-[min(94vw,560px)] nb-border nb-shadow-lg bg-paper text-ink"
          >
            <div className="flex items-center gap-2 border-b-[3px] border-ink px-3 py-2">
              <span className="font-pixel text-[10px] text-pop-red">▸</span>
              <input
                autoFocus value={q}
                onChange={(e) => setQ(e.target.value)}
                onKeyDown={(e) => {
                  if (e.key === "ArrowDown") { e.preventDefault(); setActive((a) => Math.min(filtered.length - 1, a + 1)); }
                  if (e.key === "ArrowUp") { e.preventDefault(); setActive((a) => Math.max(0, a - 1)); }
                  if (e.key === "Enter" && filtered[active]) { e.preventDefault(); choose(filtered[active]); }
                }}
                placeholder="Jump to… (try 'projects', 'cv', 'email')"
                aria-label="Command palette"
                className="w-full bg-transparent font-mono text-sm outline-none placeholder:text-ink/40"
              />
              <kbd className="nb-border bg-ink px-1.5 py-0.5 font-pixel text-[7px] text-paper">ESC</kbd>
            </div>
            <ul className="max-h-[46vh] overflow-y-auto p-2">
              {filtered.map((c, i) => (
                <li key={c.id}>
                  <button
                    type="button"
                    onMouseEnter={() => setActive(i)}
                    onClick={() => choose(c)}
                    className={cn(
                      "flex w-full items-center justify-between px-3 py-2 text-left font-pixel text-[11px]",
                      i === active ? "nb-border bg-pop-yellow text-ink" : "text-ink/80",
                    )}
                  >
                    <span>{c.label}</span>
                    <span className="text-[8px] opacity-60">{c.hint}</span>
                  </button>
                </li>
              ))}
              {filtered.length === 0 && <li className="px-3 py-4 text-center font-pixel text-[10px] text-ink/50">no match</li>}
            </ul>
          </motion.div>
        </motion.div>
      )}
    </AnimatePresence>
  );
}
