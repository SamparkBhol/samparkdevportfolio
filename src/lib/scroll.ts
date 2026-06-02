/** Pure scroll/animation math helpers (no DOM) — unit-tested. */

export const clamp = (v: number, lo = 0, hi = 1) => Math.min(hi, Math.max(lo, v));

export const lerp = (a: number, b: number, t: number) => a + (b - a) * t;

/** Map x from [inMin,inMax] to [outMin,outMax], clamped to the output range. */
export function mapRange(x: number, inMin: number, inMax: number, outMin: number, outMax: number): number {
  if (inMax === inMin) return outMin;
  const t = clamp((x - inMin) / (inMax - inMin));
  return outMin + (outMax - outMin) * t;
}

/** Parallax offset (px) for a layer given scroll progress 0..1 and a depth factor.
 *  factor 0 = fixed, 1 = full travel; negative = opposite direction. */
export function parallax(progress: number, factor: number, distance: number): number {
  return (clamp(progress) - 0.5) * 2 * factor * distance;
}

/** Round to fixed precision (avoids SSR/CSR float-mismatch in inline transforms/SVG). */
export const r2 = (n: number) => Number(n.toFixed(2));
