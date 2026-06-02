"use client";
import { Suspense, useEffect, useRef } from "react";
import { Canvas } from "@react-three/fiber";
import {
  useGLTF,
  useAnimations,
  OrbitControls,
  Environment,
  Lightformer,
  ContactShadows,
  Float,
} from "@react-three/drei";
import { EffectComposer, Bloom, Vignette } from "@react-three/postprocessing";
import type { Group } from "three";

const MODEL = "/models/RobotExpressive.glb";

function RobotModel() {
  const group = useRef<Group>(null);
  const { scene, animations } = useGLTF(MODEL);
  const { actions } = useAnimations(animations, group);

  useEffect(() => {
    // RobotExpressive ships with: Idle, Walking, Running, Dance, Wave, Jump, ...
    const action = actions["Dance"] ?? actions["Idle"] ?? Object.values(actions)[0];
    action?.reset().fadeIn(0.5).play();
    return () => {
      action?.fadeOut(0.3);
    };
  }, [actions]);

  return (
    <group ref={group} dispose={null}>
      <primitive object={scene} position={[0, -1.9, 0]} scale={0.85} />
    </group>
  );
}
useGLTF.preload(MODEL);

export default function HeroScene() {
  return (
    <Canvas
      shadows
      dpr={[1, 1.8]}
      camera={{ position: [0, 1.4, 10.5], fov: 36 }}
      gl={{ antialias: true, powerPreference: "high-performance", failIfMajorPerformanceCaveat: false }}
    >
      <color attach="background" args={["#0b0b12"]} />
      <fog attach="fog" args={["#0b0b12", 10, 22]} />

      {/* Key + neon rim lights for the arcade glow. */}
      <ambientLight intensity={0.5} />
      <directionalLight position={[5, 8, 5]} intensity={1.1} castShadow shadow-mapSize={[1024, 1024]} />
      <pointLight position={[-5, 2, 3]} color="#ff4fd8" intensity={55} />
      <pointLight position={[5, 2, 3]} color="#00e5ff" intensity={55} />
      <spotLight position={[0, 7, 2]} angle={0.5} penumbra={1} intensity={40} color="#ffd23f" castShadow />

      <Suspense fallback={null}>
        <Float speed={1.4} rotationIntensity={0.3} floatIntensity={0.7}>
          <RobotModel />
        </Float>

        {/* Procedural studio environment — colored area lights baked to an env map.
            No network fetch, so reflections render reliably offline. */}
        <Environment resolution={64}>
          <Lightformer form="rect" intensity={3} color="#00e5ff" position={[-4, 3, -3]} scale={[6, 6, 1]} />
          <Lightformer form="rect" intensity={3} color="#ff4fd8" position={[4, 2, -3]} scale={[6, 6, 1]} />
          <Lightformer form="ring" intensity={2} color="#ffd23f" position={[0, -1, -5]} scale={[4, 4, 1]} />
        </Environment>
      </Suspense>

      <ContactShadows position={[0, -1.9, 0]} opacity={0.7} scale={14} blur={2.6} far={5} color="#000000" />

      <OrbitControls
        enablePan={false}
        enableZoom={false}
        autoRotate
        autoRotateSpeed={1.4}
        minPolarAngle={Math.PI / 3}
        maxPolarAngle={Math.PI / 1.9}
        target={[0, 0.2, 0]}
      />

      <EffectComposer>
        <Bloom luminanceThreshold={0.25} intensity={1.0} mipmapBlur />
        <Vignette eskil={false} offset={0.2} darkness={0.95} />
      </EffectComposer>
    </Canvas>
  );
}
