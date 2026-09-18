"use client";
import { useCallback, useEffect, useMemo, useRef, useState } from "react";
import { CHAPTERS } from "@/content/chapters";
import { resume } from "@/content/resume";
import { VideoPanel } from "@/components/print/VideoPanel";
import { Eyebrow } from "@/components/print/Eyebrow";
import { Kanji } from "@/components/print/Kanji";
import { Caption } from "@/components/print/Caption";
import { cn } from "@/lib/cn";
import { ItemGlyph, SkillTile, SlotGlyph, glyphFor, slotIconFor, type Glyph } from "./SkillTile";
import "@/styles/inventory.css";

/* ============================================================================
   09 / INVENTORY · 装備 sōbi · Skills.
   An RPG inventory sheet: five equipment slots as tabs, the items of the open
   slot as tiles, and a FIELD REPORT that turns the hovered or equipped item
   into evidence: the roles, projects and games on this page where it was used.
   No levels, no percentages, no rarity. Everything is resume.skills.
   ========================================================================== */

const CHAPTER_ID = "inventory";

type PlaceKind = "role" | "project" | "game";
interface Place { id: string; name: string; kind: PlaceKind; href: string }
interface Tile { key: string; groupId: string; group: string; slot: string; name: string; glyph: Glyph; places: Place[] }

const PLACES: Record<string, Place> = {};
resume.roles.forEach((r) => { PLACES[r.id] = { id: r.id, name: r.org, kind: "role", href: "#campaign" }; });
resume.projects.forEach((p) => { PLACES[p.id] = { id: p.id, name: p.name, kind: "project", href: "#boss" }; });
resume.games.forEach((g) => { PLACES[g.id] = { id: g.id, name: g.name, kind: "game", href: "#arcade" }; });

const TILES: Tile[] = resume.skills.flatMap((g) => g.items.map((it) => ({
  key: `${g.id}:${it.name}`,
  groupId: g.id,
  group: g.group,
  slot: g.slot,
  name: it.name,
  glyph: glyphFor(g.id, it.name),
  places: it.usedAt.map((id) => PLACES[id]).filter((p): p is Place => !!p),
})));
const BY_KEY = new Map(TILES.map((t) => [t.key, t]));

const KIND_WORD: Record<PlaceKind, string> = { role: "Role", project: "Project", game: "Game" };

function SearchGlyph() {
  return (
    <svg className="inv-g" viewBox="0 0 20 20" width="18" height="18" aria-hidden="true" focusable="false">
      <circle className="g-none" cx="8.5" cy="8.5" r="5.5" />
      <path className="g-line" d="M12.8 12.8L18 18" />
    </svg>
  );
}

