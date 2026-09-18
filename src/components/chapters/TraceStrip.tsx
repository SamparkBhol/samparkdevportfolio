"use client";
import { useCallback, useEffect, useRef, useState } from "react";
import { resume } from "@/content/resume";
import type { RolePanel } from "@/content/types";
import { Caption } from "@/components/print/Caption";
import { Hanko } from "@/components/print/Hanko";
import { Sfx } from "@/components/print/Sfx";
import { cn } from "@/lib/cn";

/* ---------- The story, in frames ---------- */
const LAST = 28;      // frames 0..28: twenty-nine frames, on twos
const FRAME_MS = 83;  // 12 fps
const W = 1200;       // viewBox width
const CHAR = 8.7;     // Courier Prime advance at 14 px with 0.02em tracking, in viewBox units
const SPARES = 3;     // pods the HPA burst adds (a demo threshold, stamped DEMO on screen)

const helmit = resume.roles[0];
const panel = (id: string): RolePanel => {
  const p = helmit.panels.find((x) => x.id === id);
  if (!p) throw new Error(`resume.ts: Helmit panel "${id}" is missing`);
  return p;
};
const services = panel("services"), reliability = panel("reliability"), delivery = panel("delivery"), runtime = panel("runtime");
const data = panel("data"), integrations = panel("integrations"), agent = panel("agent"), mobile = panel("mobile");
const tags = (p: RolePanel, n: number) => (p.tags ?? []).slice(0, n).join(" · ");

/* Where the plane is on each hop, right to left. Frames are integers, so the plane moves on twos. */
const WAYPOINTS = [
  { f: 0, x: 1105, y: 176 },  // in the clouds
  { f: 4, x: 930, y: 106 },   // over the torii
  { f: 9, x: 755, y: 156 },   // pod-2
  { f: 12, x: 585, y: 194 },  // the conveyor
  { f: 18, x: 428, y: 112 },  // the cabinet
  { f: 22, x: 258, y: 138 },  // the desk
  { f: 26, x: 160, y: 94 },
  { f: 28, x: 95, y: 88 },    // the phone
];
function planeAt(f: number) {
  let i = 0;
  while (i < WAYPOINTS.length - 2 && f >= WAYPOINTS[i + 1].f) i++;
  const a = WAYPOINTS[i], b = WAYPOINTS[i + 1];
  const t = Math.min(1, Math.max(0, (f - a.f) / (b.f - a.f)));
  return {
    x: a.x + (b.x - a.x) * t,
    y: a.y + (b.y - a.y) * t - Math.sin(Math.PI * t) * 26,
    tilt: Math.cos(Math.PI * t) * 14,
  };
}

const HOPS = [
  { f: 4, name: "gateway", line: "gateway waf=pass auth=oauth2 → api" },
  { f: 9, name: "pod-2", line: "pod-2 (leader) · spring-boot" },
  { f: 12, name: "redis", line: "redis job#1 enqueued · async" },
  { f: 18, name: "postgres", line: `postgres schema v0${data.numeral} · ${data.numeral} migrations` },
  { f: 22, name: "agent", line: "agent vertex-ai · tool permitted from args · otel 4 spans" },
  { f: 28, name: "phone", line: "phone rn/expo · push delivered · en" },
];
const SFX = [
  { from: 4, to: 10, jp: "ドン", romaji: "DON", left: "77.5%", top: "16%" },
  { from: 12, to: 18, jp: "シュッ", romaji: "SHU", left: "48.5%", top: "36%" },
  { from: 22, to: 28, jp: "ゴゴゴ", romaji: "GOGOGO", left: "21.5%", top: "20%" },
];

