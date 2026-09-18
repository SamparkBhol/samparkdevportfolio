"use client";
import { memo } from "react";
import { cn } from "@/lib/cn";

/* ============================================================================
   09 / INVENTORY · one item tile, its glyph set and the five slot icons.
   Every drawing is ink-line SVG on the tile's paper; colours come from
   inventory.css classes (.g-paper .g-ink .g-yellow .g-shu .g-tone) so the
   tokens stay the only colours on the site.
   ========================================================================== */

export type Glyph =
  | "blade" | "gear"
  | "tome" | "orb"
  | "wrench" | "chart" | "funnel" | "flask"
  | "cloud" | "vault" | "atom" | "plate"
  | "phone" | "window" | "pad";

export type SlotIcon = "sword" | "book" | "belt" | "chestplate" | "shield";

/** Which drawn icon a slot tab carries, by skill group id. */
export function slotIconFor(groupId: string): SlotIcon {
  switch (groupId) {
    case "lang": return "sword";
    case "ml": return "book";
    case "data": return "belt";
    case "cloud": return "chestplate";
    default: return "shield";
  }
}

/** A glyph from the group's small set, chosen by what the item is (a tool, a method, a store, a runtime). */
export function glyphFor(groupId: string, name: string): Glyph {
  switch (groupId) {
    case "lang":
      return /API|gRPC|Microservices|System design/i.test(name) ? "gear" : "blade";
    case "ml":
      return /PyTorch|TensorFlow|Keras|Scikit|XGBoost|LightGBM|Hugging|LangChain|LangGraph|OpenCV/i.test(name) ? "tome" : "orb";
    case "data":
      if (/Matplotlib|Seaborn|Plotly|Power BI|Tableau/i.test(name)) return "chart";
      if (/Kafka|Spark|Airflow|ETL|warehous/i.test(name)) return "funnel";
      if (/Pandas|NumPy/i.test(name)) return "wrench";
      return "flask";
    case "cloud":
      if (/AWS|GCP|Cloud|Terraform/i.test(name)) return "cloud";
      if (/Postgre|MySQL|Mongo|Redis|ClickHouse|Elastic|Pinecone|Chroma|FAISS|RabbitMQ/i.test(name)) return "vault";
      if (/Qiskit|QAOA/i.test(name)) return "atom";
      return "plate";
    default:
      if (/Godot|Unity|Game/i.test(name)) return "pad";
      if (/WebGPU|Transformers\.js|Next\.js/i.test(name)) return "window";
      return "phone";
  }
}

