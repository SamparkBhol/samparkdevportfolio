import { describe, expect, it } from "vitest";
import { render, screen } from "@testing-library/react";
import { Kanji } from "@/components/print/Kanji";
import { Eyebrow } from "@/components/print/Eyebrow";
import { Panel } from "@/components/print/Panel";

describe("print primitives", () => {
  it("Kanji never shows Japanese without its reading", () => {
    render(<Kanji en="THE JOB" jp="仕事" romaji="shigoto" />);
    const jp = screen.getByText("仕事");
    expect(jp).toHaveAttribute("lang", "ja");
    expect(screen.getByText("shigoto")).toBeInTheDocument();
  });
  it("Eyebrow carries the number and the label", () => {
    render(<Eyebrow n="02">THE JOB</Eyebrow>);
    const el = screen.getByText(/02 \//).closest("p")!;
    expect(el.textContent).toContain("02 /");
    expect(el.textContent).toContain("THE JOB");
  });
  it("Panel shows its caption label and a real numeral", () => {
    render(<Panel label="Data" numeral="58">Redis job queues and PostgreSQL across 58 schema migrations.</Panel>);
    expect(screen.getByText("Data")).toBeInTheDocument();
    expect(screen.getByText("58", { selector: ".numeral" })).toBeInTheDocument();
  });
});
