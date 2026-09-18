/* ============================================================================
   The omake pages: eight ink drawings printed inside the book, one per page, none of
   them résumé. Each is drawn once in a 240 × 280 box with the site's stroke classes
   (pa-o paper fill · pa-c cel · pa-y yellow · pa-r red · pa-g grey · pa-n night ·
   pa-s solid ink · pa-l line 3 · pa-t line 2 · pa-d ink dot · pa-h paper dot ·
   pa-tn screentone · pa-tno screentone with an outline · pa-*d flat fills without
   a stroke for pixel art) and printed twice by <Plate>: a red silhouette three units
   right and two down, then the ink copy, the way a two-colour press misregisters.
   Captions carry no digits and no facts; they are lettered in the page, not here.
   ========================================================================== */

export interface PageArtDef {
  id: string;
  /** What the drawing shows, for assistive tech. */
  alt: string;
  /** Hand-lettered under the drawing. Twelve words at most, no digits. */
  caption: string;
  Art: () => React.ReactElement;
}

/** One drawing, printed twice (red then ink) from a single <g>. `uid` keeps the ids unique per page. */
export function Plate({ uid, alt, children }: { uid: string; alt: string; children: React.ReactNode }) {
  const g = `${uid}-g`;
  const tone = `${uid}-tone`;
  return (
    <svg className="pa" viewBox="0 0 240 280" role="img" aria-label={alt}>
      <defs>
        <pattern id={tone} width="4" height="4" patternUnits="userSpaceOnUse">
          <rect width="4" height="4" fill="var(--color-paper)" />
          <circle cx="2" cy="2" r="1" fill="var(--color-ink)" />
        </pattern>
        <g id={g}>{children}</g>
      </defs>
      <use href={`#${g}`} className="pa-red" x="3" y="2" />
      <use href={`#${g}`} className="pa-ink" style={{ "--pa-tone": `url(#${tone})` } as React.CSSProperties} />
    </svg>
  );
}

/* ---------- 1 · A shelf of tankōbon, a cat asleep on top ---------- */
function Tome({ x, w, h, cls, tilt }: { x: number; w: number; h: number; cls: string; tilt?: number }) {
  const y = 214 - h;
  return (
    <g transform={tilt ? `rotate(${tilt} ${x} 214)` : undefined}>
      <rect className={cls} x={x} y={y} width={w} height={h} />
      <rect className="pa-o" x={x} y={y} width={w} height={13} />
      <rect className="pa-d" x={x + 4} y={y + 4.5} width={w - 8} height={4} />
      <line className="pa-t" x1={x + w / 2} y1={y + 24} x2={x + w / 2} y2={y + h - 30} />
      <rect className="pa-o" x={x} y={198} width={w} height={16} />
      <rect className="pa-d" x={x + 5} y={204} width={w - 10} height={4} />
    </g>
  );
}
function MangaShelf() {
  return (
    <>
      {/* a pinned print on the wall */}
      <rect className="pa-o" x="20" y="22" width="62" height="76" />
      <rect className="pa-tn" x="26" y="28" width="50" height="64" />
      <circle className="pa-rd" cx="51" cy="60" r="17" />
      <path className="pa-l" d="M 30 88 C 40 78 60 78 72 88" />
      <circle className="pa-d" cx="51" cy="24" r="3.5" />
      {/* the plank, its brackets and the shadow it throws */}
      <rect className="pa-tn" x="22" y="228" width="196" height="9" />
      <rect className="pa-o" x="14" y="214" width="212" height="13" />
      <path className="pa-l" d="M 36 227 L 36 252 L 54 227" />
      <path className="pa-l" d="M 204 227 L 204 252 L 186 227" />
      {/* nine spines, one leaning */}
      <Tome x={26} w={20} h={82} cls="pa-c" />
      <Tome x={48} w={18} h={80} cls="pa-y" />
      <Tome x={68} w={22} h={84} cls="pa-o" />
      <Tome x={92} w={20} h={82} cls="pa-r" />
      <Tome x={114} w={18} h={78} cls="pa-c" />
      <Tome x={134} w={22} h={84} cls="pa-tno" />
      <Tome x={158} w={20} h={80} cls="pa-y" />
      <Tome x={182} w={20} h={82} cls="pa-r" tilt={13} />
      {/* the cat, loafed across the tops */}
      <path className="pa-o" d="M 70 132 C 62 114 80 96 106 95 C 136 94 164 98 174 112 C 182 122 176 132 164 132 Z" />
      <path className="pa-tn" d="M 104 121 C 122 129 150 129 166 122 L 165 132 L 102 132 Z" />
      <path className="pa-l" d="M 122 99 Q 128 108 122 116" />
      <path className="pa-l" d="M 138 99 Q 144 108 138 116" />
      <path className="pa-l" d="M 154 102 Q 160 110 154 118" />
      {/* tail curling round to the front */}
      <path className="pa-o" d="M 168 118 C 190 108 196 130 178 136 C 168 140 156 136 150 130 C 156 128 164 130 170 130 C 178 130 180 120 168 124 Z" />
      {/* head on the paws */}
      <path className="pa-o" d="M 72 100 L 75 82 L 88 95 Z" />
      <path className="pa-o" d="M 92 95 L 101 80 L 104 99 Z" />
      <circle className="pa-o" cx="88" cy="113" r="18" />
      <path className="pa-t" d="M 77 112 Q 81 117 85 112" />
      <path className="pa-t" d="M 91 112 Q 95 117 99 112" />
      <path className="pa-d" d="M 88 119 l 3.5 2.5 l -3.5 3 l -3.5 -3 z" />
      <path className="pa-t" d="M 66 116 L 78 118 M 66 122 L 78 121" />
      <path className="pa-t" d="M 110 116 L 98 118 M 110 122 L 98 121" />
      <path className="pa-o" d="M 76 128 C 78 136 92 136 96 128" />
      {/* sleep */}
      <path className="pa-l" d="M 112 78 h 9 l -9 9 h 9" />
      <path className="pa-t" d="M 126 62 h 7 l -7 7 h 7" />
    </>
  );
}

