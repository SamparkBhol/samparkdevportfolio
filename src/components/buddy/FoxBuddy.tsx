"use client";
import { Suspense, useEffect, useMemo, useRef, useState } from "react";
import { Canvas, useFrame } from "@react-three/fiber";
import { useGLTF, useAnimations, ContactShadows } from "@react-three/drei";
import type { Group } from "three";

const FOX = "/models/Fox.glb";

// Shared scroll-velocity signal (−1..1) so the fox reacts to how you scroll —
// same module-scope-signal idea the dragon uses in DragonScene. A single
// passive listener writes it; the render loop reads + decays it toward rest.
const scrollV = { v: 0 };

function FoxModel({ walking, facing }: { walking: boolean; facing: 1 | -1 }) {
  const group = useRef<Group>(null);
  const { scene, animations } = useGLTF(FOX);
  const { actions } = useAnimations(animations, group);

  // Smoothed dash signal kept in a ref so it survives between frames without
  // re-rendering. Eased toward scrollV.v each frame for a buttery reaction.
  const dash = useRef(0);
  const reduced = useMemo(
    () =>
      typeof window !== "undefined" &&
      window.matchMedia?.("(prefers-reduced-motion: reduce)").matches,
    [],
  );

  // While the user is scrolling hard, the fox breaks into a Run (dashing pose)
  // even if the cursor-driven `walking` flag is false. We track that as state
  // so the action cross-fade logic below re-runs.
  const [dashing, setDashing] = useState(false);

  useEffect(() => {
    // Fox ships with: Survey (idle), Walk, Run.
    const running = walking || dashing;
    const name = running ? (actions["Run"] ? "Run" : "Walk") : "Survey";
    const next = actions[name] ?? actions["Survey"] ?? Object.values(actions)[0];
    next?.reset().fadeIn(0.25).play();
    return () => {
      next?.fadeOut(0.2);
    };
  }, [actions, walking, dashing]);

  // The Khronos Fox is ~100 units tall and faces +Z; scale down and yaw to a
  // side profile that points in the travel direction. The base yaw is set on
  // the outer group; scroll lean is applied on top in the frame loop.
  const baseYaw = facing === 1 ? Math.PI / 2 : -Math.PI / 2;

  useFrame((_, delta) => {
    const g = group.current;
    if (!g) return;
    if (reduced) {
      // Static, neutral pose under reduced motion.
      g.rotation.set(0, baseYaw, 0);
      g.position.set(0, -0.95, 0);
      return;
    }
    const dt = Math.min(0.05, delta);
    // Ease the smoothed dash toward the live (clamped) scroll velocity, then
    // decay the shared signal so it settles to rest when scrolling stops.
    dash.current += (scrollV.v - dash.current) * Math.min(1, dt * 9);
    scrollV.v *= 0.9; // decay toward rest (matches the dragon)
    const d = Math.max(-1, Math.min(1, dash.current));
    const a = Math.abs(d);

    // Flip into / out of the Run "dashing" pose with a little hysteresis so it
    // doesn't flicker around the threshold.
    if (!dashing && a > 0.14) setDashing(true);
    else if (dashing && a < 0.05) setDashing(false);

    // Lean / face into the scroll direction. Scrolling down (d>0) tips the fox
    // forward as if chasing the content; up rears it back. Roll banks the body,
    // a touch of yaw turns the head into the motion — all clamped + eased.
    const lean = d * 0.45; // pitch, <= ~26deg
    const bank = -d * 0.28; // roll
    g.rotation.set(lean, baseYaw + d * 0.18, bank);

    // Forward stretch + a tiny eager bob while dashing; settle to rest at idle.
    const stretch = 1 + a * 0.08;
    g.scale.setScalar(1);
    g.scale.z = stretch;
    g.position.set(d * 0.12, -0.95 + a * 0.05, 0);
  });

  return (
    <group ref={group} position={[0, -0.95, 0]} rotation={[0, baseYaw, 0]}>
      <primitive object={scene} scale={0.019} />
    </group>
  );
}
useGLTF.preload(FOX);

export default function FoxBuddy({ walking, facing }: { walking: boolean; facing: 1 | -1 }) {
  // Pause the buddy's render loop when the tab is backgrounded (perf).
  const [visible, setVisible] = useState(true);
  useEffect(() => {
    const onVis = () => {
      setVisible(!document.hidden);
      // Don't resume mid-dash after the tab comes back.
      if (document.hidden) scrollV.v = 0;
    };
    document.addEventListener("visibilitychange", onVis);
    onVis();
    return () => document.removeEventListener("visibilitychange", onVis);
  }, []);

  // Wire the shared scroll signal once for this buddy's lifetime: a passive
  // scroll listener clamps velocity into [-1, 1]; an rAF tick decays it so the
  // fox eases back to its idle pose when you stop. Skipped under reduced motion.
  useEffect(() => {
    if (typeof window === "undefined") return;
    if (window.matchMedia?.("(prefers-reduced-motion: reduce)").matches) return;
    let last = window.scrollY;
    let raf = 0;
    const onScroll = () => {
      const y = window.scrollY;
      scrollV.v = Math.max(-1, Math.min(1, (y - last) / 60));
      last = y;
    };
    const decay = () => {
      scrollV.v *= 0.9;
      raf = requestAnimationFrame(decay);
    };
    window.addEventListener("scroll", onScroll, { passive: true });
    raf = requestAnimationFrame(decay);
    return () => {
      window.removeEventListener("scroll", onScroll);
      cancelAnimationFrame(raf);
      scrollV.v = 0;
    };
  }, []);

  return (
    <Canvas
      frameloop={visible ? "always" : "never"}
      dpr={1}
      camera={{ position: [0, 0.45, 3.4], fov: 42 }}
      gl={{ antialias: true, alpha: true, failIfMajorPerformanceCaveat: false }}
      style={{ width: 112, height: 112, pointerEvents: "none" }}
    >
      <ambientLight intensity={1.2} />
      <directionalLight position={[2, 4, 3]} intensity={2.2} />
      <pointLight position={[-2, 1, 2]} color="#00e5ff" intensity={10} />
      <Suspense fallback={null}>
        <FoxModel walking={walking} facing={facing} />
        <ContactShadows position={[0, -0.95, 0]} opacity={0.45} scale={3} blur={2.5} far={2} color="#000000" />
      </Suspense>
    </Canvas>
  );
}
