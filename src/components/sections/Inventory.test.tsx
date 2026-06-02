import { describe, it, expect } from "vitest";
import { render } from "@testing-library/react";
import { Inventory } from "./Inventory";
import { portfolio } from "@/content/portfolio";

describe("Inventory", () => {
  it("renders each skill category", () => {
    // Category names may appear in both a heading and a hover tooltip, so assert
    // on combined text content (presence) rather than a unique text node.
    const { container } = render(<Inventory />);
    portfolio.skills.forEach((c) => expect(container).toHaveTextContent(c.name));
  });
});