/* ---------- 2 · A handheld, mid boss fight ---------- */
function Heart({ x, y }: { x: number; y: number }) {
  return <path className="pa-rd" d={`M ${x} ${y + 2} c -2 -3 -6 -1 -4 2 l 4 4 l 4 -4 c 2 -3 -2 -5 -4 -2 z`} />;
}
function HandheldBoss() {
  return (
    <>
      {/* the cartridge, a little way out */}
      <rect className="pa-y" x="98" y="10" width="44" height="20" rx="3" />
      <rect className="pa-d" x="106" y="16" width="28" height="4" />
      {/* the shell */}
      <rect className="pa-o" x="50" y="24" width="140" height="228" rx="14" />
      <path className="pa-tn" d="M 172 40 C 184 120 182 190 168 240 L 176 246 C 190 190 192 120 180 40 Z" />
      <rect className="pa-n" x="64" y="40" width="112" height="98" rx="6" />
      <rect className="pa-c" x="76" y="50" width="88" height="76" />
      {/* the screen: hearts, the boss bar, the boss, the hero */}
      <Heart x={84} y={54} /><Heart x={96} y={54} /><Heart x={108} y={54} />
      <rect className="pa-pd" x="118" y="55" width="42" height="6" />
      <rect className="pa-rd" x="118" y="55" width="30" height="6" />
      <rect className="pa-d" x="124" y="80" width="34" height="34" />
      <rect className="pa-d" x="128" y="72" width="6" height="8" />
      <rect className="pa-d" x="140" y="66" width="6" height="14" />
      <rect className="pa-d" x="152" y="72" width="6" height="8" />
      <rect className="pa-d" x="116" y="92" width="8" height="8" />
      <rect className="pa-d" x="158" y="90" width="6" height="8" />
      <rect className="pa-yd" x="132" y="86" width="5" height="5" />
      <rect className="pa-yd" x="145" y="86" width="5" height="5" />
      <rect className="pa-rd" x="132" y="100" width="18" height="6" />
      <rect className="pa-pd" x="134" y="100" width="3" height="3" />
      <rect className="pa-pd" x="145" y="100" width="3" height="3" />
      <rect className="pa-pd" x="90" y="94" width="8" height="8" />
      <rect className="pa-yd" x="88" y="102" width="12" height="9" />
      <rect className="pa-d" x="89" y="111" width="4" height="5" />
      <rect className="pa-d" x="95" y="111" width="4" height="5" />
      <rect className="pa-pd" x="100" y="104" width="14" height="4" />
      <rect className="pa-pd" x="114" y="103" width="4" height="6" />
      <rect className="pa-d" x="76" y="116" width="88" height="10" />
      <rect className="pa-yd" x="80" y="114" width="4" height="2" /><rect className="pa-yd" x="104" y="114" width="4" height="2" />
      {/* controls */}
      <rect className="pa-s" x="66" y="184" width="40" height="14" rx="2" />
      <rect className="pa-s" x="79" y="171" width="14" height="40" rx="2" />
      <circle className="pa-h" cx="86" cy="191" r="2.5" />
      <circle className="pa-r" cx="142" cy="196" r="10" />
      <circle className="pa-r" cx="166" cy="182" r="10" />
      <path className="pa-t" d="M 138 196 h 8 M 162 182 h 8" />
      <rect className="pa-g" x="98" y="222" width="18" height="7" rx="3.5" transform="rotate(-24 107 225)" />
      <rect className="pa-g" x="122" y="222" width="18" height="7" rx="3.5" transform="rotate(-24 131 225)" />
      <path className="pa-t" d="M 150 236 l 10 -10 M 156 240 l 10 -10 M 162 244 l 10 -10 M 168 246 l 6 -6" />
      <rect className="pa-d" x="66" y="146" width="24" height="4" />
      <circle className="pa-rd" cx="72" cy="35" r="2.5" />
      <path className="pa-t" d="M 62 252 C 50 262 56 274 68 268" />
    </>
  );
}