export function Inventory() {
  const ch = CHAPTERS.find((c) => c.id === CHAPTER_ID) ?? CHAPTERS[9];
  const groups = resume.skills;

  const [slot, setSlot] = useState(groups[0].id);
  const [q, setQ] = useState("");
  const [equipped, setEquipped] = useState<string[]>([]);
  const [current, setCurrent] = useState<string | null>(null);
  const [preview, setPreview] = useState<string | null>(null);
  const [focusKey, setFocusKey] = useState<string | null>(null);

  const gridRef = useRef<HTMLDivElement>(null);
  const searchRef = useRef<HTMLInputElement>(null);

  const query = q.trim().toLowerCase();
  const searching = query.length > 0;
  const visible = useMemo(
    () => (searching ? TILES.filter((t) => t.name.toLowerCase().includes(query) || t.group.toLowerCase().includes(query)) : TILES.filter((t) => t.groupId === slot)),
    [searching, query, slot],
  );
  const group = groups.find((g) => g.id === slot) ?? groups[0];

  /* The report follows the pointer, then the keyboard, then what was last equipped, then the first tile. */
  const subjectKey = (preview && BY_KEY.has(preview) ? preview : null) ?? (current && BY_KEY.has(current) ? current : null) ?? visible[0]?.key ?? TILES[0].key;
  const subject = BY_KEY.get(subjectKey) ?? TILES[0];
  const subjectEquipped = equipped.includes(subject.key);

  /* Roving tabindex: exactly one tile in the visible grid is in the Tab order. */
  const rovingKey = focusKey && visible.some((t) => t.key === focusKey) ? focusKey : visible[0]?.key ?? null;

  const pick = useCallback((key: string) => {
    setEquipped((list) => (list.includes(key) ? list.filter((k) => k !== key) : [...list, key]));
    setCurrent(key);
    setFocusKey(key);
  }, []);

  const focusTile = (key: string) => {
    gridRef.current?.querySelector<HTMLButtonElement>(`[data-key="${CSS.escape(key)}"]`)?.focus();
  };

  const onGridKey = (e: React.KeyboardEvent<HTMLDivElement>) => {
    if (e.altKey || e.ctrlKey || e.metaKey) return;
    if (e.key === "/") { e.preventDefault(); searchRef.current?.focus(); return; }
    const i = visible.findIndex((t) => t.key === rovingKey);
    if (i < 0 || !visible.length) return;
    const grid = gridRef.current;
    const cols = grid ? Math.max(1, getComputedStyle(grid).gridTemplateColumns.split(" ").length) : 1;
    let j = i;
    switch (e.key) {
      case "ArrowRight": j = Math.min(visible.length - 1, i + 1); break;
      case "ArrowLeft": j = Math.max(0, i - 1); break;
      case "ArrowDown": j = Math.min(visible.length - 1, i + cols); break;
      case "ArrowUp": j = Math.max(0, i - cols); break;
      case "Home": j = 0; break;
      case "End": j = visible.length - 1; break;
      default: return;
    }
    e.preventDefault();
    const key = visible[j].key;
    setFocusKey(key);
    focusTile(key);
  };

  const onSlotsKey = (e: React.KeyboardEvent<HTMLDivElement>) => {
    const i = groups.findIndex((g) => g.id === slot);
    let j = i;
    if (e.key === "ArrowRight") j = (i + 1) % groups.length;
    else if (e.key === "ArrowLeft") j = (i - 1 + groups.length) % groups.length;
    else if (e.key === "Home") j = 0;
    else if (e.key === "End") j = groups.length - 1;
    else return;
    e.preventDefault();
    setQ("");
    setSlot(groups[j].id);
    (e.currentTarget.querySelectorAll<HTMLButtonElement>(".inv-slot")[j])?.focus();
  };

  /* Leaving the grid with the pointer hands the report back to the equipped item. */
  useEffect(() => {
    const grid = gridRef.current;
    if (!grid) return;
    const clear = () => setPreview(null);
    grid.addEventListener("pointerleave", clear);
    return () => grid.removeEventListener("pointerleave", clear);
  }, []);

  const perSlotMatches = useMemo(() => {
    const m = new Map<string, number>();
    if (searching) visible.forEach((t) => m.set(t.groupId, (m.get(t.groupId) ?? 0) + 1));
    return m;
  }, [searching, visible]);

  return (
    <VideoPanel video="bedroom" dim={0.85} id={CHAPTER_ID} data-chapter={CHAPTER_ID} className="chapter inv" ariaLabel={`${ch.n} ${ch.en} · ${ch.plain}`}>
      <div className="wrap">
        <header className="chapter-head inv-head">
          <div className="inv-head-row">
            <Eyebrow n={ch.n}>{ch.en}</Eyebrow>
            <span className="mono-label inv-plain">{ch.plain}</span>
          </div>
          <h2 className="chapter-title inv-title">{ch.en}</h2>
          <Kanji en={ch.en} jp={ch.jp} romaji={ch.romaji} />
          <p className="inv-lede">What I carry, sorted by slot. Each item names the roles, projects and games on this page where it was used. No levels, no bars.</p>
        </header>

        <div className="paper ink-border hard-shadow inv-sheet ink-in">
          <div className="inv-bar">
            <div className="inv-slots" role="group" aria-label="Equipment slots" onKeyDown={onSlotsKey}>
              {groups.map((g) => {
                const on = !searching && g.id === slot;
                const n = searching ? perSlotMatches.get(g.id) ?? 0 : g.items.length;
                return (
                  <button
                    key={g.id}
                    type="button"
                    className={cn("inv-slot", on && "is-on", searching && n === 0 && "is-dim")}
                    aria-pressed={on}
                    aria-label={`${g.slot}: ${g.group}, ${n} items`}
                    tabIndex={g.id === slot ? 0 : -1}
                    title={g.group}
                    onClick={() => { setQ(""); setSlot(g.id); setPreview(null); }}
                  >
                    <SlotGlyph icon={slotIconFor(g.id)} />
                    <span className="inv-slot-name">{g.slot}</span>
                    <span className="inv-slot-count" aria-label={`${n} items`}>{n}</span>
                  </button>
                );
              })}
            </div>
            <label className="inv-search-wrap">
              <SearchGlyph />
              <span className="sr-only">Find an item across all slots</span>
              <input ref={searchRef} className="inv-search" type="search" placeholder="Find an item" autoComplete="off" spellCheck={false} value={q}
                onChange={(e) => { setQ(e.target.value); setPreview(null); }} />
            </label>
          </div>

          <div className="inv-body">
            <div className="inv-grid-wrap">
              <p className="mono-label inv-groupline" aria-live="polite">
                {searching
                  ? <>{visible.length} {visible.length === 1 ? "item" : "items"} across all slots for “{q.trim()}”</>
                  : <><span className="inv-groupline-slot">{group.slot}</span> · {group.group} · {group.items.length} items</>}
              </p>
              <div ref={gridRef} className="inv-grid graph-paper" role="group" aria-label={searching ? "Search results" : `${group.slot} items`} onKeyDown={onGridKey}>
                {visible.map((t) => (
                  <SkillTile
                    key={t.key}
                    tileKey={t.key}
                    name={t.name}
                    slot={t.slot}
                    glyph={t.glyph}
                    count={t.places.length}
                    equipped={equipped.includes(t.key)}
                    focusable={t.key === rovingKey}
                    showSlot={searching}
                    onPick={pick}
                    onPreview={setPreview}
                  />
                ))}
                {visible.length === 0 ? <p className="inv-empty">Nothing in the bag by that name. Try a shorter word, or open a slot above.</p> : null}
              </div>
              <p className="mono-label inv-hint">Arrows move · Enter equips · / finds</p>
            </div>

            <aside className="inv-report" aria-label="Field report">
              <div className="inv-report-head">
                <Caption>Field report</Caption>
                {subjectEquipped ? <span className="stamp inv-report-stamp">Equipped</span> : null}
              </div>
              <div className="inv-report-item">
                <span className="inv-report-glyph"><ItemGlyph glyph={subject.glyph} size={44} /></span>
                <div className="inv-report-id">
                  <h3 className="inv-report-name">{subject.name}</h3>
                  <p className="mono-label inv-report-slot"><span>{subject.slot}</span> · {subject.group}</p>
                </div>
              </div>
              <p className="mono-label inv-report-k">Used at</p>
              {subject.places.length ? (
                <ul className="inv-chips">
                  {subject.places.map((p) => (
                    <li key={p.id}>
                      <a className="inv-chip" href={p.href} title={`${KIND_WORD[p.kind]} · jump to that chapter`}>
                        <span className="inv-chip-k">{KIND_WORD[p.kind]}</span>
                        <span className="inv-chip-n">{p.name}</span>
                      </a>
                    </li>
                  ))}
                </ul>
              ) : (
                <p className="inv-bag">in the bag · not shown on this page</p>
              )}
              <div className="inv-loadout">
                <p className="mono-label inv-report-k">Loadout · this visit only</p>
                {equipped.length ? (
                  <ul className="inv-chips inv-loadout-list">
                    {equipped.map((k) => {
                      const t = BY_KEY.get(k);
                      if (!t) return null;
                      return (
                        <li key={k}>
                          <button type="button" className="inv-chip inv-chip-btn" onClick={() => pick(k)} aria-label={`Unequip ${t.name}`}>
                            <span className="inv-chip-n">{t.name}</span>
                            <span className="inv-chip-x" aria-hidden="true">×</span>
                          </button>
                        </li>
                      );
                    })}
                  </ul>
                ) : (
                  <p className="inv-bag">Nothing equipped yet. Pick an item.</p>
                )}
              </div>
            </aside>
          </div>
        </div>
      </div>
    </VideoPanel>
  );
}
