"use client";
import { useRef, useState } from "react";
import type { SideQuest } from "@/content/types";
import { Hanko } from "@/components/print";

/* ---------- Loot icons: a trophy, a scroll, a gear, people, a spark — drawn in the book's ink ---------- */
type Loot = "trophy" | "scroll" | "gear" | "people" | "spark";
const GEAR_PTS = (() => {
  const pts: string[] = [];
  for (let i = 0; i < 16; i++) {
    const r = i % 2 === 0 ? 10 : 7.2;
    const a = (i / 16) * Math.PI * 2 - Math.PI / 2;
    pts.push(`${(12 + Math.cos(a) * r).toFixed(1)},${(12 + Math.sin(a) * r).toFixed(1)}`);
  }
  return pts.join(" ");
})();
function LootIcon({ kind }: { kind: Loot }) {
  if (kind === "trophy") {
    return (
      <svg className="ql-loot" viewBox="0 0 24 24" aria-hidden="true" focusable="false">
        <path className="q-fill" d="M 6 3 H 18 V 9 C 18 13 15 15 12 15 C 9 15 6 13 6 9 Z" />
        <path className="q-line" d="M 6 5 H 3 V 8 C 3 10 4.5 11 6 11 M 18 5 H 21 V 8 C 21 10 19.5 11 18 11" />
        <path className="q-line" d="M 12 15 V 18 M 8 21 H 16 M 9 18 H 15 V 21" />
      </svg>
    );
  }
  if (kind === "scroll") {
    return (
      <svg className="ql-loot" viewBox="0 0 24 24" aria-hidden="true" focusable="false">
        <path className="q-fill" d="M 6 4 H 19 C 20.5 4 21 5 21 6.5 V 7 H 8 V 18 C 8 19.5 7 20.5 5.5 20.5 C 4 20.5 3 19.5 3 18 V 6.5 C 3 5 4 4 6 4 Z" />
        <path className="q-line" d="M 8 7 C 8 5.5 7 4 5.5 4 M 5.5 20.5 H 17 C 18.5 20.5 19.5 19.5 19.5 18 V 17 H 8" />
        <path className="q-line" d="M 11 11 H 16 M 11 14 H 15" />
      </svg>
    );
  }
  if (kind === "people") {
    return (
      <svg className="ql-loot" viewBox="0 0 24 24" aria-hidden="true" focusable="false">
        <path className="q-fill" d="M 13.5 21 C 13.5 16.5 15 14.5 17 14.5 C 19.5 14.5 21.5 16.5 21.5 21 Z" />
        <circle className="q-fill" cx="17" cy="9.5" r="3" />
        <path className="q-fill" d="M 2.5 21 C 2.5 15.5 5 13 8.5 13 C 12 13 14.5 15.5 14.5 21 Z" />
        <circle className="q-fill" cx="8.5" cy="7.5" r="3.6" />
      </svg>
    );
  }
  if (kind === "spark") {
    return (
      <svg className="ql-loot" viewBox="0 0 24 24" aria-hidden="true" focusable="false">
        <path className="q-fill" d="M 12 2 L 14.3 9.7 L 22 12 L 14.3 14.3 L 12 22 L 9.7 14.3 L 2 12 L 9.7 9.7 Z" />
        <path className="q-line" d="M 19.5 3.5 L 20 5 L 21.5 5.5 L 20 6 L 19.5 7.5 L 19 6 L 17.5 5.5 L 19 5 Z" />
      </svg>
    );
  }
  return (
    <svg className="ql-loot" viewBox="0 0 24 24" aria-hidden="true" focusable="false">
      <polygon className="q-fill" points={GEAR_PTS} />
      <circle className="q-hole" cx="12" cy="12" r="3" />
    </svg>
  );
}

/* Which loot each reward is, chosen by hand: quest id → one icon per reward, in the order the
   rewards are written in resume.ts. A reward this map does not name gets a trophy. */
const LOOT: Record<string, Loot[]> = {
  ieee: ["trophy", "scroll", "gear"],
  aee: ["people", "spark", "scroll"],
  "quark-oss": ["trophy", "spark", "gear", "gear"],
};
const lootFor = (id: string, i: number): Loot => LOOT[id]?.[i] ?? "trophy";

const pad = (v: number) => String(v).padStart(2, "0");
const STATUS = { complete: "COMPLETE", ongoing: "ONGOING" } as const;

/* The quest sheet that unfolds under its row. The Hanko is not pre-printed: it mounts the first
   time the quest is opened and slams in (CSS), then stays for the rest of the visit. */
