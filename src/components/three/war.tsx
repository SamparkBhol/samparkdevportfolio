"use client";
import { useEffect, useMemo, useRef } from "react";
import { useFrame } from "@react-three/fiber";
import {
  AdditiveBlending,
  BufferGeometry,
  BufferAttribute,
  CanvasTexture,
  Points,
  ShaderMaterial,
  Vector3,
  type PointLight,
  type Mesh,
} from "three";

/* ============================================================================
   THE WAR BELOW THE DRAGON
   Real textured VFX (not boxes): a GPU particle FIREBREATH emitted from the
   dragon's rigged mouth bone, drifting smoke, an arrow volley, and two armies
   of hand-drawn (canvas) billboard soldier sprites marching to clash — plus a
   burning, smoking village glow. Every layer is ONE Points draw call.

   Shared signals (written by DragonScene's DragonModel each frame):
     dragonMouth — world position of the maw (fire spawns here)
     dragonAim   — unit direction the head points (forward gaze)
   ========================================================================== */

export const dragonMouth = { x: 0, y: 3, z: 0 };
export const dragonAim = { x: 0, y: -1, z: 0 };

const GROUND_Y = -3;
const FIELD = new Vector3(0, GROUND_Y + 0.6, 0); // where the breath strikes

/* ----------------------------- canvas textures ---------------------------- */

function radialTexture(stops: [number, string][], size = 64): CanvasTexture {
  const c = document.createElement("canvas");
  c.width = c.height = size;
  const ctx = c.getContext("2d")!;
  const g = ctx.createRadialGradient(size / 2, size / 2, 0, size / 2, size / 2, size / 2);
  for (const [o, col] of stops) g.addColorStop(o, col);
  ctx.fillStyle = g;
  ctx.fillRect(0, 0, size, size);
  const t = new CanvasTexture(c);
  t.needsUpdate = true;
  return t;
}

const FLAME_STOPS: [number, string][] = [
  // tight white-hot core that falls off fast → with bloom this fuses into a
  // continuous flame jet instead of reading as discrete soft discs.
  [0, "rgba(255,255,250,1)"],
  [0.12, "rgba(255,236,170,1)"],
  [0.3, "rgba(255,150,46,0.85)"],
  [0.55, "rgba(214,70,12,0.34)"],
  [0.78, "rgba(120,28,4,0.1)"],
  [1, "rgba(60,12,0,0)"],
];
const SMOKE_STOPS: [number, string][] = [
  [0, "rgba(64,64,72,0.5)"],
  [0.5, "rgba(40,40,48,0.28)"],
  [1, "rgba(18,18,22,0)"],
];

/* a side-on hoplite: dark silhouette + faction shield, plume & spear. */
function soldierTexture(faction: string): CanvasTexture {
  const S = 72;
  const c = document.createElement("canvas");
  c.width = c.height = S;
  const ctx = c.getContext("2d")!;
  const dark = "#0b0c14";
  ctx.lineCap = "round";
  ctx.lineJoin = "round";
  // spear
  ctx.strokeStyle = dark;
  ctx.lineWidth = 3;
  ctx.beginPath();
  ctx.moveTo(50, 12);
  ctx.lineTo(50, 64);
  ctx.stroke();
  ctx.fillStyle = dark;
  ctx.beginPath(); // spear tip
  ctx.moveTo(50, 6);
  ctx.lineTo(45, 16);
  ctx.lineTo(55, 16);
  ctx.closePath();
  ctx.fill();
  // legs
  ctx.fillRect(27, 50, 5, 16);
  ctx.fillRect(36, 50, 5, 16);
  // torso
  ctx.fillStyle = dark;
  ctx.fillRect(25, 28, 18, 24);
  // head + helmet
  ctx.beginPath();
  ctx.arc(34, 20, 8, 0, Math.PI * 2);
  ctx.fill();
  // faction plume
  ctx.fillStyle = faction;
  ctx.fillRect(30, 7, 9, 5);
  // shield (faction) with dark rim + boss
  ctx.beginPath();
  ctx.arc(22, 38, 11, 0, Math.PI * 2);
  ctx.fillStyle = faction;
  ctx.fill();
  ctx.lineWidth = 3;
  ctx.strokeStyle = dark;
  ctx.stroke();
  ctx.beginPath();
  ctx.arc(22, 38, 3.2, 0, Math.PI * 2);
  ctx.fillStyle = dark;
  ctx.fill();
  const t = new CanvasTexture(c);
  t.needsUpdate = true;
  return t;
}

