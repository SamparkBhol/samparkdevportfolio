import { cn } from "@/lib/cn";

/* ============================================================================
   The one character illustration: an original ink drawing of a young engineer
   in a hoodie with over-ear headphones, three-quarter view turned to the
   reader's left, anime line style. Black ink only: 4-unit outlines, 3-unit
   details, paper fills so the figure reads as a die-cut. The same drawing is
   printed twice: a red silhouette 3 px right and 2 px down behind the ink copy,
   the way a cheap two-colour print misregisters.

   v2: the drawing is a slot. `gear` is extra SVG drawn on top in the same
   600 × 700 space (see Portrait.tsx for the six class variants); it goes into
   both copies, so the red misregistration covers the gear too. `crop` shows
   the bust for roster tiles. When many portraits share a page, mount
   <AvatarDefs/> once and pass `shared` so every copy is a <use> of one symbol
   instead of a hundred paths each.
   ========================================================================== */

const LABEL = "Ink drawing of Sampark";
export const AVATAR_VIEWBOX = "0 0 600 700";
/** Head and shoulders, with room on the right for gear held up beside the face. */
export const AVATAR_BUST = "120 64 420 496";
const SYMBOL_ID = "av-base";

/* Stroke classes (colours come from CSS so the red copy is the same markup):
   av-o outline: paper fill, ink stroke 4 · av-s solid: ink fill and stroke ·
   av-L thick line 4 · av-l line 3 · av-t thin line 2.5 · av-h paper highlight ·
   av-d ink dot · av-dp paper dot · av-r red fill (the second ink) ·
   av-rs red fill with an ink stroke · av-W very thick line 8 */
function BasePaths() {
  return (
    <>
      {/* hood, bunched behind the neck */}
      <path className="av-o" d="M 176 486 C 138 440 152 372 206 356 C 236 348 258 366 264 392 C 300 372 330 372 354 388 C 366 360 400 350 430 366 C 476 392 480 448 448 486 C 390 466 236 466 176 486 Z" />
      <path className="av-l" d="M 194 462 C 186 428 198 398 226 384" />
      <path className="av-l" d="M 430 462 C 442 430 432 400 408 386" />
      <path className="av-t" d="M 210 470 C 206 446 212 420 230 404" />
      <path className="av-t" d="M 416 468 C 422 444 418 420 402 404" />

      {/* far ear cup, peeking out behind the head */}
      <rect className="av-o" x="184" y="268" width="34" height="78" rx="15" />

      {/* neck */}
      <path className="av-o" d="M 262 372 L 258 500 C 290 522 328 522 358 500 L 352 364 Z" />
      <path className="av-l" d="M 322 400 C 328 418 331 436 333 452" />

      {/* hoodie body with the collar opening */}
      <path className="av-o" d="M 258 448 C 224 450 168 468 126 496 C 92 520 70 572 58 640 C 54 662 52 682 52 700 L 548 700 C 548 680 544 656 538 630 C 524 566 500 516 462 492 C 428 470 384 452 358 448 C 352 478 332 500 306 502 C 280 500 262 478 258 448 Z" />
      <path className="av-l" d="M 268 458 C 274 482 290 496 306 498 C 322 496 338 482 348 458" />
      <path className="av-l" d="M 272 470 C 286 490 326 490 342 470" />
      <path className="av-l" d="M 292 498 C 286 534 282 570 284 604" />
      <path className="av-l" d="M 322 498 C 328 534 332 570 330 604" />
      <path className="av-o" d="M 279 604 L 289 604 L 290 622 L 280 622 Z" />
      <path className="av-o" d="M 325 604 L 335 604 L 336 622 L 326 622 Z" />
      <path className="av-l" d="M 132 500 C 120 552 114 624 110 700" />
      <path className="av-l" d="M 460 498 C 474 550 482 624 488 700" />
      <path className="av-l" d="M 232 522 C 222 552 218 586 220 618" />
      <path className="av-l" d="M 388 530 C 396 562 398 594 394 626" />
      <path className="av-t" d="M 152 560 C 162 582 164 604 158 626" />
      <path className="av-t" d="M 446 556 C 438 580 436 602 442 624" />
      <path className="av-l" d="M 170 654 C 230 664 380 664 440 654" />
      <path className="av-t" d="M 178 668 C 234 678 376 678 432 668" strokeDasharray="7 7" />

      {/* face */}
      <path className="av-o" d="M 222 222 C 214 248 212 272 218 294 C 224 324 230 350 240 370 C 250 390 260 404 274 408 C 296 412 318 404 334 392 C 352 378 364 362 370 352 C 382 332 388 298 390 264 C 392 228 388 192 376 168 C 360 138 320 124 280 130 C 250 134 232 160 226 184 C 223 198 222 210 222 222 Z" />
      {/* cast shadow under the jaw */}
      <path className="av-l" d="M 268 418 L 282 432" />
      <path className="av-l" d="M 284 416 L 298 432" />
      <path className="av-l" d="M 300 416 L 314 432" />
      <path className="av-l" d="M 316 414 L 330 428" />
      <path className="av-l" d="M 332 408 L 344 420" />

      {/* hair: one dark mass with spiked bangs */}
      <path className="av-s" d="M 228 270 C 206 246 198 212 204 178 C 212 136 246 102 298 94 C 356 86 408 118 420 170 C 428 204 426 238 420 268 L 404 270 C 396 246 390 220 384 198 C 380 216 374 228 366 240 C 360 222 352 206 342 192 C 340 214 334 234 324 250 C 318 230 310 210 300 196 C 298 218 292 238 282 254 C 274 236 264 216 254 202 C 250 222 246 238 240 252 C 236 240 232 228 230 216 C 228 234 226 252 228 270 Z" />
      <path className="av-s" d="M 210 196 C 196 188 186 176 182 160 C 196 170 206 180 214 188 Z" />
      <path className="av-s" d="M 206 232 C 192 228 180 220 172 208 C 186 212 198 218 208 222 Z" />
      <path className="av-s" d="M 412 150 C 426 142 442 144 452 154 C 440 158 430 166 424 176 Z" />
      {/* sharp tips carried past the bangs */}
      <path className="av-t" d="M 366 240 C 363 248 360 254 358 260" />
      <path className="av-t" d="M 324 250 C 322 258 320 264 318 270" />
      <path className="av-t" d="M 282 254 C 280 262 278 268 276 274" />
      <path className="av-t" d="M 240 252 C 238 260 237 266 236 272" />
      <path className="av-t" d="M 426 214 C 438 208 446 214 452 224" />
      {/* anime sheen */}
      <path className="av-h" d="M 252 156 C 270 138 298 128 328 130" />
      <path className="av-h" d="M 246 178 C 258 164 274 156 292 154" />
      <path className="av-h" d="M 356 140 C 374 150 388 166 396 186" />

      {/* headphone band over the hair, and the near cup over the ear */}
      <path className="av-o" d="M 200 266 C 184 190 226 96 300 84 C 374 72 432 122 436 200 C 437 220 437 242 436 266 L 420 266 C 421 240 421 222 420 204 C 416 136 364 94 300 104 C 238 114 204 190 216 266 Z" />
      <path className="av-l" d="M 206 236 L 220 234" />
      <path className="av-l" d="M 422 236 L 436 234" />
      <circle className="av-d" cx="209" cy="252" r="4" />
      <circle className="av-d" cx="427" cy="252" r="4" />
      <rect className="av-o" x="392" y="254" width="58" height="86" rx="24" />
      <rect className="av-l" x="405" y="268" width="32" height="58" rx="15" />
      <circle className="av-d" cx="421" cy="297" r="4" />

      {/* features: brows, lids, irises, a nose, a calm mouth */}
      <path className="av-L" d="M 238 266 C 252 258 270 258 284 264" />
      <path className="av-L" d="M 318 264 C 336 252 364 252 380 262" />
      <path className="av-L" d="M 244 288 C 254 276 272 274 284 284" />
      <path className="av-t" d="M 244 288 L 238 286" />
      <ellipse className="av-d" cx="266" cy="293" rx="7" ry="10" />
      <circle className="av-dp" cx="263" cy="289" r="2.5" />
      <path className="av-t" d="M 250 302 C 258 306 272 306 280 300" />
      <path className="av-L" d="M 322 286 C 336 270 364 270 378 284" />
      <path className="av-t" d="M 378 284 L 386 280" />
      <ellipse className="av-d" cx="352" cy="292" rx="8" ry="11" />
      <circle className="av-dp" cx="349" cy="288" r="3" />
      <path className="av-t" d="M 328 302 C 340 308 362 308 374 300" />
      <path className="av-l" d="M 302 302 C 298 318 292 330 290 338 C 294 342 300 342 304 338" />
      <path className="av-l" d="M 288 368 C 298 374 314 374 324 366" />
      <path className="av-t" d="M 356 328 L 350 340" />
      <path className="av-t" d="M 366 330 L 360 342" />
    </>
  );
}