function QuestSheet({ q, k, n, stamped }: { q: SideQuest; k: number; n: number; stamped: boolean }) {
  return (
    <div className="ql-sheet">
      <div className="ql-sheet-head">
        <p className="mono-label ql-on-rule ql-sheet-n">Quest {pad(k + 1)} of {pad(n)}</p>
        <span className="ql-hanko-slot">
          {stamped ? (
            <span className="ql-hanko" data-slam="true"><Hanko>{STATUS[q.status]}</Hanko></span>
          ) : null}
        </span>
      </div>
      <p className="ql-summary">{q.summary}</p>
      <p className="mono-label ql-on-rule ql-rewards-h">Rewards</p>
      <ul className="ql-rewards">
        {q.rewards.map((r, i) => (
          <li key={r}><LootIcon kind={lootFor(q.id, i)} /><span>{r}</span></li>
        ))}
      </ul>
    </div>
  );
}

/* The quest log: one ledger at every width. Every entry is a button; Enter, Space, a click or a tap
   unfolds its sheet in place and stamps it. ↑ / ↓ move focus between entries (roving tabindex),
   Home / End jump, Escape folds the open sheet. Nothing moves on its own. */
export function QuestLog({ quests }: { quests: SideQuest[] }) {
  const [open, setOpen] = useState<string | null>(null);
  const [stamped, setStamped] = useState<string[]>([]);
  const [focusAt, setFocusAt] = useState(0);
  const rows = useRef<(HTMLButtonElement | null)[]>([]);
  const n = quests.length;
  if (!n) return null;
  const done = quests.filter((q) => q.status === "complete").length;
  const going = n - done;

  const toggle = (q: SideQuest) => {
    if (open === q.id) { setOpen(null); return; }
    setOpen(q.id);
    if (!stamped.includes(q.id)) setStamped((s) => [...s, q.id]);
  };
  const focusRow = (k: number) => { setFocusAt(k); rows.current[k]?.focus(); };

  const onKeyDown = (e: React.KeyboardEvent) => {
    if (e.altKey || e.ctrlKey || e.metaKey) return;
    switch (e.key) {
      case "ArrowDown": e.preventDefault(); focusRow((focusAt + 1) % n); break;
      case "ArrowUp": e.preventDefault(); focusRow((focusAt - 1 + n) % n); break;
      case "Home": e.preventDefault(); focusRow(0); break;
      case "End": e.preventDefault(); focusRow(n - 1); break;
      case "Escape": if (open) { e.preventDefault(); setOpen(null); } break;
    }
  };

  return (
    <div className="ql paper ink-border">
      <p className="ql-tab display" aria-hidden="true">Quest log</p>
      <div className="ql-body">
        <p className="mono-label ql-tally">{n} {n === 1 ? "quest" : "quests"} · {done} complete · {going} ongoing</p>
        <ul className="ql-list" role="list" onKeyDown={onKeyDown}>
          {quests.map((q, k) => {
            const on = open === q.id;
            const rowId = `ql-row-${q.id}`;
            const foldId = `ql-fold-${q.id}`;
            return (
              <li key={q.id} className="ql-item" data-open={on ? "true" : undefined}>
                <button
                  ref={(el) => { rows.current[k] = el; }}
                  type="button"
                  id={rowId}
                  className="ql-row"
                  aria-expanded={on}
                  aria-controls={foldId}
                  tabIndex={k === focusAt ? 0 : -1}
                  onClick={() => toggle(q)}
                  onFocus={() => setFocusAt(k)}
                >
                  <span className="mono-label ql-n" aria-hidden="true">{pad(k + 1)}</span>
                  <span className="ql-row-org">{q.org}</span>
                  <span className="mono-label ql-row-meta">{q.role} <span className="ql-period">· {q.period}</span></span>
                  <span className="mono-label ql-row-status" data-status={q.status}>{STATUS[q.status]}</span>
                  <svg className="ql-chev" viewBox="0 0 16 16" aria-hidden="true" focusable="false"><path d="M 3.5 6 L 8 10.5 L 12.5 6" /></svg>
                </button>
                <div className="ql-fold" id={foldId} role="region" aria-labelledby={rowId}>
                  <div className="ql-fold-in">
                    <QuestSheet q={q} k={k} n={n} stamped={stamped.includes(q.id)} />
                  </div>
                </div>
              </li>
            );
          })}
        </ul>
        <p className="mono-label ql-help">↑ ↓ point · Enter or tap unfolds</p>
      </div>
    </div>
  );
}
