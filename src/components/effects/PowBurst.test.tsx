import { describe, it, expect } from "vitest";
import { render, screen } from "@testing-library/react";
import { PowBurst } from "./PowBurst";

describe("PowBurst", () => {
  it("renders the given word", () => {
    render(<PowBurst word="POW!" />);
    expect(screen.getByText("POW!")).toBeInTheDocument();
  });
});