/* ---------- 3 · A knight, a dragon made of server racks ---------- */
function Rack({ x, y, w, h, leds }: { x: number; y: number; w: number; h: number; leds: number }) {
  return (
    <g>
      <rect className="pa-g" x={x} y={y} width={w} height={h} rx="2" />
      <path className="pa-t" d={`M ${x + 6} ${y + h - 6} h ${w - 12} M ${x + 6} ${y + h - 11} h ${w - 12}`} />
      {Array.from({ length: leds }, (_, i) => <circle key={i} className={i % 3 === 1 ? "pa-rd" : "pa-yd"} cx={x + 8 + i * 8} cy={y + 8} r="2.2" />)}
    </g>
  );
}
function KnightVsRackDragon() {
  return (
    <>
      {/* the floor and its glow */}
      <path className="pa-tn" d="M 8 240 L 232 240 L 232 252 L 8 252 Z" />
      <path className="pa-l" d="M 8 240 H 232" />
      {/* the dragon: body, neck, head, tail of cable, crown of heat sinks */}
      <Rack x={152} y={186} w={76} h={18} leds={5} />
      <Rack x={152} y={204} w={76} h={18} leds={5} />
      <Rack x={152} y={222} w={76} h={18} leds={5} />
      <Rack x={142} y={156} w={60} h={26} leds={4} />
      <Rack x={126} y={124} w={54} h={28} leds={3} />
      <Rack x={100} y={88} w={56} h={34} leds={3} />
      <path className="pa-d" d="M 106 88 l 6 -14 l 6 14 z M 122 88 l 6 -18 l 6 18 z M 138 88 l 6 -14 l 6 14 z" />
      <path className="pa-g" d="M 100 118 L 60 134 L 64 146 L 100 130 Z" />
      <path className="pa-h" d="M 70 134 l 3 -7 l 3 5 z M 82 130 l 3 -7 l 3 5 z M 94 126 l 3 -7 l 3 5 z" />
      <circle className="pa-y" cx="114" cy="102" r="6" />
      <circle className="pa-d" cx="115" cy="103" r="2.2" />
      <path className="pa-l" d="M 228 232 C 240 226 236 212 226 208 C 212 202 214 190 226 186" />
      <rect className="pa-o" x="222" y="182" width="12" height="8" />
      <path className="pa-t" d="M 196 240 l 0 -8 M 208 240 l 0 -8" />
      {/* fire, from the open door */}
      <path className="pa-r" d="M 66 122 C 50 118 40 122 30 114 C 38 124 30 132 20 130 C 34 136 40 142 34 152 C 48 146 56 148 62 154 C 58 144 64 136 72 134 Z" />
      <path className="pa-yd" d="M 60 128 C 50 126 44 130 38 126 C 44 132 40 138 36 140 C 46 140 50 144 48 150 C 54 144 58 142 62 146 C 60 140 62 134 66 132 Z" />
      {/* the knight */}
      <path className="pa-r" d="M 46 128 C 30 122 26 108 36 100 C 32 112 40 120 50 122 Z" />
      <circle className="pa-g" cx="52" cy="146" r="15" />
      <rect className="pa-d" x="40" y="142" width="24" height="6" rx="2" />
      <path className="pa-c" d="M 38 162 L 68 162 L 72 200 L 34 200 Z" />
      <path className="pa-yd" d="M 44 172 L 53 182 L 62 172 L 62 178 L 53 188 L 44 178 Z" />
      <rect className="pa-o" x="38" y="200" width="10" height="36" />
      <rect className="pa-o" x="56" y="200" width="10" height="36" />
      <path className="pa-s" d="M 34 236 h 16 v 6 h -18 z M 54 236 h 16 v 6 h -18 z" />
      <path className="pa-y" d="M 16 166 L 42 166 L 42 194 C 42 204 30 208 29 208 C 28 208 16 204 16 194 Z" />
      <path className="pa-l" d="M 29 172 V 200 M 20 184 H 38" />
      <path className="pa-l" d="M 66 170 L 84 158" />
      <path className="pa-o" d="M 80 160 L 110 116 L 118 122 L 88 166 Z" />
      <path className="pa-l" d="M 78 150 L 96 172" />
      <circle className="pa-d" cx="84" cy="160" r="3" />
    </>
  );
}

