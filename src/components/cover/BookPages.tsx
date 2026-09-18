"use client";
import { useCallback, useId, useState } from "react";
import { cn } from "@/lib/cn";
import { PAGES, Plate, type PageArtDef } from "./PageArt";

/* The leaves of the open book. Four two-faced sheets on the spine hinge: leaf k's front is the
   right page of spread k, its back the left page of spread k + 1; the last right page is the top
   of the block. One face index drives it all (0 = page 1 … FACES − 1 = the last page): a desktop
   reads by the spread, so it steps two faces at a time; a phone reads one face at a time and slides
   the book so the back of a turned leaf lands in front of you. Depth does the stacking: an unturned
   leaf sits one unit deeper per index, a turned one one unit nearer, so the pile on the left always
   prints over the inside cover and the pile on the right under the top leaf. No z-index, no canvas. */

export const LEAVES = 4;
export const FACES = LEAVES * 2 + 1;
const LAST = FACES - 1;

export function useBookPages({ open, wide }: { open: boolean; wide: boolean }) {
  const [pos, setPos] = useState(0);
  // A closed book starts at page 1 again when it is reopened (state adjusted during render, not in an effect).
  const [prevOpen, setPrevOpen] = useState(open);
  if (prevOpen !== open) { setPrevOpen(open); if (!open) setPos(0); }

  const shown = open ? pos : 0;
  const turned = Math.ceil(shown / 2);
  const slid = !wide && shown % 2 === 1;
  const canNext = open && (wide ? turned < LEAVES : shown < LAST);
  const canPrev = open && shown > 0;
  const next = useCallback(() => setPos((p) => (wide ? Math.min(LAST, (Math.ceil(p / 2) + 1) * 2) : Math.min(LAST, p + 1))), [wide]);
  const prev = useCallback(() => setPos((p) => (wide ? Math.max(0, (Math.ceil(p / 2) - 1) * 2) : Math.max(0, p - 1))), [wide]);
  const label = wide
    ? (turned === 0 ? `Page 1 / ${FACES}` : `Pages ${turned * 2}–${turned * 2 + 1} / ${FACES}`)
    : `Page ${shown + 1} / ${FACES}`;

  return { pos: shown, turned, slid, canNext, canPrev, next, prev, label, rightShown: open && (wide || shown % 2 === 0), leftShown: open && (wide || shown % 2 === 1) };
}
export type BookPagesState = ReturnType<typeof useBookPages>;

function EdgeButton({ dir, onClick }: { dir: "next" | "prev"; onClick: () => void }) {
  const next = dir === "next";
  return (
    <button
      type="button"
      className={cn("leaf-edge", next ? "leaf-edge-next" : "leaf-edge-prev")}
      aria-label={next ? "Turn to the next page" : "Turn back a page"}
      aria-keyshortcuts={next ? "ArrowRight" : "ArrowLeft"}
      onClick={(e) => { e.stopPropagation(); onClick(); }}
    />
  );
}

/** One omake page: the running head, the plate, the lettered caption. `n` is a page counter. */
function ArtPage({ n, def }: { n: number; def: PageArtDef }) {
  const uid = useId().replace(/:/g, "");
  const { Art } = def;
  return (
    <>
      <p className="art-folio mono-label"><span>Omake · bonus page</span><span className="art-folio-n">{n}</span></p>
      <div className="art-frame"><Plate uid={uid} alt={def.alt}><Art /></Plate></div>
      <p className="art-cap">{def.caption}</p>
    </>
  );
}

export function Leaves({ pages, profile, onNext, onPrev }: { pages: BookPagesState; profile: React.ReactNode; onNext: () => void; onPrev: () => void }) {
  const { turned, rightShown, leftShown, canNext, canPrev } = pages;
  return (
    <>
      {Array.from({ length: LEAVES }, (_, k) => {
        const frontShown = rightShown && turned === k;
        const backShown = leftShown && turned === k + 1;
        return (
          <div key={k} className="leaf" data-turned={k < turned ? "" : undefined} style={{ "--k": k } as React.CSSProperties}>
            <div className={cn("face leaf-front", k === 0 ? "page1" : "art")} inert={!frontShown}>
              {k === 0 ? profile : <ArtPage n={2 * k + 1} def={PAGES[2 * k - 1]} />}
              {canNext ? <EdgeButton dir="next" onClick={onNext} /> : null}
            </div>
            <div className="face leaf-back art" inert={!backShown}>
              <ArtPage n={2 * k + 2} def={PAGES[2 * k]} />
              {canPrev ? <EdgeButton dir="prev" onClick={onPrev} /> : null}
            </div>
          </div>
        );
      })}
      <div className="face last art" inert={!(rightShown && turned === LEAVES)}>
        <ArtPage n={FACES} def={PAGES[PAGES.length - 1]} />
      </div>
    </>
  );
}

/** PREV · page x / y · NEXT under the book. Real buttons, 44 px tall; the ends stay focusable but do nothing. */
export function Pager({ pages, open }: { pages: BookPagesState; open: boolean }) {
  const { canNext, canPrev, next, prev, label } = pages;
  return (
    <div className="book-pager" data-open={open ? "" : undefined}>
      <button type="button" className="btn btn-ghost btn-sm" aria-disabled={!canPrev} aria-keyshortcuts="ArrowLeft" onClick={() => { if (canPrev) prev(); }}>◀ Prev</button>
      <span className="book-pager-n mono-label" aria-live="polite">{label}</span>
      <button type="button" className="btn btn-ghost btn-sm" aria-disabled={!canNext} aria-keyshortcuts="ArrowRight" onClick={() => { if (canNext) next(); }}>Next ▶</button>
    </div>
  );
}
