"use client";
import { useRef } from "react";
import { useFrame } from "@react-three/fiber";
import type { Group } from "three";

const ITEMS = Array.from({ length: 14 }, (_, i) => ({
  x: Math.cos(i) * 3.2, y: ((i % 5) - 2) * 0.9, z: Math.sin(i) * 2 - 1, c: ["#ffd23f", "#39ff14", "#ff4fd8"][i % 3],
}));

export function FloatingLoot({ pointer }: { pointer: { x: number; y: number } }) {
  const g = useRef<Group>(null);
  useFrame((state) => {
    if (!g.current) return;
    g.current.rotation.y = state.clock.elapsedTime * 0.2;
    g.current.children.forEach((m, i) => {
      m.position.y = ITEMS[i].y + Math.sin(state.clock.elapsedTime + i) * 0.2 + pointer.y * 0.4;
    });
  });
  return (
    <group ref={g}>
      {ITEMS.map((it, i) => (
        <mesh key={i} position={[it.x, it.y, it.z]}>
          <icosahedronGeometry args={[0.22, 0]} />
          <meshStandardMaterial color={it.c} emissive={it.c} emissiveIntensity={0.6} />
        </mesh>
      ))}
    </group>
  );
}