/** Mount once per page when portraits use `shared`: the base drawing as one <symbol>. */
export function AvatarDefs() {
  return (
    <svg aria-hidden="true" focusable="false" style={{ position: "absolute", width: 0, height: 0, overflow: "hidden" }}>
      <symbol id={SYMBOL_ID} viewBox={AVATAR_VIEWBOX}>
        <g strokeLinecap="round" strokeLinejoin="round"><BasePaths /></g>
      </symbol>
    </svg>
  );
}

function Drawing({ className, decorative, viewBox = AVATAR_VIEWBOX, label = LABEL, shared, gear }: {
  className?: string; decorative?: boolean; viewBox?: string; label?: string; shared?: boolean; gear?: React.ReactNode;
}) {
  return (
    <svg
      className={className}
      viewBox={viewBox}
      role={decorative ? undefined : "img"}
      aria-hidden={decorative ? "true" : undefined}
      aria-label={decorative ? undefined : label}
      focusable="false"
    >
      {decorative ? null : <title>{label}</title>}
      {shared ? <use href={`#${SYMBOL_ID}`} width="600" height="700" /> : <g strokeLinecap="round" strokeLinejoin="round"><BasePaths /></g>}
      {gear ? <g className="av-gear" strokeLinecap="round" strokeLinejoin="round">{gear}</g> : null}
    </svg>
  );
}

/** The die-cut: a red silhouette copy behind the ink copy, offset 3 px right and 2 px down. */
export function Avatar({ className, gear, viewBox, label, shared }: {
  className?: string; gear?: React.ReactNode; viewBox?: string; label?: string; shared?: boolean;
}) {
  const bust = viewBox === AVATAR_BUST;
  return (
    <div className={cn("avatar", bust && "avatar-bust", className)}>
      <Drawing className="avatar-copy avatar-red" decorative viewBox={viewBox} shared={shared} gear={gear} />
      <Drawing className="avatar-copy avatar-ink" viewBox={viewBox} label={label} shared={shared} gear={gear} />
    </div>
  );
}

export default Avatar;
