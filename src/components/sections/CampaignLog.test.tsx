import { describe, it, expect } from "vitest";
import { render, screen } from "@testing-library/react";
import { CampaignLog } from "./CampaignLog";
import { portfolio } from "@/content/portfolio";

describe("CampaignLog", () => {
  it("renders each experience role", () => {
    render(<CampaignLog />);
    portfolio.experience.forEach((x) => expect(screen.getByText(x.role)).toBeInTheDocument());
  });
});
