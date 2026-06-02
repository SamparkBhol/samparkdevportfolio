import { describe, it, expect } from "vitest";
import { render, screen } from "@testing-library/react";
import { PowerUpShop } from "./PowerUpShop";
import { portfolio } from "@/content/portfolio";

describe("PowerUpShop", () => {
  it("renders each package and its install cmd", () => {
    render(<PowerUpShop />);
    portfolio.packages.forEach((p) => {
      expect(screen.getByText(p.name)).toBeInTheDocument();
      expect(screen.getByText(p.installCmd)).toBeInTheDocument();
    });
  });
});
