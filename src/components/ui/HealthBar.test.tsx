import { describe, it, expect } from "vitest";
import { render, screen } from "@testing-library/react";
import { HealthBar } from "./HealthBar";

describe("HealthBar", () => {
  it("renders an accessible progressbar with correct aria value", () => {
    render(<HealthBar value={60} max={100} label="HP" />);
    const bar = screen.getByRole("progressbar");
    expect(bar).toHaveAttribute("aria-valuenow", "60");
    expect(bar).toHaveAttribute("aria-valuemax", "100");
  });
});