/* --------------------------- point shader material ------------------------ */
/* size-attenuated, textured billboard points. `additive` for fire/arrows;
   opaque alphaTest for soldiers so they occlude correctly. */
function makePointMaterial(map: CanvasTexture, opts: { additive?: boolean; soldier?: boolean }) {
  const mat = new ShaderMaterial({
    uniforms: { map: { value: map }, uScale: { value: 340 } },
    transparent: true,
    depthWrite: opts.soldier ? true : false,
    vertexShader: `
      attribute float size;
      attribute float alpha;
      varying float vAlpha;
      uniform float uScale;
      void main() {
        vAlpha = alpha;
        vec4 mv = modelViewMatrix * vec4(position, 1.0);
        gl_PointSize = min(size * (uScale / -mv.z), 90.0);
        gl_Position = projectionMatrix * mv;
      }
    `,
    fragmentShader: `
      uniform sampler2D map;
      varying float vAlpha;
      void main() {
        vec4 t = texture2D(map, gl_PointCoord);
        ${opts.soldier ? "if (t.a < 0.5) discard; gl_FragColor = vec4(t.rgb, t.a);" : "if (t.a < 0.02) discard; gl_FragColor = vec4(t.rgb, t.a * vAlpha);"}
      }
    `,
  });
  // set blending explicitly (avoid passing `undefined` which warns in three)
  if (opts.additive) mat.blending = AdditiveBlending;
  return mat;
}

/* ------------------------------- firebreath ------------------------------- */
const MAX_FIRE = 520;
const MAX_SMOKE = 90;

