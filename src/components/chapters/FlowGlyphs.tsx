import type { ReactElement } from "react";
import type { FlowGlyph } from "@/content/types";
import { cn } from "@/lib/cn";

/* ============================================================================
   One glyph per FlowGlyph in types.ts, each drawn in a 120×120 box with its
   feet at y≈114: 3 px ink strokes, a paper surface, and at most two of the cel
   fills (cel, yellow, shu). Recognisable at 80 px. `active` means the traveller
   has reached the node (a few glyphs answer it: the phone shows its push, the
   database writes a row, the bell rings); `burst` is the flow's repeated-send
   beat, used only by the pods. Nothing here moves on its own.
   ========================================================================== */

export interface GlyphProps { active?: boolean; burst?: boolean }
type Draw = (p: GlyphProps) => ReactElement;

/* A flat cel cloud: the outline is the union of its shapes (a 6 px stroked copy under an unstroked one). */
const cloudShapes = (
  <>
    <rect x={4} y={-12} width={44} height={12} rx={6} />
    <circle cx={14} cy={-13} r={10} />
    <circle cx={28} cy={-18} r={13} />
    <circle cx={41} cy={-12} r={9} />
  </>
);
function Cloud({ x, y, s = 1 }: { x: number; y: number; s?: number }) {
  return (
    <g transform={`translate(${x} ${y}) scale(${s})`}>
      <g className="outline">{cloudShapes}</g>
      <g className="f-paper">{cloudShapes}</g>
    </g>
  );
}

/* A database cylinder; the top ellipse takes the fill that tells the two databases apart. */
function Cylinder({ top, children }: { top: string; children?: React.ReactNode }) {
  return (
    <>
      <path d="M20 30 V92 A40 12 0 0 0 100 92 V30" className="f-paper ink" />
      {children}
      <ellipse cx={60} cy={30} rx={40} ry={12} className={cn(top, "ink")} />
    </>
  );
}

const pine = (x: number, y: number, s: number, cls: string) => (
  <g key={`${x}-${y}`}>
    <rect x={x - 3} y={y} width={6} height={10 * s} className="f-ink" />
    <polygon points={`${x},${y - 34 * s} ${x - 16 * s},${y} ${x + 16 * s},${y}`} className={cn(cls, "ink")} />
    <polygon points={`${x},${y - 44 * s} ${x - 12 * s},${y - 16 * s} ${x + 12 * s},${y - 16 * s}`} className={cn(cls, "ink")} />
  </g>
);

