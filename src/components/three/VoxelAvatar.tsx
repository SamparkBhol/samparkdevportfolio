"use client";
import { useRef } from "react";
import { useFrame } from "@react-three/fiber";
import type { Group } from "three";

function Box({ position, size = [1, 1, 1], color }: { position: [number, number, number]; size?: [number, number, number]; color: string }) {
  return (
    <mesh position={position} castShadow>
      <boxGeometry args={size} />
      <meshStandardMaterial color={color} />
    </mesh>
  );
}

export function VoxelAvatar() {
  const g = useRef<Group>(null);
  useFrame((state) => {
    if (g.current) g.current.position.y = Math.sin(state.clock.elapsedTime * 2) * 0.08;
  });
  return (
    <group ref={g}>
      <Box position={[0, 1.6, 0]} size={[0.9, 0.9, 0.9]} color="#ffd23f" /> {/* head */}
      <Box position={[0, 0.5, 0]} size={[1.1, 1.4, 0.7]} color="#ff3b3b" /> {/* torso */}
      <Box position={[-0.8, 0.6, 0]} size={[0.4, 1.2, 0.4]} color="#ffd23f" /> {/* arm */}
      <Box position={[0.8, 0.6, 0]} size={[0.4, 1.2, 0.4]} color="#ffd23f" /> {/* arm */}
      <Box position={[-0.3, -0.6, 0]} size={[0.45, 1.1, 0.45]} color="#00e5ff" /> {/* leg */}
      <Box position={[0.3, -0.6, 0]} size={[0.45, 1.1, 0.45]} color="#00e5ff" /> {/* leg */}
    </group>
  );
}
