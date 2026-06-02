export const SFX = {
  coin: "/sfx/coin.mp3", select: "/sfx/select.mp3", start: "/sfx/start.mp3",
  powerup: "/sfx/powerup.mp3", hover: "/sfx/hover.mp3",
} as const;
export type SfxName = keyof typeof SFX;

export const SECTION_IDS = [
  "title", "about", "experience", "projects", "packages", "research",
  "blogs", "volunteer", "skills", "certifications", "contact",
] as const;
export type SectionId = (typeof SECTION_IDS)[number];

export const SECTION_LABELS: Record<SectionId, string> = {
  title: "TITLE", about: "PLAYER 1", experience: "CAMPAIGN", projects: "BOSS FIGHTS",
  packages: "POWER-UPS", research: "ARCHIVES", blogs: "TRANSMISSIONS",
  volunteer: "SIDE QUESTS", skills: "INVENTORY", certifications: "TROPHIES", contact: "CONTINUE?",
};
