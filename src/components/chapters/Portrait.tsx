import { useId } from "react";
import { resume } from "@/content/resume";
import type { ClassId } from "@/content/types";
import { cn } from "@/lib/cn";

/* ============================================================================
   Four characters, one cast. Each class is its own full drawing in a 480 × 640
   space (3:4): a different silhouette, pose, outfit and props, but the same
   head, the same line weights and the same five inks, so they read as one
   person on four different days. Every drawing is printed twice: a solid red
   copy three units right and two down, then the ink copy on top, the way a
   cheap two-colour print misregisters. Shadows are screentone (an SVG dot
   pattern); everything else is a flat cel fill from the tokens.

   Stroke classes live in select.css and read CSS variables, so the red copy
   is the same markup with every variable set to shu:
     ch-o   outline · paper fill, ink 4        ch-c   cel fill, ink 4
     ch-y   yellow fill, ink 4                 ch-s   solid ink, ink 4
     ch-yf  yellow fill, no stroke             ch-cs  cel-shadow fill, no stroke
     ch-cso cel-shadow fill, ink 4             ch-tn  screentone fill, no stroke
     ch-tno screentone fill, ink 4             ch-tx  open dots on nothing (the red copy skips it)
     ch-L 4 · ch-l 3 · ch-t 2.5 · ch-W 8
     ch-h   paper highlight stroke 3           ch-d ink dot · ch-dp paper dot
     ch-r   red fill (the second ink, both copies) · ch-rs red fill, ink 4 · ch-rl red line 4
   ========================================================================== */

export const PORTRAIT_VIEWBOX = "0 0 480 640";

export const classById = (id: ClassId) => resume.classes.find((c) => c.id === id)!;

/* ---------- Helpers ---------- */

const f = (n: number) => (Math.round(n * 10) / 10).toString();

/** A tapered tube with round caps between two points: an arm, a leg, a rod. */
function limb(ax: number, ay: number, bx: number, by: number, wa: number, wb = wa): string {
  const dx = bx - ax, dy = by - ay, len = Math.hypot(dx, dy) || 1;
  const nx = -dy / len, ny = dx / len;
  return [
    `M ${f(ax + nx * wa)} ${f(ay + ny * wa)}`,
    `L ${f(bx + nx * wb)} ${f(by + ny * wb)}`,
    `A ${wb} ${wb} 0 0 0 ${f(bx - nx * wb)} ${f(by - ny * wb)}`,
    `L ${f(ax - nx * wa)} ${f(ay - ny * wa)}`,
    `A ${wa} ${wa} 0 0 0 ${f(ax + nx * wa)} ${f(ay + ny * wa)} Z`,
  ].join(" ");
}

type Look = "calm" | "grin" | "focus" | "oh";

