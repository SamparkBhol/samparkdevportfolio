"use client";
import { useEffect, useRef, useState } from "react";
import type { NpmPackage } from "@/content/types";
import { Sfx } from "@/components/print";

/* ---------- Pixel sprites: a grid of characters becomes crisp SVG rects ----------
   '#' ink · 'f' paper · 'r' shu · 'y' yellow · 'c' cel · '.' nothing. */
const INKS: Record<string, string> = { "#": "var(--color-ink)", f: "var(--color-paper)", r: "var(--color-shu)", y: "var(--color-yellow)", c: "var(--color-cel)" };
function Pixels({ rows, cell = 4, className, label }: { rows: string[]; cell?: number; className?: string; label?: string }) {
  const w = Math.max(...rows.map((r) => r.length));
  const h = rows.length;
  const rects: React.ReactNode[] = [];
  rows.forEach((row, y) => {
    // Run-length across the row: one rect per run of the same ink keeps the node count small.
    let x = 0;
    while (x < row.length) {
      const ch = row[x];
      let x2 = x;
      while (x2 < row.length && row[x2] === ch) x2++;
      if (INKS[ch]) rects.push(<rect key={`${x}-${y}`} x={x} y={y} width={x2 - x} height={1} fill={INKS[ch]} />);
      x = x2;
    }
  });
  return (
    <svg className={className} viewBox={`0 0 ${w} ${h}`} width={w * cell} height={h * cell} shapeRendering="crispEdges" role={label ? "img" : undefined} aria-label={label} aria-hidden={label ? undefined : "true"} focusable="false">
      {rects}
    </svg>
  );
}

/* 5×7 bitmap letters for the sign. */
const GLYPHS: Record<string, string[]> = {
  S: [".###.", "#...#", "#....", ".###.", "....#", "#...#", ".###."],
  H: ["#...#", "#...#", "#...#", "#####", "#...#", "#...#", "#...#"],
  O: [".###.", "#...#", "#...#", "#...#", "#...#", "#...#", ".###."],
  P: ["####.", "#...#", "#...#", "####.", "#....", "#....", "#...."],
};
function bitmapWord(word: string): string[] {
  const rows = Array.from({ length: 7 }, () => "");
  word.split("").forEach((c, i) => {
    const g = GLYPHS[c] ?? GLYPHS.O;
    for (let y = 0; y < 7; y++) rows[y] += (i ? "." : "") + g[y];
  });
  return rows;
}
const SIGN = bitmapWord("SHOP");

/** The pixel SHOP sign over the counter. */
export function ShopSign() {
  return (
    <div className="shop-sign ink-border hard-shadow">
      <span className="shop-sign-nail" aria-hidden="true" /><span className="shop-sign-nail shop-sign-nail-r" aria-hidden="true" />
      <Pixels rows={SIGN} cell={6} className="shop-sign-px" label="Shop" />
    </div>
  );
}

/* A beckoning cat at the counter: paper fur, a red collar, a raised paw, a coin by its feet. */
const CAT = [
  "...#........#.......",
  "...##......##.......",
  "...#f#....#f#.......",
  "...#ff####ff#.......",
  "..#ffffffffff#......",
  "..#ffffffffff#......",
  "..#f##ffff##f#...##.",
  "..#f##ffff##f#..#ff#",
  "..#ffffffffff#..#ff#",
  "..#fff#rr#fff#..#ff#",
  "...#ffffffff#...#ff#",
  "....#rrrrrr#....#ff#",
  "...#ffffffff#####ff#",
  "..#ffffffffffffffff#",
  "..#ff###ffffffffff#.",
  "..#f#yyy#fffffffff#.",
  "..#f#yyy#ffffffff#..",
  "...#####.########...",
];
export function Shopkeeper() {
  return <Pixels rows={CAT} cell={5} className="shop-cat" label="A beckoning cat at the counter" />;
}

/* The cursor: a coin with a square hole, printed beside the item you point at. */
const COIN = ["..####..", ".#yyyy#.", "#yyyyyy#", "#yy##yy#", "#yy##yy#", "#yyyyyy#", ".#yyyy#.", "..####.."];
function Coin() {
  return <Pixels rows={COIN} cell={3} className="shop-coin" />;
}

/* ---------- The menu: an item list and the sheet for the pointed-at item ----------
   ↑ / ↓ move the pointer (and focus), Home / End jump, Enter copies the install line of the pointed-at
   item; a click or tap points at an item; COPY copies. Nothing here moves on its own. */