const GLYPHS: Record<FlowGlyph, Draw> = {
  /* ---- Helmit: a request, client to phone ---- */
  clients: () => (
    <g>
      <Cloud x={18} y={44} s={0.6} />
      <Cloud x={52} y={62} s={0.95} />
      <Cloud x={8} y={92} s={0.8} />
      <Cloud x={58} y={112} s={1.05} />
    </g>
  ),
  gate: () => (
    <g>
      <rect x={22} y={34} width={12} height={80} className="f-shu ink" />
      <rect x={86} y={34} width={12} height={80} className="f-shu ink" />
      <rect x={14} y={48} width={92} height={9} className="f-shu ink" />
      <path d="M8 34 Q60 20 112 34 L112 26 Q60 12 8 26 Z" className="f-shu ink" />
      <path d="M60 60 L80 68 V86 Q80 104 60 114 Q40 104 40 86 V68 Z" className="f-yellow ink" />
      <path d="M50 86 L57 94 L71 78" className="f-none ink" />
    </g>
  ),
  shield: () => (
    <g>
      <path d="M60 8 L104 22 V60 Q104 96 60 114 Q16 96 16 60 V22 Z" className="f-yellow ink" />
      <path d="M60 26 L90 36 V60 Q90 84 60 98 Q30 84 30 60 V36 Z" className="f-paper ink" />
      <path d="M44 62 L56 74 L78 48" className="f-none ink" />
    </g>
  ),
  pods: ({ burst }) => (
    <g>
      <polygon points="8,72 34,32 86,32 112,72 86,112 34,112" className="f-cel ink" />
      {[28, 52, 76].map((x) => (
        <g key={x}>
          <rect x={x} y={50} width={22} height={22} rx={5} className="f-paper ink" />
          <circle cx={x + 11} cy={61} r={3} className="f-ink" />
        </g>
      ))}
      <path d="M52 50 L55 40 L59 46 L63 38 L67 46 L71 40 L74 50 Z" className="f-yellow ink2" />
      {burst
        ? [24, 39, 54, 69, 84].map((x, i) => (
            <rect key={x} x={x} y={79} width={12} height={12} rx={3} className="f-yellow ink2 pod-pop" strokeDasharray="3 2" style={{ animationDelay: `${i * 83}ms` }} />
          ))
        : null}
    </g>
  ),
  queue: () => (
    <g>
      <line x1={30} y1={98} x2={30} y2={114} className="ink" />
      <line x1={90} y1={98} x2={90} y2={114} className="ink" />
      <rect x={8} y={74} width={104} height={24} rx={12} className="f-paper ink" />
      <circle cx={20} cy={86} r={6} className="f-ink" />
      <circle cx={100} cy={86} r={6} className="f-ink" />
      {[40, 56, 72, 88].map((x) => <line key={x} x1={x} y1={77} x2={x - 5} y2={95} className="ink2" />)}
      {[[22, -6], [50, 4], [78, -3]].map(([x, r]) => (
        <g key={x} transform={`translate(${x} 52) rotate(${r})`}>
          <rect width={28} height={18} rx={2} className="f-yellow ink" />
          <line x1={6} y1={6} x2={22} y2={6} className="ink2" />
          <line x1={6} y1={12} x2={16} y2={12} className="ink2" />
        </g>
      ))}
    </g>
  ),
  database: ({ active }) => (
    <g>
      <Cylinder top="f-cel">
        <path d="M20 52 A40 12 0 0 0 100 52" className="f-none ink" />
        <path d="M20 72 A40 12 0 0 0 100 72" className="f-none ink" />
        {active ? <rect x={44} y={58} width={32} height={9} rx={2} className="f-yellow ink2" /> : null}
      </Cylinder>
    </g>
  ),
  agent: () => (
    <g>
      <rect x={18} y={80} width={84} height={10} className="f-paper ink" />
      <line x1={28} y1={90} x2={28} y2={114} className="ink" />
      <line x1={92} y1={90} x2={92} y2={114} className="ink" />
      <line x1={60} y1={74} x2={60} y2={80} className="ink" />
      <rect x={36} y={36} width={48} height={38} rx={3} className="f-paper ink" />
      <circle cx={60} cy={55} r={9} className="f-cel ink" />
      <circle cx={60} cy={55} r={3.5} className="f-ink" />
      <rect x={6} y={90} width={6} height={24} className="f-ink" />
      <rect x={108} y={90} width={6} height={24} className="f-ink" />
      <circle cx={9} cy={90} r={5} className="f-shu ink2" />
      <circle cx={111} cy={90} r={5} className="f-shu ink2" />
      <path d="M9 96 Q60 120 111 96" className="f-none s-shu rope" />
    </g>
  ),
  phone: ({ active }) => (
    <g>
      <rect x={34} y={6} width={52} height={108} rx={10} className="f-paper ink" />
      <rect x={40} y={18} width={40} height={80} rx={3} className="f-cel ink" />
      <line x1={52} y1={12} x2={68} y2={12} className="ink2" />
      <circle cx={60} cy={106} r={3.5} className="f-ink" />
      <rect x={45} y={48} width={22} height={9} rx={4.5} className="f-paper" />
      <rect x={53} y={62} width={22} height={9} rx={4.5} className="f-paper" />
      <rect x={45} y={76} width={16} height={9} rx={4.5} className="f-paper" />
      {active ? (
        <g>
          <rect x={43} y={22} width={34} height={16} rx={3} className="f-yellow ink2" />
          <line x1={48} y1={28} x2={72} y2={28} className="ink2" />
          <line x1={48} y1={33} x2={64} y2={33} className="ink2" />
        </g>
      ) : null}
    </g>
  ),

  /* ---- CLR3: an event, stream to price ---- */
  stream: () => (
    <g>
      <path d="M4 44 Q32 28 60 44 T116 44 V76 Q88 92 60 76 T4 76 Z" className="f-cel ink" />
      <path d="M14 60 Q37 48 60 60 T106 60" className="f-none s-paper ink2" strokeDasharray="6 5" />
      {[30, 62, 94].map((x, i) => <circle key={x} cx={x} cy={i === 1 ? 66 : 54} r={7} className="f-yellow ink" />)}
      <line x1={104} y1={100} x2={28} y2={100} className="ink" />
      <polygon points="14,100 28,92 28,108" className="f-ink" />
    </g>
  ),
  features: () => (
    <g>
      <rect x={12} y={22} width={96} height={76} className="f-paper ink" />
      <rect x={44} y={38} width={32} height={20} className="f-yellow" />
      <rect x={76} y={78} width={32} height={20} className="f-yellow" />
      <rect x={12} y={22} width={96} height={16} className="f-cel ink" />
      <line x1={44} y1={38} x2={44} y2={98} className="ink" />
      <line x1={76} y1={38} x2={76} y2={98} className="ink" />
      <line x1={12} y1={58} x2={108} y2={58} className="ink" />
      <line x1={12} y1={78} x2={108} y2={78} className="ink" />
      <line x1={20} y1={48} x2={34} y2={48} className="ink2" />
      <line x1={84} y1={48} x2={100} y2={48} className="ink2" />
      <line x1={20} y1={68} x2={30} y2={68} className="ink2" />
      <line x1={52} y1={68} x2={68} y2={68} className="ink2" />
      <line x1={20} y1={88} x2={36} y2={88} className="ink2" />
    </g>
  ),
  model: () => {
    const tree = (x: number, h: number, w: number) => (
      <g key={x}>
        <rect x={x - 3} y={114 - h * 0.28} width={6} height={h * 0.28} className="f-ink" />
        <polygon points={`${x},${114 - h} ${x - w / 2},${114 - h * 0.28} ${x + w / 2},${114 - h * 0.28}`} className="f-cel ink" />
      </g>
    );
    const plus = (x: number, y: number) => (
      <g key={`p${x}`}>
        <line x1={x - 5} y1={y} x2={x + 5} y2={y} className="ink" />
        <line x1={x} y1={y - 5} x2={x} y2={y + 5} className="ink" />
      </g>
    );
    return <g>{tree(18, 38, 26)}{plus(38, 82)}{tree(58, 60, 34)}{plus(77, 68)}{tree(98, 90, 40)}</g>;
  },
  price: () => (
    <g>
      <path d="M18 30 H70 L108 66 L70 102 H18 Z" className="f-yellow ink" />
      <circle cx={32} cy={66} r={6} className="f-paper ink" />
      <path d="M32 60 Q14 40 26 14" className="f-none ink2" />
      <line x1={72} y1={86} x2={72} y2={52} className="ink" />
      <polygon points="72,44 62,58 82,58" className="f-ink" />
    </g>
  ),
  vectors: () => (
    <g>
      <path d="M18 10 V104 H112" className="f-none ink" />
      {[[52, 42], [70, 72], [86, 58]].map(([x, y]) => <line key={`l${x}`} x1={60} y1={58} x2={x} y2={y} className="ink2" strokeDasharray="4 3" />)}
      {[[40, 82], [52, 42], [70, 72], [92, 30], [98, 86], [66, 94], [86, 58]].map(([x, y]) => <circle key={`${x}-${y}`} cx={x} cy={y} r={5} className="f-cel ink2" />)}
      <circle cx={60} cy={58} r={7} className="f-shu ink" />
    </g>
  ),
  recommender: () => (
    <g>
      {[[30, 30], [30, 60], [60, 30], [60, 90], [90, 60], [90, 90]].map(([y1, y2]) => <line key={`${y1}-${y2}`} x1={35} y1={y1} x2={76} y2={y2} className="ink2" />)}
      <line x1={35} y1={60} x2={76} y2={30} className="hi" />
      {[30, 60, 90].map((y) => <circle key={y} cx={26} cy={y} r={9} className={cn("ink", y === 60 ? "f-cel" : "f-paper")} />)}
      {[30, 60, 90].map((y) => <rect key={y} x={76} y={y - 9} width={18} height={18} rx={3} className={cn("ink", y === 30 ? "f-yellow" : "f-paper")} />)}
    </g>
  ),
  api: () => (
    <g>
      <rect x={14} y={20} width={92} height={80} rx={6} className="f-paper ink" />
      <path d="M20 20 H100 Q106 20 106 26 V34 H14 V26 Q14 20 20 20 Z" className="f-cel ink" />
      <text x={56} y={82} fontSize={40}>{"{ }"}</text>
      <circle cx={94} cy={86} r={6} className="f-yellow ink2" />
    </g>
  ),

  /* ---- Content pipeline glyphs (plan, draft, validate, dedupe) ---- */
  plan: () => (
    <g>
      <rect x={24} y={18} width={72} height={96} rx={4} className="f-paper ink" />
      <rect x={46} y={10} width={28} height={14} rx={4} className="f-cel ink" />
      {[44, 66, 88].map((y, i) => (
        <g key={y}>
          <rect x={34} y={y} width={13} height={13} rx={2} className={cn("ink2", i === 0 ? "f-yellow" : "f-paper")} />
          {i === 0 ? <path d="M37 50 L41 54 L46 46" className="f-none ink2" /> : null}
          <line x1={54} y1={y + 7} x2={i === 2 ? 74 : 86} y2={y + 7} className="ink2" />
        </g>
      ))}
    </g>
  ),
  draft: () => (
    <g>
      <rect x={20} y={12} width={66} height={92} className="f-paper ink" />
      <path d="M66 12 V32 H86" className="f-none ink" />
      {[48, 60, 72].map((y, i) => <line key={y} x1={30} y1={y} x2={i === 2 ? 56 : 74} y2={y} className="ink2" />)}
      <g transform="translate(84 80) rotate(45)">
        <rect x={-8} y={-38} width={16} height={8} className="f-shu ink" />
        <rect x={-8} y={-30} width={16} height={46} className="f-yellow ink" />
        <polygon points="-8,16 8,16 0,30" className="f-paper ink" />
        <polygon points="-3,24 3,24 0,30" className="f-ink" />
      </g>
    </g>
  ),
  validate: () => (
    <g>
      <rect x={18} y={12} width={60} height={84} className="f-paper ink" />
      {[34, 48, 62].map((y, i) => <line key={y} x1={28} y1={y} x2={i === 2 ? 54 : 68} y2={y} className="ink2" />)}
      <circle cx={84} cy={84} r={24} className="f-cel ink" />
      <path d="M72 84 L81 93 L98 72" className="f-none s-paper thick" />
    </g>
  ),
  dedupe: () => (
    <g>
      <rect x={8} y={22} width={40} height={54} className="f-paper ink" />
      {[36, 48, 60].map((y) => <line key={y} x1={16} y1={y} x2={40} y2={y} className="ink2" />)}
      <line x1={54} y1={44} x2={66} y2={44} className="ink" />
      <line x1={54} y1={54} x2={66} y2={54} className="ink" />
      <rect x={72} y={22} width={40} height={54} className="f-paper ink" />
      {[36, 48, 60].map((y) => <line key={y} x1={80} y1={y} x2={104} y2={y} className="ink2" />)}
      <path d="M70 18 L114 80 M114 18 L70 80" className="f-none s-shu thick" />
      <rect x={8} y={90} width={104} height={20} className="f-ink" />
      <rect x={16} y={95} width={8} height={10} className="f-yellow" />
      <line x1={30} y1={100} x2={62} y2={100} className="s-paper ink2" />
    </g>
  ),

  /* ---- QuantumX: a circuit, QASM to vector ---- */
  circuit: () => (
    <g>
      {[34, 60, 86].map((y) => <line key={y} x1={8} y1={y} x2={112} y2={y} className="ink" />)}
      <rect x={22} y={22} width={24} height={24} className="f-cel ink" />
      <rect x={22} y={74} width={24} height={24} className="f-cel ink" />
      <circle cx={70} cy={34} r={5} className="f-ink" />
      <line x1={70} y1={34} x2={70} y2={69} className="ink" />
      <circle cx={70} cy={60} r={9} className="f-paper ink" />
      <line x1={70} y1={51} x2={70} y2={69} className="ink" />
      <line x1={61} y1={60} x2={79} y2={60} className="ink" />
      <rect x={90} y={74} width={22} height={24} className="f-yellow ink" />
      <path d="M94 92 A7 7 0 0 1 108 92" className="f-none ink2" />
      <line x1={101} y1={92} x2={107} y2={82} className="ink2" />
    </g>
  ),
  embedding: () => (
    <g>
      {[40, 56, 72].map((y) => <line key={y} x1={6} y1={y} x2={46} y2={y} className="ink2" />)}
      <rect x={16} y={33} width={14} height={14} className="f-cel ink2" />
      <circle cx={38} cy={56} r={3} className="f-ink" />
      <line x1={38} y1={56} x2={38} y2={77} className="ink2" />
      <circle cx={38} cy={72} r={5} className="f-paper ink2" />
      <line x1={52} y1={56} x2={66} y2={56} className="ink" />
      <polygon points="66,50 76,56 66,62" className="f-ink" />
      <rect x={84} y={14} width={28} height={92} rx={3} className="f-paper ink" />
      {[20, 37, 54, 71, 88].map((y, i) => (
        <rect key={y} x={90} y={y} width={16} height={13} className={cn("ink2", i === 0 || i === 2 ? "f-yellow" : i === 3 ? "f-cel" : "f-paper")} />
      ))}
    </g>
  ),
  rabbit: () => (
    <g>
      <ellipse cx={44} cy={28} rx={9} ry={22} className="f-paper ink" />
      <ellipse cx={76} cy={28} rx={9} ry={22} className="f-paper ink" />
      <ellipse cx={44} cy={30} rx={4} ry={14} className="f-shu" />
      <ellipse cx={76} cy={30} rx={4} ry={14} className="f-shu" />
      <circle cx={60} cy={60} r={22} className="f-paper ink" />
      <circle cx={52} cy={56} r={3} className="f-ink" />
      <circle cx={68} cy={56} r={3} className="f-ink" />
      <polygon points="57,65 63,65 60,69" className="f-ink" />
      <line x1={36} y1={64} x2={50} y2={66} className="ink2" />
      <line x1={70} y1={66} x2={84} y2={64} className="ink2" />
      <rect x={14} y={76} width={92} height={38} className="f-paper ink" />
      <path d="M14 76 L60 102 L106 76" className="f-none ink" />
    </g>
  ),
  optimizer: () => (
    <g>
      <path d="M8 18 C30 122 90 122 112 18" className="f-none ink" />
      <path d="M24 63 L32 78 M40 88 L50 93" className="f-none ink2" strokeDasharray="3 3" />
      <circle cx={20} cy={58} r={5} className="f-paper ink2" />
      <circle cx={36} cy={83} r={5} className="f-paper ink2" />
      <circle cx={60} cy={88} r={9} className="f-shu ink" />
    </g>
  ),

  /* ---- CSM: a question, document to answer ---- */
  documents: () => (
    <g>
      <rect x={38} y={8} width={60} height={78} className="f-paper ink" />
      <rect x={27} y={18} width={60} height={78} className="f-paper ink" />
      <path d="M16 28 H56 L76 48 V108 H16 Z" className="f-paper ink" />
      <path d="M56 28 V48 H76" className="f-none ink" />
      {[64, 76, 88].map((y, i) => <line key={y} x1={26} y1={y} x2={i === 2 ? 50 : 64} y2={y} className="ink2" />)}
    </g>
  ),
  chunks: () => (
    <g>
      <rect x={16} y={10} width={64} height={26} className="f-paper ink" />
      {[19, 28].map((y) => <line key={y} x1={26} y1={y} x2={68} y2={y} className="ink2" />)}
      <line x1={8} y1={41} x2={112} y2={41} className="ink2" strokeDasharray="5 4" />
      <rect x={30} y={46} width={64} height={26} className="f-cel ink" />
      {[55, 64].map((y) => <line key={y} x1={40} y1={y} x2={82} y2={y} className="s-paper ink2" />)}
      <line x1={8} y1={77} x2={112} y2={77} className="ink2" strokeDasharray="5 4" />
      <rect x={16} y={82} width={64} height={26} className="f-paper ink" />
      {[91, 100].map((y) => <line key={y} x1={26} y1={y} x2={60} y2={y} className="ink2" />)}
    </g>
  ),
  vectordb: () => (
    <g>
      <Cylinder top="f-yellow">
        {[[40, 56], [82, 60], [62, 90]].map(([x, y]) => (
          <g key={x}>
            <line x1={60} y1={70} x2={x} y2={y} className="ink2" />
            <circle cx={x} cy={y} r={4.5} className="f-cel ink2" />
          </g>
        ))}
        <circle cx={60} cy={70} r={3} className="f-ink" />
      </Cylinder>
    </g>
  ),
  llm: () => {
    const a = [34, 58, 82], b = [24, 54, 84], c = [46, 70];
    return (
      <g>
        {a.flatMap((y1) => b.map((y2) => <line key={`a${y1}-${y2}`} x1={22} y1={y1} x2={60} y2={y2} className="ink2" />))}
        {b.flatMap((y1) => c.map((y2) => <line key={`b${y1}-${y2}`} x1={60} y1={y1} x2={98} y2={y2} className="ink2" />))}
        {a.map((y) => <circle key={y} cx={22} cy={y} r={7} className="f-paper ink" />)}
        {b.map((y) => <circle key={y} cx={60} cy={y} r={7} className="f-cel ink" />)}
        {c.map((y) => <circle key={y} cx={98} cy={y} r={7} className="f-paper ink" />)}
        <rect x={44} y={100} width={32} height={14} rx={3} className="f-yellow ink2" />
      </g>
    );
  },
  answer: () => (
    <g>
      <path d="M12 16 H108 V80 H58 L38 102 V80 H12 Z" className="f-paper ink" />
      {[36, 50, 64].map((y, i) => <line key={y} x1={24} y1={y} x2={[96, 80, 60][i]} y2={y} className="ink2" />)}
      <circle cx={96} cy={86} r={14} className="f-yellow ink" />
      <path d="M89 86 L94 91 L104 79" className="f-none ink" />
    </g>
  ),

  /* ---- NIC: a record, raw to dashboard ---- */
  records: () => (
    <g>
      <rect x={20} y={6} width={92} height={90} className="f-paper ink" />
      <rect x={10} y={16} width={92} height={92} className="f-paper ink" />
      <rect x={10} y={16} width={92} height={12} className="f-ink" />
      {[40, 58, 76, 94].map((y, i) => (
        <g key={y}>
          <circle cx={22} cy={y} r={4} className="f-cel ink2" />
          <line x1={32} y1={y} x2={[88, 70, 92, 62][i]} y2={y} className="ink2" />
        </g>
      ))}
    </g>
  ),
  etl: () => (
    <g>
      <path d="M12 8 H108 L70 46 V64 H50 V46 Z" className="f-cel ink" />
      <line x1={60} y1={66} x2={60} y2={78} className="ink2" strokeDasharray="3 3" />
      <path d="M24 92 L60 76 L96 92 Z" className="f-yellow ink" />
      <rect x={30} y={92} width={60} height={22} className="f-paper ink" />
      <rect x={54} y={100} width={12} height={14} className="f-ink" />
    </g>
  ),
  forest: () => (
    <g>
      {pine(20, 100, 0.8, "f-cel")}
      {pine(46, 104, 1, "f-cel")}
      {pine(72, 100, 0.85, "f-cel")}
      {pine(100, 104, 0.9, "f-cel")}
      {pine(34, 66, 0.6, "f-cel")}
      <rect x={74} y={14} width={38} height={44} className="f-none ink2" strokeDasharray="5 4" />
      {pine(93, 52, 0.7, "f-shu")}
    </g>
  ),
  alerts: ({ active }) => (
    <g>
      <path d="M36 86 V60 A24 24 0 0 1 84 60 V86 L94 98 H26 Z" className="f-yellow ink" />
      <circle cx={60} cy={30} r={5} className="f-ink" />
      <circle cx={60} cy={106} r={7} className="f-paper ink" />
      <circle cx={92} cy={34} r={12} className="f-shu ink" />
      <line x1={92} y1={28} x2={92} y2={36} className="s-paper thick" />
      <circle cx={92} cy={40} r={2} className="f-paper" />
      {active ? (
        <g className="ink2">
          <line x1={14} y1={44} x2={24} y2={52} />
          <line x1={10} y1={62} x2={22} y2={62} />
          <line x1={14} y1={80} x2={24} y2={72} />
          <line x1={106} y1={62} x2={114} y2={62} />
        </g>
      ) : null}
    </g>
  ),
  dashboard: () => (
    <g>
      <rect x={10} y={14} width={100} height={72} rx={4} className="f-paper ink" />
      <rect x={48} y={86} width={24} height={8} className="f-ink" />
      <line x1={34} y1={100} x2={86} y2={100} className="ink" />
      {[[22, 60, 18], [40, 46, 32], [58, 52, 26], [76, 36, 42]].map(([x, y, h]) => <rect key={x} x={x} y={y} width={12} height={h} className="f-cel ink2" />)}
      <path d="M22 42 L40 30 L58 38 L76 22 L94 28" className="f-none s-yellow ink" />
      <circle cx={94} cy={28} r={4.5} className="f-yellow ink2" />
    </g>
  ),
};