/** The one head: spiked bangs, big calm eyes, the jaw in screentone. Local space ≈ 130 wide, chin at +68, crown at −84. */
function Head({ cx, cy, tilt = 0, look = "calm", scale = 1, children }: { cx: number; cy: number; tilt?: number; look?: Look; scale?: number; children?: React.ReactNode }) {
  return (
    <g transform={`translate(${cx} ${cy}) rotate(${tilt}) scale(${scale})`}>
      {/* neck, under everything */}
      <path className="ch-o" d="M -20 52 L -23 100 C -8 110 12 110 23 100 L 20 52 Z" />
      <path className="ch-tn" d="M -19 56 C -8 70 8 70 19 56 L 18 74 C 6 80 -6 80 -18 74 Z" />
      {/* face */}
      <path className="ch-o" d="M -50 -28 C -54 4 -46 36 -28 54 C -14 68 8 70 24 60 C 42 48 52 22 52 -10 C 52 -44 32 -62 0 -62 C -30 -62 -48 -50 -50 -28 Z" />
      <path className="ch-tn" d="M -46 18 C -42 40 -28 56 -8 64 C -24 62 -40 48 -48 26 Z" />
      {/* ear */}
      <path className="ch-o" d="M 48 -8 C 62 -16 68 6 54 16 L 50 4 Z" />
      <path className="ch-t" d="M 56 -4 C 60 -2 60 6 56 8" />
      {/* hair: one mass with spiked bangs, two side flicks, one on top */}
      <path className="ch-s" d="M -60 -26 C -70 -56 -42 -84 0 -84 C 42 -86 70 -58 62 -22 L 54 -30 L 48 -8 L 40 -34 L 30 -10 L 18 -36 L 8 -12 L -4 -38 L -14 -12 L -26 -36 L -36 -12 L -46 -34 L -60 -26 Z" />
      <path className="ch-s" d="M -60 -40 L -86 -50 L -60 -26 Z" />
      <path className="ch-s" d="M 60 -46 L 86 -60 L 64 -30 Z" />
      <path className="ch-s" d="M 4 -84 L 12 -102 L 22 -82 Z" />
      <path className="ch-h" d="M -30 -64 C -14 -74 8 -76 26 -70" />
      <path className="ch-h" d="M -42 -50 C -34 -58 -22 -63 -8 -64" />
      {/* brows */}
      <path className="ch-L" d={look === "focus" ? "M -42 -20 C -34 -30 -18 -30 -10 -22" : "M -42 -24 C -34 -32 -18 -32 -10 -26"} />
      <path className="ch-L" d={look === "focus" ? "M 10 -22 C 18 -30 34 -30 42 -20" : "M 10 -26 C 18 -34 34 -34 42 -26"} />
      {/* eyes */}
      <path className="ch-L" d="M -38 -2 C -32 -12 -16 -12 -10 -4" />
      <ellipse className="ch-d" cx="-24" cy="2" rx="6.5" ry="8.5" />
      <circle className="ch-dp" cx="-26.5" cy="-1" r="2.5" />
      <path className="ch-t" d="M -36 8 C -30 12 -18 12 -12 8" />
      <path className="ch-L" d="M 12 -4 C 18 -14 34 -14 40 -2" />
      <ellipse className="ch-d" cx="26" cy="2" rx="7" ry="9" />
      <circle className="ch-dp" cx="23.5" cy="-1.5" r="2.5" />
      <path className="ch-t" d="M 14 8 C 20 12 32 12 38 8" />
      {/* nose, cheek marks */}
      <path className="ch-l" d="M 2 12 C 0 20 -4 26 -2 30" />
      <path className="ch-t" d="M 34 26 L 30 34 M 42 28 L 38 36" />
      {/* mouth */}
      {look === "calm" ? <path className="ch-l" d="M -12 44 C -4 50 8 50 16 44" /> : null}
      {look === "focus" ? <path className="ch-l" d="M -10 46 L 14 45" /> : null}
      {look === "grin" ? <path className="ch-o" d="M -18 40 C -8 56 14 56 22 40 Z" /> : null}
      {look === "grin" ? <path className="ch-t" d="M -12 42 L 16 42" /> : null}
      {look === "oh" ? <ellipse className="ch-s" cx="2" cy="46" rx="5" ry="6.5" /> : null}
      {/* anything worn on the head: goggles, glasses, a headset, a pencil */}
      {children}
    </g>
  );
}

/** A pixel sprite: rows of `#` (colour), `o` (paper) and `.` (empty). The ink outline is the same grid grown by three units. */
function Pix({ x, y, s, rows, fill }: { x: number; y: number; s: number; rows: string[]; fill: "ch-c" | "ch-y" | "ch-r" }) {
  const cells: { r: number; c: number; ch: string }[] = [];
  rows.forEach((row, r) => [...row].forEach((ch, c) => { if (ch !== ".") cells.push({ r, c, ch }); }));
  return (
    <g>
      {cells.map(({ r, c }) => <rect key={`o${r}-${c}`} className="ch-d" x={x + c * s - 3} y={y + r * s - 3} width={s + 6} height={s + 6} />)}
      {cells.map(({ r, c, ch }) => <rect key={`f${r}-${c}`} className={cn("ch-px", ch === "o" ? "ch-dp" : fill)} x={x + c * s} y={y + r * s} width={s} height={s} />)}
    </g>
  );
}

/** An atom: a nucleus, two tilted orbits and one red electron. */
function Atom({ cx, cy, s = 1, rot = 0 }: { cx: number; cy: number; s?: number; rot?: number }) {
  return (
    <g transform={`translate(${cx} ${cy}) rotate(${rot}) scale(${s})`}>
      <ellipse className="ch-t" cx="0" cy="0" rx="26" ry="9" transform="rotate(-30)" />
      <ellipse className="ch-t" cx="0" cy="0" rx="26" ry="9" transform="rotate(30)" />
      <ellipse className="ch-t" cx="0" cy="0" rx="26" ry="9" transform="rotate(90)" />
      <circle className="ch-d" cx="0" cy="0" r="4.5" />
      <circle className="ch-r" cx="22" cy="-13" r="4" />
    </g>
  );
}

