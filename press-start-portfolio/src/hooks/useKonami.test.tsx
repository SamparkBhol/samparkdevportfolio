import { describe, it, expect, vi } from "vitest";
import { renderHook } from "@testing-library/react";
import { fireEvent } from "@testing-library/dom";
import { useKonami } from "./useKonami";

const SEQ = ["ArrowUp", "ArrowUp", "ArrowDown", "ArrowDown", "ArrowLeft", "ArrowRight", "ArrowLeft", "ArrowRight", "b", "a"];

describe("useKonami", () => {
  it("fires callback when the full sequence is entered", () => {
    const cb = vi.fn();
    renderHook(() => useKonami(cb));
    SEQ.forEach((key) => fireEvent.keyDown(window, { key }));
    expect(cb).toHaveBeenCalledTimes(1);
  });
  it("does not fire on partial/wrong sequence", () => {
    const cb = vi.fn();
    renderHook(() => useKonami(cb));
    ["ArrowUp", "ArrowUp", "ArrowDown", "x"].forEach((key) => fireEvent.keyDown(window, { key }));
    expect(cb).not.toHaveBeenCalled();
  });
});