/* ---------- 4 · A fox with a lantern in the rain ---------- */
function FoxLantern() {
  return (
    <>
      {/* night, buildings, lit windows, rain */}
      <rect className="pa-tn" x="12" y="14" width="216" height="178" />
      <path className="pa-s" d="M 12 192 V 90 H 44 V 66 H 70 V 108 H 92 V 46 H 130 V 84 H 150 V 120 H 176 V 58 H 212 V 100 H 228 V 192 Z" />
      <path className="pa-yd" d="M 20 100 h 8 v 10 h -8 z M 32 100 h 8 v 10 h -8 z M 20 124 h 8 v 10 h -8 z M 32 148 h 8 v 10 h -8 z M 50 76 h 8 v 10 h -8 z M 50 100 h 8 v 10 h -8 z M 100 56 h 8 v 12 h -8 z M 116 56 h 8 v 12 h -8 z M 100 80 h 8 v 12 h -8 z M 116 104 h 8 v 12 h -8 z M 158 130 h 8 v 10 h -8 z M 184 68 h 8 v 12 h -8 z M 200 68 h 8 v 12 h -8 z M 184 92 h 8 v 12 h -8 z M 200 116 h 8 v 12 h -8 z M 216 110 h 6 v 10 h -6 z" />
      <path className="pa-r" d="M 138 96 h 14 v 62 h -14 z" />
      <path className="pa-h" d="M 142 102 h 6 v 6 h -6 z M 142 114 h 6 v 6 h -6 z M 142 126 h 6 v 6 h -6 z M 142 138 h 6 v 6 h -6 z" />
      <path className="pa-t" d="M 30 20 l -8 22 M 66 24 l -8 22 M 104 18 l -8 22 M 150 26 l -8 22 M 190 20 l -8 22 M 220 30 l -8 22 M 48 44 l -8 22 M 170 40 l -8 22 M 120 90 l -8 22 M 60 120 l -8 22 M 200 140 l -8 22 M 24 160 l -8 22 M 90 150 l -8 22" />
      {/* the wet street */}
      <rect className="pa-o" x="12" y="192" width="216" height="62" />
      <path className="pa-cd" d="M 30 232 C 40 224 70 224 80 232 C 70 240 40 240 30 232 Z M 170 222 C 178 216 204 216 212 222 C 204 228 178 228 170 222 Z" />
      <path className="pa-t" d="M 100 244 h 26 M 140 238 h 18" />
      {/* the fox, sitting, lantern on a pole */}
      <path className="pa-o" d="M 60 224 C 52 198 66 176 92 172 L 116 172 C 136 176 140 200 130 222 Z" />
      <path className="pa-o" d="M 62 210 C 40 214 24 202 30 186 C 36 172 56 176 60 190 C 58 200 62 204 68 206 Z" />
      <path className="pa-h" d="M 34 194 C 34 186 42 182 48 186 C 44 190 40 194 40 200 Z" />
      <path className="pa-o" d="M 96 174 C 82 172 74 158 82 146 L 88 130 L 100 146 L 118 146 L 130 130 L 132 148 C 138 160 130 176 116 176 Z" />
      <path className="pa-tn" d="M 90 148 C 96 140 118 140 126 150 C 114 146 100 146 90 148 Z" />
      <circle className="pa-d" cx="98" cy="158" r="3" />
      <circle className="pa-d" cx="118" cy="158" r="3" />
      <path className="pa-d" d="M 106 167 l 5 3 l -5 3 l -5 -3 z" />
      <path className="pa-r" d="M 84 176 C 96 186 120 186 130 176 L 128 184 C 118 192 96 192 84 184 Z" />
      <path className="pa-t" d="M 80 210 V 224 M 112 210 V 224" />
      <path className="pa-l" d="M 128 178 L 170 138" />
      <path className="pa-t" d="M 170 138 v 10" strokeDasharray="4 3" />
      <rect className="pa-y" x="156" y="146" width="28" height="36" rx="10" />
      <path className="pa-t" d="M 160 156 h 20 M 160 164 h 20 M 160 172 h 20" />
      <rect className="pa-d" x="164" y="142" width="12" height="4" />
      <rect className="pa-d" x="164" y="182" width="12" height="4" />
      <path className="pa-t" d="M 146 160 l -8 0 M 194 160 l 8 0 M 152 142 l -6 -6 M 188 142 l 6 -6 M 152 186 l -6 6 M 188 186 l 6 6" />
    </>
  );
}