/* ---------- SOFTWARE · at the desk, two monitors, headset, one hand on the keys ---------- */
function SoftwareFigure() {
  const keys: React.ReactNode[] = [];
  const rows: [number, number, number][] = [[452, 158, 13], [461, 163, 13], [470, 168, 13]];
  rows.forEach(([y, x0, n], r) => {
    for (let i = 0; i < n; i++) {
      const x = x0 + i * 12.6 + r * 1.5;
      keys.push(<rect key={`${r}-${i}`} className={r === 0 && i === 0 ? "ch-r" : "ch-d"} x={x} y={y} width="9" height="6" rx="1" />);
    }
  });
  return (
    <>
      {/* under the desk: two legs, a tower with one lit LED, the knees */}
      <path className="ch-tno" d="M 186 560 L 232 560 L 236 640 L 176 640 Z" />
      <path className="ch-tno" d="M 250 560 L 296 560 L 306 640 L 246 640 Z" />
      <path className="ch-l" d="M 200 578 C 204 600 204 620 202 640 M 280 578 C 278 600 278 620 282 640" />
      <rect className="ch-o" x="22" y="560" width="16" height="80" />
      <rect className="ch-o" x="442" y="560" width="16" height="80" />
      <rect className="ch-o" x="316" y="566" width="68" height="74" rx="4" />
      <path className="ch-t" d="M 326 580 L 374 580 M 326 590 L 374 590" />
      <rect className="ch-tn" x="326" y="604" width="48" height="24" />
      <circle className="ch-r" cx="372" cy="626" r="4" />
      <path className="ch-t" d="M 384 600 C 402 592 414 570 416 540" />
      <g transform="translate(0 46)">
      {/* the log window, lit */}
      <rect className="ch-yf" x="16" y="34" width="190" height="130" rx="14" />
      <path className="ch-t" d="M 8 22 L 18 32 M 214 24 L 204 34 M 6 176 L 16 166 M 216 176 L 206 166" />
      <rect className="ch-o" x="30" y="46" width="162" height="106" rx="6" />
      <rect className="ch-d" x="32" y="48" width="158" height="18" />
      <circle className="ch-dp" cx="44" cy="57" r="3.5" /><circle className="ch-dp" cx="56" cy="57" r="3.5" /><circle className="ch-dp" cx="68" cy="57" r="3.5" />
      <rect className="ch-d" x="42" y="76" width="86" height="6" rx="3" />
      <rect className="ch-d" x="42" y="90" width="118" height="6" rx="3" />
      <rect className="ch-d" x="42" y="104" width="60" height="6" rx="3" />
      <rect className="ch-r" x="42" y="118" width="98" height="6" rx="3" />
      <rect className="ch-d" x="42" y="132" width="40" height="6" rx="3" />
      <rect className="ch-d" x="88" y="130" width="8" height="10" />

      {/* chair back */}
      <rect className="ch-c" x="156" y="246" width="168" height="220" rx="26" />
      <path className="ch-cs" d="M 170 300 C 172 360 176 420 180 462 L 160 462 C 158 420 160 360 164 300 Z" />

      {/* two monitors on the desk */}
      <g transform="rotate(-7 108 300)">
        <rect className="ch-o" x="106" y="352" width="14" height="40" />
        <rect className="ch-o" x="30" y="232" width="156" height="122" rx="5" />
        <rect className="ch-d" x="38" y="240" width="140" height="106" />
        <rect className="ch-dp" x="48" y="252" width="70" height="5" /><rect className="ch-dp" x="56" y="264" width="98" height="5" /><rect className="ch-dp" x="56" y="276" width="52" height="5" />
        <rect className="ch-yf" x="48" y="288" width="112" height="5" /><rect className="ch-dp" x="56" y="300" width="80" height="5" /><rect className="ch-dp" x="48" y="312" width="40" height="5" />
        <rect className="ch-dp" x="48" y="330" width="12" height="7" />
      </g>
      <g transform="rotate(7 372 300)">
        <rect className="ch-o" x="364" y="352" width="14" height="40" />
        <rect className="ch-o" x="294" y="232" width="156" height="122" rx="5" />
        <rect className="ch-d" x="302" y="240" width="140" height="106" />
        <path className="ch-h" d="M 314 330 L 322 300 L 334 316 L 348 268 L 362 296 L 378 260 L 392 290 L 410 254 L 428 284" />
        <rect className="ch-r" x="404" y="250" width="26" height="10" rx="2" />
        <path className="ch-h" d="M 312 332 L 432 332" />
      </g>
      <ellipse className="ch-o" cx="112" cy="396" rx="42" ry="8" />
      <ellipse className="ch-o" cx="368" cy="396" rx="42" ry="8" />

      {/* torso in the hoodie */}
      <path className="ch-c" d="M 150 336 C 170 316 196 306 214 304 C 226 326 254 326 266 304 C 284 306 310 316 330 336 C 344 350 350 390 352 442 L 128 442 C 130 390 136 350 150 336 Z" />
      <path className="ch-cs" d="M 312 334 C 334 354 344 394 346 440 L 328 440 C 326 398 318 362 302 342 Z" />
      <path className="ch-cs" d="M 216 306 C 226 326 254 326 264 306 C 258 320 250 330 240 332 C 230 330 222 320 216 306 Z" />
      <path className="ch-l" d="M 232 324 L 226 372 M 248 324 L 254 372" />
      <rect className="ch-d" x="222" y="370" width="8" height="8" rx="1" /><rect className="ch-d" x="250" y="370" width="8" height="8" rx="1" />

      {/* the head with the headset */}
      <Head cx={240} cy={206} tilt={-4} look="focus">
        <path className="ch-o" d="M -70 -6 C -76 -74 -34 -104 0 -104 C 34 -104 76 -74 70 -6 L 58 -6 C 62 -66 30 -92 0 -92 C -30 -92 -62 -66 -58 -6 Z" />
        <rect className="ch-o" x="-78" y="-18" width="26" height="46" rx="12" />
        <rect className="ch-o" x="52" y="-20" width="26" height="46" rx="12" />
        <rect className="ch-tn" x="56" y="-14" width="18" height="34" rx="9" />
        <circle className="ch-r" cx="65" cy="20" r="3.5" />
        <path className="ch-l" d="M -66 26 C -70 54 -46 66 -14 66" />
        <ellipse className="ch-s" cx="-10" cy="66" rx="9" ry="6" />
      </Head>

      {/* desk top, keyboard, mug */}
      <path className="ch-o" d="M 40 428 L 440 428 L 476 486 L 4 486 Z" />
      <path className="ch-tno" d="M 4 486 L 476 486 L 476 514 L 4 514 Z" />
      <path className="ch-o" d="M 150 444 L 322 444 L 336 478 L 138 478 Z" />
      {keys}
      <rect className="ch-y" x="398" y="412" width="44" height="48" rx="7" />
      <ellipse className="ch-o" cx="420" cy="412" rx="22" ry="6" />
      <path className="ch-o" d="M 442 422 C 464 416 466 452 442 448 L 442 438 C 454 440 454 430 442 432 Z" />
      <path className="ch-t" d="M 410 400 C 404 390 414 380 408 368 M 428 400 C 422 390 432 380 426 368" />

      {/* arms on the desk: sleeves, a hand on the keys, a hand round the mug */}
      <path className="ch-c" d={limb(154, 342, 96, 452, 21, 18)} />
      <path className="ch-c" d={limb(96, 452, 176, 462, 18, 15)} />
      <path className="ch-o" d="M 172 450 C 176 434 214 432 222 448 C 220 462 190 468 174 462 Z" />
      <path className="ch-t" d="M 190 436 L 192 448 M 202 434 L 204 448 M 213 436 L 213 448" />
      <path className="ch-c" d={limb(326, 342, 392, 470, 21, 18)} />
      <path className="ch-c" d={limb(392, 470, 342, 456, 18, 15)} />
      <path className="ch-o" d="M 300 452 C 306 436 344 434 350 450 C 350 464 326 470 308 466 C 298 462 296 458 300 452 Z" />
      <path className="ch-t" d="M 314 440 L 314 454 M 326 438 L 326 454 M 338 440 L 338 454" />
      </g>
    </>
  );
}

