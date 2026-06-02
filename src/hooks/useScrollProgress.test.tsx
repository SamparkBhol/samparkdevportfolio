import { describe, it, expect } from "vitest";
import { computeProgress } from "./useScrollProgress";

describe("computeProgress", () => {
  it("0 at top", () => expect(computeProgress(0, 1000)).toBe(0));
  it("1 at bottom", () => expect(computeProgress(1000, 1000)).toBe(1));
  it("0.5 mid", () => expect(computeProgress(500, 1000)).toBeCloseTo(0.5));
  it("clamps + guards divide-by-zero", () => {
    expect(computeProgress(50, 0)).toBe(0);
    expect(computeProgress(2000, 1000)).toBe(1);
  });
});