export function Firebreath() {
  const flameTex = useMemo(() => radialTexture(FLAME_STOPS), []);
  const smokeTex = useMemo(() => radialTexture(SMOKE_STOPS), []);
  const light = useRef<PointLight>(null);
  const scorch = useRef<Mesh>(null);

  const fire = useMemo(() => {
    const g = new BufferGeometry();
    g.setAttribute("position", new BufferAttribute(new Float32Array(MAX_FIRE * 3), 3));
    g.setAttribute("size", new BufferAttribute(new Float32Array(MAX_FIRE), 1));
    g.setAttribute("alpha", new BufferAttribute(new Float32Array(MAX_FIRE), 1));
    return new Points(g, makePointMaterial(flameTex, { additive: true }));
  }, [flameTex]);

  const smoke = useMemo(() => {
    const g = new BufferGeometry();
    g.setAttribute("position", new BufferAttribute(new Float32Array(MAX_SMOKE * 3), 3));
    g.setAttribute("size", new BufferAttribute(new Float32Array(MAX_SMOKE), 1));
    g.setAttribute("alpha", new BufferAttribute(new Float32Array(MAX_SMOKE), 1));
    return new Points(g, makePointMaterial(smokeTex, { additive: false }));
  }, [smokeTex]);

  // particle pools
  const F = useMemo(
    () => ({
      px: new Float32Array(MAX_FIRE), py: new Float32Array(MAX_FIRE), pz: new Float32Array(MAX_FIRE),
      vx: new Float32Array(MAX_FIRE), vy: new Float32Array(MAX_FIRE), vz: new Float32Array(MAX_FIRE),
      age: new Float32Array(MAX_FIRE), life: new Float32Array(MAX_FIRE), seed: new Float32Array(MAX_FIRE),
      cursor: 0,
    }),
    [],
  );
  const S = useMemo(
    () => ({
      px: new Float32Array(MAX_SMOKE), py: new Float32Array(MAX_SMOKE), pz: new Float32Array(MAX_SMOKE),
      vx: new Float32Array(MAX_SMOKE), vy: new Float32Array(MAX_SMOKE), vz: new Float32Array(MAX_SMOKE),
      age: new Float32Array(MAX_SMOKE), life: new Float32Array(MAX_SMOKE),
      cursor: 0,
    }),
    [],
  );
  const aim = useMemo(() => new Vector3(), []);

  useEffect(() => {
    return () => {
      fire.geometry.dispose();
      (fire.material as ShaderMaterial).dispose();
      smoke.geometry.dispose();
      (smoke.material as ShaderMaterial).dispose();
      flameTex.dispose();
      smokeTex.dispose();
    };
  }, [fire, smoke, flameTex, smokeTex]);

  useFrame((state, dtRaw) => {
    const dt = Math.min(0.05, dtRaw);
    const t = state.clock.elapsedTime;
    // breathe in bursts: ~1.6s on every ~6s
    const cyc = t % 6;
    const breathing = cyc < 1.7;
    const intensity = breathing ? Math.sin((cyc / 1.7) * Math.PI) : 0; // 0→1→0

    // aim from the maw down at the battlefield (so it always strafes the field)
    aim.set(FIELD.x - dragonMouth.x, FIELD.y - dragonMouth.y, FIELD.z - dragonMouth.z).normalize();

    // ---- emit fire while breathing: many small, fast, short-lived embers tight
    // to the aim axis → a dense jet, not a sparse string of blobs ----
    if (intensity > 0.05) {
      // dense emission + varied speed → particles overlap along the axis into a
      // continuous jet (with bloom) rather than a dotted line.
      const emit = Math.round(60 * intensity);
      for (let n = 0; n < emit; n++) {
        const i = F.cursor++ % MAX_FIRE;
        F.px[i] = dragonMouth.x + (Math.random() - 0.5) * 0.1;
        F.py[i] = dragonMouth.y + (Math.random() - 0.5) * 0.1;
        F.pz[i] = dragonMouth.z + (Math.random() - 0.5) * 0.1;
        // wide speed range fills the gaps between fast leaders & slow trailers
        const spd = 6 + Math.random() * 12;
        const spread = 0.7;
        F.vx[i] = aim.x * spd + (Math.random() - 0.5) * spread;
        F.vy[i] = aim.y * spd + (Math.random() - 0.5) * spread;
        F.vz[i] = aim.z * spd + (Math.random() - 0.5) * spread;
        F.age[i] = 0;
        F.life[i] = 0.3 + Math.random() * 0.45;
        F.seed[i] = 0.35 + Math.random() * 0.6;
      }
    }
    // ---- update + write fire ----
    const fp = fire.geometry.attributes.position.array as Float32Array;
    const fs = fire.geometry.attributes.size.array as Float32Array;
    const fa = fire.geometry.attributes.alpha.array as Float32Array;
    for (let i = 0; i < MAX_FIRE; i++) {
      if (F.age[i] < F.life[i]) {
        F.age[i] += dt;
        F.vy[i] += dt * 1.4; // hot gas lifts late
        F.vx[i] *= 0.96; F.vz[i] *= 0.96;
        F.px[i] += F.vx[i] * dt;
        F.py[i] += F.vy[i] * dt;
        F.pz[i] += F.vz[i] * dt;
        const k = F.age[i] / F.life[i];
        // grow modestly (was up to ~3.0 → fat discs); keep embers small + bright
        fs[i] = (0.35 + k * 1.0) * F.seed[i];
        fa[i] = (1 - k) * (1 - k);
      } else {
        fa[i] = 0;
      }
      fp[i * 3] = F.px[i]; fp[i * 3 + 1] = F.py[i]; fp[i * 3 + 2] = F.pz[i];
    }
    fire.geometry.attributes.position.needsUpdate = true;
    fire.geometry.attributes.size.needsUpdate = true;
    fire.geometry.attributes.alpha.needsUpdate = true;

    // ---- smoke: emit near the impact while breathing, rises + spreads ----
    if (intensity > 0.1 && Math.random() < 0.6) {
      const i = S.cursor++ % MAX_SMOKE;
      S.px[i] = FIELD.x + (Math.random() - 0.5) * 3;
      S.py[i] = FIELD.y + 0.3;
      S.pz[i] = FIELD.z + (Math.random() - 0.5) * 3;
      S.vx[i] = (Math.random() - 0.5) * 0.8;
      S.vy[i] = 0.9 + Math.random() * 0.7;
      S.vz[i] = (Math.random() - 0.5) * 0.8;
      S.age[i] = 0;
      S.life[i] = 2.5 + Math.random() * 1.8;
    }
    const sp = smoke.geometry.attributes.position.array as Float32Array;
    const ss = smoke.geometry.attributes.size.array as Float32Array;
    const sa = smoke.geometry.attributes.alpha.array as Float32Array;
    for (let i = 0; i < MAX_SMOKE; i++) {
      if (S.age[i] < S.life[i]) {
        S.age[i] += dt;
        S.px[i] += S.vx[i] * dt;
        S.py[i] += S.vy[i] * dt;
        S.pz[i] += S.vz[i] * dt;
        const k = S.age[i] / S.life[i];
        ss[i] = 1.4 + k * 3.6;
        sa[i] = Math.sin(k * Math.PI) * 0.5;
      } else {
        sa[i] = 0;
      }
      sp[i * 3] = S.px[i]; sp[i * 3 + 1] = S.py[i]; sp[i * 3 + 2] = S.pz[i];
    }
    smoke.geometry.attributes.position.needsUpdate = true;
    smoke.geometry.attributes.size.needsUpdate = true;
    smoke.geometry.attributes.alpha.needsUpdate = true;

    // impact light + scorch glow pulse
    if (light.current) {
      light.current.position.set(FIELD.x, FIELD.y + 0.4, FIELD.z);
      light.current.intensity = 6 + intensity * 60;
    }
    if (scorch.current) {
      const m = scorch.current.material as { opacity: number };
      m.opacity = 0.25 + intensity * 0.5;
      const s = 2.2 + intensity * 1.6;
      scorch.current.scale.set(s, s, s);
    }
  });

  return (
    <>
      <primitive object={fire} />
      <primitive object={smoke} />
      <pointLight ref={light} color="#ff7a1c" intensity={6} distance={26} decay={2} />
      {/* scorched glow disc on the ground where the fire lands */}
      <mesh ref={scorch} position={[FIELD.x, GROUND_Y + 0.06, FIELD.z]} rotation={[-Math.PI / 2, 0, 0]}>
        <circleGeometry args={[1, 32]} />
        <meshBasicMaterial color="#ff6a1c" transparent opacity={0.3} toneMapped={false} depthWrite={false} />
      </mesh>
    </>
  );
}

