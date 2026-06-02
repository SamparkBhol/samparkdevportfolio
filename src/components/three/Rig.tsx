"use client";
import { useFrame, useThree } from "@react-three/fiber";

export function Rig({ pointer }: { pointer: { x: number; y: number } }) {
  const { camera } = useThree();
  useFrame(() => {
    camera.position.x += (pointer.x * 2 - camera.position.x) * 0.04;
    camera.position.y += (pointer.y * 1.2 + 1 - camera.position.y) * 0.04;
    camera.lookAt(0, 0.8, 0);
  });
  return null;
}
