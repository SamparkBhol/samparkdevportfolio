import { describe, it, expect } from "vitest";
import { render, screen } from "@testing-library/react";
import { BossFights } from "./BossFights";
import { portfolio } from "@/content/portfolio";

describe("BossFights", () => {
  it("renders each project name", () => {
    render(<BossFights />);
    portfolio.projects.forEach((p) => expect(screen.getByText(p.name)).toBeInTheDocument());
  });
});