const GLYPHS: Record<Glyph, React.ReactNode> = {
  blade: (
    <>
      <path className="g-paper" d="M14 2 L18 16 H10 Z" />
      <path className="g-line" d="M14 5 V14" />
      <rect className="g-yellow" x="8" y="16" width="12" height="3" />
      <rect className="g-ink" x="12" y="19" width="4" height="6" />
      <circle className="g-shu" cx="14" cy="26" r="1.8" />
    </>
  ),
  gear: (
    <>
      <path className="g-teeth" d="M21.5 14H24.5M19.3 19.3L21.4 21.4M14 21.5V24.5M8.7 19.3L6.6 21.4M6.5 14H3.5M8.7 8.7L6.6 6.6M14 6.5V3.5M19.3 8.7L21.4 6.6" />
      <circle className="g-paper" cx="14" cy="14" r="6.5" />
      <circle className="g-ink" cx="14" cy="14" r="2" />
    </>
  ),
  tome: (
    <>
      <rect className="g-paper" x="5" y="4" width="18" height="20" rx="1" />
      <path className="g-line" d="M9 4V24M12.5 11H19M12.5 15H19M12.5 19H17" />
      <rect className="g-yellow" x="17" y="4" width="3.5" height="7" />
    </>
  ),
  orb: (
    <>
      <circle className="g-paper" cx="14" cy="12" r="8" />
      <circle className="g-yellow" cx="14" cy="12" r="3" />
      <path className="g-line" d="M9.5 8.5Q11 6.5 13.5 6" />
      <path className="g-ink" d="M9.5 24.5L11 20.5H17L18.5 24.5Z" />
      <path className="g-line" d="M7 25H21" />
    </>
  ),
  wrench: (
    <g transform="rotate(45 14 14)">
      <circle className="g-paper" cx="14" cy="8" r="5.5" />
      <rect className="g-ink" x="12.5" y="1.5" width="3" height="6" />
      <rect className="g-paper" x="12" y="12" width="4" height="14" rx="1.5" />
    </g>
  ),
  chart: (
    <>
      <path className="g-line" d="M5 4V23H24" />
      <rect className="g-yellow" x="8" y="14" width="4" height="9" />
      <rect className="g-paper" x="14" y="8" width="4" height="15" />
      <rect className="g-ink" x="20" y="12" width="3.5" height="11" />
    </>
  ),
  funnel: (
    <>
      <path className="g-paper" d="M4 4H24L17 13V23L11 25.5V13Z" />
      <path className="g-line" d="M11 13H17" />
      <rect className="g-yellow" x="11.5" y="16" width="5" height="3" />
    </>
  ),
  flask: (
    <>
      <path className="g-paper" d="M11 3H17V10L23 22Q24 25 21 25H7Q4 25 5 22L11 10Z" />
      <path className="g-yellow" d="M8.8 18.5H19.2L21.5 23H6.5Z" />
      <path className="g-line" d="M9.5 3H18.5" />
    </>
  ),
  cloud: (
    <>
      <path className="g-paper" d="M8 22H21A4.6 4.6 0 0 0 21.5 12.8A6.5 6.5 0 0 0 9 11.4A5.3 5.3 0 0 0 8 22Z" />
      <path className="g-line" d="M9 17.5H19" />
    </>
  ),
  vault: (
    <>
      <path className="g-paper" d="M5 7V21A9 3.5 0 0 0 23 21V7" />
      <path className="g-line" d="M5 14A9 3.5 0 0 0 23 14" />
      <ellipse className="g-yellow" cx="14" cy="7" rx="9" ry="3.5" />
    </>
  ),
  atom: (
    <>
      <ellipse className="g-none" cx="14" cy="14" rx="11" ry="4.5" />
      <ellipse className="g-none" cx="14" cy="14" rx="11" ry="4.5" transform="rotate(60 14 14)" />
      <ellipse className="g-none" cx="14" cy="14" rx="11" ry="4.5" transform="rotate(120 14 14)" />
      <circle className="g-shu" cx="14" cy="14" r="2.6" />
    </>
  ),
  plate: (
    <>
      <path className="g-paper" d="M6 4L14 7.5L22 4L24.5 12L21 25H7L3.5 12Z" />
      <path className="g-line" d="M14 7.5V25" />
      <path className="g-yellow" d="M9.5 12H12.5V16H9.5Z" />
    </>
  ),
  phone: (
    <>
      <rect className="g-paper" x="8" y="2" width="12" height="24" rx="2" />
      <rect className="g-yellow" x="10.5" y="6" width="7" height="12" />
      <path className="g-line" d="M12 23.5H16" />
    </>
  ),
  window: (
    <>
      <rect className="g-paper" x="3" y="5" width="22" height="18" rx="1" />
      <path className="g-ink" d="M3 5H25V10H3Z" />
      <circle className="g-paperfill" cx="6.5" cy="7.5" r="1" />
      <circle className="g-paperfill" cx="9.5" cy="7.5" r="1" />
      <circle className="g-yellowfill" cx="12.5" cy="7.5" r="1" />
      <path className="g-line" d="M7 15H16M7 19H13" />
    </>
  ),
  pad: (
    <>
      <path className="g-paper" d="M7.5 9H20.5A5 5 0 0 1 25 16L23.5 21.5A3 3 0 0 1 18.5 22.5L16.5 19.5H11.5L9.5 22.5A3 3 0 0 1 4.5 21.5L3 16A5 5 0 0 1 7.5 9Z" />
      <path className="g-line" d="M9 12V17M6.5 14.5H11.5" />
      <circle className="g-shu" cx="19" cy="13" r="1.5" />
      <circle className="g-yellow" cx="21.8" cy="15.6" r="1.5" />
    </>
  ),
};

export function ItemGlyph({ glyph, size = 28, className }: { glyph: Glyph; size?: number; className?: string }) {
  return (
    <svg className={cn("inv-g", className)} viewBox="0 0 28 28" width={size} height={size} aria-hidden="true" focusable="false">
      {GLYPHS[glyph]}
    </svg>
  );
}

