import { describe, it, expect } from "vitest";
import { render, screen } from "@testing-library/react";
import { TrophyRoom } from "./TrophyRoom";
import { portfolio } from "@/content/portfolio";

describe("TrophyRoom", () => {
  it("renders each certification title", () => {
    render(<TrophyRoom />);
    portfolio.certifications.forEach((c) => expect(screen.getByText(c.title)).toBeInTheDocument());
  });
});
