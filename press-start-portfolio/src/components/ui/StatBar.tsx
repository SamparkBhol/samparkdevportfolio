import { HealthBar } from "./HealthBar";
export function StatBar({ name, level }: { name: string; level: number }) {
  return (
    <div className="mb-3">
      <HealthBar value={level} max={100} label={name} />
    </div>
  );
}