export function ShopMenu({ packages }: { packages: NpmPackage[] }) {
  const [i, setI] = useState(0);
  const [copied, setCopied] = useState(false);
  const rows = useRef<(HTMLButtonElement | null)[]>([]);
  const timer = useRef(0);
  useEffect(() => () => window.clearTimeout(timer.current), []);
  const n = packages.length;
  const cur = packages[i];
  if (!cur) return null;

  const point = (k: number, focus = false) => {
    const next = (k + n) % n;
    setI(next);
    setCopied(false);
    if (focus) rows.current[next]?.focus();
  };

  const copy = (text: string) => {
    const done = () => {
      setCopied(true);
      window.clearTimeout(timer.current);
      timer.current = window.setTimeout(() => setCopied(false), 900);
    };
    if (navigator.clipboard?.writeText) navigator.clipboard.writeText(text).then(done).catch(() => {});
  };

  const onKeyDown = (e: React.KeyboardEvent) => {
    if (e.altKey || e.ctrlKey || e.metaKey) return;
    switch (e.key) {
      case "ArrowDown": e.preventDefault(); point(i + 1, true); break;
      case "ArrowUp": e.preventDefault(); point(i - 1, true); break;
      case "Home": e.preventDefault(); point(0, true); break;
      case "End": e.preventDefault(); point(n - 1, true); break;
      case "Enter": e.preventDefault(); copy(cur.install); break;
    }
  };

  return (
    <div className="shop-menu">
      <div className="shop-win shop-list-win">
        <p className="mono-label shop-win-title"><span>Items</span><span>{n} on the shelf</span></p>
        <ul className="shop-list" role="listbox" aria-label="Packages on npm" onKeyDown={onKeyDown}>
          {packages.map((p, k) => (
            <li key={p.id} role="presentation">
              <button
                id={`shop-item-${p.id}`}
                ref={(el) => { rows.current[k] = el; }}
                type="button"
                role="option"
                aria-selected={k === i}
                tabIndex={k === i ? 0 : -1}
                className="shop-row"
                data-on={k === i ? "true" : undefined}
                onClick={() => point(k)}
              >
                <span className="shop-row-cursor" aria-hidden="true">{k === i ? <Coin /> : null}</span>
                <span className="shop-row-name">{p.name}</span>
                <span className="shop-row-meta">
                  <span className="mono-label shop-chip">v{p.version}</span>
                  <span className="mono-label shop-price"><span className="shop-price-hole" aria-hidden="true" />FREE · npm</span>
                </span>
              </button>
            </li>
          ))}
        </ul>
        <p className="mono-label shop-help" aria-hidden="true">↑ ↓ point · Enter copies</p>
      </div>

      <div className="shop-win shop-sheet-win" key={cur.id} role="region" aria-label={`${cur.name}, the pointed-at item`}>
        <p className="mono-label shop-win-title"><span>Item</span><span>{cur.tags.join(" · ")}</span></p>
        <div className="shop-sheet">
          <header className="shop-sheet-head">
            <h3 className="display shop-sheet-name">{cur.name}</h3>
            <span className="mono-label shop-chip shop-chip-lg">v{cur.version}</span>
            <span className="mono-label shop-price shop-price-lg"><span className="shop-price-hole" aria-hidden="true" />FREE · npm</span>
          </header>
          <p className="shop-desc">{cur.description}</p>
          <ul className="shop-tags" aria-label="Tags">
            {cur.tags.map((t) => <li key={t} className="mono-label shop-tag">{t}</li>)}
          </ul>
          <dl className="shop-spec">
            <div><dt className="mono-label">Weekly downloads</dt><dd>{cur.weeklyDownloads !== undefined ? <>{cur.weeklyDownloads} / week{cur.checkedOn ? <span className="shop-checked"> · checked {cur.checkedOn}</span> : null}</> : "not counted"}</dd></div>
            <div><dt className="mono-label">Version</dt><dd>{cur.version}</dd></div>
            <div><dt className="mono-label">Price</dt><dd>Free · npm</dd></div>
          </dl>
          <div className="shop-install">
            <code className="shop-code"><span className="shop-prompt" aria-hidden="true">$ </span>{cur.install}</code>
            <button type="button" className="btn btn-sm shop-copy" onClick={() => copy(cur.install)} aria-label={`Copy ${cur.install} to the clipboard`}>Copy</button>
            <span className="shop-copied" aria-hidden="true">{copied ? <Sfx size={26}>COPIED</Sfx> : null}</span>
          </div>
          <div className="shop-sheet-btns">
            <a className="btn btn-red" href={cur.href} target="_blank" rel="noopener">Open on npm ↗</a>
          </div>
        </div>
      </div>
      <span className="sr-only" aria-live="polite">{copied ? "Copied" : ""}</span>
    </div>
  );
}