/* ---------- 5 · Ramen, chopsticks across the keyboard ---------- */
function RamenKeyboard() {
  const keys: React.ReactElement[] = [];
  const rows = [176, 194, 212];
  rows.forEach((y, r) => {
    for (let i = 0; i < 12; i++) keys.push(<rect key={`${r}-${i}`} className="pa-o" x={30 + r * 5 + i * 15} y={y} width={12} height={12} rx="2" />);
  });
  return (
    <>
      {/* the keyboard */}
      <rect className="pa-g" x="18" y="164" width="204" height="82" rx="6" />
      {keys}
      <rect className="pa-o" x="70" y="230" width="100" height="10" rx="2" />
      <rect className="pa-o" x="30" y="230" width="34" height="10" rx="2" />
      <rect className="pa-o" x="176" y="230" width="34" height="10" rx="2" />
      <path className="pa-tn" d="M 18 246 L 222 246 L 218 252 L 22 252 Z" />
      {/* the bowl, from above */}
      <ellipse className="pa-tn" cx="128" cy="178" rx="60" ry="10" />
      <circle className="pa-c" cx="120" cy="106" r="66" />
      <circle className="pa-o" cx="120" cy="106" r="54" />
      <path className="pa-y" d="M 78 92 C 84 76 106 66 128 70 C 150 74 166 90 166 108 C 166 126 150 146 128 146 C 104 146 74 128 78 92 Z" />
      <path className="pa-l" d="M 84 100 C 92 94 100 106 108 100 C 116 94 124 106 132 100 C 140 94 148 106 156 100" />
      <path className="pa-l" d="M 84 116 C 92 110 100 122 108 116 C 116 110 124 122 132 116 C 140 110 148 122 156 116" />
      <path className="pa-l" d="M 92 132 C 100 126 108 138 116 132 C 124 126 132 138 140 132" />
      <ellipse className="pa-o" cx="98" cy="86" rx="15" ry="11" transform="rotate(-20 98 86)" />
      <circle className="pa-yd" cx="99" cy="86" r="6" />
      <rect className="pa-s" x="122" y="72" width="30" height="20" transform="rotate(14 137 82)" />
      <circle className="pa-o" cx="146" cy="120" r="12" />
      <path className="pa-t" d="M 146 120 m -7 0 a 7 7 0 1 1 7 7 a 3.5 3.5 0 1 1 3.5 -3.5" stroke="var(--pa-shu)" />
      <circle className="pa-cd" cx="90" cy="126" r="2.5" /><circle className="pa-cd" cx="100" cy="112" r="2.5" /><circle className="pa-cd" cx="132" cy="138" r="2.5" /><circle className="pa-cd" cx="158" cy="96" r="2.5" />
      {/* chopsticks lying across the rim onto the keys */}
      <path className="pa-o" d="M 150 60 L 212 176 L 206 178 L 145 63 Z" />
      <path className="pa-o" d="M 160 56 L 224 170 L 218 172 L 155 59 Z" />
      {/* steam */}
      <path className="pa-t" d="M 100 34 C 94 26 106 18 100 10 M 120 30 C 114 22 126 14 120 6 M 140 36 C 134 28 146 20 140 12" />
    </>
  );
}