/* ---------- ML · lab coat, sleeves rolled, the glowing orb, a tensor cube, goggles up ---------- */
function MlFigure() {
  const nodes: [number, number][] = [[176, 336], [176, 356], [176, 376], [200, 328], [200, 350], [200, 372], [224, 342], [224, 364]];
  const edges: [number, number][] = [[0, 3], [0, 4], [1, 3], [1, 4], [1, 5], [2, 4], [2, 5], [3, 6], [4, 6], [4, 7], [5, 7], [3, 7]];
  return (
    <>
      {/* the tensor cube, floating top right */}
      <g transform="translate(392 112)">
        <path className="ch-t" d="M -30 66 L -18 72 M 30 66 L 18 72 M 0 76 L 0 86" />
        <path className="ch-c" d="M 0 -44 L 40 -22 L 0 0 L -40 -22 Z" />
        <path className="ch-tno" d="M -40 -22 L 0 0 L 0 44 L -40 22 Z" />
        <path className="ch-o" d="M 40 -22 L 0 0 L 0 44 L 40 22 Z" />
        <path className="ch-t" d="M -13 -37 L 27 -15 M -27 -29 L 13 -7 M -20 -11 L -20 33 M 20 -11 L 20 33 M 13 -7 L 13 37 M 27 -15 L 27 29" />
        <path className="ch-t" d="M -40 -8 L 0 14 M -40 8 L 0 30 M 0 14 L 40 -8 M 0 30 L 40 8" />
        <path className="ch-yf" d="M 54 -50 L 58 -40 L 68 -36 L 58 -32 L 54 -22 L 50 -32 L 40 -36 L 50 -40 Z" />
      </g>

      {/* coat collar behind the neck */}
      <path className="ch-o" d="M 190 244 C 206 218 258 218 274 244 L 262 262 L 202 262 Z" />

      {/* t-shirt in the V, then the coat */}
      <path className="ch-c" d="M 178 258 L 286 258 L 300 640 L 164 640 Z" />
      <path className="ch-cs" d="M 210 256 C 226 300 234 360 234 430 L 232 430 C 226 364 214 300 200 262 Z" />
      <path className="ch-o" d="M 210 250 C 176 256 146 270 132 296 C 116 330 106 430 102 520 L 100 640 L 232 640 L 232 430 Z" />
      <path className="ch-o" d="M 254 250 C 288 256 318 270 332 296 C 348 330 358 430 362 520 L 364 640 L 232 640 L 232 430 Z" />
      <path className="ch-tn" d="M 102 520 C 106 430 116 330 132 296 L 146 302 C 130 340 122 430 118 520 L 116 640 L 100 640 Z" />
      <path className="ch-o" d="M 210 250 C 220 300 226 360 232 430 L 176 336 C 190 300 200 272 210 250 Z" />
      <path className="ch-o" d="M 254 250 C 244 300 238 360 232 430 L 288 336 C 274 300 264 272 254 250 Z" />
      <circle className="ch-d" cx="232" cy="470" r="4.5" /><circle className="ch-d" cx="232" cy="540" r="4.5" /><circle className="ch-d" cx="232" cy="610" r="4.5" />
      <rect className="ch-o" x="288" y="384" width="46" height="46" rx="3" />
      <path className="ch-t" d="M 288 394 L 334 394" />
      <g transform="rotate(-8 306 372)">
        <rect className="ch-y" x="300" y="352" width="10" height="40" rx="3" />
        <circle className="ch-r" cx="305" cy="352" r="4.5" />
      </g>

      {/* the head, goggles pushed up */}
      <Head cx={232} cy={150} tilt={5} look="grin">
        <path className="ch-y" d="M -64 -44 C -40 -64 40 -64 64 -44 L 64 -32 C 40 -52 -40 -52 -64 -32 Z" />
        <rect className="ch-o" x="-42" y="-64" width="38" height="26" rx="9" />
        <rect className="ch-o" x="4" y="-66" width="38" height="26" rx="9" />
        <path className="ch-h" d="M -34 -58 C -30 -61 -24 -61 -20 -58 M 12 -60 C 16 -63 22 -63 26 -60" />
        <path className="ch-l" d="M -4 -52 L 4 -52" />
      </Head>

      {/* right arm points at the cube: sleeve, rolled cuff, forearm, fist, one finger */}
      <path className="ch-o" d={limb(318, 284, 356, 350, 24, 22)} />
      <ellipse className="ch-o" cx="356" cy="350" rx="26" ry="16" transform="rotate(30 356 350)" />
      <path className="ch-o" d={limb(360, 346, 372, 268, 15, 13)} />
      <ellipse className="ch-o" cx="374" cy="252" rx="17" ry="15" />
      <path className="ch-o" d={limb(376, 246, 380, 208, 6, 5)} />
      <path className="ch-t" d="M 362 256 L 386 254" />

      {/* left arm cups the orb */}
      <path className="ch-o" d={limb(150, 284, 118, 372, 24, 22)} />
      <ellipse className="ch-o" cx="118" cy="372" rx="26" ry="16" transform="rotate(-24 118 372)" />
      <path className="ch-o" d={limb(122, 376, 172, 404, 15, 13)} />

      {/* the orb: a halo, rays, the sphere, a tiny network inside */}
      <circle className="ch-yf" cx="196" cy="350" r="60" />
      <path className="ch-l" d="M 196 272 L 196 258 M 196 428 L 196 442 M 118 350 L 104 350 M 274 350 L 288 350 M 141 295 L 131 285 M 251 295 L 261 285 M 141 405 L 131 415 M 251 405 L 261 415" />
      <circle className="ch-y" cx="196" cy="350" r="46" />
      {edges.map(([a, b]) => <path key={`${a}-${b}`} className="ch-t" d={`M ${nodes[a][0]} ${nodes[a][1]} L ${nodes[b][0]} ${nodes[b][1]}`} />)}
      {nodes.map(([x, y], i) => <circle key={i} className={i === 4 ? "ch-r" : "ch-d"} cx={x} cy={y} r="4.5" />)}
      <path className="ch-h" d="M 166 326 C 172 314 184 308 196 308" />
      <path className="ch-o" d="M 160 404 C 168 388 214 386 226 402 C 228 418 206 430 184 428 C 168 426 156 418 160 404 Z" />
      <path className="ch-t" d="M 176 392 L 178 406 M 192 388 L 194 404 M 208 390 L 208 404" />
    </>
  );
}

