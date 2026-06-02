import { describe, it, expect } from "vitest";
import { render } from "@testing-library/react";
import { Archives } from "./Archives";
import { portfolio } from "@/content/portfolio";

describe("Archives", () => {
  it("renders each research title", () => {
    // Titles render with a blackletter drop-cap (first letter in a separate span),
    // so assert on combined text content rather than a single text node.
    const { container } = render(<Archives />);
    portfolio.research.forEach((r) => expect(container).toHaveTextContent(r.title));
  });
});
