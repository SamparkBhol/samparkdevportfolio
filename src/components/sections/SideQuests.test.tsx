import { describe, it, expect } from "vitest";
import { render, screen } from "@testing-library/react";
import { SideQuests } from "./SideQuests";
import { portfolio } from "@/content/portfolio";

describe("SideQuests", () => {
  it("renders each volunteer role", () => {
    render(<SideQuests />);
    portfolio.volunteer.forEach((v) => expect(screen.getByText(v.role)).toBeInTheDocument());
  });
});
