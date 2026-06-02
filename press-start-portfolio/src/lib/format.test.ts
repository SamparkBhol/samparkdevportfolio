import { describe, it, expect } from "vitest";
import { formatDownloads } from "./format";

describe("formatDownloads", () => {
  it("formats thousands with k", () => expect(formatDownloads(18400)).toBe("18.4k"));
  it("formats millions with m", () => expect(formatDownloads(2_300_000)).toBe("2.3m"));
  it("leaves small numbers", () => expect(formatDownloads(840)).toBe("840"));
});
