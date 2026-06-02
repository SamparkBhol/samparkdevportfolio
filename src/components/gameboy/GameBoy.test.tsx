import { describe, it, expect } from "vitest";
import { render, screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { GameBoy } from "./GameBoy";

describe("GameBoy", () => {
  it("renders the device with controls and the LCD", () => {
    render(<GameBoy />);
    expect(screen.getByLabelText("Move left")).toBeInTheDocument();
    expect(screen.getByLabelText("Rotate clockwise (A)")).toBeInTheDocument();
    expect(screen.getByLabelText("Start, pause or restart")).toBeInTheDocument();
    expect(screen.getByLabelText("Game screen")).toBeInTheDocument();
  });

  it("starts the game when START is pressed", async () => {
    const user = userEvent.setup();
    render(<GameBoy />);
    expect(screen.getByText(/Status: READY/i)).toBeInTheDocument();
    await user.click(screen.getByLabelText("Start, pause or restart"));
    expect(screen.getByText(/Status: PLAYING/i)).toBeInTheDocument();
  });
});