export function Glyph({ name, active, burst }: { name: FlowGlyph } & GlyphProps) {
  return GLYPHS[name]({ active, burst });
}

/* ---------- The travellers: what a flow sends through its nodes ---------- */
export type TravellerKind = "plane" | "spark" | "token" | "question" | "record";

/** "a request" → a paper plane, "an event" → a spark, "a circuit" → a circuit token, "a question" → a question chip, "a record" → a record card. */
export function travellerKind(traveller: string): TravellerKind {
  const s = traveller.toLowerCase();
  if (s.includes("event")) return "spark";
  if (s.includes("circuit")) return "token";
  if (s.includes("question")) return "question";
  if (s.includes("record")) return "record";
  return "plane";
}

/** Drawn around its own origin, nose to the left (it flies right → left). `tilt` is degrees from the arc. */
export function Traveller({ kind, tilt }: { kind: TravellerKind; tilt: number }) {
  const t = tilt.toFixed(1);
  switch (kind) {
    case "spark":
      return (
        <g transform={`rotate(${(tilt * 0.6).toFixed(1)})`}>
          <path d="M0 -17 L5 -5 L17 0 L5 5 L0 17 L-5 5 L-17 0 L-5 -5 Z" className="f-yellow ink" />
          <circle r={3} className="f-ink" />
        </g>
      );
    case "token":
      return (
        <g transform={`rotate(${t})`}>
          <circle r={15} className="f-cel ink" />
          <line x1={-9} y1={0} x2={9} y2={0} className="s-paper ink2" />
          <rect x={-4} y={-7} width={8} height={14} className="f-yellow ink2" />
        </g>
      );
    case "question":
      return (
        <g transform={`rotate(${(tilt * 0.5).toFixed(1)})`}>
          <rect x={-14} y={-14} width={28} height={28} rx={6} className="f-yellow ink" />
          <text y={8} fontSize={22}>?</text>
        </g>
      );
    case "record":
      return (
        <g transform={`rotate(${(tilt * 0.5).toFixed(1)})`}>
          <rect x={-19} y={-13} width={38} height={26} rx={2} className="f-paper ink" />
          <circle cx={-11} cy={-4} r={3.5} className="f-cel ink2" />
          <line x1={-4} y1={-4} x2={13} y2={-4} className="ink2" />
          <line x1={-13} y1={6} x2={8} y2={6} className="ink2" />
        </g>
      );
    default:
      return (
        <g transform={`rotate(${t})`}>
          <polygon points="-18,0 18,-12 10,0 18,12" className="f-paper ink" />
          <line x1={-18} y1={0} x2={10} y2={0} className="ink2" />
        </g>
      );
  }
}
