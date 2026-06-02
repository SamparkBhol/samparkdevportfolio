"use client";
export function ArcadeCabinet() {
  return (
    <group position={[2.6, 0, -1]}>
      <mesh position={[0, 0.6, 0]} castShadow>
        <boxGeometry args={[1.6, 3.2, 1.2]} />
        <meshStandardMaterial color="#0b0b12" />
      </mesh>
      <mesh position={[0, 1.4, 0.62]}>
        <planeGeometry args={[1.2, 1]} />
        <meshStandardMaterial color="#00e5ff" emissive="#00e5ff" emissiveIntensity={1.4} />
      </mesh>
    </group>
  );
}
