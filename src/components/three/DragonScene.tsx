"use client";
import { Suspense, useEffect, useMemo, useRef } from "react";
import { Canvas, useFrame } from "@react-three/fiber";
import { useGLTF, useAnimations, Environment, Stars, Sparkles } from "@react-three/drei";
import { EffectComposer, Bloom, Vignette, ChromaticAberration } from "@react-three/postprocessing";
import { KernelSize } from "postprocessing";
import {
  ACESFilmicToneMapping,
  AdditiveBlending,
  DoubleSide,
  MeshStandardMaterial,
  Vector3,
  type Group,
  type Mesh,
  type Object3D,
  type PointLight,
} from "three";
import { Battle, Firebreath, dragonMouth, dragonAim } from "./war";

const DRAGON = "/models/dragon.glb";

// Shared scroll-velocity signal (−1..1) so the dragon reacts to how you scroll.
const scrollV = { v: 0 };
// reusable temporaries for reading bone world transforms (no per-frame alloc)
const tmpA = new Vector3();
const tmpB = new Vector3();

/* ---- Dragon: rigged, flies with a glide/flap cadence, circling above the realm ---- */
function DragonModel() {
  const g = useRef<Group>(null);
  const { scene, animations } = useGLTF(DRAGON);
  const { actions, names } = useAnimations(animations, g);
  const mouth = useRef<Object3D | null>(null);
  const mouthTip = useRef<Object3D | null>(null);
  const head = useRef<Object3D | null>(null);

  useEffect(() => {
    scene.traverse((o) => {
      const m = o as Mesh;
      if (!m.isMesh) return;
      m.frustumCulled = false;
      const mat = m.material as MeshStandardMaterial | undefined;
      if (mat) { mat.envMapIntensity = 0.9; mat.needsUpdate = true; }
    });
    // grab the rigged maw bones so fire can erupt from the real mouth
    mouth.current = scene.getObjectByName("mouth_lower") ?? scene.getObjectByName("head") ?? null;
    mouthTip.current = scene.getObjectByName("mouth_upper_tip") ?? null;
    head.current = scene.getObjectByName("head") ?? null;

    const glide = actions["Fly Glide"];
    const flap = actions["Fly Flap"];
    const base = glide ?? flap ?? actions["Idle"] ?? actions[names[0]];
    if (base) { base.reset().fadeIn(0.6).play(); base.timeScale = 0.8; }
    let timer: ReturnType<typeof setTimeout> | null = null;
    if (glide && flap) {
      flap.timeScale = 1.15;
      let onGlide = true;
      const cycle = () => {
        if (onGlide) {
          glide.fadeOut(0.5); flap.reset().fadeIn(0.5).play();
          onGlide = false; timer = setTimeout(cycle, 2200);
        } else {
          flap.fadeOut(0.9); glide.reset().fadeIn(0.9).play();
          onGlide = true; timer = setTimeout(cycle, 9000);
        }
      };
      timer = setTimeout(cycle, 6500);
    }
    return () => {
      if (timer) clearTimeout(timer);
      glide?.fadeOut(0.3); flap?.fadeOut(0.3);
      if (base && base !== glide && base !== flap) base.fadeOut(0.3);
    };
  }, [actions, names, scene]);

  // circle high above the village, banking into the turn
  const orbit = useRef(0);
  useFrame((s, delta) => {
    if (!g.current) return;
    orbit.current += delta * (0.18 + Math.abs(scrollV.v) * 0.5);
    const t = orbit.current;
    g.current.position.set(Math.cos(t) * 5.5, 3 + Math.sin(t * 2) * 0.4, Math.sin(t) * 5.5);
    g.current.rotation.y = -t + Math.PI / 2;
    g.current.rotation.z = 0.25 + scrollV.v * 0.7; // bank with scroll

    // publish the real mouth-bone world position for the firebreath
    if (mouth.current) {
      mouth.current.getWorldPosition(tmpA);
      dragonMouth.x = tmpA.x; dragonMouth.y = tmpA.y; dragonMouth.z = tmpA.z;
    }
    // publish the gaze direction (head → mouth tip)
    if (mouthTip.current && head.current) {
      mouthTip.current.getWorldPosition(tmpA);
      head.current.getWorldPosition(tmpB);
      tmpA.sub(tmpB).normalize();
      dragonAim.x = tmpA.x; dragonAim.y = tmpA.y; dragonAim.z = tmpA.z;
    }
  });

  return (
    <group ref={g}>
      <primitive object={scene} scale={1.5} />
    </group>
  );
}
useGLTF.preload(DRAGON);