/* ------------------------------- sprite army ------------------------------ */
const ARMY = 16;

type Soldier = { spawnX: number; clashX: number; lane: number; phase: number; speed: number; bob: number; size: number };
function makeArmy(side: number): Soldier[] {
  return Array.from({ length: ARMY }, () => ({
    spawnX: side * (6 + Math.random() * 5),
    clashX: side * (0.6 + Math.random() * 1.8),
    lane: (Math.random() - 0.5) * 9,
    phase: Math.random(),
    speed: 0.03 + Math.random() * 0.03,
    bob: Math.random() * Math.PI * 2,
    size: 1.5 + Math.random() * 0.5,
  }));
}

function Army({ faction, side }: { faction: string; side: number }) {
  const tex = useMemo(() => soldierTexture(faction), [faction]);
  const troops = useMemo(() => makeArmy(side), [side]);
  const points = useMemo(() => {
    const g = new BufferGeometry();
    g.setAttribute("position", new BufferAttribute(new Float32Array(ARMY * 3), 3));
    g.setAttribute("size", new BufferAttribute(new Float32Array(ARMY), 1));
    g.setAttribute("alpha", new BufferAttribute(new Float32Array(ARMY).fill(1), 1));
    return new Points(g, makePointMaterial(tex, { soldier: true }));
  }, [tex]);

  useEffect(() => {
    return () => {
      points.geometry.dispose();
      (points.material as ShaderMaterial).dispose();
      tex.dispose();
    };
  }, [points, tex]);

  useFrame((state) => {
    const t = state.clock.elapsedTime;
    const p = points.geometry.attributes.position.array as Float32Array;
    const sz = points.geometry.attributes.size.array as Float32Array;
    for (let i = 0; i < ARMY; i++) {
      const tr = troops[i];
      const prog = (t * tr.speed + tr.phase) % 1;
      const x = tr.spawnX + (tr.clashX - tr.spawnX) * prog;
      const y = GROUND_Y + 0.55 + Math.abs(Math.sin(t * 6 + tr.bob)) * 0.12;
      p[i * 3] = x;
      p[i * 3 + 1] = y;
      p[i * 3 + 2] = tr.lane;
      sz[i] = tr.size;
    }
    points.geometry.attributes.position.needsUpdate = true;
    points.geometry.attributes.size.needsUpdate = true;
  });

  return <primitive object={points} />;
}

