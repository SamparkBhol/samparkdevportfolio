import { describe, it, expect } from "vitest";
import { render, screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { Hud } from "./Hud";

describe("Hud", () => {
  it("opens stage-select menu with all stages", async () => {
    render(<Hud />);
    await userEvent.click(screen.getByLabelText("Open stage select menu"));
    expect(screen.getByRole("navigation", { name: /stage select/i })).toBeInTheDocument();
    expect(screen.getByText("BOSS FIGHTS")).toBeInTheDocument();
  });
});
