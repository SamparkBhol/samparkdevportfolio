import "@testing-library/jest-dom/vitest";
import { vi } from "vitest";

// jsdom lacks these; sections/effects use them.
window.matchMedia = window.matchMedia || ((q: string) => ({
  matches: false, media: q, onchange: null,
  addEventListener: vi.fn(), removeEventListener: vi.fn(),
  addListener: vi.fn(), removeListener: vi.fn(), dispatchEvent: vi.fn(),
}) as unknown as MediaQueryList);
window.scrollTo = vi.fn();
class IO { observe() {} unobserve() {} disconnect() {} }
// @ts-expect-error test shim
window.IntersectionObserver = IO;