/* --------------------------------- arrows --------------------------------- */
const ARROWS = 12;
function ArrowVolley() {
  const tex = useMemo(
    () =>
      radialTexture(
        [
          [0, "rgba(255,240,200,1)"],
          [0.5, "rgba(255,180,90,0.7)"],
          [1, "rgba(255,140,40,0)"],
        ],
        32,
      ),
    [],
  );
  const balls = useMemo(
    () =>
      Array.from({ length: ARROWS }, (_, i) => ({
        side: i % 2 === 0 ? -1 : 1,
        lane: (Math.random() - 0.5) * 8,
        phase: i / ARROWS,
        speed: 0.16 + Math.random() * 0.1,
        arc: 4 + Math.random() * 3,
        size: 0.5 + Math.random() * 0.5,
      })),
    [],
  );
  const points = useMemo(() => {
    const g = new BufferGeometry();
    g.setAttribute("position", new BufferAttribute(new Float32Array(ARROWS * 3), 3));
    g.setAttribute("size", new BufferAttribute(new Float32Array(ARROWS), 1));
    g.setAttribute("alpha", new BufferAttribute(new Float32Array(ARROWS).fill(1), 1));
    return new Points(g, makePointMaterial(tex, { additive: true }));
  }, [tex]);

  useEffect(() => {
    return () => {
      points.geometry.dispose();
      (points.material as ShaderMaterial).dispose();
      tex.dispose();
    };
  }, [points, tex]);

  useFrame((state) => {
    const t = state.clock.elapsedTime;
    const p = points.geometry.attributes.position.array as Float32Array;
    const sz = points.geometry.attributes.size.array as Float32Array;
    const al = points.geometry.attributes.alpha.array as Float32Array;
    for (let i = 0; i < ARROWS; i++) {
      const b = balls[i];
      const prog = (t * b.speed + b.phase) % 1;
      const x0 = b.side * 8;
      const x1 = -b.side * 7;
      p[i * 3] = x0 + (x1 - x0) * prog;
      p[i * 3 + 1] = GROUND_Y + 0.4 + Math.sin(prog * Math.PI) * b.arc;
      p[i * 3 + 2] = b.lane;
      sz[i] = b.size;
      al[i] = Math.sin(prog * Math.PI);
    }
    points.geometry.attributes.position.needsUpdate = true;
    points.geometry.attributes.size.needsUpdate = true;
    points.geometry.attributes.alpha.needsUpdate = true;
  });

  return <primitive object={points} />;
}