/* ---------- RESEARCH · round glasses, a scroll unrolled to the floor, a pencil behind the ear, atoms, a stack of papers ---------- */
function ResearchFigure() {
  const sheets = Array.from({ length: 17 }, (_, i) => i);
  return (
    <>
      {/* atoms and one qubit orbiting */}
      <Atom cx={74} cy={116} s={1.15} rot={12} />
      <Atom cx={412} cy={96} s={0.9} rot={-20} />
      <Atom cx={436} cy={296} s={0.75} rot={30} />
      <g transform="translate(398 200)">
        <circle className="ch-o" cx="0" cy="0" r="18" />
        <path className="ch-t" d="M -18 0 L 18 0 M 0 -18 L 0 18" />
        <path className="ch-l" d="M 0 0 L 12 -11" />
        <circle className="ch-r" cx="12" cy="-11" r="3.5" />
      </g>

      {/* the stack of papers, bottom right */}
      {sheets.map((i) => (
        <rect key={i} className="ch-o" x={334 + ((i * 7) % 3) * 3 - 3} y={640 - (i + 1) * 12} width="124" height="12" />
      ))}
      <rect className="ch-o" x="334" y="424" width="124" height="14" />
      <path className="ch-t" d="M 348 430 L 400 430 M 348 434 L 420 434" />
      <circle className="ch-r" cx="440" cy="432" r="5" />

      {/* shirt collar, then the vest and the trousers */}
      <path className="ch-o" d="M 250 244 L 232 232 L 212 268 L 250 292 L 288 268 L 268 232 Z" />
      <path className="ch-c" d="M 250 250 C 214 252 186 264 176 286 C 166 326 164 426 166 526 L 334 526 C 336 426 334 326 324 286 C 314 264 286 252 250 250 Z" />
      <path className="ch-o" d="M 226 248 L 250 300 L 274 248 Z" />
      <path className="ch-cs" d="M 306 270 C 322 296 330 380 332 520 L 318 520 C 316 380 310 300 296 276 Z" />
      <path className="ch-l" d="M 168 508 L 332 508" />
      <path className="ch-tno" d="M 166 526 L 334 526 L 340 640 L 160 640 Z" />
      <path className="ch-l" d="M 250 526 L 248 640" />

      {/* the head: round glasses, a pencil behind the ear */}
      <Head cx={250} cy={160} tilt={-4} look="oh">
        <circle className="ch-l" cx="-24" cy="2" r="18" />
        <circle className="ch-l" cx="26" cy="2" r="18" />
        <path className="ch-l" d="M -6 0 L 8 0 M 44 -2 L 54 -6" />
        <path className="ch-h" d="M -36 -8 C -34 -12 -30 -14 -26 -14 M 14 -8 C 16 -12 20 -14 24 -14" />
        <g transform="translate(60 -14) rotate(-34)">
          <rect className="ch-y" x="-5" y="-22" width="10" height="44" rx="2" />
          <path className="ch-o" d="M -5 22 L 0 34 L 5 22 Z" />
          <rect className="ch-r" x="-5" y="-30" width="10" height="8" rx="2" />
        </g>
      </Head>

      {/* right arm rests on the stack */}
      <path className="ch-o" d={limb(320, 282, 352, 356, 20, 18)} />
      <path className="ch-o" d={limb(352, 356, 386, 416, 18, 15)} />
      <path className="ch-o" d="M 362 420 C 370 406 408 406 416 420 C 414 432 394 438 374 434 C 366 432 360 428 362 420 Z" />
      <path className="ch-t" d="M 380 410 L 382 426 M 394 408 L 396 426 M 406 412 L 406 426" />

      {/* the scroll, held up in the left hand and unrolled to the floor */}
      <path className="ch-o" d="M 52 272 C 60 320 46 380 56 440 C 64 500 48 560 58 610 L 160 604 C 152 560 166 500 158 440 C 150 380 164 320 156 272 Z" />
      <path className="ch-tn" d="M 56 272 L 60 300 L 154 300 L 156 272 Z" />
      <path className="ch-t" d="M 72 320 L 136 320 M 72 334 L 126 334 M 72 348 L 140 348" />
      <path className="ch-l" d="M 72 384 L 140 384 M 72 412 L 140 412" />
      <rect className="ch-o" x="84" y="374" width="18" height="20" />
      <path className="ch-t" d="M 90 379 L 90 389 M 96 379 L 96 389" />
      <circle className="ch-d" cx="118" cy="384" r="3.5" />
      <path className="ch-t" d="M 118 384 L 118 412" />
      <circle className="ch-o" cx="118" cy="412" r="6" />
      <path className="ch-t" d="M 112 412 L 124 412 M 118 406 L 118 418" />
      <path className="ch-t" d="M 72 450 L 130 450 M 72 464 L 140 464 M 72 478 L 110 478 M 72 506 L 136 506 M 72 520 L 124 520" />
      <path className="ch-rl" d="M 100 546 L 108 562 L 124 542" />
      <ellipse className="ch-o" cx="108" cy="608" rx="58" ry="12" />
      <ellipse className="ch-tn" cx="108" cy="608" rx="44" ry="6" />
      <rect className="ch-s" x="38" y="262" width="142" height="14" rx="7" />

      {/* left arm holds the top rod */}
      <path className="ch-o" d={limb(182, 282, 150, 332, 20, 18)} />
      <path className="ch-o" d={limb(150, 332, 118, 284, 18, 15)} />
      <ellipse className="ch-o" cx="114" cy="268" rx="18" ry="14" />
      <path className="ch-t" d="M 100 262 L 128 262 M 100 272 L 128 272" />
    </>
  );
}

