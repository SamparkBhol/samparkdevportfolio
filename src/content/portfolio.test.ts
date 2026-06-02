import { describe, it, expect } from "vitest";
import { portfolio } from "./portfolio";

describe("portfolio content", () => {
  it("has all 11 sections populated", () => {
    expect(portfolio.profile.name).toBeTruthy();
    expect(portfolio.about.stats.length).toBeGreaterThan(0);
    expect(portfolio.experience.length).toBeGreaterThan(0);
    expect(portfolio.projects.length).toBeGreaterThan(0);
    expect(portfolio.packages.length).toBeGreaterThan(0);
    expect(portfolio.research.length).toBeGreaterThan(0);
    expect(portfolio.blogs.length).toBeGreaterThan(0);
    expect(portfolio.volunteer.length).toBeGreaterThan(0);
    expect(portfolio.skills.length).toBeGreaterThan(0);
    expect(portfolio.certifications.length).toBeGreaterThan(0);
    expect(portfolio.contact.email).toContain("@");
  });
  it("project ids are unique", () => {
    const ids = portfolio.projects.map((p) => p.id);
    expect(new Set(ids).size).toBe(ids.length);
  });
});
