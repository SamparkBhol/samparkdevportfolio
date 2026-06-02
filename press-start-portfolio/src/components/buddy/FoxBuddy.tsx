"use client";
import { Suspense, useEffect, useRef } from "react";
import { Canvas } from "@react-three/fiber";
import { useGLTF, useAnimations, ContactShadows } from "@react-three/drei";
import type { Group } from "three";

const FOX = "/models/Fox.glb";

function FoxModel({ walking, facing }: { walking: boolean; facing: 1 | -1 }) {
  const group = useRef<Group>(null);
  const { scene, animations } = useGLTF(FOX);
  const { actions } = useAnimations(animations, group);

  useEffect(() => {
    // Fox ships with: Survey (idle), Walk, Run.
    const name = walking ? (actions["Run"] ? "Run" : "Walk") : "Survey";
    const next = actions[name] ?? actions["Survey"] ?? Object.values(actions)[0];
    next?.reset().fadeIn(0.25).play();
    return () => {
      next?.fadeOut(0.2);
    };
  }, [actions, walking]);

  // The Khronos Fox is ~100 units tall and faces +Z; scale down and yaw to a
  // side profile that points in the travel direction.
  return (
    <group
      ref={group}
      position={[0, -0.95, 0]}
      rotation={[0, facing === 1 ? Math.PI / 2 : -Math.PI / 2, 0]}
    >
      <primitive object={scene} scale={0.019} />
    </group>
  );
}
useGLTF.preload(FOX);

export default function FoxBuddy({ walking, facing }: { walking: boolean; facing: 1 | -1 }) {
  return (
    <Canvas
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