/* ---------- The parts of the stack, each one a button that reads its panel ---------- */
type Part = { id: string; panel: string; cx: number; top: number; hit: [number, number, number, number]; fact: string };
const PARTS: Part[] = [
  { id: "clouds", panel: integrations.id, cx: 1102, top: 130, hit: [1022, 122, 168, 142], fact: `${integrations.label} · ${integrations.numeral} platforms · ${tags(integrations, 2)}` },
  { id: "torii", panel: delivery.id, cx: 930, top: 112, hit: [860, 108, 140, 182], fact: `${delivery.label} · API gateway · ${(delivery.tags ?? []).slice(-1)[0]}` },
  { id: "hex", panel: runtime.id, cx: 755, top: 160, hit: [668, 158, 174, 132], fact: `${runtime.label} · ${tags(runtime, 3)}` },
  { id: "conveyor", panel: data.id, cx: 585, top: 208, hit: [505, 206, 160, 84], fact: `${data.label} · ${(data.tags ?? [])[0]} job queues · async` },
  { id: "cabinet", panel: data.id, cx: 428, top: 124, hit: [364, 120, 128, 170], fact: `${data.label} · ${(data.tags ?? [])[1]} · ${data.numeral} schema migrations` },
  { id: "desk", panel: agent.id, cx: 258, top: 162, hit: [176, 158, 164, 132], fact: `${agent.label} · ${tags(agent, 2)} · quarantine` },
  { id: "phone", panel: mobile.id, cx: 95, top: 104, hit: [45, 100, 100, 190], fact: `${mobile.label} · ${tags(mobile, 2)} · push` },
  { id: "road", panel: reliability.id, cx: 600, top: 326, hit: [40, 306, 1120, 54], fact: `${reliability.label} · latency · error rate · saturation` },
];
const PLANE_FACT = `${services.label} · REST contracts · idempotent operations`;

function PartG({ part, transform, onJump, onHot, children }: { part: Part; transform?: string; onJump: (p: Part) => void; onHot: (id: string | null) => void; children: React.ReactNode }) {
  const [x, y, w, h] = part.hit;
  return (
    <g role="button" tabIndex={0} className="job-part" aria-label={part.fact} transform={transform}
      onClick={() => onJump(part)}
      onKeyDown={(e) => { if (e.key === "Enter" || e.key === " ") { e.preventDefault(); e.stopPropagation(); onJump(part); } }}
      onMouseEnter={() => onHot(part.id)} onMouseLeave={() => onHot(null)} onFocus={() => onHot(part.id)} onBlur={() => onHot(null)}>
      <title>{`${part.fact}. Click or press Enter to read its panel.`}</title>
      <rect className="job-hit-area" x={x} y={y} width={w} height={h} rx={8} />
      {children}
    </g>
  );
}

/** A caption chip on the ground under a part. */
function Chip({ cx, y, text }: { cx: number; y: number; text: string }) {
  const w = text.length * CHAR + 14;
  return (
    <g aria-hidden="true">
      <rect x={cx - w / 2} y={y} width={w} height={24} className="f-paper ink2" />
      <text x={cx} y={y + 16.5}>{text}</text>
    </g>
  );
}

/** A flat cel cloud: the outline is the union of its shapes (a thick stroked copy under an unstroked one). */
function Cloud({ x, y }: { x: number; y: number }) {
  const shapes = (
    <>
      <rect x={4} y={-11} width={40} height={11} rx={5} className="f-paper" />
      <circle cx={12} cy={-11} r={9} className="f-paper" />
      <circle cx={25} cy={-15} r={12} className="f-paper" />
      <circle cx={38} cy={-10} r={8} className="f-paper" />
    </>
  );
  return (
    <g transform={`translate(${x} ${y})`}>
      <g className="job-outline">{shapes}</g>
      <g>{shapes}</g>
    </g>
  );
}

function Pod({ x, y, spare }: { x: number; y: number; spare?: boolean }) {
  return (
    <g>
      <rect x={x} y={y} width={22} height={22} rx={6} className={cn("ink2", spare ? "f-yellow" : "f-paper")} strokeDasharray={spare ? "4 3" : undefined} />
      <circle cx={x + 11} cy={y + 11} r={3} className="f-ink" />
    </g>
  );
}

