export type Link = { label: string; href: string };
export type Ink = "cel" | "shu" | "yellow";

/* ---------- v2 additions: general portfolio, every role as a stage ---------- */

/** Glyphs the flow strip can draw. One SVG each in FlowGlyphs.tsx. */
export type FlowGlyph =
  | "clients" | "gate" | "shield" | "pods" | "queue" | "database" | "agent" | "phone"
  | "stream" | "features" | "model" | "price" | "vectors" | "recommender" | "api"
  | "plan" | "draft" | "validate" | "dedupe"
  | "circuit" | "embedding" | "rabbit" | "optimizer"
  | "documents" | "chunks" | "vectordb" | "llm" | "answer"
  | "records" | "etl" | "forest" | "alerts" | "dashboard";

export interface FlowNode {
  id: string;
  glyph: FlowGlyph;
  /** Printed under the glyph. */
  label: string;
  /** The true fact shown on hover/focus, taken from the résumé. */
  fact: string;
  /** Mono log line printed when the request reaches this node. */
  log: string;
  /** Panel id in the role's spread to jump to. */
  panel?: string;
}

export interface Flow {
  /** What travels: "a request", "an event", "a circuit", "a question", "a record". */
  traveller: string;
  /** Printed above the strip, e.g. "ONE REQUEST, RIGHT TO LEFT". */
  caption: string;
  nodes: FlowNode[];
  /** The stamp that lands at the end: a real figure from the résumé. */
  stamp: string;
  stampNote?: string;
  /** Optional second beat after repeated sends (real figure). */
  burst?: { after: number; within: number; label: string };
}

export type ClassId = "software" | "ml" | "research" | "games";

export interface CharacterClass {
  id: ClassId;
  name: string;
  tagline: string;
  /** Two or three witty, first-person sentences; no figures (the numbers live in stats and the résumé). */
  blurb: string;
  /** Which roles and projects this class was played in (ids). */
  roles: string[];
  projects: string[];
  /** Four real figures from the résumé, label and value. */
  stats: [string, string][];
  /** The drawing: each class is its own full illustration. */
  gear: "software" | "ml" | "research" | "games";
}

export interface NpmPackage {
  id: string;
  name: string;
  version: string;
  description: string;
  install: string;
  href: string;
  repo?: string;
  tags: string[];
  /** Real weekly downloads at the time of writing, or omitted. */
  weeklyDownloads?: number;
  checkedOn?: string;
}

export interface SideQuest {
  id: string;
  org: string;
  role: string;
  period: string;
  summary: string;
  rewards: string[];
  status: "complete" | "ongoing";
}

export interface SkillItem {
  name: string;
  /** Role or project ids where it was used; the inventory shows these as evidence. */
  usedAt: string[];
}
export interface SkillGroup {
  id: string;
  group: string;
  slot: string;
  items: SkillItem[];
}

export type MiniGame = "pong" | "snake" | "breakout" | "invaders" | "runner";


export interface Profile {
  name: string;
  title: string;
  classLine: string;
  employer: string;
  location: string;
  since: string;
  premise: string;
  narration: string;
  email: string;
  github: string;
  linkedin: string;
  medium: string;
  cvUrl: string;
  cvMirrorUrl: string;
  siteUrl: string;
  issue: { number: number; month: string; price: string; title: string; volume: string };
  phone?: string;
}

export type ThumbKind = "pods" | "ladder" | "quarantine" | "idem";

export interface RolePanel {
  id: string;
  label: string;
  /** Résumé wording, verbatim. */
  text: string;
  tags?: string[];
  /** A real number that also appears in `text`. */
  numeral?: string;
  span: 3 | 4 | 5 | 7 | 12;
  thumb?: ThumbKind;
}

export interface Role {
  id: string;
  org: string;
  orgNote?: string;
  title: string;
  period: string;
  location: string;
  current?: boolean;
  /** Screentone density: 0 current, 10 last year, 25 earlier. */
  tone: 0 | 10 | 25;
  panels: RolePanel[];
  stack: string[];
  /** The stage's system, drawn as a flow strip you can send something through. */
  flow: Flow;
  classes: ClassId[];
}

export interface Project {
  id: string;
  name: string;
  /** Two-word slash stamp, e.g. "AGENTS / MEMORY". */
  stamp: string;
  /** The problem it beats, for the VS card. */
  vs: string;
  idea: string;
  system: string;
  result: string;
  stack: string[];
  year: string;
  links: { live?: string; code: string; npm?: string };
  featured: boolean;
  accent: string;
  glyph: "cairn" | "terminal" | "browser" | "quark" | "shield" | "plumb" | "chart" | "veil" | "graph";
}

export interface Game {
  id: string;
  name: string;
  sub: string;
  year: string;
  href: string;
  install?: string;
  accent: string;
}

export interface Paper {
  id: string;
  title: string;
  venue: string;
  year: string;
  authors: string[];
  /** Index of Sampark in `authors`. */
  authorIndex: number;
  doi?: string;
  href?: string;
  status: "published" | "under review";
}

export interface Post {
  id: string;
  title: string;
  href: string;
  /** ISO date. */
  date: string;
  words: number;
  tags: string[];
  /** The live mini-game on the card's screen. */
  game: MiniGame;
}

export interface Cert {
  id: string;
  ep: number;
  title: string;
  issuer: string;
  year: string;
  verifyUrl?: string;
}

export interface Resume {
  profile: Profile;
  roles: Role[];
  projects: Project[];
  games: Game[];
  papers: Paper[];
  posts: Post[];
  certs: Cert[];
  education: { school: string; degree: string; period: string; location: string; coursework: string[] };
  also: { label: string; text: string }[];
  skills: SkillGroup[];
  classes: CharacterClass[];
  packages: NpmPackage[];
  sideQuests: SideQuest[];
  contact: { openTo: string; where: string; timezone: string; response: string };
}

