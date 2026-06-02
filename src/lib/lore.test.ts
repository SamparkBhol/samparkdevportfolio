import { describe, it, expect } from "vitest";
import { LORE, LORE_IDS, LORE_TOTAL, isLoreId, loreById } from "./lore";

describe("lore", () => {
  it("has five uniquely-ided fragments in numeral order", () => {
    expect(LORE).toHaveLength(5);
    expect(LORE_TOTAL).toBe(5);
    expect(new Set(LORE_IDS).size).toBe(5);
    expect(LORE.map((l) => l.numeral)).toEqual(["I", "II", "III", "IV", "V"]);
  });
  it("every fragment has title, text and hint", () => {
    for (const f of LORE) {
      expect(f.title.length).toBeGreaterThan(0);
      expect(f.text.length).toBeGreaterThan(0);
      expect(f.hint.length).toBeGreaterThan(0);
    }
  });
  it("isLoreId guards correctly", () => {
    expect(isLoreId("fox")).toBe(true);
    expect(isLoreId("nope")).toBe(false);
    expect(isLoreId(42)).toBe(false);
  });
  it("loreById returns the matching fragment / throws on unknown", () => {
    expect(loreById("dragon").title).toBe("The Dragon");
    expect(() => loreById("ghost" as never)).toThrow();
  });
});