/* ---- Low-poly moonlit medieval village (cheap silhouettes in the fog) ---- */
function Village() {
  const houses = useMemo(() => {
    const a: { x: number; z: number; w: number; h: number; d: number; rot: number }[] = [];
    for (let i = 0; i < 30; i++) {
      a.push({
        x: (Math.random() - 0.5) * 17,
        z: (Math.random() - 0.5) * 11 - 1,
        w: 0.8 + Math.random() * 0.9,
        h: 0.8 + Math.random() * 1.5,
        d: 0.8 + Math.random() * 0.9,
        rot: Math.random() * Math.PI,
      });
    }
    return a;
  }, []);
  const towers: [number, number, number][] = [[-6.5, -3, 3.6], [5.5, -4, 3.2], [0.5, 2.5, 4]];

  const winMats = useMemo(() => {
    const tints = ["#ffb347", "#ffcf6b", "#ff9e57", "#ffd98a", "#ffbe5c"];
    return tints.map(
      (c) => new MeshStandardMaterial({ color: "#241808", emissive: c, emissiveIntensity: 1.2, toneMapped: false, roughness: 1 }),
    );
  }, []);
  useFrame((s) => {
    const t = s.clock.elapsedTime;
    for (let i = 0; i < winMats.length; i++) {
      const base = 0.85 + Math.sin(t * (1.6 + i * 0.6) + i * 1.3) * 0.35;
      const candle = Math.sin(t * 11 + i * 2.1) > 0.9 ? 0.7 : 0;
      winMats[i].emissiveIntensity = base + candle;
    }
  });

  return (
    <group position={[0, -3, 0]}>
      <pointLight position={[0, 1.2, 0]} color="#ffa64d" intensity={9} distance={24} decay={1.4} />
      <mesh rotation={[-Math.PI / 2, 0, 0]}>
        <planeGeometry args={[80, 80]} />
        <meshStandardMaterial color="#0e1322" roughness={1} metalness={0} />
      </mesh>
      {houses.map((h, i) => {
        const front = h.d / 2 + 0.02;
        return (
          <group key={i} position={[h.x, h.h / 2, h.z]} rotation={[0, h.rot, 0]}>
            <mesh><boxGeometry args={[h.w, h.h, h.d]} /><meshStandardMaterial color="#222637" roughness={0.92} /></mesh>
            <mesh position={[0, h.h / 2 + h.w * 0.35, 0]}>
              <coneGeometry args={[h.w * 0.8, h.w * 0.7, 4]} />
              <meshStandardMaterial color="#3a2230" roughness={0.9} />
            </mesh>
            <mesh position={[-h.w * 0.22, -h.h * 0.05, front]} material={winMats[i % winMats.length]}>
              <planeGeometry args={[h.w * 0.2, h.h * 0.22]} />
            </mesh>
            <mesh position={[h.w * 0.22, h.h * 0.14, front]} material={winMats[(i + 2) % winMats.length]}>
              <planeGeometry args={[h.w * 0.2, h.h * 0.22]} />
            </mesh>
          </group>
        );
      })}
      {towers.map(([x, z, th], i) => (
        <group key={`t${i}`} position={[x, th / 2, z]}>
          <mesh><boxGeometry args={[1, th, 1]} /><meshStandardMaterial color="#1b1d24" roughness={1} /></mesh>
          <mesh position={[0, th / 2 + 0.7, 0]}>
            <coneGeometry args={[0.85, 1.4, 4]} />
            <meshStandardMaterial color="#14151b" roughness={1} />
          </mesh>
          <mesh position={[0, th * 0.18, 0.51]} material={winMats[i % winMats.length]}>
            <planeGeometry args={[0.26, 0.4]} />
          </mesh>
          <mesh position={[0, -th * 0.12, 0.51]} material={winMats[(i + 3) % winMats.length]}>
            <planeGeometry args={[0.26, 0.4]} />
          </mesh>
        </group>
      ))}
    </group>
  );
}

/* ---- Distant mountain silhouettes: layered ridges, cool moonlit tint so they
   read as depth against the indigo sky instead of a flat black blob ---- */
function Mountains() {
  // back ridge (faint, blue) + front ridge (darker) for parallax depth
  const back: [number, number, number][] = [[-14, 12, -4], [-2, 15, -6], [8, 13, -5], [16, 11, -7]];
  const front: [number, number, number][] = [[-10, 9, 0], [-1, 11, -1], [7, 10, 0], [13, 8, -2]];
  return (
    <group position={[0, -3, -17]}>
      {back.map(([x, h, dz], i) => (
        <mesh key={`b${i}`} position={[x, h / 2, dz]}>
          <coneGeometry args={[h * 0.8, h, 4]} />
          <meshStandardMaterial color="#161d33" roughness={1} />
        </mesh>
      ))}
      {front.map(([x, h, dz], i) => (
        <mesh key={`f${i}`} position={[x, h / 2, dz]}>
          <coneGeometry args={[h * 0.75, h, 4]} />
          <meshStandardMaterial color="#0c1020" roughness={1} />
        </mesh>
      ))}
    </group>
  );
}