/* ---------- GAMES · hoodie, cross-legged, an arcade stick in the lap, sprites popping, a cartridge in the pocket ---------- */
function GamesFigure() {
  return (
    <>
      {/* floor shadow, then the sprites */}
      <ellipse className="ch-tx" cx="240" cy="598" rx="210" ry="26" />
      <Pix x={40} y={92} s={9} fill="ch-c" rows={["..###..", ".#####.", "#o###o#", "#######", ".#####."]} />
      <path className="ch-t" d="M 30 80 L 22 70 M 74 74 L 76 62 M 118 82 L 128 72" />
      <Pix x={394} y={148} s={9} fill="ch-r" rows={[".##.##.", "#o#####", "#######", ".#####.", "..###..", "...#..."]} />
      <path className="ch-t" d="M 384 138 L 376 130 M 456 134 L 464 126 M 428 132 L 428 120" />
      <Pix x={384} y={40} s={8} fill="ch-y" rows={["...#...", "..###..", "#######", ".#####.", "..###..", ".#...#."]} />
      <path className="ch-t" d="M 372 36 L 364 28 M 448 36 L 456 28 M 412 26 L 412 16" />

      {/* legs crossed, the far shin first */}
      <path className="ch-o" d={limb(330, 470, 384, 528, 28, 24)} />
      <path className="ch-o" d={limb(384, 528, 214, 594, 24, 20)} />
      <path className="ch-o" d={limb(150, 470, 96, 528, 28, 24)} />
      <path className="ch-o" d={limb(96, 528, 270, 596, 24, 20)} />
      <path className="ch-tn" d="M 100 516 C 120 530 150 546 190 566 L 184 578 C 146 560 116 542 96 530 Z" />
      <path className="ch-c" d="M 258 574 C 282 566 310 570 322 588 C 324 600 306 612 280 610 C 262 608 250 596 258 574 Z" />
      <path className="ch-o" d="M 262 594 C 280 604 302 604 320 596 L 322 602 C 300 612 276 612 260 602 Z" />
      <path className="ch-c" d="M 226 574 C 202 566 174 570 162 588 C 160 600 178 612 204 610 C 222 608 234 596 226 574 Z" />
      <path className="ch-o" d="M 222 594 C 204 604 182 604 164 596 L 162 602 C 184 612 208 612 224 602 Z" />

      {/* the hood bunched behind the neck, then the hoodie */}
      <path className="ch-c" d="M 172 306 C 152 272 178 242 214 250 C 226 238 254 238 266 250 C 302 242 328 272 308 306 Z" />
      <path className="ch-cs" d="M 184 302 C 172 280 186 258 212 258 L 214 270 C 196 272 186 286 190 302 Z" />
      <path className="ch-c" d="M 152 334 C 172 312 198 302 216 300 C 228 322 252 322 264 300 C 282 302 308 312 328 334 C 342 350 348 396 350 448 L 130 448 C 132 396 138 350 152 334 Z" />
      <path className="ch-cs" d="M 312 332 C 332 354 340 396 342 446 L 326 446 C 324 400 318 362 302 340 Z" />
      <path className="ch-l" d="M 234 320 L 228 366 M 246 320 L 252 366" />
      <rect className="ch-d" x="224" y="364" width="8" height="8" rx="1" /><rect className="ch-d" x="248" y="364" width="8" height="8" rx="1" />
      {/* the cartridge in the pocket */}
      <rect className="ch-o" x="218" y="356" width="46" height="44" rx="3" />
      <path className="ch-t" d="M 224 362 L 224 372 M 230 362 L 230 372 M 236 362 L 236 372" />
      <rect className="ch-y" x="226" y="376" width="30" height="18" rx="2" />
      <rect className="ch-cso" x="188" y="390" width="104" height="52" rx="6" />
      <path className="ch-t" d="M 200 402 C 198 416 198 428 200 438 M 280 402 C 282 416 282 428 280 438" />

      {/* the head, hood down */}
      <Head cx={240} cy={176} tilt={2} look="grin" />

      {/* arcade stick on the lap: top, front, the stick, six buttons */}
      <path className="ch-o" d="M 150 436 L 330 436 L 344 486 L 136 486 Z" />
      <path className="ch-tno" d="M 136 486 L 344 486 L 344 512 L 136 512 Z" />
      <path className="ch-t" d="M 156 444 L 324 444" />
      <path className="ch-W" d="M 198 468 L 190 434" />
      <circle className="ch-rs" cx="188" cy="426" r="13" />
      <circle className="ch-y" cx="252" cy="452" r="8" /><circle className="ch-y" cx="276" cy="450" r="8" /><circle className="ch-y" cx="300" cy="452" r="8" />
      <circle className="ch-y" cx="256" cy="472" r="8" /><circle className="ch-y" cx="280" cy="470" r="8" /><circle className="ch-y" cx="304" cy="472" r="8" />

      {/* arms: sleeves in from the sides, one hand on the stick, one over the buttons */}
      <path className="ch-c" d={limb(156, 340, 112, 428, 21, 18)} />
      <path className="ch-c" d={limb(112, 428, 176, 456, 18, 15)} />
      <path className="ch-o" d="M 172 442 C 174 426 208 424 214 440 C 216 456 194 466 178 460 C 170 456 168 450 172 442 Z" />
      <path className="ch-t" d="M 186 430 L 188 444 M 198 428 L 200 444" />
      <path className="ch-c" d={limb(324, 340, 368, 428, 21, 18)} />
      <path className="ch-c" d={limb(368, 428, 302, 448, 18, 15)} />
      <path className="ch-o" d="M 256 446 C 262 432 300 430 306 446 C 306 460 284 468 266 464 C 254 460 250 454 256 446 Z" />
      <path className="ch-t" d="M 270 436 L 270 450 M 282 434 L 282 450 M 294 436 L 294 450" />
    </>
  );
}

