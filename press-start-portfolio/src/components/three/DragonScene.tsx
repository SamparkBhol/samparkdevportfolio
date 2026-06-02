"use client";
import { Suspense, useEffect, useRef } from "react";
import { Canvas, useFrame } from "@react-three/fiber";
import { useGLTF, useAnimations, Environment } from "@react-three/drei";
import { ACESFilmicToneMapping, type Group, type Mesh, type MeshStandardMaterial } from "three";

const DRAGON = "/models/dragon.glb";

function DragonModel() {
  const g = useRef<Group>(null);
  const { scene, animations } = useGLTF(DRAGON);
  const { actions, names } = useAnimations(animations, g);

  useEffect(() => {
    scene.traverse((o) => {
      const m = o as Mesh;
      if (!m.isMesh) return;
      m.castShadow = true;
      m.receiveShadow = true;
      m.frustumCulled = false; // skinned meshes mis-cull without this
      const mat = m.material as MeshStandardMaterial | undefined;
      if (mat) {
        mat.envMapIntensity = 1.3; // pick up HDRI reflections for realism
        mat.needsUpdate = true;
      }
    });
    // Cadence: soar on "Fly Glide", with periodic "Fly Flap" bursts, crossfaded.
    const glide = actions["Fly Glide"];
    const flap = actions["Fly Flap"];
    const base = glide ?? flap ?? actions["Idle"] ?? actions[names[0]];
    if (base) {
      base.reset().fadeIn(0.6).play();
      base.timeScale = 0.8; // calm, drawn-out glide
    }
    let timer: ReturnType<typeof setTimeout> | null = null;
    if (glide && flap) {
      flap.timeScale = 1.15; // snappier wingbeats
      let onGlide = true;
      const cycle = () => {
        if (onGlide) {
          glide.fadeOut(0.5);
          flap.reset().fadeIn(0.5).play();
          onGlide = false;
          timer = setTimeout(cycle, 2200); // short, snappy flap burst
        } else {
          flap.fadeOut(0.9);
          glide.reset().fadeIn(0.9).play();
          onGlide = true;
          timer = setTimeout(cycle, 9000); // long calm glide cruise
        }
      };
      timer = setTimeout(cycle, 6500); // long opening glide before the first flap
    }
    return () => {
      if (timer) clearTimeout(timer);
      glide?.fadeOut(0.3);
      flap?.fadeOut(0.3);
      if (base && base !== glide && base !== flap) base.fadeOut(0.3);
    };
  }, [actions, names, scene]);

  // hover bob + gentle horizontal roam + banking
  useFrame((s) => {
    if (!g.current) return;
    const t = s.clock.elapsedTime;
    g.current.position.y = -0.3 + Math.sin(t * 0.8) * 0.25;
    g.current.position.x = Math.sin(t * 0.12) * 1.4;
    g.current.rotation.z = Math.sin(t * 0.12) * 0.06;
  });

  return (
    <group ref={g}>
      <primitive object={scene} scale={2.2} rotation={[0, Math.PI * 0.25, 0]} />
    </group>
  );
}
useGLTF.preload(DRAGON);

// slow cinematic camera circling the soaring dragon
function CameraRoam() {
  useFrame((s) => {
    const t = s.clock.elapsedTime * 0.09;
    s.camera.position.x = Math.sin(t) * 8.5;
    s.camera.position.z = Math.cos(t) * 8.5;
    s.camera.position.y = 1.2 + Math.sin(t * 0.5) * 1.0;
    s.camera.lookAt(0, 0, 0);
  });
  return null;
}

export default function DragonScene() {
  return (
    <Canvas
      shadows
      dpr={[1, 1.6]}
      camera={{ position: [0, 1.2, 8.5], fov: 42 }}
      gl={{
        antialias: true,
        toneMapping: ACESFilmicToneMapping,
        toneMappingExposure: 1.05,
        powerPreference: "high-performance",
        failIfMajorPerformanceCaveat: false,
      }}
    >
      <color attach="background" args={["#0b0d12"]} />
      <fog attach="fog" args={["#0b0d12", 11, 30]} />

      {/* moonlight key for cast shadows; HDRI fills the rest */}
      <directionalLight
        position={[-6, 11, 5]}
        intensity={2.0}
        color="#cdd8ff"
        castShadow
        shadow-mapSize={[2048, 2048]}
        shadow-bias={-0.0001}
      />

      <Suspense fallback={null}>
        <DragonModel />
        <Environment files="/hdri/night.hdr" environmentIntensity={1.1} />
      </Suspense>

      <CameraRoam />
    </Canvas>
  );
}