function Bubble({ part }: { part: Part }) {
  const text = part.fact.toUpperCase();
  const bw = text.length * CHAR + 24;
  const bx = Math.min(Math.max(part.cx - bw / 2, 6), W - 6 - bw);
  const by = Math.max(6, part.top - 48);
  const tail = Math.min(Math.max(part.cx, bx + 16), bx + bw - 16);
  return (
    <g className="job-bubble" aria-hidden="true">
      <polygon points={`${tail - 8},${by + 27} ${tail + 8},${by + 27} ${tail},${by + 42}`} className="f-paper ink" />
      <rect x={bx} y={by} width={bw} height={30} rx={4} className="f-paper ink" />
      <polygon points={`${tail - 6},${by + 28.5} ${tail + 6},${by + 28.5} ${tail},${by + 39.5}`} className="f-paper" />
      <text x={bx + bw / 2} y={by + 20}>{text}</text>
    </g>
  );
}

/* ---------- The strip ---------- */
export function TraceStrip() {
  const [frame, setFrame] = useState(0);
  const [running, setRunning] = useState(false);
  const [sends, setSends] = useState(0);
  const [hpa, setHpa] = useState(false);
  const [hot, setHot] = useState<string | null>(null);
  const timer = useRef<number | null>(null);
  const hpaTimer = useRef<number | null>(null);
  const sendTimes = useRef<number[]>([]);
  const scroller = useRef<HTMLDivElement>(null);
  const stage = useRef<HTMLDivElement>(null);

  const stop = useCallback(() => {
    if (timer.current !== null) { window.clearInterval(timer.current); timer.current = null; }
    setRunning(false);
  }, []);
  useEffect(() => () => {
    if (timer.current !== null) window.clearInterval(timer.current);
    if (hpaTimer.current !== null) window.clearTimeout(hpaTimer.current);
  }, []);

  const send = useCallback(() => {
    stop();
    const now = Date.now();
    sendTimes.current = [...sendTimes.current.filter((t) => now - t < 4000), now];
    setSends((n) => n + 1);
    if (sendTimes.current.length >= 5) {
      sendTimes.current = [];
      setHpa(true);
      if (hpaTimer.current !== null) window.clearTimeout(hpaTimer.current);
      hpaTimer.current = window.setTimeout(() => { setHpa(false); hpaTimer.current = null; }, 6000);
    }
    if (window.matchMedia("(prefers-reduced-motion: reduce)").matches) { setFrame(LAST); return; }
    setFrame(0);
    setRunning(true);
    let f = 0;
    timer.current = window.setInterval(() => {
      f += 1;
      setFrame(f);
      if (f >= LAST) stop();
    }, FRAME_MS);
  }, [stop]);

  const scrub = useCallback((f: number) => { stop(); setFrame(Math.min(LAST, Math.max(0, f))); }, [stop]);

  const jump = useCallback((p: Part | string) => {
    const id = typeof p === "string" ? p : p.panel;
    const el = document.getElementById(`panel-${id}`);
    if (!el) return;
    el.scrollIntoView({ behavior: window.matchMedia("(prefers-reduced-motion: reduce)").matches ? "auto" : "smooth", block: "center" });
    el.classList.add("job-hit");
    window.setTimeout(() => el.classList.remove("job-hit"), 1400);
  }, []);

  /* On phones the strip is wider than the screen; the camera follows the plane. */
  useEffect(() => {
    const sc = scroller.current, st = stage.current;
    if (!sc || !st || sc.scrollWidth <= sc.clientWidth + 2) return;
    const { x } = planeAt(frame);
    sc.scrollTo({ left: Math.max(0, (x / W) * st.clientWidth - sc.clientWidth / 2), behavior: "auto" });
  }, [frame]);

  const onStripKey = (e: React.KeyboardEvent<SVGSVGElement>) => {
    if (e.target !== e.currentTarget) return;
    if (e.key === "Enter" || e.key === " ") { e.preventDefault(); send(); }
    else if (e.key === "ArrowRight" || e.key === "ArrowUp") { e.preventDefault(); scrub(frame + 1); }
    else if (e.key === "ArrowLeft" || e.key === "ArrowDown") { e.preventDefault(); scrub(frame - 1); }
    else if (e.key === "Home") { e.preventDefault(); scrub(0); }
    else if (e.key === "End") { e.preventDefault(); scrub(LAST); }
  };

  const plane = planeAt(frame);
  const planePart: Part = { id: "plane", panel: services.id, cx: plane.x, top: plane.y - 26, hit: [-38, -28, 78, 56], fact: PLANE_FACT };
  const hotPart = hot === "plane" ? planePart : PARTS.find((p) => p.id === hot);
  const log = HOPS.filter((h) => h.f <= frame);
  const lastHop = log[log.length - 1];
  const done = frame >= LAST;
  const seconds = (((LAST + 1) * FRAME_MS) / 1000).toFixed(1);
  const status = done
    ? `200 OK · ${seconds} s · ${sends > 0 ? `request #${sends}` : "scrubbed to the end"}`
    : running ? `in flight · ${lastHop ? lastHop.name : "leaving the clouds"}`
    : sends === 0 && frame === 0 ? "ready · press send · demo timing"
    : `paused · ${lastHop ? lastHop.name : "at the clouds"}`;
  const sfx = SFX.find((s) => frame >= s.from && frame < s.to);

  return (
    <div className="job-trace paper ink-border hard-shadow ink-in">
      <div className="job-trace-head">
        <span className="mono-label">Fig. 02 · one request, right to left</span>
        <span className="mono-label job-trace-hint">Send · drag the timeline · click a part to read its panel</span>
      </div>

      <div className="job-scroll" ref={scroller}>
        <div className="job-stage" ref={stage}>
          <svg className="job-svg" viewBox={`0 0 ${W} 360`} preserveAspectRatio="xMidYMid meet" width="100%" tabIndex={0} role="group"
            aria-label="The request trace strip. Enter sends a request; arrow keys scrub it; Tab reaches each part of the stack." onKeyDown={onStripKey}>
            <defs>
              <pattern id="job-tone" width={6} height={6} patternUnits="userSpaceOnUse"><circle cx={3} cy={3} r={1} className="f-ink" opacity={0.28} /></pattern>
            </defs>

            {/* ground */}
            <rect x={0} y={282} width={W} height={78} fill="url(#job-tone)" />
            <line x1={0} y1={282} x2={W} y2={282} className="ink" />

            {/* the road: reliability lives under everything */}
            <PartG part={PARTS[7]} onJump={jump} onHot={setHot}>
              <line x1={1150} y1={346} x2={740} y2={346} className="ink" />
              <line x1={460} y1={346} x2={66} y2={346} className="ink" />
              <polygon points="46,346 68,336 68,356" className="f-ink ink" />
              <Chip cx={600} y={334} text="REQUEST TRAVELS RIGHT → LEFT" />
            </PartG>

            {/* phone · React Native */}
            <PartG part={PARTS[6]} onJump={jump} onHot={setHot}>
              <rect x={57} y={112} width={76} height={166} rx={12} className="f-paper ink" />
              <rect x={65} y={126} width={60} height={126} rx={4} className="f-cel ink2" />
              <line x1={82} y1={119} x2={108} y2={119} className="ink2" />
              <circle cx={95} cy={265} r={5} className="f-paper ink2" />
              <rect x={71} y={168} width={34} height={14} rx={7} className="f-paper" />
              <rect x={85} y={190} width={34} height={14} rx={7} className="f-paper" />
              <rect x={71} y={212} width={26} height={14} rx={7} className="f-paper" />
              {done ? (
                <g>
                  <rect x={69} y={132} width={52} height={24} rx={4} className="f-yellow ink2" />
                  <line x1={76} y1={141} x2={112} y2={141} className="ink2" />
                  <line x1={76} y1={148} x2={100} y2={148} className="ink2" />
                </g>
              ) : null}
              <Chip cx={92} y={294} text="REACT NATIVE" />
            </PartG>

            {/* the agent's desk behind the quarantine rope */}
            <PartG part={PARTS[5]} onJump={jump} onHot={setHot}>
              <line x1={216} y1={226} x2={216} y2={282} className="ink" />
              <line x1={300} y1={226} x2={300} y2={282} className="ink" />
              <rect x={206} y={214} width={104} height={12} className="f-paper ink" />
              <line x1={258} y1={206} x2={258} y2={214} className="ink" />
              <rect x={232} y={168} width={52} height={38} rx={3} className="f-paper ink" />
              <circle cx={258} cy={187} r={8} className="f-cel ink2" />
              <circle cx={258} cy={187} r={3} className="f-ink" />
              <rect x={284} y={200} width={18} height={14} rx={2} className="f-yellow ink2" />
              <rect x={181} y={236} width={8} height={46} className="f-ink" />
              <rect x={327} y={236} width={8} height={46} className="f-ink" />
              <circle cx={185} cy={236} r={6} className="f-shu ink2" />
              <circle cx={331} cy={236} r={6} className="f-shu ink2" />
              <path d="M185 242 Q258 270 331 242" fill="none" stroke="var(--color-shu)" strokeWidth={4} strokeDasharray="10 7" strokeLinecap="round" />
              <g transform="translate(258 256) rotate(45)"><rect x={-9} y={-9} width={18} height={18} className="f-yellow ink2" /></g>
              <line x1={258} y1={250} x2={258} y2={258} className="ink" />
              <circle cx={258} cy={263} r={1.8} className="f-ink" />
              <Chip cx={256} y={294} text="AGENT · QUARANTINE" />
            </PartG>

            {/* the Postgres cabinet, drawer 058 */}
            <PartG part={PARTS[4]} onJump={jump} onHot={setHot}>
              <rect x={380} y={136} width={96} height={146} className="f-paper ink" />
              <rect x={374} y={128} width={108} height={10} className="f-paper ink" />
              {[0, 1, 3].map((i) => (
                <g key={i}>
                  <rect x={388} y={146 + i * 33} width={80} height={27} rx={2} className="f-paper ink2" />
                  <rect x={444} y={157 + i * 33} width={16} height={5} rx={2} className="f-ink" />
                </g>
              ))}
              <g className={cn("job-drawer", frame >= 18 && "out")}>
                <rect x={422} y={216} width={46} height={19} className="f-paper ink2" />
                <rect x={388} y={212} width={80} height={27} rx={2} className="f-paper ink2" />
                <rect x={444} y={223} width={16} height={5} rx={2} className="f-ink" />
                <text x={412} y={231}>{`0${data.numeral}`}</text>
              </g>
              <Chip cx={430} y={294} text={`POSTGRESQL · ${data.numeral}`} />
            </PartG>

            {/* the Redis conveyor */}
            <PartG part={PARTS[3]} onJump={jump} onHot={setHot}>
              <line x1={535} y1={262} x2={535} y2={282} className="ink" />
              <line x1={635} y1={262} x2={635} y2={282} className="ink" />
              <rect x={515} y={236} width={140} height={26} rx={13} className="f-paper ink" />
              <circle cx={528} cy={249} r={7} className="f-ink" />
              <circle cx={642} cy={249} r={7} className="f-ink" />
              {[550, 575, 600, 620].map((x) => <line key={x} x1={x} y1={239} x2={x - 6} y2={259} className="ink2" />)}
              {[[540, -6], [575, 4], [610, -3]].map(([x, r]) => (
                <g key={x} transform={`translate(${x} 217) rotate(${r})`}>
                  <rect width={30} height={18} rx={2} className="f-yellow ink2" />
                  <line x1={6} y1={6} x2={24} y2={6} className="ink2" />
                  <line x1={6} y1={12} x2={18} y2={12} className="ink2" />
                </g>
              ))}
              <Chip cx={590} y={294} text="REDIS JOB QUEUES" />
            </PartG>

            {/* the GKE hex platform */}
            <PartG part={PARTS[2]} onJump={jump} onHot={setHot}>
              <polygon points="675,226 717,170 793,170 835,226 793,282 717,282" className="f-cel ink" />
              {[182, 212].map((y) => [721, 751, 781].map((x) => <Pod key={`${x}-${y}`} x={x} y={y} />))}
              {hpa ? Array.from({ length: SPARES }, (_, i) => <Pod key={`s${i}`} x={721 + i * 30} y={242} spare />) : null}
              <path d="M751 181 L754 171 L758 177 L762 168 L766 177 L770 171 L773 181 Z" className="f-yellow ink2" />
              <Chip cx={758} y={294} text="GKE AUTOPILOT" />
            </PartG>

            {/* the torii gateway with its WAF shield */}
            <PartG part={PARTS[1]} onJump={jump} onHot={setHot}>
              <rect x={890} y={148} width={14} height={134} className="f-shu ink" />
              <rect x={956} y={148} width={14} height={134} className="f-shu ink" />
              <rect x={880} y={166} width={100} height={10} className="f-shu ink" />
              <path d="M868 142 Q930 124 992 142 L992 132 Q930 114 868 132 Z" className="f-shu ink" />
              <path d="M930 194 L952 202 V220 Q952 240 930 250 Q908 240 908 220 V202 Z" className="f-yellow ink" />
              <path d="M920 220 L927 228 L941 212" className="f-none ink" />
              <Chip cx={930} y={294} text="WAF · GATEWAY" />
            </PartG>

            {/* nine client clouds */}
            <PartG part={PARTS[0]} onJump={jump} onHot={setHot}>
              {[[1030, 160], [1080, 160], [1130, 160], [1038, 200], [1088, 200], [1138, 200], [1030, 240], [1080, 240], [1130, 240]].map(([x, y]) => <Cloud key={`${x}-${y}`} x={x} y={y} />)}
              <Chip cx={1104} y={294} text={`${integrations.numeral} CLIENT PLATFORMS`} />
            </PartG>

            {/* the request */}
            <PartG part={planePart} transform={`translate(${plane.x.toFixed(1)} ${plane.y.toFixed(1)})`} onJump={jump} onHot={setHot}>
              {running ? <g className="job-motion"><line x1={40} y1={-8} x2={62} y2={-10} className="ink2" /><line x1={38} y1={2} x2={70} y2={2} className="ink2" /><line x1={40} y1={12} x2={58} y2={13} className="ink2" /></g> : null}
              <g transform={`rotate(${plane.tilt.toFixed(1)})`} className="job-plane">
                <polygon points="0,0 34,-12 26,0 34,12" className="f-paper ink" />
                <line x1={0} y1={0} x2={26} y2={0} className="ink2" />
              </g>
            </PartG>

            {hotPart ? <Bubble part={hotPart} /> : null}
          </svg>

          {sfx ? <span key={sfx.romaji} className="job-over job-sfx" style={{ left: sfx.left, top: sfx.top }}><Sfx romaji={sfx.romaji}>{sfx.jp}</Sfx></span> : null}
          {hpa ? <span className="job-over job-hpa" style={{ left: "63%", top: "28%" }}><Caption>HPA +{SPARES} · DEMO</Caption></span> : null}
          {done ? <span className="job-over job-hanko" aria-hidden="true" style={{ left: "9%", top: "22%" }}><Hanko>200 OK</Hanko></span> : null}
        </div>
      </div>

      <div className="job-controls">
        <button type="button" className="btn btn-red job-send" onClick={send}>Send a request ▶</button>
        <label className="job-timeline">
          <span className="mono-label">Timeline</span>
          <input type="range" min={0} max={LAST} step={1} value={frame} aria-label="Scrub the request" aria-valuetext={`frame ${frame} of ${LAST}${lastHop ? ` · ${lastHop.name}` : ""}`} onChange={(e) => scrub(+e.target.value)} />
        </label>
        <p className="job-status mono-label" role="status" aria-live="polite">{status}</p>
      </div>

      <div className="job-log-wrap">
        {log.length ? (
          <ol className="job-log" aria-label="Request log">
            {log.map((h) => <li key={h.f}>{h.line}</li>)}
          </ol>
        ) : (
          <p className="job-log job-log-empty" aria-label="Request log">log · empty · send a request or drag the timeline</p>
        )}
      </div>
    </div>
  );
}