const SLOTS: Record<SlotIcon, React.ReactNode> = {
  sword: (
    <>
      <path className="g-paper" d="M12 2L15.2 13H8.8Z" />
      <rect className="g-yellow" x="7" y="13" width="10" height="2.6" />
      <rect className="g-ink" x="10.6" y="15.6" width="2.8" height="4.6" />
      <circle className="g-shu" cx="12" cy="21.8" r="1.4" />
    </>
  ),
  book: (
    <>
      <rect className="g-paper" x="4" y="3" width="16" height="18" rx="1" />
      <path className="g-line" d="M8 3V21M11 9H17M11 13H17" />
      <rect className="g-yellow" x="15" y="3" width="3" height="6" />
    </>
  ),
  belt: (
    <>
      <rect className="g-ink" x="2" y="9" width="20" height="6" rx="1" />
      <rect className="g-yellow" x="9" y="7" width="6.5" height="10" rx="1" />
      <circle className="g-paperfill" cx="5" cy="12" r="0.9" />
      <circle className="g-paperfill" cx="18.5" cy="12" r="0.9" />
    </>
  ),
  chestplate: (
    <>
      <path className="g-paper" d="M5 4L12 7L19 4L21.5 10L18.5 21H5.5L2.5 10Z" />
      <path className="g-line" d="M12 7V21" />
    </>
  ),
  shield: (
    <>
      <path className="g-paper" d="M12 2L21 5V11C21 16.5 17 20.5 12 22.5C7 20.5 3 16.5 3 11V5Z" />
      <path className="g-yellow" d="M12 6L17 7.8V11C17 14.5 15 17.3 12 19C9 17.3 7 14.5 7 11V7.8Z" />
    </>
  ),
};

export function SlotGlyph({ icon, size = 20, className }: { icon: SlotIcon; size?: number; className?: string }) {
  return (
    <svg className={cn("inv-g", className)} viewBox="0 0 24 24" width={size} height={size} aria-hidden="true" focusable="false">
      {SLOTS[icon]}
    </svg>
  );
}

/** A hand count: four strokes and a bar through them, one group per five. */
export function Tally({ n, className }: { n: number; className?: string }) {
  if (n <= 0) return null;
  const groups = Math.ceil(n / 5);
  const w = groups * 16;
  const marks: React.ReactNode[] = [];
  for (let i = 0; i < n; i++) {
    const g = Math.floor(i / 5), p = i % 5, x0 = g * 16;
    marks.push(p < 4
      ? <line key={i} x1={x0 + 1.5 + p * 3.4} y1="1" x2={x0 + 1.5 + p * 3.4} y2="11" />
      : <line key={i} x1={x0} y1="10.5" x2={x0 + 13} y2="1.5" />);
  }
  return (
    <svg className={cn("inv-tally", className)} viewBox={`0 0 ${w} 12`} width={w} height={12} aria-hidden="true" focusable="false">
      {marks}
    </svg>
  );
}

export interface SkillTileProps {
  name: string;
  slot: string;
  glyph: Glyph;
  /** Places on this page where the item was used. */
  count: number;
  equipped: boolean;
  /** Roving tabindex: only one tile in the grid is reachable by Tab. */
  focusable: boolean;
  /** Printed when the grid mixes slots (search results). */
  showSlot?: boolean;
  onPick: (name: string) => void;
  onPreview: (name: string | null) => void;
}

export const SkillTile = memo(function SkillTile({ tileKey, name, slot, glyph, count, equipped, focusable, showSlot, onPick, onPreview }: SkillTileProps & { tileKey: string }) {
  const places = count === 1 ? "one place" : `${count} places`;
  return (
    <button
      type="button"
      className={cn("inv-tile", equipped && "is-eq", count === 0 && "is-bag")}
      data-key={tileKey}
      tabIndex={focusable ? 0 : -1}
      aria-pressed={equipped}
      aria-label={`${name}, ${slot.toLowerCase()}${count ? `, used at ${places} on this page` : ", in the bag"}${equipped ? ", equipped" : ""}`}
      onClick={() => onPick(tileKey)}
      onPointerEnter={(e) => { if (e.pointerType === "mouse") onPreview(tileKey); }}
      onFocus={() => onPreview(tileKey)}
    >
      <ItemGlyph glyph={glyph} />
      <span className="inv-tile-name">{name}</span>
      {showSlot ? <span className="inv-tile-slot">{slot}</span> : null}
      <span className="inv-tile-foot">
        <Tally n={count} />
      </span>
      {equipped ? <span className="inv-tile-eq" aria-hidden="true">Equipped</span> : null}
    </button>
  );
});
