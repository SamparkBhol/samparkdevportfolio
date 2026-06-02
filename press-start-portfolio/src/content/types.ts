export interface Social { label: string; href: string; icon: string }

export interface Profile {
  name: string; handle: string; title: string; tagline: string;
  location: string; avatarSprite: string; resumeUrl?: string; socials: Social[];
}
export interface AboutData {
  blurb: string;
  stats: { label: string; value: string }[];
  originStrip: { caption: string; sprite: string }[];
}
export interface ExperienceItem {
  id: string; role: string; org: string; period: string; location?: string;
  level: number; summary: string; highlights: string[]; stack: string[];
}
export type Difficulty = "EASY" | "NORMAL" | "HARD" | "BOSS";
export interface Project {
  id: string; name: string; tagline: string; description: string;
  hp: number; difficulty: Difficulty; tags: string[];
  links: { label: string; href: string }[]; sprite: string; year: string;
}
export interface NpmPackage {
  id: string; name: string; description: string; version: string;
  weeklyDownloads: number; installCmd: string; href: string; tags: string[];
}
export interface ResearchItem {
  id: string; title: string; venue: string; year: string; authors: string[];
  abstract: string; links: { label: string; href: string }[];
}
export interface BlogPost {
  slug: string; title: string; excerpt: string; date: string;
  readingMins: number; tags: string[]; cover?: string;
}
export interface VolunteerItem {
  id: string; role: string; org: string; period: string; summary: string; impact: string[];
}
export interface Skill { name: string; level: number; category: string; icon?: string }
export interface SkillCategory { name: string; skills: Skill[] }
export type Rarity = "COMMON" | "RARE" | "EPIC" | "LEGENDARY";
export interface Certification {
  id: string; title: string; issuer: string; year: string;
  credentialUrl?: string; icon: string; rarity: Rarity;
}
export interface ContactData { email: string; blurb: string; socials: Social[]; formAction?: string }

export interface Portfolio {
  profile: Profile; about: AboutData; experience: ExperienceItem[]; projects: Project[];
  packages: NpmPackage[]; research: ResearchItem[]; blogs: BlogPost[];
  volunteer: VolunteerItem[]; skills: SkillCategory[]; certifications: Certification[];
  contact: ContactData;
}