/* ---------- 6 · The cassette futon cockpit ---------- */
function FutonCockpit() {
  return (
    <>
      {/* the windshield onto space */}
      <path className="pa-n" d="M 46 16 L 194 16 L 214 76 L 26 76 Z" />
      <circle className="pa-h" cx="70" cy="34" r="2" /><circle className="pa-h" cx="112" cy="26" r="1.6" /><circle className="pa-h" cx="150" cy="40" r="2" /><circle className="pa-h" cx="186" cy="30" r="1.6" /><circle className="pa-h" cx="96" cy="58" r="1.6" /><circle className="pa-h" cx="172" cy="62" r="2" />
      <circle className="pa-yd" cx="134" cy="52" r="11" />
      <ellipse className="pa-t" cx="134" cy="52" rx="20" ry="5" transform="rotate(-18 134 52)" stroke="var(--pa-paper)" />
      {/* the deck: a cassette for a dashboard */}
      <path className="pa-g" d="M 20 76 L 220 76 L 232 140 L 8 140 Z" />
      <rect className="pa-o" x="86" y="86" width="86" height="46" rx="4" />
      <rect className="pa-yd" x="92" y="92" width="74" height="12" />
      <circle className="pa-o" cx="112" cy="116" r="9" />
      <circle className="pa-o" cx="146" cy="116" r="9" />
      <path className="pa-t" d="M 112 108 v 4 M 112 120 v 4 M 104 116 h 4 M 116 116 h 4 M 146 108 v 4 M 146 120 v 4 M 138 116 h 4 M 150 116 h 4" />
      <path className="pa-d" d="M 122 118 h 14 v 3 h -14 z" />
      <path className="pa-t" d="M 120 124 L 138 124" />
      {/* meters and switches */}
      <path className="pa-o" d="M 26 118 a 14 14 0 0 1 28 0 z" />
      <path className="pa-l" d="M 40 118 L 48 106" />
      <path className="pa-o" d="M 186 118 a 14 14 0 0 1 28 0 z" />
      <path className="pa-l" d="M 200 118 L 194 106" />
      <rect className="pa-o" x="30" y="86" width="10" height="20" rx="5" /><circle className="pa-rd" cx="35" cy="91" r="3" />
      <rect className="pa-o" x="46" y="86" width="10" height="20" rx="5" /><circle className="pa-d" cx="51" cy="101" r="3" />
      <rect className="pa-o" x="62" y="86" width="10" height="20" rx="5" /><circle className="pa-rd" cx="67" cy="91" r="3" />
      <rect className="pa-o" x="188" y="86" width="26" height="8" rx="4" /><rect className="pa-o" x="188" y="98" width="26" height="8" rx="4" />
      {/* the futon, the pillow, the pilot and the duvet */}
      <rect className="pa-o" x="14" y="222" width="212" height="24" rx="6" />
      <path className="pa-tn" d="M 14 246 L 226 246 L 222 254 L 18 254 Z" />
      <rect className="pa-o" x="26" y="196" width="60" height="26" rx="8" />
      <circle className="pa-o" cx="66" cy="196" r="17" />
      <path className="pa-s" d="M 50 190 C 48 176 60 170 72 172 C 82 174 86 182 82 190 L 76 184 L 70 190 L 62 182 L 56 190 Z" />
      <path className="pa-t" d="M 62 198 Q 65 202 68 198 M 72 198 Q 75 202 78 198" />
      <path className="pa-d" d="M 70 208 q 4 3 8 0" />
      <path className="pa-y" d="M 84 222 C 84 196 108 176 140 178 C 176 180 210 194 226 222 Z" />
      <path className="pa-t" d="M 100 214 C 104 204 112 198 122 196 M 150 200 C 166 200 180 206 190 216 M 130 210 C 140 206 150 208 160 214" />
      <path className="pa-l" d="M 132 180 L 132 152" />
      <circle className="pa-r" cx="132" cy="146" r="9" />
      <path className="pa-o" d="M 120 190 C 124 182 138 182 142 190 C 134 194 128 194 120 190 Z" />
      <path className="pa-t" d="M 118 160 l -6 -8 M 146 160 l 6 -8" />
    </>
  );
}

