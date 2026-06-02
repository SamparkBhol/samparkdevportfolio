import { describe, it, expect } from "vitest";
import { render, screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { ContinueScreen } from "./ContinueScreen";

describe("ContinueScreen", () => {
  it("seeds the terminal with a 'type help' prompt", () => {
    render(<ContinueScreen />);
    // Welcome banner instructs the user to begin.
    expect(screen.getByText(/type 'help' to begin/i)).toBeInTheDocument();
  });

  it("runs the 'help' command and prints available commands", async () => {
    const user = userEvent.setup();
    render(<ContinueScreen />);

    const input = screen.getByLabelText("terminal input");
    expect(input).toBeInTheDocument();

    await user.click(input);
    await user.type(input, "help");
    await user.keyboard("{Enter}");

    // The command echo and the help output both appear, deterministically.
    expect(screen.getByText(/AVAILABLE COMMANDS/i)).toBeInTheDocument();
    expect(screen.getByText(/show this list/i)).toBeInTheDocument();

    // Input is cleared after submitting.
    expect((input as HTMLInputElement).value).toBe("");
  });

  it("reports unknown commands without crashing", async () => {
    const user = userEvent.setup();
    render(<ContinueScreen />);

    const input = screen.getByLabelText("terminal input");
    await user.click(input);
    await user.type(input, "doesnotexist");
    await user.keyboard("{Enter}");

    expect(screen.getByText(/command not found: doesnotexist/i)).toBeInTheDocument();
  });
});
