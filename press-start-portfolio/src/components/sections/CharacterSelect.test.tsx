import { describe, it, expect } from "vitest";
import { render, screen } from "@testing-library/react";
import { CharacterSelect } from "./CharacterSelect";
import { portfolio } from "@/content/portfolio";

describe("CharacterSelect", () => {
  it("shows the player name and stats", () => {
    render(<CharacterSelect />);
    expect(screen.getByText(portfolio.profile.name)).toBeInTheDocument();
    expect(screen.getByText(portfolio.about.stats[0].label)).toBeInTheDocument();
  });
});