/* ---------- 7 · One more credit ---------- */
function ArcadeCoin() {
  return (
    <>
      <path className="pa-tn" d="M 8 250 L 232 250 L 232 262 L 8 262 Z" />
      <path className="pa-l" d="M 8 250 H 232" />
      {/* the cabinet */}
      <rect className="pa-o" x="76" y="36" width="130" height="214" />
      <path className="pa-c" d="M 76 36 L 76 250 L 64 250 L 64 60 Z" />
      <rect className="pa-r" x="76" y="36" width="130" height="34" />
      <path className="pa-yd" d="M 141 42 l 5 10 l 11 1 l -8 7 l 3 11 l -11 -6 l -11 6 l 3 -11 l -8 -7 l 11 -1 z" />
      <rect className="pa-n" x="90" y="80" width="102" height="72" />
      <path className="pa-pd" d="M 102 92 h 6 v 5 h -6 z M 118 92 h 6 v 5 h -6 z M 134 92 h 6 v 5 h -6 z M 150 92 h 6 v 5 h -6 z M 166 92 h 6 v 5 h -6 z M 110 104 h 6 v 5 h -6 z M 126 104 h 6 v 5 h -6 z M 142 104 h 6 v 5 h -6 z M 158 104 h 6 v 5 h -6 z" />
      <path className="pa-yd" d="M 136 132 h 10 v 4 h 6 v 8 h -22 v -8 h 6 z" />
      <path className="pa-rd" d="M 140 118 h 2 v 10 h -2 z" />
      <path className="pa-g" d="M 76 160 L 206 160 L 212 190 L 70 190 Z" />
      <path className="pa-l" d="M 110 178 L 110 164" />
      <circle className="pa-r" cx="110" cy="162" r="7" />
      <circle className="pa-y" cx="150" cy="176" r="8" />
      <circle className="pa-y" cx="174" cy="176" r="8" />
      <rect className="pa-o" x="118" y="202" width="46" height="40" />
      <rect className="pa-d" x="136" y="212" width="10" height="3" />
      <circle className="pa-l" cx="141" cy="228" r="4" />
      <path className="pa-t" d="M 124 208 h 8 M 150 208 h 8" />
      {/* the player from behind, reaching up */}
      <path className="pa-c" d="M 20 250 L 22 196 C 22 182 36 176 48 180 L 60 192 L 60 250 Z" />
      <circle className="pa-o" cx="42" cy="168" r="16" />
      <path className="pa-s" d="M 26 166 C 26 150 40 146 52 150 C 60 154 60 164 58 170 C 52 162 40 160 26 166 Z" />
      <path className="pa-c" d="M 52 190 L 82 166 L 90 174 L 60 200 Z" />
      <circle className="pa-o" cx="90" cy="170" r="7" />
      <path className="pa-tn" d="M 24 236 h 34 v 14 h -34 z" />
      {/* the coin in the air */}
      <circle className="pa-y" cx="112" cy="140" r="9" />
      <path className="pa-d" d="M 112 135 l 1.5 3 l 3.5 0.5 l -2.5 2.5 l 0.5 3.5 l -3 -1.5 l -3 1.5 l 0.5 -3.5 l -2.5 -2.5 l 3.5 -0.5 z" />
      <path className="pa-t" d="M 98 152 l -8 6 M 100 144 l -10 2 M 104 158 l -4 8" />
    </>
  );
}

