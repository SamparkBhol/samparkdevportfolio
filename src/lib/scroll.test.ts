import { describe, it, expect } from "vitest";
import { clamp, lerp, mapRange, parallax, r2 } from "./scroll";

describe("scroll math", () => {
  it("clamps", () => {
    expect(clamp(-1)).toBe(0);
    expect(clamp(2)).toBe(1);
    expect(clamp(0.5)).toBe(0.5);
  });
  it("lerps", () => {
    expect(lerp(0, 10, 0.5)).toBe(5);
    expect(lerp(10, 20, 0)).toBe(10);
  });
  it("maps + clamps ranges", () => {
    expect(mapRange(5, 0, 10, 0, 100)).toBe(50);
    expect(mapRange(20, 0, 10, 0, 100)).toBe(100);
    expect(mapRange(1, 5, 5, 0, 9)).toBe(0); // guards divide-by-zero
  });
  it("parallax is 0 at mid, symmetric at ends", () => {
    expect(parallax(0.5, 1, 100)).toBe(0);
    expect(parallax(1, 1, 100)).toBe(100);
    expect(parallax(0, 1, 100)).toBe(-100);
  });
  it("r2 rounds to 2dp", () => {
    expect(r2(1.23456)).toBe(1.23);
  });
});