/* ---- Pale moon (unlit so fog/tone-mapping never dims it).
       SECRET: knock 3× to unlock Codex Fragment II (The Dragon). ---- */
function Moon() {
  const knocks = useRef(0);
  const onKnock = (e: { stopPropagation: () => void }) => {
    e.stopPropagation();
    knocks.current += 1;
    if (knocks.current >= 3) {
      knocks.current = 0;
      if (typeof window !== "undefined") {
        window.dispatchEvent(new CustomEvent("lore-found", { detail: "dragon" }));
      }
    }
  };
  return (
    <group position={[-15, 16, -24]}>
      <mesh onPointerDown={onKnock}>
        <sphereGeometry args={[3, 32, 32]} />
        <meshBasicMaterial color="#e8edf7" toneMapped={false} fog={false} />
      </mesh>
      <mesh>
        <sphereGeometry args={[4.6, 24, 24]} />
        <meshBasicMaterial color="#9fb6e8" transparent opacity={0.16} toneMapped={false} fog={false} />
      </mesh>
    </group>
  );
}

/* ---- Aurora: two large additive curtains far behind the realm that slowly
   undulate. Cheap (2 planes), unlit, fogged out — pure atmosphere. ---- */
function Aurora() {
  const a = useRef<Mesh>(null);
  const b = useRef<Mesh>(null);
  useFrame((s) => {
    const t = s.clock.elapsedTime;
    if (a.current) {
      a.current.position.x = Math.sin(t * 0.05) * 4;
      (a.current.material as { opacity: number }).opacity = 0.10 + Math.sin(t * 0.3) * 0.04;
    }
    if (b.current) {
      b.current.position.x = Math.cos(t * 0.04) * 5;
      (b.current.material as { opacity: number }).opacity = 0.08 + Math.cos(t * 0.25) * 0.03;
    }
  });
  return (
    <group position={[0, 14, -34]}>
      <mesh ref={a} rotation={[0, 0, 0.1]}>
        <planeGeometry args={[44, 18]} />
        <meshBasicMaterial color="#2fd6a6" transparent opacity={0.12} blending={AdditiveBlending} depthWrite={false} side={DoubleSide} toneMapped={false} fog={false} />
      </mesh>
      <mesh ref={b} position={[6, -2, 2]} rotation={[0, 0, -0.14]}>
        <planeGeometry args={[40, 14]} />
        <meshBasicMaterial color="#5f74e0" transparent opacity={0.10} blending={AdditiveBlending} depthWrite={false} side={DoubleSide} toneMapped={false} fog={false} />
      </mesh>
    </group>
  );
}

/* ---- Ember trail: a ring of additive sprites that lag behind the dragon's maw
   (read from the live dragonMouth signal), so flight leaves a faint heat wake.
   One Points-free approach: a small pool of meshes recycled each frame. ---- */
const TRAIL = 18;
function EmberTrail() {
  const g = useRef<Group>(null);
  // history ring of recent maw positions
  const hist = useMemo(() => Array.from({ length: TRAIL }, () => new Vector3(0, 3, 0)), []);
  const cursor = useRef(0);
  useFrame(() => {
    // record current maw pos
    hist[cursor.current].set(dragonMouth.x, dragonMouth.y, dragonMouth.z);
    cursor.current = (cursor.current + 1) % TRAIL;
    const grp = g.current;
    if (!grp) return;
    for (let i = 0; i < TRAIL; i++) {
      const idx = (cursor.current + i) % TRAIL; // oldest → newest
      const m = grp.children[i] as Mesh;
      const p = hist[idx];
      m.position.set(p.x, p.y, p.z);
      const age = i / TRAIL; // 0 oldest .. 1 newest
      // small + faint: a wisp of heat-haze, not a string of beads. Newest is
      // tiniest (right at the maw); it widens slightly and fades as it trails.
      const s = 0.03 + (1 - age) * 0.12;
      m.scale.setScalar(s);
      (m.material as { opacity: number }).opacity = age * 0.16;
    }
  });
  return (
    <group ref={g}>
      {Array.from({ length: TRAIL }).map((_, i) => (
        <mesh key={i}>
          <sphereGeometry args={[1, 6, 6]} />
          <meshBasicMaterial color="#ff6a24" transparent opacity={0} blending={AdditiveBlending} depthWrite={false} toneMapped={false} />
        </mesh>
      ))}
    </group>
  );
}

