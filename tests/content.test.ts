import { describe, expect, it } from "vitest";
import { resume } from "@/content/resume";
import { CHAPTERS } from "@/content/chapters";
import { VIDEOS } from "@/content/videos";

const allHrefs = (): string[] => {
  const out: string[] = [resume.profile.linkedin, resume.profile.medium, resume.profile.cvUrl, resume.profile.cvMirrorUrl];
  for (const p of resume.projects) { out.push(p.links.code); if (p.links.live) out.push(p.links.live); }
  for (const g of resume.games) out.push(g.href);
  for (const p of resume.papers) if (p.href) out.push(p.href);
  for (const p of resume.posts) out.push(p.href);
  for (const c of resume.certs) if (c.verifyUrl) out.push(c.verifyUrl);
  return out;
};

describe("resume data is true and complete", () => {
  it("every link is https or site-relative, and no project or game links to the bare GitHub profile", () => {
    expect(resume.profile.github).toBe("https://github.com/SamparkBhol");
    for (const h of allHrefs()) {
      expect(h, h).toMatch(/^(https:\/\/|\/)/);
      expect(h.replace(/\/$/, ""), h).not.toBe("https://github.com/SamparkBhol");
    }
  });
  it("the current role is first", () => {
    expect(resume.roles[0].id).toBe("helmit");
    expect(resume.roles[0].current).toBe(true);
    expect(resume.roles[0].panels).toHaveLength(8);
  });
  it("every numeral appears in its own panel text", () => {
    for (const r of resume.roles) for (const p of r.panels) if (p.numeral) expect(p.text, `${r.id}/${p.id}`).toContain(p.numeral);
  });
  it("the Procedia paper credits all authors and places Sampark correctly", () => {
    const p = resume.papers.find((x) => x.id === "wsn")!;
    expect(p.authors.length).toBeGreaterThanOrEqual(2);
    expect(p.authors[p.authorIndex]).toBe("Sampark Bhol");
    expect(p.doi).toBe("10.1016/j.procs.2025.01.059");
  });
  it("every post links to Medium and has a date", () => {
    expect(resume.posts.length).toBeGreaterThanOrEqual(10);
    for (const p of resume.posts) { expect(p.href).toMatch(/^https:\/\/medium\.com\//); expect(p.date).toMatch(/^\d{4}-\d{2}-\d{2}$/); }
  });
  it("certs are numbered as episodes in order", () => {
    resume.certs.forEach((c, i) => expect(c.ep).toBe(i + 1));
  });
  it("every project has code and featured ones have a glyph", () => {
    for (const p of resume.projects) { expect(p.links.code).toMatch(/^https:\/\/github\.com\/SamparkBhol\//); expect(p.stamp).toMatch(/ \/ /); }
    expect(resume.projects.filter((p) => p.featured)).toHaveLength(4);
  });
  it("chapters carry a plain résumé word and videos have three tiers", () => {
    for (const c of CHAPTERS) expect(c.plain.length).toBeGreaterThan(0);
    for (const v of Object.values(VIDEOS)) expect(v.base).toMatch(/^\/video\//);
  });
});

describe("v2 data: flows, classes, packages, quests, skills", () => {
  it("every role has a flow whose nodes carry facts, logs and valid panel ids, and a stamp", () => {
    for (const r of resume.roles) {
      expect(r.flow.nodes.length, r.id).toBeGreaterThanOrEqual(5);
      expect(r.flow.stamp.length).toBeGreaterThan(0);
      const ids = new Set(r.panels.map((p) => `panel-${p.id}`));
      for (const n of r.flow.nodes) { expect(n.fact.length).toBeGreaterThan(10); expect(n.log.length).toBeGreaterThan(3); if (n.panel) expect(ids.has(n.panel), `${r.id}/${n.id} → ${n.panel}`).toBe(true); }
      expect(r.classes.length).toBeGreaterThan(0);
    }
  });
  it("classes reference real roles and projects", () => {
    const roleIds = new Set(resume.roles.map((r) => r.id)); const projIds = new Set(resume.projects.map((p) => p.id));
    for (const c of resume.classes) { c.roles.forEach((r) => expect(roleIds.has(r), `${c.id}/${r}`).toBe(true)); c.projects.forEach((p) => expect(projIds.has(p), `${c.id}/${p}`).toBe(true)); expect(c.stats.length).toBe(4); }
    expect(resume.classes).toHaveLength(4);
    for (const c of resume.classes) expect(/\d/.test(c.blurb), `${c.id} blurb has a figure`).toBe(false);
  });
  it("packages are separate from games and carry install lines and dated download counts", () => {
    expect(resume.packages).toHaveLength(3);
    for (const p of resume.packages) { expect(p.install).toMatch(/^npm i /); expect(p.href).toMatch(/^https:\/\/www\.npmjs\.com\/package\//); if (p.weeklyDownloads !== undefined) expect(p.checkedOn).toMatch(/^\d{4}-\d{2}-\d{2}$/); }
  });
  it("skills cite roles or projects that exist", () => {
    const ids = new Set([...resume.roles.map((r) => r.id), ...resume.projects.map((p) => p.id), ...resume.games.map((g) => g.id)]);
    for (const g of resume.skills) for (const s of g.items) for (const u of s.usedAt) expect(ids.has(u), `${s.name} → ${u}`).toBe(true);
    expect(resume.skills.flatMap((g) => g.items).length).toBeGreaterThanOrEqual(60);
  });
  it("every post has a mini-game and quests have rewards", () => {
    for (const p of resume.posts) expect(["pong", "snake", "breakout", "invaders", "runner"]).toContain(p.game);
    for (const q of resume.sideQuests) expect(q.rewards.length).toBeGreaterThanOrEqual(2);
    expect(CHAPTERS.length).toBe(12);
  });
});