const FIGURES: Record<ClassId, () => React.JSX.Element> = { software: SoftwareFigure, ml: MlFigure, research: ResearchFigure, games: GamesFigure };

const DESCRIPTION: Record<ClassId, string> = {
  software: "at a desk with two monitors, a headset on, one hand on a mechanical keyboard, a mug, and a lit log window",
  ml: "in a lab coat with the sleeves rolled, goggles pushed up, holding a glowing neural orb while a tensor cube floats beside",
  research: "in round glasses with a pencil behind the ear, a scroll unrolled to the floor in one hand, the other on a stack of papers, atoms orbiting",
  games: "in a hoodie, cross-legged, an arcade stick in the lap, a cartridge in the pocket, a slime, a heart and a star popping around",
};

/** One class, drawn in full: the symbol once, a red copy misregistered under an ink copy. */
export function Portrait({ classId, className }: { classId: ClassId; className?: string }) {
  const k = classById(classId);
  const Figure = FIGURES[classId];
  const id = useId().replace(/[^a-zA-Z0-9_-]/g, "");
  const fig = `${id}-${classId}-fig`, tone = `${id}-${classId}-tone`, dots = `${id}-${classId}-dots`;
  const label = `Ink drawing of Sampark as ${k.name}: ${DESCRIPTION[classId]}.`;
  return (
    <svg className={cn("ch", className)} viewBox={PORTRAIT_VIEWBOX} role="img" aria-label={label} focusable="false">
      <title>{label}</title>
      <defs>
        <pattern id={tone} width="6" height="6" patternUnits="userSpaceOnUse">
          <rect width="6" height="6" fill="var(--color-paper)" />
          <circle cx="3" cy="3" r="1.5" fill="var(--color-ink)" />
        </pattern>
        <pattern id={dots} width="6" height="6" patternUnits="userSpaceOnUse">
          <circle cx="3" cy="3" r="1.6" fill="var(--color-ink)" />
        </pattern>
        <symbol id={fig} viewBox={PORTRAIT_VIEWBOX} overflow="visible">
          <g strokeLinecap="round" strokeLinejoin="round"><Figure /></g>
        </symbol>
      </defs>
      <use href={`#${fig}`} className="ch-red" x="3" y="2" width="480" height="640" />
      <use href={`#${fig}`} className="ch-ink" width="480" height="640" style={{ "--ch-tone": `url(#${tone})`, "--ch-dots": `url(#${dots})` } as React.CSSProperties} />
    </svg>
  );
}

export default Portrait;