/* ---- Distant heat-lightning: a sky-fill flash on rare random beats, lighting
   the clouds/mountains for a frame or two. ---- */
function SkyStorm() {
  const light = useRef<PointLight>(null);
  const next = useRef(4);
  const flash = useRef(0);
  useFrame((s, dt) => {
    const t = s.clock.elapsedTime;
    if (t > next.current) {
      flash.current = 1;
      next.current = t + 6 + Math.random() * 10; // every 6–16s
    }
    flash.current = Math.max(0, flash.current - dt * 4);
    if (light.current) {
      // a quick double-strike feel via squared falloff
      light.current.intensity = flash.current * flash.current * 90;
    }
  });
  return <pointLight ref={light} position={[-10, 20, -26]} color="#bcd0ff" intensity={0} distance={80} decay={1.2} />;
}

/* ---- Cinematic camera circling the realm, framing the battle below ---- */
function CameraRoam() {
  useFrame((s) => {
    const t = s.clock.elapsedTime * 0.06;
    s.camera.position.set(Math.sin(t) * 16, 4.4 + Math.sin(t * 0.5) * 1.2, Math.cos(t) * 16);
    s.camera.lookAt(0, 0.4, 0);
  });
  return null;
}

export default function DragonScene({ active = true }: { active?: boolean }) {
  useEffect(() => {
    let last = typeof window !== "undefined" ? window.scrollY : 0;
    let raf = 0;
    const onScroll = () => {
      const y = window.scrollY;
      scrollV.v = Math.max(-1, Math.min(1, (y - last) / 60));
      last = y;
    };
    const decay = () => { scrollV.v *= 0.9; raf = requestAnimationFrame(decay); };
    window.addEventListener("scroll", onScroll, { passive: true });
    raf = requestAnimationFrame(decay);
    return () => { window.removeEventListener("scroll", onScroll); cancelAnimationFrame(raf); };
  }, []);

  return (
    <Canvas
      frameloop={active ? "always" : "never"}
      dpr={[1, 1.6]}
      camera={{ position: [0, 5, 16], fov: 38 }}
      gl={{ antialias: true, toneMapping: ACESFilmicToneMapping, toneMappingExposure: 1.12, powerPreference: "high-performance", failIfMajorPerformanceCaveat: false }}
    >
      {/* deep indigo sky; fog tuned a touch nearer so the village reads as depth */}
      <color attach="background" args={["#070912"]} />
      <fog attach="fog" args={["#0b1024", 18, 52]} />

      {/* cinematic three-point-ish night rig:
          - cool moon key from upper-left  - faint blue fill  - warm fire bounce from below */}
      <hemisphereLight args={["#2a3a66", "#120a08", 0.45]} />
      <directionalLight position={[-9, 16, 8]} intensity={1.7} color="#cdd8ff" castShadow={false} />
      <directionalLight position={[7, 5, -9]} intensity={0.55} color="#7f9be8" />
      <pointLight position={[0, -1.5, 2]} intensity={5} distance={26} decay={1.6} color="#ff7a2c" />

      <Stars radius={130} depth={60} count={2200} factor={4.2} saturation={0} fade speed={0.6} />
      <Aurora />
      <SkyStorm />
      <Moon />

      <Suspense fallback={null}>
        <DragonModel />
        <EmberTrail />
        <Village />
        <Battle />
        <Firebreath />
        <Mountains />
        {/* ash + embers drifting over the field */}
        <Sparkles count={70} scale={[22, 9, 16]} position={[0, -1, 0]} size={2.2} speed={0.4} noise={1.2} color="#ff8a3c" />
        {/* high cold star-dust for depth */}
        <Sparkles count={44} scale={[42, 22, 32]} position={[0, 12, -10]} size={1.4} speed={0.12} noise={0.4} color="#9fb6e8" />
        <Environment files="/hdri/night.hdr" environmentIntensity={1.0} />
      </Suspense>

      <CameraRoam />

      {/* CINEMATIC GRADE — bloom makes every emissive (fire, embers, windows,
          aurora, moon) actually glow; vignette focuses the frame; a whisper of
          chromatic aberration adds lens realism. This is the single biggest
          quality lever and was previously unused. */}
      <EffectComposer multisampling={4}>
        <Bloom
          intensity={1.15}
          luminanceThreshold={0.2}
          luminanceSmoothing={0.9}
          kernelSize={KernelSize.LARGE}
          mipmapBlur
        />
        <ChromaticAberration offset={[0.0006, 0.0009]} radialModulation modulationOffset={0.3} />
        <Vignette eskil={false} offset={0.28} darkness={0.92} />
      </EffectComposer>
    </Canvas>
  );
}
