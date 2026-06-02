import { describe, it, expect } from "vitest";
import { render, screen } from "@testing-library/react";
import { Panel } from "./Panel";
import { Badge } from "./Badge";

describe("ui primitives", () => {
  it("Panel renders children", () => {
    render(<Panel>hello</Panel>);
    expect(screen.getByText("hello")).toBeInTheDocument();
  });
  it("Badge renders children", () => {
    render(<Badge>RARE</Badge>);
    expect(screen.getByText("RARE")).toBeInTheDocument();
  });
});
