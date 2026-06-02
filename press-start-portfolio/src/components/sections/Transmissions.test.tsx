import { describe, it, expect } from "vitest";
import { render, screen } from "@testing-library/react";
import { Transmissions } from "./Transmissions";
import { portfolio } from "@/content/portfolio";

describe("Transmissions", () => {
  it("renders each blog title", () => {
    render(<Transmissions />);
    portfolio.blogs.forEach((b) => expect(screen.getByText(b.title)).toBeInTheDocument());
  });
});
