import { describe, expect, it } from "vitest";
import { render, screen } from "@testing-library/react";
import { ResumeDoc } from "@/components/resume/ResumeDoc";
import { resume } from "@/content/resume";

describe("ResumeDoc", () => {
  it("renders every Helmit bullet verbatim, every post, the author line and the four links", () => {
    render(<ResumeDoc />);
    for (const p of resume.roles[0].panels) expect(screen.getByText(p.text)).toBeInTheDocument();
    for (const p of resume.posts) expect(screen.getByText(p.title)).toBeInTheDocument();
    expect(screen.getAllByText("Sampark Bhol", { selector: "b" }).length).toBeGreaterThanOrEqual(2);
    expect(screen.getByText(resume.profile.email)).toHaveAttribute("href", `mailto:${resume.profile.email}`);
    expect(screen.getByRole("link", { name: "CV.pdf" })).toHaveAttribute("href", "/cv.pdf");
    expect(screen.getByRole("link", { name: "GitHub" })).toHaveAttribute("href", resume.profile.github);
    expect(screen.getByRole("link", { name: "LinkedIn" })).toHaveAttribute("href", resume.profile.linkedin);
  });
});