/* --------------------------- burning village fires ------------------------ */
const PYRES: [number, number][] = [[-4.5, 2.5], [3.8, -2], [6.5, 1.5], [-7, -1]];
const PER = 18;
const MAX_PYRE = PYRES.length * PER;
function Pyres() {
  const tex = useMemo(() => radialTexture(FLAME_STOPS), []);
  const points = useMemo(() => {
    const g = new BufferGeometry();
    g.setAttribute("position", new BufferAttribute(new Float32Array(MAX_PYRE * 3), 3));
    g.setAttribute("size", new BufferAttribute(new Float32Array(MAX_PYRE), 1));
    g.setAttribute("alpha", new BufferAttribute(new Float32Array(MAX_PYRE), 1));
    return new Points(g, makePointMaterial(tex, { additive: true }));
  }, [tex]);
  const seed = useMemo(() => Array.from({ length: MAX_PYRE }, () => Math.random()), []);

  useEffect(() => {
    return () => {
      points.geometry.dispose();
      (points.material as ShaderMaterial).dispose();
      tex.dispose();
    };
  }, [points, tex]);

  useFrame((state) => {
    const t = state.clock.elapsedTime;
    const p = points.geometry.attributes.position.array as Float32Array;
    const sz = points.geometry.attributes.size.array as Float32Array;
    const al = points.geometry.attributes.alpha.array as Float32Array;
    let idx = 0;
    for (let f = 0; f < PYRES.length; f++) {
      const [cx, cz] = PYRES[f];
      for (let j = 0; j < PER; j++) {
        const s = seed[idx];
        const k = (t * (0.6 + s * 0.5) + s) % 1; // 0→1 rising loop
        p[idx * 3] = cx + Math.sin((s + t) * 3) * 0.3;
        p[idx * 3 + 1] = GROUND_Y + 0.2 + k * 1.6;
        p[idx * 3 + 2] = cz + Math.cos((s + t) * 3) * 0.3;
        sz[idx] = (0.5 + (1 - k) * 1.3) * (0.7 + s * 0.6);
        al[idx] = (1 - k) * 0.9;
        idx++;
      }
    }
    points.geometry.attributes.position.needsUpdate = true;
    points.geometry.attributes.size.needsUpdate = true;
    points.geometry.attributes.alpha.needsUpdate = true;
  });

  return (
    <>
      <primitive object={points} />
      {PYRES.map(([x, z], i) => (
        <pointLight key={i} position={[x, GROUND_Y + 0.8, z]} color="#ff7a2c" intensity={3.5} distance={7} decay={2} />
      ))}
    </>
  );
}

/* -------------------------------- the field ------------------------------- */
export function Battle() {
  return (
    <group>
      <Army faction="#ff3b3b" side={-1} />
      <Army faction="#00e5ff" side={1} />
      <ArrowVolley />
      <Pyres />
      {/* faction banners marking the lines */}
      <Banner x={-7} z={-1} color="#ff3b3b" />
      <Banner x={7} z={1} color="#00e5ff" />
    </group>
  );
}

function Banner({ x, z, color }: { x: number; z: number; color: string }) {
  const flag = useRef<Mesh>(null);
  useFrame((s) => {
    if (flag.current) flag.current.rotation.y = Math.sin(s.clock.elapsedTime * 2 + x) * 0.3;
  });
  return (
    <group position={[x, GROUND_Y, z]}>
      <mesh position={[0, 1.2, 0]}>
        <cylinderGeometry args={[0.045, 0.045, 2.6, 6]} />
        <meshStandardMaterial color="#0a0a0a" roughness={1} />
      </mesh>
      <mesh ref={flag} position={[0.5, 2.1, 0]}>
        <planeGeometry args={[1, 0.6]} />
        <meshStandardMaterial color={color} emissive={color} emissiveIntensity={0.6} side={2} roughness={1} />
      </mesh>
    </group>
  );
}
