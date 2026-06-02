export const SFX = {
  coin: "/sfx/coin.wav", select: "/sfx/select.wav", start: "/sfx/start.wav",
  powerup: "/sfx/powerup.wav", hover: "/sfx/hover.wav",
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