/* ---------- 8 · The mech waters the bonsai ---------- */
function MechBonsai() {
  return (
    <>
      {/* the window and the sun */}
      <rect className="pa-o" x="122" y="24" width="102" height="86" />
      <path className="pa-l" d="M 173 24 V 110 M 122 67 H 224" />
      <circle className="pa-yd" cx="196" cy="50" r="12" />
      <path className="pa-t" d="M 138 48 q 4 -4 8 0 M 146 48 q 4 -4 8 0 M 150 40 q 4 -4 8 0 M 158 40 q 4 -4 8 0" />
      {/* floor */}
      <path className="pa-tn" d="M 8 240 L 232 240 L 232 252 L 8 252 Z" />
      <path className="pa-l" d="M 8 240 H 232" />
      {/* the mech */}
      <path className="pa-l" d="M 86 84 L 86 66" />
      <circle className="pa-r" cx="86" cy="60" r="6" />
      <path className="pa-g" d="M 40 120 C 40 92 60 82 86 82 C 112 82 132 92 132 120 L 132 190 C 132 204 118 210 86 210 C 54 210 40 204 40 190 Z" />
      <path className="pa-c" d="M 56 104 C 56 94 70 90 86 90 C 102 90 116 94 116 104 L 116 122 C 116 128 104 130 86 130 C 68 130 56 128 56 122 Z" />
      <circle className="pa-d" cx="74" cy="112" r="4" />
      <circle className="pa-d" cx="98" cy="112" r="4" />
      <path className="pa-t" d="M 80 122 q 6 4 12 0" />
      <path className="pa-tn" d="M 48 150 C 48 176 60 196 86 200 L 86 208 C 56 206 42 194 42 160 Z" />
      <rect className="pa-o" x="52" y="150" width="20" height="8" rx="2" /><rect className="pa-o" x="52" y="164" width="20" height="8" rx="2" />
      <circle className="pa-rd" cx="112" cy="156" r="4" /><circle className="pa-yd" cx="112" cy="170" r="4" />
      <rect className="pa-g" x="52" y="210" width="22" height="26" rx="4" />
      <rect className="pa-g" x="98" y="210" width="22" height="26" rx="4" />
      <path className="pa-s" d="M 44 236 h 36 v 6 h -36 z M 92 236 h 36 v 6 h -36 z" />
      <path className="pa-l" d="M 40 150 C 28 158 20 172 24 188" />
      <circle className="pa-g" cx="24" cy="192" r="7" />
      {/* the arm and the can */}
      <path className="pa-l" d="M 132 140 C 148 138 158 148 164 160" />
      <circle className="pa-g" cx="164" cy="162" r="7" />
      <path className="pa-c" d="M 140 170 L 178 170 L 182 202 L 136 202 Z" />
      <path className="pa-l" d="M 178 176 L 206 146" />
      <path className="pa-o" d="M 200 138 L 212 136 L 212 148 L 204 152 Z" />
      <path className="pa-l" d="M 148 170 C 148 160 170 160 170 170" />
      <path className="pa-cd" d="M 214 150 c 3 -4 6 0 3 4 z M 218 162 c 3 -4 6 0 3 4 z M 214 174 c 3 -4 6 0 3 4 z M 210 186 c 3 -4 6 0 3 4 z" />
      {/* the bonsai */}
      <path className="pa-r" d="M 190 214 L 234 214 L 230 238 L 194 238 Z" />
      <path className="pa-l" d="M 190 220 H 234" />
      <path className="pa-l" d="M 212 214 C 214 200 204 194 208 182 C 212 172 224 172 220 160" strokeWidth="5" />
      <path className="pa-tno" d="M 196 180 C 190 168 200 158 212 162 C 218 154 232 158 232 168 C 240 172 236 184 226 184 C 220 190 204 190 196 180 Z" />
      <path className="pa-tno" d="M 200 198 C 194 190 200 182 210 186 C 216 182 226 188 222 196 C 218 202 206 204 200 198 Z" />
    </>
  );
}

/** Reading order, page two onward. */
export const PAGES: PageArtDef[] = [
  { id: "shelf", alt: "Ink drawing: a shelf of manga volumes with a cat asleep across their tops", caption: "Read the whole shelf twice. Would read again.", Art: MangaShelf },
  { id: "handheld", alt: "Ink drawing: a handheld console, the boss fight on its screen", caption: "The boss has a tell. So does every bug.", Art: HandheldBoss },
  { id: "dragon", alt: "Ink drawing: a small knight facing a dragon made of server racks", caption: "It only breathes fire under load.", Art: KnightVsRackDragon },
  { id: "fox", alt: "Ink drawing: a fox with a paper lantern on a rainy neon street", caption: "Rain again. The fox knows the way home.", Art: FoxLantern },
  { id: "ramen", alt: "Ink drawing: a bowl of ramen with the chopsticks resting on a keyboard", caption: "Deploy first. Then the noodles. Never both.", Art: RamenKeyboard },
  { id: "cockpit", alt: "Ink drawing: a pilot tucked into a futon under a cassette-deck dashboard", caption: "Mission control has a duvet. Launch postponed.", Art: FutonCockpit },
  { id: "arcade", alt: "Ink drawing: a kid tossing a coin at an arcade cabinet", caption: "One more credit. It is always one more credit.", Art: ArcadeCoin },
  { id: "mech", alt: "Ink drawing: a round mech watering a bonsai by the window", caption: "Even the mech waters the bonsai on Sundays.", Art: MechBonsai },
];
