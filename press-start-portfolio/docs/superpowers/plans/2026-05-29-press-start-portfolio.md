# PRESS START — Arcade-Comic Portfolio Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Build a single-page, scroll-as-experience developer portfolio styled as a playable retro arcade cartridge × comic book, with 11 in-fiction sections, one interactive 3D hero, rich 2D motion, and Vercel deployment.

**Architecture:** Next.js 15 (App Router, React 19) + TypeScript + Tailwind v4 + Motion (Framer Motion) for 2D animation + React Three Fiber for the single WebGL hero. All section content reads from one typed content layer (`src/content/`). Shared neobrutalist UI primitives + effects compose into independent section components, assembled on one scroll page behind a sticky arcade HUD.

**Tech Stack:** next@15, react@19, tailwindcss@4, motion, three + @react-three/fiber@9 + @react-three/drei + @react-three/postprocessing, vitest + @testing-library/react + jsdom, @playwright/test, clsx + tailwind-merge.

**Design spec:** `docs/superpowers/specs/2026-05-29-press-start-portfolio-design.md`

**Parallelization note:** Phases 0–5 are sequential prerequisites (scaffold → tokens → content contract → lib/hooks → effects → primitives → HUD). Phase 6 (the 11 sections) and Phase 7 (3D hero) depend only on the content contract (Phase 1) + primitives (Phase 4/5) and are mutually independent → safe to dispatch as parallel subagents. Phases 8–11 re-converge.

---

## File Structure (decomposition lock-in)

```
package.json, tsconfig.json, next.config.ts, postcss.config.mjs,
vitest.config.ts, vitest.setup.ts, playwright.config.ts, .gitignore, README.md
public/
  fonts/            # (optional self-hosted Deutsch Gothic / The Wildeast; Google blackletter fallback used by default)
  sfx/              # 8-bit sounds (coin.mp3, select.mp3, start.mp3, powerup.mp3, hover.mp3)
  sprites/          # pixel art + static hero fallback (hero-fallback.png) + og.png
src/
  app/
    layout.tsx          # fonts, providers, <body>, metadata
    page.tsx            # assembles HUD + 11 stages
    globals.css         # tailwind import + @theme tokens + base + effect layers
    not-found.tsx       # GAME OVER 404
    sitemap.ts, robots.ts, opengraph-image.tsx
    blog/[slug]/page.tsx # stub detail route
  content/
    types.ts            # content interfaces (the contract)
    portfolio.ts        # all placeholder data, typed
  lib/
    cn.ts               # className merge
    sfx.ts              # sound name → file map + constants
    format.ts           # formatDownloads, etc.
  hooks/
    useScrollProgress.ts, useKonami.ts, useSound.tsx, useCursor.ts, useInView.ts
  providers/
    Providers.tsx       # SoundProvider + Motion/CRT context wrapper
  components/
    ui/                 # Panel, ArcadeButton, SpeechBubble, ComicPanel, HalftoneBg,
                        # ScanlineOverlay, Marquee, HealthBar, Sprite, Badge, StatBar,
                        # SectionHeader, PixelDivider, Stage
    effects/            # Scanlines, Speedlines, PowBurst, PixelCursor (client)
    hud/                # Hud, PauseMenu
    sections/           # TitleScreen, CharacterSelect, CampaignLog, BossFights,
                        # PowerUpShop, Archives, Transmissions, SideQuests, Inventory,
                        # TrophyRoom, ContinueScreen
    three/              # HeroSceneClient (dynamic), HeroScene, VoxelAvatar,
                        # ArcadeCabinet, FloatingLoot, Rig
```

---

# PHASE 0 — Foundation & Scaffold

### Task 0.1: Project manifest & configs

**Files:**
- Create: `package.json`, `tsconfig.json`, `next.config.ts`, `postcss.config.mjs`, `next-env.d.ts` (auto), `.gitignore` (exists — verify)

- [ ] **Step 1: Write `package.json`**

```json
{
  "name": "press-start-portfolio",
  "version": "0.1.0",
  "private": true,
  "scripts": {
    "dev": "next dev",
    "build": "next build",
    "start": "next start",
    "lint": "next lint",
    "test": "vitest run",
    "test:watch": "vitest",
    "test:e2e": "playwright test",
    "typecheck": "tsc --noEmit"
  },
  "dependencies": {
    "next": "^15.1.0",
    "react": "^19.0.0",
    "react-dom": "^19.0.0",
    "motion": "^11.15.0",
    "three": "^0.171.0",
    "@react-three/fiber": "^9.0.0",
    "@react-three/drei": "^10.0.0",
    "@react-three/postprocessing": "^3.0.0",
    "clsx": "^2.1.1",
    "tailwind-merge": "^2.6.0"
  },
  "devDependencies": {
    "typescript": "^5.7.0",
    "@types/node": "^22.10.0",
    "@types/react": "^19.0.0",
    "@types/react-dom": "^19.0.0",
    "@types/three": "^0.171.0",
    "tailwindcss": "^4.0.0",
    "@tailwindcss/postcss": "^4.0.0",
    "postcss": "^8.4.49",
    "vitest": "^2.1.8",
    "@vitejs/plugin-react": "^4.3.4",
    "jsdom": "^25.0.1",
    "@testing-library/react": "^16.1.0",
    "@testing-library/dom": "^10.4.0",
    "@testing-library/jest-dom": "^6.6.3",
    "@testing-library/user-event": "^14.5.2",
    "@playwright/test": "^1.49.0"
  }
}
```

- [ ] **Step 2: Write `tsconfig.json`**

```json
{
  "compilerOptions": {
    "target": "ES2022",
    "lib": ["dom", "dom.iterable", "esnext"],
    "allowJs": true,
    "skipLibCheck": true,
    "strict": true,
    "noEmit": true,
    "esModuleInterop": true,
    "module": "esnext",
    "moduleResolution": "bundler",
    "resolveJsonModule": true,
    "isolatedModules": true,
    "jsx": "preserve",
    "incremental": true,
    "plugins": [{ "name": "next" }],
    "paths": { "@/*": ["./src/*"] }
  },
  "include": ["next-env.d.ts", "**/*.ts", "**/*.tsx", ".next/types/**/*.ts"],
  "exclude": ["node_modules"]
}
```

- [ ] **Step 3: Write `next.config.ts`**

```ts
import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  reactStrictMode: true,
  // three.js ships untranspiled ESM that Next handles, but transpiling is safest:
  transpilePackages: ["three"],
};

export default nextConfig;
```

- [ ] **Step 4: Write `postcss.config.mjs`**

```js
const config = { plugins: { "@tailwindcss/postcss": {} } };
export default config;
```

- [ ] **Step 5: Install deps & verify**

Run: `npm install`
Expected: installs without peer-dep errors (R3F 9 + React 19 are compatible).

- [ ] **Step 6: Commit**

```bash
git add package.json package-lock.json tsconfig.json next.config.ts postcss.config.mjs
git commit -m "chore: scaffold Next.js 15 + Tailwind v4 + R3F toolchain"
```

---

### Task 0.2: Tailwind v4 theme tokens + global styles + effect CSS

**Files:**
- Create: `src/app/globals.css`

- [ ] **Step 1: Write `src/app/globals.css`**

```css
@import "tailwindcss";

/* ---- Design tokens (Tailwind v4 @theme) ---- */
@theme {
  --color-ink: #0a0a0a;
  --color-paper: #fdf6e3;
  --color-crt: #0b0b12;
  --color-pop-red: #ff3b3b;
  --color-pop-yellow: #ffd23f;
  --color-pop-cyan: #00e5ff;
  --color-pop-magenta: #ff4fd8;
  --color-pop-green: #39ff14;

  --font-pixel: var(--font-press-start), monospace;
  --font-comic: var(--font-bungee), system-ui, sans-serif;
  --font-bang: var(--font-bangers), system-ui, sans-serif;
  --font-black: var(--font-blackletter), serif;
  --font-body: var(--font-space-grotesk), system-ui, sans-serif;
  --font-mono: var(--font-jetbrains), monospace;

  --shadow-hard: 4px 4px 0 0 var(--color-ink);
  --shadow-hard-lg: 8px 8px 0 0 var(--color-ink);
}

/* ---- Base ---- */
:root { color-scheme: dark; }
* { box-sizing: border-box; }
html { scroll-behavior: smooth; }
body {
  background: var(--color-crt);
  color: var(--color-paper);
  font-family: var(--font-body);
  overflow-x: hidden;
  cursor: none; /* custom pixel cursor; falls back below */
}
@media (pointer: coarse) { body { cursor: auto; } }
.skip-link { position: absolute; left: -9999px; }
.skip-link:focus { left: 1rem; top: 1rem; z-index: 100; }
*:focus-visible { outline: 3px solid var(--color-pop-cyan); outline-offset: 2px; }

/* ---- Neobrutalist utility ---- */
@utility nb-border { border: 3px solid var(--color-ink); }
@utility nb-shadow { box-shadow: var(--shadow-hard); }
@utility nb-shadow-lg { box-shadow: var(--shadow-hard-lg); }

/* ---- Halftone / Ben-Day dots ---- */
.halftone {
  background-image: radial-gradient(var(--color-ink) 1.2px, transparent 1.3px);
  background-size: 8px 8px;
}

/* ---- CRT scanlines overlay ---- */
.scanlines::after {
  content: ""; position: fixed; inset: 0; pointer-events: none; z-index: 60;
  background: repeating-linear-gradient(
    to bottom, rgba(0,0,0,0) 0, rgba(0,0,0,0) 2px,
    rgba(0,0,0,0.18) 3px, rgba(0,0,0,0.18) 3px);
  mix-blend-mode: multiply;
}
.crt-flicker { animation: flicker 4s infinite steps(1); }
@keyframes flicker { 0%,97%,100%{opacity:1} 98%{opacity:.85} 99%{opacity:.95} }

/* ---- Anime speedlines ---- */
.speedlines {
  background: repeating-conic-gradient(from 0deg at 50% 50%,
    rgba(0,0,0,0) 0deg 2deg, rgba(255,255,255,0.06) 2deg 3deg);
}

@media (prefers-reduced-motion: reduce) {
  html { scroll-behavior: auto; }
  .crt-flicker { animation: none; }
  *, *::before, *::after { animation-duration: 0.001ms !important; transition-duration: 0.001ms !important; }
}
```

- [ ] **Step 2: Commit**

```bash
git add src/app/globals.css
git commit -m "feat: Tailwind v4 theme tokens + neobrutalist/CRT/halftone utilities"
```

---

### Task 0.3: Test harness (Vitest + Playwright)

**Files:**
- Create: `vitest.config.ts`, `vitest.setup.ts`, `playwright.config.ts`

- [ ] **Step 1: Write `vitest.config.ts`**

```ts
import { defineConfig } from "vitest/config";
import react from "@vitejs/plugin-react";
import path from "node:path";

export default defineConfig({
  plugins: [react()],
  test: {
    environment: "jsdom",
    setupFiles: ["./vitest.setup.ts"],
    globals: true,
    include: ["src/**/*.test.{ts,tsx}"],
    exclude: ["node_modules", "e2e/**"],
  },
  resolve: { alias: { "@": path.resolve(__dirname, "./src") } },
});
```

- [ ] **Step 2: Write `vitest.setup.ts`**

```ts
import "@testing-library/jest-dom/vitest";
import { vi } from "vitest";

// jsdom lacks these; sections/effects use them.
window.matchMedia = window.matchMedia || ((q: string) => ({
  matches: false, media: q, onchange: null,
  addEventListener: vi.fn(), removeEventListener: vi.fn(),
  addListener: vi.fn(), removeListener: vi.fn(), dispatchEvent: vi.fn(),
}) as unknown as MediaQueryList);
window.scrollTo = vi.fn();
class IO { observe() {} unobserve() {} disconnect() {} }
// @ts-expect-error test shim
window.IntersectionObserver = IO;
```

- [ ] **Step 3: Write `playwright.config.ts`**

```ts
import { defineConfig } from "@playwright/test";

export default defineConfig({
  testDir: "./e2e",
  webServer: {
    command: "npm run build && npm run start",
    url: "http://localhost:3000",
    reuseExistingServer: !process.env.CI,
    timeout: 180_000,
  },
  use: { baseURL: "http://localhost:3000" },
});
```

- [ ] **Step 4: Sanity test the harness**

Create `src/lib/cn.test.ts` (temporary smoke; real impl in Task 1.x):

```ts
import { describe, it, expect } from "vitest";
describe("harness", () => { it("runs", () => expect(1 + 1).toBe(2)); });
```

Run: `npm run test`
Expected: 1 passing test.

- [ ] **Step 5: Commit**

```bash
git add vitest.config.ts vitest.setup.ts playwright.config.ts src/lib/cn.test.ts
git commit -m "test: add Vitest + Playwright harness"
```

---

# PHASE 1 — Content Contract (the data layer everything reads)

### Task 1.1: Content types

**Files:**
- Create: `src/content/types.ts`

- [ ] **Step 1: Write `src/content/types.ts`**

```ts
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
```

- [ ] **Step 2: Commit**

```bash
git add src/content/types.ts
git commit -m "feat: content type contract for all sections"
```

---

### Task 1.2: Placeholder content data (real, swappable)

**Files:**
- Create: `src/content/portfolio.ts`
- Test: `src/content/portfolio.test.ts`

- [ ] **Step 1: Write the failing test**

```ts
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
```

- [ ] **Step 2: Run test to verify it fails**

Run: `npm run test -- portfolio`
Expected: FAIL (`Cannot find module './portfolio'`).

- [ ] **Step 3: Write `src/content/portfolio.ts`** (placeholder content — swap freely later)

```ts
import type { Portfolio } from "./types";

export const portfolio: Portfolio = {
  profile: {
    name: "Player One", handle: "@player_one", title: "FULL-STACK ADVENTURER",
    tagline: "I build cool sh!t for the web — fast, weird, and well-tested.",
    location: "Earth, Sector 7", avatarSprite: "/sprites/avatar.png",
    resumeUrl: "/resume.pdf",
    socials: [
      { label: "GitHub", href: "https://github.com/", icon: "github" },
      { label: "LinkedIn", href: "https://linkedin.com/", icon: "linkedin" },
      { label: "X", href: "https://x.com/", icon: "x" },
    ],
  },
  about: {
    blurb: "Player 1 has been writing software since the days of dial-up. Specializes in web platforms, dev tooling, and making interfaces that feel like games.",
    stats: [
      { label: "YEARS XP", value: "6+" }, { label: "PROJECTS", value: "40+" },
      { label: "COFFEE", value: "∞" }, { label: "BUGS SLAIN", value: "9001" },
    ],
    originStrip: [
      { caption: "Found a keyboard.", sprite: "/sprites/origin-1.png" },
      { caption: "Broke the internet (locally).", sprite: "/sprites/origin-2.png" },
      { caption: "Shipped to prod. Survived.", sprite: "/sprites/origin-3.png" },
    ],
  },
  experience: [
    { id: "exp-1", role: "Senior Frontend Engineer", org: "Pixel Forge Inc.", period: "2023 — Now",
      location: "Remote", level: 24, summary: "Lead the web platform guild.",
      highlights: ["Cut LCP 45%", "Shipped design system", "Mentored 5 devs"], stack: ["Next.js","TS","R3F"] },
    { id: "exp-2", role: "Full-Stack Developer", org: "Arcade Labs", period: "2021 — 2023",
      location: "Hybrid", level: 16, summary: "Built realtime multiplayer tooling.",
      highlights: ["WebSocket infra", "10k concurrent users"], stack: ["Node","React","Postgres"] },
    { id: "exp-3", role: "Junior Developer", org: "Startup Quest", period: "2019 — 2021",
      location: "On-site", level: 8, summary: "First boss fights with production.",
      highlights: ["Shipped MVP", "On-call survivor"], stack: ["JS","Express","MySQL"] },
  ],
  projects: [
    { id: "proj-1", name: "NEON DASH", tagline: "A WebGL endless runner", hp: 100, difficulty: "BOSS",
      description: "Browser game with custom shaders and a global leaderboard.", year: "2024",
      tags: ["R3F","Shaders","Zustand"], sprite: "/sprites/proj-1.png",
      links: [{ label: "PLAY", href: "#" }, { label: "CODE", href: "#" }] },
    { id: "proj-2", name: "DEVDECK", tagline: "Dev dashboard CLI+web", hp: 80, difficulty: "HARD",
      description: "Unified dashboard for repos, CI, and incidents.", year: "2023",
      tags: ["Next.js","tRPC","Prisma"], sprite: "/sprites/proj-2.png",
      links: [{ label: "DEMO", href: "#" }, { label: "CODE", href: "#" }] },
    { id: "proj-3", name: "PIXELPAINT", tagline: "Collaborative pixel canvas", hp: 60, difficulty: "NORMAL",
      description: "Realtime multiplayer pixel art board.", year: "2022",
      tags: ["WebSocket","Canvas"], sprite: "/sprites/proj-3.png",
      links: [{ label: "TRY", href: "#" }] },
    { id: "proj-4", name: "LORE ENGINE", tagline: "Static site gen for TTRPGs", hp: 40, difficulty: "EASY",
      description: "Markdown → beautiful campaign sites.", year: "2021",
      tags: ["Astro","MDX"], sprite: "/sprites/proj-4.png",
      links: [{ label: "DOCS", href: "#" }] },
  ],
  packages: [
    { id: "pkg-1", name: "use-arcade", description: "React hooks for game-feel UIs.", version: "2.1.0",
      weeklyDownloads: 18400, installCmd: "npm i use-arcade", href: "#", tags: ["react","hooks"] },
    { id: "pkg-2", name: "crt-css", description: "Zero-dep CRT/scanline effects.", version: "1.4.2",
      weeklyDownloads: 9200, installCmd: "npm i crt-css", href: "#", tags: ["css","effects"] },
    { id: "pkg-3", name: "konami-react", description: "Tiny Konami-code hook.", version: "0.9.0",
      weeklyDownloads: 3100, installCmd: "npm i konami-react", href: "#", tags: ["react","easter-egg"] },
  ],
  research: [
    { id: "res-1", title: "Perceived Performance in Game-Like Web UIs", venue: "WebConf", year: "2024",
      authors: ["P. One", "J. Doe"], abstract: "We study how game-feel motion affects perceived latency.",
      links: [{ label: "PDF", href: "#" }, { label: "DOI", href: "#" }] },
    { id: "res-2", title: "Procedural Voxel Scenes at 60fps in the Browser", venue: "GraphicsW", year: "2023",
      authors: ["P. One"], abstract: "Instanced rendering techniques for low-poly web scenes.",
      links: [{ label: "PDF", href: "#" }] },
  ],
  blogs: [
    { slug: "shipping-game-feel", title: "Shipping Game-Feel on the Web", excerpt: "Juice, easing, and the 100ms rule.",
      date: "2025-02-10", readingMins: 7, tags: ["motion","ux"], cover: "/sprites/blog-1.png" },
    { slug: "tailwind-v4-tokens", title: "Design Tokens with Tailwind v4", excerpt: "The @theme directive changes everything.",
      date: "2024-12-01", readingMins: 5, tags: ["css","tailwind"], cover: "/sprites/blog-2.png" },
    { slug: "r3f-perf", title: "R3F Performance Cheatsheet", excerpt: "Instancing, DPR, and offscreen pausing.",
      date: "2024-09-18", readingMins: 9, tags: ["webgl","r3f"], cover: "/sprites/blog-3.png" },
  ],
  volunteer: [
    { id: "vol-1", role: "Mentor", org: "Code Guild", period: "2022 — Now",
      summary: "Mentor early-career devs.", impact: ["30+ mentees", "Weekly office hours"] },
    { id: "vol-2", role: "Organizer", org: "RetroJam", period: "2021 — Now",
      summary: "Run a yearly retro game jam.", impact: ["500+ participants", "Open-source toolkit"] },
  ],
  skills: [
    { name: "Frontend", skills: [
      { name: "React", level: 95, category: "Frontend" }, { name: "Next.js", level: 92, category: "Frontend" },
      { name: "TypeScript", level: 90, category: "Frontend" }, { name: "Motion", level: 85, category: "Frontend" } ] },
    { name: "Graphics", skills: [
      { name: "Three.js / R3F", level: 80, category: "Graphics" }, { name: "GLSL", level: 65, category: "Graphics" },
      { name: "Canvas", level: 78, category: "Graphics" } ] },
    { name: "Backend", skills: [
      { name: "Node.js", level: 85, category: "Backend" }, { name: "Postgres", level: 75, category: "Backend" },
      { name: "tRPC", level: 70, category: "Backend" } ] },
  ],
  certifications: [
    { id: "cert-1", title: "AWS Solutions Architect", issuer: "Amazon", year: "2024", icon: "🏆",
      rarity: "LEGENDARY", credentialUrl: "#" },
    { id: "cert-2", title: "Pro WebGL Developer", issuer: "Khronos", year: "2023", icon: "🎖️", rarity: "EPIC" },
    { id: "cert-3", title: "Accessibility Specialist", issuer: "W3C", year: "2023", icon: "🥇", rarity: "RARE" },
    { id: "cert-4", title: "Scrum Master", issuer: "Scrum.org", year: "2022", icon: "🥈", rarity: "COMMON" },
  ],
  contact: {
    email: "hello@example.com",
    blurb: "Got a quest for me? Insert coin and enter your name.",
    socials: [
      { label: "GitHub", href: "https://github.com/", icon: "github" },
      { label: "LinkedIn", href: "https://linkedin.com/", icon: "linkedin" },
      { label: "Email", href: "mailto:hello@example.com", icon: "mail" },
    ],
  },
};
```

- [ ] **Step 4: Run test to verify it passes**

Run: `npm run test -- portfolio`
Expected: 2 passing.

- [ ] **Step 5: Commit**

```bash
git add src/content/portfolio.ts src/content/portfolio.test.ts
git commit -m "feat: placeholder portfolio content for all 11 sections"
```

---

# PHASE 2 — Lib utils & Hooks (logic, TDD)

### Task 2.1: `cn` + `format` utils

**Files:**
- Create: `src/lib/cn.ts`, `src/lib/format.ts`, `src/lib/sfx.ts`
- Test: `src/lib/format.test.ts`
- Delete: `src/lib/cn.test.ts` (temporary smoke from Task 0.3)

- [ ] **Step 1: Write `src/lib/cn.ts`**

```ts
import { clsx, type ClassValue } from "clsx";
import { twMerge } from "tailwind-merge";
export function cn(...inputs: ClassValue[]) { return twMerge(clsx(inputs)); }
```

- [ ] **Step 2: Write failing test `src/lib/format.test.ts`**

```ts
import { describe, it, expect } from "vitest";
import { formatDownloads } from "./format";

describe("formatDownloads", () => {
  it("formats thousands with k", () => expect(formatDownloads(18400)).toBe("18.4k"));
  it("formats millions with m", () => expect(formatDownloads(2_300_000)).toBe("2.3m"));
  it("leaves small numbers", () => expect(formatDownloads(840)).toBe("840"));
});
```

- [ ] **Step 3: Run → fails** — Run: `npm run test -- format` → FAIL.

- [ ] **Step 4: Write `src/lib/format.ts`**

```ts
export function formatDownloads(n: number): string {
  if (n >= 1_000_000) return `${(n / 1_000_000).toFixed(1)}m`;
  if (n >= 1_000) return `${(n / 1_000).toFixed(1)}k`;
  return `${n}`;
}
```

- [ ] **Step 5: Write `src/lib/sfx.ts`**

```ts
export const SFX = {
  coin: "/sfx/coin.mp3", select: "/sfx/select.mp3", start: "/sfx/start.mp3",
  powerup: "/sfx/powerup.mp3", hover: "/sfx/hover.mp3",
} as const;
export type SfxName = keyof typeof SFX;
export const SECTION_IDS = [
  "title","about","experience","projects","packages","research",
  "blogs","volunteer","skills","certifications","contact",
] as const;
export type SectionId = (typeof SECTION_IDS)[number];
export const SECTION_LABELS: Record<SectionId, string> = {
  title: "TITLE", about: "PLAYER 1", experience: "CAMPAIGN", projects: "BOSS FIGHTS",
  packages: "POWER-UPS", research: "ARCHIVES", blogs: "TRANSMISSIONS",
  volunteer: "SIDE QUESTS", skills: "INVENTORY", certifications: "TROPHIES", contact: "CONTINUE?",
};
```

- [ ] **Step 6: Run → passes, remove smoke test**

Run: `rm src/lib/cn.test.ts && npm run test`
Expected: format + portfolio tests pass.

- [ ] **Step 7: Commit**

```bash
git add src/lib/ && git rm --cached src/lib/cn.test.ts 2>/dev/null; git add -A
git commit -m "feat: cn, formatDownloads, sfx + section id maps"
```

---

### Task 2.2: `useKonami` hook (TDD)

**Files:**
- Create: `src/hooks/useKonami.ts`
- Test: `src/hooks/useKonami.test.tsx`

- [ ] **Step 1: Write failing test**

```tsx
import { describe, it, expect, vi } from "vitest";
import { renderHook } from "@testing-library/react";
import { fireEvent } from "@testing-library/dom";
import { useKonami } from "./useKonami";

const SEQ = ["ArrowUp","ArrowUp","ArrowDown","ArrowDown","ArrowLeft","ArrowRight","ArrowLeft","ArrowRight","b","a"];

describe("useKonami", () => {
  it("fires callback when the full sequence is entered", () => {
    const cb = vi.fn();
    renderHook(() => useKonami(cb));
    SEQ.forEach((key) => fireEvent.keyDown(window, { key }));
    expect(cb).toHaveBeenCalledTimes(1);
  });
  it("does not fire on partial/wrong sequence", () => {
    const cb = vi.fn();
    renderHook(() => useKonami(cb));
    ["ArrowUp","ArrowUp","ArrowDown","x"].forEach((key) => fireEvent.keyDown(window, { key }));
    expect(cb).not.toHaveBeenCalled();
  });
});
```

- [ ] **Step 2: Run → fails** — `npm run test -- useKonami` → FAIL.

- [ ] **Step 3: Write `src/hooks/useKonami.ts`**

```ts
import { useEffect, useRef } from "react";

const CODE = ["ArrowUp","ArrowUp","ArrowDown","ArrowDown","ArrowLeft","ArrowRight","ArrowLeft","ArrowRight","b","a"];

export function useKonami(onUnlock: () => void) {
  const pos = useRef(0);
  useEffect(() => {
    function handler(e: KeyboardEvent) {
      const key = e.key.length === 1 ? e.key.toLowerCase() : e.key;
      if (key === CODE[pos.current]) {
        pos.current += 1;
        if (pos.current === CODE.length) { pos.current = 0; onUnlock(); }
      } else {
        pos.current = key === CODE[0] ? 1 : 0;
      }
    }
    window.addEventListener("keydown", handler);
    return () => window.removeEventListener("keydown", handler);
  }, [onUnlock]);
}
```

- [ ] **Step 4: Run → passes** — `npm run test -- useKonami` → PASS.

- [ ] **Step 5: Commit**

```bash
git add src/hooks/useKonami.ts src/hooks/useKonami.test.tsx
git commit -m "feat: useKonami hook with sequence detection"
```

---

### Task 2.3: `useScrollProgress`, `useInView`, `useCursor` hooks

**Files:**
- Create: `src/hooks/useScrollProgress.ts`, `src/hooks/useInView.ts`, `src/hooks/useCursor.ts`
- Test: `src/hooks/useScrollProgress.test.tsx`

- [ ] **Step 1: Write failing test for the pure math helper**

```tsx
import { describe, it, expect } from "vitest";
import { computeProgress } from "./useScrollProgress";

describe("computeProgress", () => {
  it("0 at top", () => expect(computeProgress(0, 1000)).toBe(0));
  it("1 at bottom", () => expect(computeProgress(1000, 1000)).toBe(1));
  it("0.5 mid", () => expect(computeProgress(500, 1000)).toBeCloseTo(0.5));
  it("clamps + guards divide-by-zero", () => {
    expect(computeProgress(50, 0)).toBe(0);
    expect(computeProgress(2000, 1000)).toBe(1);
  });
});
```

- [ ] **Step 2: Run → fails** — `npm run test -- useScrollProgress` → FAIL.

- [ ] **Step 3: Write `src/hooks/useScrollProgress.ts`**

```ts
"use client";
import { useEffect, useState } from "react";

export function computeProgress(scrollY: number, max: number): number {
  if (max <= 0) return 0;
  return Math.min(1, Math.max(0, scrollY / max));
}

export function useScrollProgress(): number {
  const [progress, setProgress] = useState(0);
  useEffect(() => {
    function onScroll() {
      const max = document.documentElement.scrollHeight - window.innerHeight;
      setProgress(computeProgress(window.scrollY, max));
    }
    onScroll();
    window.addEventListener("scroll", onScroll, { passive: true });
    window.addEventListener("resize", onScroll);
    return () => {
      window.removeEventListener("scroll", onScroll);
      window.removeEventListener("resize", onScroll);
    };
  }, []);
  return progress;
}
```

- [ ] **Step 4: Write `src/hooks/useInView.ts`**

```ts
"use client";
import { useEffect, useRef, useState } from "react";

export function useInView<T extends Element>(opts: IntersectionObserverInit = { threshold: 0.2 }) {
  const ref = useRef<T>(null);
  const [inView, setInView] = useState(false);
  useEffect(() => {
    const el = ref.current;
    if (!el) return;
    const io = new IntersectionObserver(([entry]) => {
      if (entry.isIntersecting) setInView(true);
    }, opts);
    io.observe(el);
    return () => io.disconnect();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);
  return { ref, inView };
}
```

- [ ] **Step 5: Write `src/hooks/useCursor.ts`** (returns live pointer position)

```ts
"use client";
import { useEffect, useState } from "react";

export function useCursor() {
  const [pos, setPos] = useState({ x: -100, y: -100 });
  const [down, setDown] = useState(false);
  useEffect(() => {
    const move = (e: PointerEvent) => setPos({ x: e.clientX, y: e.clientY });
    const d = () => setDown(true);
    const u = () => setDown(false);
    window.addEventListener("pointermove", move);
    window.addEventListener("pointerdown", d);
    window.addEventListener("pointerup", u);
    return () => {
      window.removeEventListener("pointermove", move);
      window.removeEventListener("pointerdown", d);
      window.removeEventListener("pointerup", u);
    };
  }, []);
  return { pos, down };
}
```

- [ ] **Step 6: Run → passes** — `npm run test -- useScrollProgress` → PASS.

- [ ] **Step 7: Commit**

```bash
git add src/hooks/useScrollProgress.ts src/hooks/useScrollProgress.test.tsx src/hooks/useInView.ts src/hooks/useCursor.ts
git commit -m "feat: scroll-progress, in-view, cursor hooks"
```

---

### Task 2.4: `useSound` + `SoundProvider` (Web Audio, muted by default)

**Files:**
- Create: `src/hooks/useSound.tsx`, `src/providers/Providers.tsx`

- [ ] **Step 1: Write `src/hooks/useSound.tsx`**

```tsx
"use client";
import { createContext, useCallback, useContext, useEffect, useMemo, useRef, useState } from "react";
import { SFX, type SfxName } from "@/lib/sfx";

interface SoundCtx { enabled: boolean; toggle: () => void; play: (name: SfxName) => void }
const Ctx = createContext<SoundCtx | null>(null);

export function SoundProvider({ children }: { children: React.ReactNode }) {
  const [enabled, setEnabled] = useState(false);
  const cache = useRef<Partial<Record<SfxName, HTMLAudioElement>>>({});

  useEffect(() => {
    const saved = localStorage.getItem("sound") === "on";
    if (saved) setEnabled(true);
  }, []);

  const toggle = useCallback(() => {
    setEnabled((e) => {
      const next = !e;
      localStorage.setItem("sound", next ? "on" : "off");
      return next;
    });
  }, []);

  const play = useCallback((name: SfxName) => {
    if (!enabled) return;
    let a = cache.current[name];
    if (!a) { a = new Audio(SFX[name]); a.volume = 0.35; cache.current[name] = a; }
    a.currentTime = 0; void a.play().catch(() => {});
  }, [enabled]);

  const value = useMemo(() => ({ enabled, toggle, play }), [enabled, toggle, play]);
  return <Ctx.Provider value={value}>{children}</Ctx.Provider>;
}

export function useSound(): SoundCtx {
  const ctx = useContext(Ctx);
  if (!ctx) return { enabled: false, toggle: () => {}, play: () => {} };
  return ctx;
}
```

- [ ] **Step 2: Write `src/providers/Providers.tsx`**

```tsx
"use client";
import { SoundProvider } from "@/hooks/useSound";
export function Providers({ children }: { children: React.ReactNode }) {
  return <SoundProvider>{children}</SoundProvider>;
}
```

- [ ] **Step 3: Typecheck**

Run: `npm run typecheck`
Expected: no errors.

- [ ] **Step 4: Commit**

```bash
git add src/hooks/useSound.tsx src/providers/Providers.tsx
git commit -m "feat: SoundProvider/useSound (muted default, localStorage)"
```

---

# PHASE 3 — Effects (client visual layers)

### Task 3.1: Scanlines, Speedlines, PowBurst, PixelCursor

**Files:**
- Create: `src/components/effects/Scanlines.tsx`, `Speedlines.tsx`, `PowBurst.tsx`, `PixelCursor.tsx`
- Test: `src/components/effects/PowBurst.test.tsx`

- [ ] **Step 1: Write `src/components/effects/Scanlines.tsx`**

```tsx
export function Scanlines() {
  return <div aria-hidden className="scanlines crt-flicker pointer-events-none fixed inset-0 z-[60]" />;
}
```

- [ ] **Step 2: Write `src/components/effects/Speedlines.tsx`**

```tsx
"use client";
import { motion } from "motion/react";
export function Speedlines({ show }: { show: boolean }) {
  return (
    <motion.div aria-hidden
      initial={{ opacity: 0 }} animate={{ opacity: show ? 0.25 : 0 }} transition={{ duration: 0.4 }}
      className="speedlines pointer-events-none absolute inset-0 -z-0" />
  );
}
```

- [ ] **Step 3: Write failing test for `PowBurst`**

```tsx
import { describe, it, expect } from "vitest";
import { render, screen } from "@testing-library/react";
import { PowBurst } from "./PowBurst";

describe("PowBurst", () => {
  it("renders the given word", () => {
    render(<PowBurst word="POW!" />);
    expect(screen.getByText("POW!")).toBeInTheDocument();
  });
});
```

- [ ] **Step 4: Run → fails** — `npm run test -- PowBurst` → FAIL.

- [ ] **Step 5: Write `src/components/effects/PowBurst.tsx`**

```tsx
"use client";
import { motion } from "motion/react";
import { cn } from "@/lib/cn";

export function PowBurst({ word = "POW!", className }: { word?: string; className?: string }) {
  return (
    <motion.span
      initial={{ scale: 0, rotate: -12 }} animate={{ scale: 1, rotate: -8 }}
      transition={{ type: "spring", stiffness: 600, damping: 12 }}
      className={cn(
        "inline-block font-bang text-pop-yellow nb-border nb-shadow bg-pop-red px-3 py-1 text-2xl",
        "[-webkit-text-stroke:1px_black]", className
      )}>
      {word}
    </motion.span>
  );
}
```

- [ ] **Step 6: Write `src/components/effects/PixelCursor.tsx`**

```tsx
"use client";
import { useCursor } from "@/hooks/useCursor";
export function PixelCursor() {
  const { pos, down } = useCursor();
  return (
    <div aria-hidden className="pointer-events-none fixed z-[70] hidden md:block"
      style={{ left: pos.x, top: pos.y, transform: "translate(-50%,-50%)" }}>
      <div className="nb-border bg-pop-cyan"
        style={{ width: down ? 10 : 16, height: down ? 10 : 16, transition: "all .08s" }} />
    </div>
  );
}
```

- [ ] **Step 7: Run → passes** — `npm run test -- PowBurst` → PASS.

- [ ] **Step 8: Commit**

```bash
git add src/components/effects/
git commit -m "feat: scanlines, speedlines, pow-burst, pixel cursor effects"
```

---

# PHASE 4 — UI Primitives (the neobrutalist kit)

> Each primitive is a small, focused, mostly-presentational component. Tests are lightweight render assertions. Build them together; one commit per logical group.

### Task 4.1: `Panel`, `ArcadeButton`, `Badge`, `PixelDivider`

**Files:**
- Create: `src/components/ui/Panel.tsx`, `ArcadeButton.tsx`, `Badge.tsx`, `PixelDivider.tsx`
- Test: `src/components/ui/Panel.test.tsx`

- [ ] **Step 1: Write `src/components/ui/Panel.tsx`**

```tsx
import { cn } from "@/lib/cn";
type PanelColor = "paper" | "yellow" | "cyan" | "magenta" | "green" | "red";
const BG: Record<PanelColor, string> = {
  paper: "bg-paper text-ink", yellow: "bg-pop-yellow text-ink", cyan: "bg-pop-cyan text-ink",
  magenta: "bg-pop-magenta text-ink", green: "bg-pop-green text-ink", red: "bg-pop-red text-paper",
};
export function Panel({
  children, className, color = "paper", lg = false,
}: { children: React.ReactNode; className?: string; color?: PanelColor; lg?: boolean }) {
  return (
    <div className={cn("nb-border", lg ? "nb-shadow-lg" : "nb-shadow", BG[color], className)}>
      {children}
    </div>
  );
}
```

- [ ] **Step 2: Write `src/components/ui/ArcadeButton.tsx`**

```tsx
"use client";
import { cn } from "@/lib/cn";
import { useSound } from "@/hooks/useSound";

export function ArcadeButton({
  children, href, onClick, color = "yellow", className,
}: {
  children: React.ReactNode; href?: string; onClick?: () => void;
  color?: "yellow" | "cyan" | "magenta" | "green" | "red"; className?: string;
}) {
  const { play } = useSound();
  const cls = cn(
    "inline-flex items-center gap-2 font-pixel text-xs uppercase nb-border nb-shadow",
    "px-4 py-3 text-ink transition-transform active:translate-x-1 active:translate-y-1 active:shadow-none",
    "hover:-translate-y-0.5",
    { yellow: "bg-pop-yellow", cyan: "bg-pop-cyan", magenta: "bg-pop-magenta",
      green: "bg-pop-green", red: "bg-pop-red text-paper" }[color], className
  );
  const handle = () => { play("select"); onClick?.(); };
  if (href) return <a href={href} onClick={() => play("select")} className={cls}>{children}</a>;
  return <button type="button" onClick={handle} onMouseEnter={() => play("hover")} className={cls}>{children}</button>;
}
```

- [ ] **Step 3: Write `src/components/ui/Badge.tsx`**

```tsx
import { cn } from "@/lib/cn";
export function Badge({ children, className }: { children: React.ReactNode; className?: string }) {
  return <span className={cn("nb-border bg-ink text-paper font-pixel text-[10px] px-2 py-1 inline-block", className)}>{children}</span>;
}
```

- [ ] **Step 4: Write `src/components/ui/PixelDivider.tsx`**

```tsx
export function PixelDivider() {
  return <div aria-hidden className="h-2 w-full halftone my-8" />;
}
```

- [ ] **Step 5: Write render test `src/components/ui/Panel.test.tsx`**

```tsx
import { describe, it, expect } from "vitest";
import { render, screen } from "@testing-library/react";
import { Panel } from "./Panel";
import { Badge } from "./Badge";

describe("ui primitives", () => {
  it("Panel renders children", () => {
    render(<Panel>hello</Panel>);
    expect(screen.getByText("hello")).toBeInTheDocument();
  });
  it("Badge renders children", () => {
    render(<Badge>RARE</Badge>);
    expect(screen.getByText("RARE")).toBeInTheDocument();
  });
});
```

- [ ] **Step 6: Run → passes** — `npm run test -- Panel` → PASS.

- [ ] **Step 7: Commit**

```bash
git add src/components/ui/Panel.tsx src/components/ui/ArcadeButton.tsx src/components/ui/Badge.tsx src/components/ui/PixelDivider.tsx src/components/ui/Panel.test.tsx
git commit -m "feat: Panel, ArcadeButton, Badge, PixelDivider primitives"
```

---

### Task 4.2: `SpeechBubble`, `ComicPanel`, `HalftoneBg`, `SectionHeader`

**Files:**
- Create: `src/components/ui/SpeechBubble.tsx`, `ComicPanel.tsx`, `HalftoneBg.tsx`, `SectionHeader.tsx`

- [ ] **Step 1: Write `src/components/ui/SpeechBubble.tsx`**

```tsx
import { cn } from "@/lib/cn";
export function SpeechBubble({ children, className }: { children: React.ReactNode; className?: string }) {
  return (
    <div className={cn("relative nb-border nb-shadow bg-paper text-ink px-4 py-3 font-body", className)}>
      {children}
      <span aria-hidden className="absolute -bottom-3 left-8 h-0 w-0 border-x-[10px] border-x-transparent border-t-[14px] border-t-ink" />
      <span aria-hidden className="absolute -bottom-[7px] left-[34px] h-0 w-0 border-x-[8px] border-x-transparent border-t-[11px] border-t-paper" />
    </div>
  );
}
```

- [ ] **Step 2: Write `src/components/ui/ComicPanel.tsx`**

```tsx
import { cn } from "@/lib/cn";
export function ComicPanel({
  children, title, className,
}: { children: React.ReactNode; title?: string; className?: string }) {
  return (
    <div className={cn("nb-border nb-shadow-lg bg-paper text-ink overflow-hidden", className)}>
      {title && (
        <div className="nb-border border-t-0 border-x-0 bg-ink text-paper font-pixel text-[10px] px-3 py-2">
          {title}
        </div>
      )}
      <div className="p-4">{children}</div>
    </div>
  );
}
```

- [ ] **Step 3: Write `src/components/ui/HalftoneBg.tsx`**

```tsx
export function HalftoneBg({ className = "" }: { className?: string }) {
  return <div aria-hidden className={`halftone opacity-20 absolute inset-0 -z-10 ${className}`} />;
}
```

- [ ] **Step 4: Write `src/components/ui/SectionHeader.tsx`**

```tsx
import { cn } from "@/lib/cn";
export function SectionHeader({
  kicker, title, subtitle, className,
}: { kicker: string; title: string; subtitle?: string; className?: string }) {
  return (
    <header className={cn("mb-8", className)}>
      <p className="font-pixel text-pop-cyan text-xs mb-2">{kicker}</p>
      <h2 className="font-comic text-4xl md:text-6xl text-pop-yellow [-webkit-text-stroke:2px_black]">{title}</h2>
      {subtitle && <p className="font-body text-paper/80 mt-3 max-w-2xl">{subtitle}</p>}
    </header>
  );
}
```

- [ ] **Step 5: Typecheck & commit**

Run: `npm run typecheck` → no errors.

```bash
git add src/components/ui/SpeechBubble.tsx src/components/ui/ComicPanel.tsx src/components/ui/HalftoneBg.tsx src/components/ui/SectionHeader.tsx
git commit -m "feat: SpeechBubble, ComicPanel, HalftoneBg, SectionHeader"
```

---

### Task 4.3: `HealthBar`, `StatBar`, `Sprite`, `Marquee`

**Files:**
- Create: `src/components/ui/HealthBar.tsx`, `StatBar.tsx`, `Sprite.tsx`, `Marquee.tsx`
- Test: `src/components/ui/HealthBar.test.tsx`

- [ ] **Step 1: Write failing test**

```tsx
import { describe, it, expect } from "vitest";
import { render, screen } from "@testing-library/react";
import { HealthBar } from "./HealthBar";

describe("HealthBar", () => {
  it("renders an accessible progressbar with correct aria value", () => {
    render(<HealthBar value={60} max={100} label="HP" />);
    const bar = screen.getByRole("progressbar");
    expect(bar).toHaveAttribute("aria-valuenow", "60");
    expect(bar).toHaveAttribute("aria-valuemax", "100");
  });
});
```

- [ ] **Step 2: Run → fails** — `npm run test -- HealthBar` → FAIL.

- [ ] **Step 3: Write `src/components/ui/HealthBar.tsx`**

```tsx
import { cn } from "@/lib/cn";
export function HealthBar({
  value, max = 100, label, className,
}: { value: number; max?: number; label?: string; className?: string }) {
  const pct = Math.min(100, Math.max(0, (value / max) * 100));
  const color = pct > 60 ? "bg-pop-green" : pct > 30 ? "bg-pop-yellow" : "bg-pop-red";
  return (
    <div className={cn("w-full", className)}>
      {label && <div className="font-pixel text-[9px] mb-1 flex justify-between"><span>{label}</span><span>{value}/{max}</span></div>}
      <div role="progressbar" aria-valuenow={value} aria-valuemin={0} aria-valuemax={max} aria-label={label}
        className="nb-border h-4 bg-ink/30 overflow-hidden">
        <div className={cn("h-full transition-[width] duration-700", color)} style={{ width: `${pct}%` }} />
      </div>
    </div>
  );
}
```

- [ ] **Step 4: Write `src/components/ui/StatBar.tsx`**

```tsx
import { HealthBar } from "./HealthBar";
export function StatBar({ name, level }: { name: string; level: number }) {
  return (
    <div className="mb-3">
      <HealthBar value={level} max={100} label={name} />
    </div>
  );
}
```

- [ ] **Step 5: Write `src/components/ui/Sprite.tsx`**

```tsx
"use client";
import { motion } from "motion/react";
export function Sprite({
  src, alt, size = 64, bob = true, className,
}: { src: string; alt: string; size?: number; bob?: boolean; className?: string }) {
  return (
    <motion.img
      src={src} alt={alt} width={size} height={size}
      style={{ imageRendering: "pixelated" }}
      animate={bob ? { y: [0, -6, 0] } : undefined}
      transition={bob ? { repeat: Infinity, duration: 1.6, ease: "easeInOut" } : undefined}
      className={className}
      onError={(e) => { (e.currentTarget as HTMLImageElement).style.visibility = "hidden"; }}
    />
  );
}
```

> Note: `onError` hides broken placeholder sprites gracefully until real art is added.

- [ ] **Step 6: Write `src/components/ui/Marquee.tsx`**

```tsx
"use client";
import { motion } from "motion/react";
export function Marquee({ items, className = "" }: { items: string[]; className?: string }) {
  const row = [...items, ...items];
  return (
    <div className={`overflow-hidden nb-border bg-ink text-pop-yellow py-2 ${className}`}>
      <motion.div className="flex gap-8 whitespace-nowrap font-pixel text-xs"
        animate={{ x: ["0%", "-50%"] }} transition={{ repeat: Infinity, ease: "linear", duration: 18 }}>
        {row.map((t, i) => <span key={i}>★ {t}</span>)}
      </motion.div>
    </div>
  );
}
```

- [ ] **Step 7: Run → passes** — `npm run test -- HealthBar` → PASS.

- [ ] **Step 8: Commit**

```bash
git add src/components/ui/HealthBar.tsx src/components/ui/StatBar.tsx src/components/ui/Sprite.tsx src/components/ui/Marquee.tsx src/components/ui/HealthBar.test.tsx
git commit -m "feat: HealthBar, StatBar, Sprite, Marquee primitives"
```

---

### Task 4.4: `Stage` wrapper (section landmark + reveal + speedlines)

**Files:**
- Create: `src/components/ui/Stage.tsx`

- [ ] **Step 1: Write `src/components/ui/Stage.tsx`**

```tsx
"use client";
import { motion } from "motion/react";
import { useInView } from "@/hooks/useInView";
import { Speedlines } from "@/components/effects/Speedlines";
import { HalftoneBg } from "./HalftoneBg";
import { SectionHeader } from "./SectionHeader";
import type { SectionId } from "@/lib/sfx";

export function Stage({
  id, label, title, subtitle, children, className = "",
}: {
  id: SectionId; label: string; title: string; subtitle?: string;
  children: React.ReactNode; className?: string;
}) {
  const { ref, inView } = useInView<HTMLElement>({ threshold: 0.15 });
  return (
    <section ref={ref} id={id} aria-label={title}
      className={`relative min-h-screen w-full px-5 py-24 md:px-12 ${className}`}>
      <HalftoneBg />
      <Speedlines show={inView} />
      <motion.div
        initial={{ opacity: 0, y: 40 }} animate={inView ? { opacity: 1, y: 0 } : {}}
        transition={{ duration: 0.6, ease: "easeOut" }}
        className="relative z-10 mx-auto max-w-6xl">
        <SectionHeader kicker={label} title={title} subtitle={subtitle} />
        {children}
      </motion.div>
    </section>
  );
}
```

- [ ] **Step 2: Typecheck & commit**

Run: `npm run typecheck` → no errors.

```bash
git add src/components/ui/Stage.tsx
git commit -m "feat: Stage wrapper (semantic landmark + scroll reveal + speedlines)"
```

---

# PHASE 5 — HUD (sticky arcade cabinet bar)

### Task 5.1: `Hud` + `PauseMenu`

**Files:**
- Create: `src/components/hud/Hud.tsx`, `src/components/hud/PauseMenu.tsx`
- Test: `src/components/hud/Hud.test.tsx`

- [ ] **Step 1: Write `src/components/hud/PauseMenu.tsx`**

```tsx
"use client";
import { motion, AnimatePresence } from "motion/react";
import { SECTION_IDS, SECTION_LABELS } from "@/lib/sfx";
import { ArcadeButton } from "@/components/ui/ArcadeButton";

export function PauseMenu({ open, onClose }: { open: boolean; onClose: () => void }) {
  return (
    <AnimatePresence>
      {open && (
        <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
          className="fixed inset-0 z-[80] grid place-items-center bg-crt/90 backdrop-blur-sm">
          <motion.nav aria-label="Stage select"
            initial={{ scale: 0.9, y: 20 }} animate={{ scale: 1, y: 0 }} exit={{ scale: 0.9, opacity: 0 }}
            className="nb-border nb-shadow-lg bg-paper text-ink p-6 w-[min(92vw,520px)]">
            <p className="font-comic text-3xl text-pop-red mb-4">PAUSE — STAGE SELECT</p>
            <ul className="grid grid-cols-2 gap-3">
              {SECTION_IDS.map((id) => (
                <li key={id}>
                  <ArcadeButton href={`#${id}`} onClick={onClose} color="cyan" className="w-full justify-center">
                    {SECTION_LABELS[id]}
                  </ArcadeButton>
                </li>
              ))}
            </ul>
          </motion.nav>
        </motion.div>
      )}
    </AnimatePresence>
  );
}
```

- [ ] **Step 2: Write `src/components/hud/Hud.tsx`**

```tsx
"use client";
import { useState } from "react";
import { useScrollProgress } from "@/hooks/useScrollProgress";
import { useSound } from "@/hooks/useSound";
import { HealthBar } from "@/components/ui/HealthBar";
import { PauseMenu } from "./PauseMenu";

export function Hud() {
  const progress = useScrollProgress();
  const { enabled, toggle } = useSound();
  const [paused, setPaused] = useState(false);
  const level = Math.max(1, Math.round(progress * 24));
  const coins = Math.round(progress * 999);

  return (
    <>
      <header className="fixed top-0 inset-x-0 z-[75] nb-border border-x-0 border-t-0 bg-crt/95 backdrop-blur">
        <div className="mx-auto max-w-7xl flex items-center gap-3 px-3 py-2 font-pixel text-[10px] text-paper">
          <span className="text-pop-red">♥♥♥</span>
          <span className="text-pop-yellow">LVL {level}</span>
          <div className="hidden sm:block w-40"><HealthBar value={Math.round(progress * 100)} max={100} label="XP" /></div>
          <span className="ml-auto text-pop-yellow">◎ {coins}</span>
          <button type="button" onClick={toggle} aria-pressed={enabled} aria-label="Toggle sound"
            className="nb-border px-2 py-1 bg-pop-cyan text-ink">{enabled ? "🔊" : "🔇"}</button>
          <button type="button" onClick={() => setPaused(true)} aria-label="Open stage select menu"
            className="nb-border px-2 py-1 bg-pop-yellow text-ink">☰</button>
        </div>
      </header>
      <PauseMenu open={paused} onClose={() => setPaused(false)} />
    </>
  );
}
```

- [ ] **Step 3: Write test `src/components/hud/Hud.test.tsx`**

```tsx
import { describe, it, expect } from "vitest";
import { render, screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { Hud } from "./Hud";

describe("Hud", () => {
  it("opens stage-select menu with all stages", async () => {
    render(<Hud />);
    await userEvent.click(screen.getByLabelText("Open stage select menu"));
    expect(screen.getByRole("navigation", { name: /stage select/i })).toBeInTheDocument();
    expect(screen.getByText("BOSS FIGHTS")).toBeInTheDocument();
  });
});
```

- [ ] **Step 4: Run → passes** — `npm run test -- Hud` → PASS.

- [ ] **Step 5: Commit**

```bash
git add src/components/hud/
git commit -m "feat: sticky arcade HUD + pause/stage-select menu"
```

---

# PHASE 6 — Sections (PARALLELIZABLE — each depends only on content + primitives)

> Each section is a focused component reading from `portfolio` and composing primitives. Each gets a render test asserting its data appears. Build, test, commit one section at a time (or dispatch in parallel — no shared mutable state).

### Task 6.1: `CharacterSelect` (About)

**Files:** Create `src/components/sections/CharacterSelect.tsx`, Test `…/CharacterSelect.test.tsx`

- [ ] **Step 1: Write component**

```tsx
"use client";
import { portfolio } from "@/content/portfolio";
import { Stage } from "@/components/ui/Stage";
import { Panel } from "@/components/ui/Panel";
import { ComicPanel } from "@/components/ui/ComicPanel";
import { Sprite } from "@/components/ui/Sprite";

export function CharacterSelect() {
  const { about, profile } = portfolio;
  return (
    <Stage id="about" label="PLAYER 1" title="CHARACTER SELECT" subtitle={about.blurb}>
      <div className="grid gap-6 md:grid-cols-[1fr_1.4fr]">
        <Panel color="cyan" className="p-6 text-center">
          <Sprite src={profile.avatarSprite} alt={`${profile.name} avatar`} size={120} className="mx-auto" />
          <p className="font-comic text-2xl mt-3">{profile.name}</p>
          <p className="font-pixel text-[10px] mt-1">{profile.title}</p>
          <div className="grid grid-cols-2 gap-2 mt-4">
            {about.stats.map((s) => (
              <div key={s.label} className="nb-border bg-paper p-2">
                <div className="font-comic text-xl">{s.value}</div>
                <div className="font-pixel text-[8px]">{s.label}</div>
              </div>
            ))}
          </div>
        </Panel>
        <div className="grid gap-4 sm:grid-cols-3 content-start">
          {about.originStrip.map((p, i) => (
            <ComicPanel key={i} title={`PANEL ${i + 1}`}>
              <Sprite src={p.sprite} alt={p.caption} size={72} className="mx-auto" />
              <p className="font-body text-sm mt-2">{p.caption}</p>
            </ComicPanel>
          ))}
        </div>
      </div>
    </Stage>
  );
}
```

- [ ] **Step 2: Write test**

```tsx
import { describe, it, expect } from "vitest";
import { render, screen } from "@testing-library/react";
import { CharacterSelect } from "./CharacterSelect";
import { portfolio } from "@/content/portfolio";

describe("CharacterSelect", () => {
  it("shows the player name and stats", () => {
    render(<CharacterSelect />);
    expect(screen.getByText(portfolio.profile.name)).toBeInTheDocument();
    expect(screen.getByText(portfolio.about.stats[0].label)).toBeInTheDocument();
  });
});
```

- [ ] **Step 3: Run → PASS, then commit**

```bash
git add src/components/sections/CharacterSelect.tsx src/components/sections/CharacterSelect.test.tsx
git commit -m "feat(section): About → Character Select"
```

### Task 6.2: `CampaignLog` (Experience)

**Files:** Create `src/components/sections/CampaignLog.tsx` + test.

- [ ] **Step 1: Write component**

```tsx
"use client";
import { portfolio } from "@/content/portfolio";
import { Stage } from "@/components/ui/Stage";
import { Panel } from "@/components/ui/Panel";
import { Badge } from "@/components/ui/Badge";

export function CampaignLog() {
  return (
    <Stage id="experience" label="CAMPAIGN" title="STAGES CLEARED" subtitle="Each role, a level conquered.">
      <ol className="relative border-l-4 border-ink/60 ml-3 space-y-8">
        {portfolio.experience.map((x) => (
          <li key={x.id} className="ml-6">
            <span className="absolute -left-[14px] nb-border bg-pop-green w-6 h-6 grid place-items-center font-pixel text-[8px] text-ink">{x.level}</span>
            <Panel className="p-5">
              <div className="flex flex-wrap items-baseline gap-2">
                <h3 className="font-comic text-2xl">{x.role}</h3>
                <span className="font-pixel text-[10px] text-pop-red">@ {x.org}</span>
                <span className="ml-auto font-pixel text-[10px]">{x.period}</span>
              </div>
              <p className="font-body text-sm mt-2">{x.summary}</p>
              <ul className="mt-3 space-y-1 font-body text-sm list-disc pl-5">
                {x.highlights.map((h) => <li key={h}>{h}</li>)}
              </ul>
              <div className="flex flex-wrap gap-2 mt-3">{x.stack.map((s) => <Badge key={s}>{s}</Badge>)}</div>
            </Panel>
          </li>
        ))}
      </ol>
    </Stage>
  );
}
```

- [ ] **Step 2: Test (assert first role appears), Step 3: Run → PASS, Step 4: Commit**

```tsx
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
```
```bash
git add src/components/sections/CampaignLog.tsx src/components/sections/CampaignLog.test.tsx
git commit -m "feat(section): Experience → Campaign Log"
```

### Task 6.3: `BossFights` (Projects)

**Files:** Create `src/components/sections/BossFights.tsx` + test.

- [ ] **Step 1: Write component**

```tsx
"use client";
import { portfolio } from "@/content/portfolio";
import { Stage } from "@/components/ui/Stage";
import { ComicPanel } from "@/components/ui/ComicPanel";
import { HealthBar } from "@/components/ui/HealthBar";
import { Badge } from "@/components/ui/Badge";
import { ArcadeButton } from "@/components/ui/ArcadeButton";
import { Sprite } from "@/components/ui/Sprite";

export function BossFights() {
  return (
    <Stage id="projects" label="BOSS FIGHTS" title="PROJECTS" subtitle="Defeat each boss to view the spoils.">
      <div className="grid gap-6 md:grid-cols-2">
        {portfolio.projects.map((p) => (
          <ComicPanel key={p.id} title={`${p.difficulty} · ${p.year}`}>
            <div className="flex items-center gap-3">
              <Sprite src={p.sprite} alt={`${p.name} sprite`} size={56} />
              <div className="flex-1">
                <h3 className="font-comic text-2xl text-pop-red">{p.name}</h3>
                <p className="font-pixel text-[10px]">{p.tagline}</p>
              </div>
            </div>
            <div className="my-3"><HealthBar value={p.hp} max={100} label="BOSS HP" /></div>
            <p className="font-body text-sm">{p.description}</p>
            <div className="flex flex-wrap gap-2 my-3">{p.tags.map((t) => <Badge key={t}>{t}</Badge>)}</div>
            <div className="flex flex-wrap gap-2">
              {p.links.map((l) => <ArcadeButton key={l.label} href={l.href} color="green">{l.label}</ArcadeButton>)}
            </div>
          </ComicPanel>
        ))}
      </div>
    </Stage>
  );
}
```

- [ ] **Step 2: Test / Step 3: Run → PASS / Step 4: Commit**

```tsx
import { describe, it, expect } from "vitest";
import { render, screen } from "@testing-library/react";
import { BossFights } from "./BossFights";
import { portfolio } from "@/content/portfolio";
describe("BossFights", () => {
  it("renders each project name", () => {
    render(<BossFights />);
    portfolio.projects.forEach((p) => expect(screen.getByText(p.name)).toBeInTheDocument());
  });
});
```
```bash
git add src/components/sections/BossFights.tsx src/components/sections/BossFights.test.tsx
git commit -m "feat(section): Projects → Boss Fights"
```

### Task 6.4: `PowerUpShop` (NPM Packages)

**Files:** Create `src/components/sections/PowerUpShop.tsx` + test.

- [ ] **Step 1: Write component**

```tsx
"use client";
import { portfolio } from "@/content/portfolio";
import { Stage } from "@/components/ui/Stage";
import { Panel } from "@/components/ui/Panel";
import { Badge } from "@/components/ui/Badge";
import { ArcadeButton } from "@/components/ui/ArcadeButton";
import { formatDownloads } from "@/lib/format";

export function PowerUpShop() {
  return (
    <Stage id="packages" label="POWER-UPS" title="ITEM SHOP" subtitle="npm-installable power-ups. Downloads = ammo.">
      <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
        {portfolio.packages.map((pkg) => (
          <Panel key={pkg.id} color="yellow" className="p-5 flex flex-col">
            <div className="flex items-baseline justify-between">
              <h3 className="font-comic text-xl">{pkg.name}</h3>
              <span className="font-pixel text-[10px]">v{pkg.version}</span>
            </div>
            <p className="font-body text-sm mt-2 flex-1">{pkg.description}</p>
            <code className="block nb-border bg-ink text-pop-green font-mono text-xs p-2 my-3">{pkg.installCmd}</code>
            <div className="flex items-center justify-between">
              <span className="font-pixel text-[10px]">⬇ {formatDownloads(pkg.weeklyDownloads)}/wk</span>
              <ArcadeButton href={pkg.href} color="cyan">VIEW</ArcadeButton>
            </div>
            <div className="flex flex-wrap gap-2 mt-3">{pkg.tags.map((t) => <Badge key={t}>{t}</Badge>)}</div>
          </Panel>
        ))}
      </div>
    </Stage>
  );
}
```

- [ ] **Step 2–4: Test/Run/Commit**

```tsx
import { describe, it, expect } from "vitest";
import { render, screen } from "@testing-library/react";
import { PowerUpShop } from "./PowerUpShop";
import { portfolio } from "@/content/portfolio";
describe("PowerUpShop", () => {
  it("renders each package and its install cmd", () => {
    render(<PowerUpShop />);
    portfolio.packages.forEach((p) => {
      expect(screen.getByText(p.name)).toBeInTheDocument();
      expect(screen.getByText(p.installCmd)).toBeInTheDocument();
    });
  });
});
```
```bash
git add src/components/sections/PowerUpShop.tsx src/components/sections/PowerUpShop.test.tsx
git commit -m "feat(section): NPM Packages → Power-Up Shop"
```

### Task 6.5: `Archives` (Research — the medieval beat)

**Files:** Create `src/components/sections/Archives.tsx` + test. Uses `font-black` (blackletter).

- [ ] **Step 1: Write component**

```tsx
"use client";
import { portfolio } from "@/content/portfolio";
import { Stage } from "@/components/ui/Stage";
import { Panel } from "@/components/ui/Panel";
import { ArcadeButton } from "@/components/ui/ArcadeButton";

export function Archives() {
  return (
    <Stage id="research" label="ARCHIVES" title="SCROLLS OF LORE" subtitle="Ancient tomes of research, recovered.">
      <div className="space-y-6">
        {portfolio.research.map((r) => (
          <Panel key={r.id} color="paper" className="p-6">
            <h3 className="font-black text-3xl text-ink">{r.title}</h3>
            <p className="font-pixel text-[10px] mt-1">{r.venue} · {r.year} · {r.authors.join(", ")}</p>
            <p className="font-body text-sm mt-3 italic">“{r.abstract}”</p>
            <div className="flex flex-wrap gap-2 mt-4">
              {r.links.map((l) => <ArcadeButton key={l.label} href={l.href} color="magenta">{l.label}</ArcadeButton>)}
            </div>
          </Panel>
        ))}
      </div>
    </Stage>
  );
}
```

- [ ] **Step 2–4: Test/Run/Commit**

```tsx
import { describe, it, expect } from "vitest";
import { render, screen } from "@testing-library/react";
import { Archives } from "./Archives";
import { portfolio } from "@/content/portfolio";
describe("Archives", () => {
  it("renders each research title", () => {
    render(<Archives />);
    portfolio.research.forEach((r) => expect(screen.getByText(r.title)).toBeInTheDocument());
  });
});
```
```bash
git add src/components/sections/Archives.tsx src/components/sections/Archives.test.tsx
git commit -m "feat(section): Research → Archives (blackletter)"
```

### Task 6.6: `Transmissions` (Blogs)

**Files:** Create `src/components/sections/Transmissions.tsx` + test.

- [ ] **Step 1: Write component**

```tsx
"use client";
import { portfolio } from "@/content/portfolio";
import { Stage } from "@/components/ui/Stage";
import { ComicPanel } from "@/components/ui/ComicPanel";
import { Badge } from "@/components/ui/Badge";
import { ArcadeButton } from "@/components/ui/ArcadeButton";

export function Transmissions() {
  return (
    <Stage id="blogs" label="TRANSMISSIONS" title="LATEST ISSUES" subtitle="Dispatches from the field.">
      <div className="grid gap-6 md:grid-cols-3">
        {portfolio.blogs.map((b) => (
          <ComicPanel key={b.slug} title={`${b.date} · ${b.readingMins} MIN`}>
            <h3 className="font-comic text-xl text-pop-red">{b.title}</h3>
            <p className="font-body text-sm mt-2">{b.excerpt}</p>
            <div className="flex flex-wrap gap-2 my-3">{b.tags.map((t) => <Badge key={t}>{t}</Badge>)}</div>
            <ArcadeButton href={`/blog/${b.slug}`} color="cyan">READ</ArcadeButton>
          </ComicPanel>
        ))}
      </div>
    </Stage>
  );
}
```

- [ ] **Step 2–4: Test/Run/Commit**

```tsx
import { describe, it, expect } from "vitest";
import { render, screen } from "@testing-library/react";
import { Transmissions } from "./Transmissions";
import { portfolio } from "@/content/portfolio";
describe("Transmissions", () => {
  it("renders each blog title", () => {
    render(<Transmissions />);
    portfolio.blogs.forEach((b) => expect(screen.getByText(b.title)).toBeInTheDocument());
  });
});
```
```bash
git add src/components/sections/Transmissions.tsx src/components/sections/Transmissions.test.tsx
git commit -m "feat(section): Blogs → Transmissions"
```

### Task 6.7: `SideQuests` (Volunteer)

**Files:** Create `src/components/sections/SideQuests.tsx` + test.

- [ ] **Step 1: Write component**

```tsx
"use client";
import { portfolio } from "@/content/portfolio";
import { Stage } from "@/components/ui/Stage";
import { Panel } from "@/components/ui/Panel";

export function SideQuests() {
  return (
    <Stage id="volunteer" label="SIDE QUESTS" title="CO-OP MISSIONS" subtitle="Giving back to the guild.">
      <div className="grid gap-6 md:grid-cols-2">
        {portfolio.volunteer.map((v) => (
          <Panel key={v.id} color="green" className="p-5">
            <div className="flex items-baseline justify-between">
              <h3 className="font-comic text-2xl">{v.role}</h3>
              <span className="font-pixel text-[10px]">{v.period}</span>
            </div>
            <p className="font-pixel text-[10px] text-pop-red mt-1">@ {v.org}</p>
            <p className="font-body text-sm mt-2">{v.summary}</p>
            <ul className="mt-3 space-y-1 font-body text-sm list-['▸_'] pl-5">
              {v.impact.map((i) => <li key={i}>{i}</li>)}
            </ul>
          </Panel>
        ))}
      </div>
    </Stage>
  );
}
```

- [ ] **Step 2–4: Test/Run/Commit**

```tsx
import { describe, it, expect } from "vitest";
import { render, screen } from "@testing-library/react";
import { SideQuests } from "./SideQuests";
import { portfolio } from "@/content/portfolio";
describe("SideQuests", () => {
  it("renders each volunteer role", () => {
    render(<SideQuests />);
    portfolio.volunteer.forEach((v) => expect(screen.getByText(v.role)).toBeInTheDocument());
  });
});
```
```bash
git add src/components/sections/SideQuests.tsx src/components/sections/SideQuests.test.tsx
git commit -m "feat(section): Volunteer → Side Quests"
```

### Task 6.8: `Inventory` (Skills)

**Files:** Create `src/components/sections/Inventory.tsx` + test.

- [ ] **Step 1: Write component**

```tsx
"use client";
import { portfolio } from "@/content/portfolio";
import { Stage } from "@/components/ui/Stage";
import { Panel } from "@/components/ui/Panel";
import { StatBar } from "@/components/ui/StatBar";

export function Inventory() {
  return (
    <Stage id="skills" label="INVENTORY" title="SKILL TREE" subtitle="Abilities unlocked and leveled.">
      <div className="grid gap-6 md:grid-cols-3">
        {portfolio.skills.map((cat) => (
          <Panel key={cat.name} className="p-5">
            <h3 className="font-comic text-xl text-pop-red mb-4">{cat.name}</h3>
            {cat.skills.map((s) => <StatBar key={s.name} name={s.name} level={s.level} />)}
          </Panel>
        ))}
      </div>
    </Stage>
  );
}
```

- [ ] **Step 2–4: Test/Run/Commit**

```tsx
import { describe, it, expect } from "vitest";
import { render, screen } from "@testing-library/react";
import { Inventory } from "./Inventory";
import { portfolio } from "@/content/portfolio";
describe("Inventory", () => {
  it("renders each skill category", () => {
    render(<Inventory />);
    portfolio.skills.forEach((c) => expect(screen.getByText(c.name)).toBeInTheDocument());
  });
});
```
```bash
git add src/components/sections/Inventory.tsx src/components/sections/Inventory.test.tsx
git commit -m "feat(section): Skills → Inventory / Skill Tree"
```

### Task 6.9: `TrophyRoom` (Certifications)

**Files:** Create `src/components/sections/TrophyRoom.tsx` + test.

- [ ] **Step 1: Write component**

```tsx
"use client";
import { portfolio } from "@/content/portfolio";
import { Stage } from "@/components/ui/Stage";
import { Panel } from "@/components/ui/Panel";
import { Badge } from "@/components/ui/Badge";
import type { Rarity } from "@/content/types";

const RARITY_COLOR: Record<Rarity, "yellow" | "magenta" | "cyan" | "paper"> = {
  LEGENDARY: "yellow", EPIC: "magenta", RARE: "cyan", COMMON: "paper",
};

export function TrophyRoom() {
  return (
    <Stage id="certifications" label="TROPHIES" title="ACHIEVEMENTS UNLOCKED" subtitle="The trophy case.">
      <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-4">
        {portfolio.certifications.map((c) => (
          <Panel key={c.id} color={RARITY_COLOR[c.rarity]} className="p-5 text-center">
            <div className="text-5xl">{c.icon}</div>
            <h3 className="font-comic text-lg mt-2">{c.title}</h3>
            <p className="font-pixel text-[9px] mt-1">{c.issuer} · {c.year}</p>
            <div className="mt-3"><Badge>{c.rarity}</Badge></div>
          </Panel>
        ))}
      </div>
    </Stage>
  );
}
```

- [ ] **Step 2–4: Test/Run/Commit**

```tsx
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
```
```bash
git add src/components/sections/TrophyRoom.tsx src/components/sections/TrophyRoom.test.tsx
git commit -m "feat(section): Certifications → Trophy Room"
```

### Task 6.10: `ContinueScreen` (Contact)

**Files:** Create `src/components/sections/ContinueScreen.tsx` + test.

- [ ] **Step 1: Write component** (high-score-entry styled contact; mailto form, no backend)

```tsx
"use client";
import { useState } from "react";
import { portfolio } from "@/content/portfolio";
import { Stage } from "@/components/ui/Stage";
import { Panel } from "@/components/ui/Panel";
import { ArcadeButton } from "@/components/ui/ArcadeButton";

export function ContinueScreen() {
  const { contact } = portfolio;
  const [name, setName] = useState("");
  const [msg, setMsg] = useState("");
  const href = `mailto:${contact.email}?subject=${encodeURIComponent(`Quest from ${name || "a traveller"}`)}&body=${encodeURIComponent(msg)}`;
  return (
    <Stage id="contact" label="CONTINUE?" title="ENTER YOUR NAME" subtitle={contact.blurb}>
      <div className="grid gap-6 md:grid-cols-2">
        <Panel color="cyan" className="p-6">
          <label className="font-pixel text-[10px] block mb-1" htmlFor="c-name">PLAYER NAME</label>
          <input id="c-name" value={name} onChange={(e) => setName(e.target.value)}
            className="nb-border bg-paper text-ink w-full p-2 font-mono mb-4" placeholder="AAA" />
          <label className="font-pixel text-[10px] block mb-1" htmlFor="c-msg">MESSAGE</label>
          <textarea id="c-msg" value={msg} onChange={(e) => setMsg(e.target.value)} rows={4}
            className="nb-border bg-paper text-ink w-full p-2 font-mono mb-4" placeholder="Type your quest..." />
          <ArcadeButton href={href} color="green">INSERT COIN ▸ SEND</ArcadeButton>
        </Panel>
        <Panel className="p-6">
          <p className="font-comic text-2xl mb-3">FIND ME</p>
          <ul className="space-y-3">
            {contact.socials.map((s) => (
              <li key={s.label}><ArcadeButton href={s.href} color="yellow" className="w-full justify-center">{s.label}</ArcadeButton></li>
            ))}
          </ul>
        </Panel>
      </div>
    </Stage>
  );
}
```

- [ ] **Step 2–4: Test/Run/Commit**

```tsx
import { describe, it, expect } from "vitest";
import { render, screen } from "@testing-library/react";
import { ContinueScreen } from "./ContinueScreen";
describe("ContinueScreen", () => {
  it("renders name + message inputs", () => {
    render(<ContinueScreen />);
    expect(screen.getByLabelText("PLAYER NAME")).toBeInTheDocument();
    expect(screen.getByLabelText("MESSAGE")).toBeInTheDocument();
  });
});
```
```bash
git add src/components/sections/ContinueScreen.tsx src/components/sections/ContinueScreen.test.tsx
git commit -m "feat(section): Contact → Continue / high-score entry"
```

---

# PHASE 7 — 3D Hero (the single WebGL piece)

### Task 7.1: R3F scene pieces

**Files:** Create `src/components/three/VoxelAvatar.tsx`, `ArcadeCabinet.tsx`, `FloatingLoot.tsx`, `Rig.tsx`

- [ ] **Step 1: Write `src/components/three/VoxelAvatar.tsx`** (procedural voxel figure — no external model)

```tsx
"use client";
import { useRef } from "react";
import { useFrame } from "@react-three/fiber";
import type { Group } from "three";

function Box({ position, size = [1, 1, 1], color }: { position: [number, number, number]; size?: [number, number, number]; color: string }) {
  return (
    <mesh position={position} castShadow>
      <boxGeometry args={size} />
      <meshStandardMaterial color={color} />
    </mesh>
  );
}

export function VoxelAvatar() {
  const g = useRef<Group>(null);
  useFrame((state) => {
    if (g.current) g.current.position.y = Math.sin(state.clock.elapsedTime * 2) * 0.08;
  });
  return (
    <group ref={g}>
      <Box position={[0, 1.6, 0]} size={[0.9, 0.9, 0.9]} color="#ffd23f" /> {/* head */}
      <Box position={[0, 0.5, 0]} size={[1.1, 1.4, 0.7]} color="#ff3b3b" /> {/* torso */}
      <Box position={[-0.8, 0.6, 0]} size={[0.4, 1.2, 0.4]} color="#ffd23f" /> {/* arm */}
      <Box position={[0.8, 0.6, 0]} size={[0.4, 1.2, 0.4]} color="#ffd23f" /> {/* arm */}
      <Box position={[-0.3, -0.6, 0]} size={[0.45, 1.1, 0.45]} color="#00e5ff" /> {/* leg */}
      <Box position={[0.3, -0.6, 0]} size={[0.45, 1.1, 0.45]} color="#00e5ff" /> {/* leg */}
    </group>
  );
}
```

- [ ] **Step 2: Write `src/components/three/ArcadeCabinet.tsx`**

```tsx
"use client";
export function ArcadeCabinet() {
  return (
    <group position={[2.6, 0, -1]}>
      <mesh position={[0, 0.6, 0]} castShadow>
        <boxGeometry args={[1.6, 3.2, 1.2]} />
        <meshStandardMaterial color="#0b0b12" />
      </mesh>
      <mesh position={[0, 1.4, 0.62]}>
        <planeGeometry args={[1.2, 1]} />
        <meshStandardMaterial color="#00e5ff" emissive="#00e5ff" emissiveIntensity={1.4} />
      </mesh>
    </group>
  );
}
```

- [ ] **Step 3: Write `src/components/three/FloatingLoot.tsx`** (instanced coins drifting to cursor)

```tsx
"use client";
import { useRef } from "react";
import { useFrame } from "@react-three/fiber";
import type { Group } from "three";

const ITEMS = Array.from({ length: 14 }, (_, i) => ({
  x: Math.cos(i) * 3.2, y: ((i % 5) - 2) * 0.9, z: Math.sin(i) * 2 - 1, c: ["#ffd23f", "#39ff14", "#ff4fd8"][i % 3],
}));

export function FloatingLoot({ pointer }: { pointer: { x: number; y: number } }) {
  const g = useRef<Group>(null);
  useFrame((state) => {
    if (!g.current) return;
    g.current.rotation.y = state.clock.elapsedTime * 0.2;
    g.current.children.forEach((m, i) => {
      m.position.y = ITEMS[i].y + Math.sin(state.clock.elapsedTime + i) * 0.2 + pointer.y * 0.4;
    });
  });
  return (
    <group ref={g}>
      {ITEMS.map((it, i) => (
        <mesh key={i} position={[it.x, it.y, it.z]}>
          <icosahedronGeometry args={[0.22, 0]} />
          <meshStandardMaterial color={it.c} emissive={it.c} emissiveIntensity={0.6} />
        </mesh>
      ))}
    </group>
  );
}
```

- [ ] **Step 4: Write `src/components/three/Rig.tsx`** (cursor-parallax camera)

```tsx
"use client";
import { useFrame, useThree } from "@react-three/fiber";

export function Rig({ pointer }: { pointer: { x: number; y: number } }) {
  const { camera } = useThree();
  useFrame(() => {
    camera.position.x += (pointer.x * 2 - camera.position.x) * 0.04;
    camera.position.y += (pointer.y * 1.2 + 1 - camera.position.y) * 0.04;
    camera.lookAt(0, 0.8, 0);
  });
  return null;
}
```

- [ ] **Step 5: Typecheck & commit**

Run: `npm run typecheck` → no errors.
```bash
git add src/components/three/VoxelAvatar.tsx src/components/three/ArcadeCabinet.tsx src/components/three/FloatingLoot.tsx src/components/three/Rig.tsx
git commit -m "feat(3d): voxel avatar, arcade cabinet, floating loot, camera rig"
```

### Task 7.2: `HeroScene` + dynamic client wrapper + fallback

**Files:** Create `src/components/three/HeroScene.tsx`, `src/components/sections/TitleScreen.tsx`

- [ ] **Step 1: Write `src/components/three/HeroScene.tsx`**

```tsx
"use client";
import { useState } from "react";
import { Canvas } from "@react-three/fiber";
import { Environment, OrbitControls } from "@react-three/drei";
import { EffectComposer, Bloom, Vignette } from "@react-three/postprocessing";
import { VoxelAvatar } from "./VoxelAvatar";
import { ArcadeCabinet } from "./ArcadeCabinet";
import { FloatingLoot } from "./FloatingLoot";
import { Rig } from "./Rig";

export default function HeroScene() {
  const [pointer, setPointer] = useState({ x: 0, y: 0 });
  return (
    <Canvas shadows dpr={[1, 1.8]} camera={{ position: [0, 1.5, 7], fov: 45 }}
      onPointerMove={(e) => setPointer({
        x: (e.clientX / window.innerWidth) * 2 - 1,
        y: -((e.clientY / window.innerHeight) * 2 - 1),
      })}>
      <color attach="background" args={["#0b0b12"]} />
      <fog attach="fog" args={["#0b0b12", 8, 18]} />
      <ambientLight intensity={0.4} />
      <directionalLight position={[5, 8, 5]} intensity={1.4} castShadow />
      <pointLight position={[-4, 2, 2]} color="#ff4fd8" intensity={30} />
      <pointLight position={[4, 2, 2]} color="#00e5ff" intensity={30} />
      <VoxelAvatar />
      <ArcadeCabinet />
      <FloatingLoot pointer={pointer} />
      <mesh rotation={[-Math.PI / 2, 0, 0]} position={[0, -1.2, 0]} receiveShadow>
        <planeGeometry args={[40, 40]} />
        <meshStandardMaterial color="#11111a" />
      </mesh>
      <Rig pointer={pointer} />
      <OrbitControls enablePan={false} enableZoom={false} maxPolarAngle={Math.PI / 2} />
      <Environment preset="night" />
      <EffectComposer>
        <Bloom luminanceThreshold={0.2} intensity={0.9} mipmapBlur />
        <Vignette eskil={false} offset={0.2} darkness={0.9} />
      </EffectComposer>
    </Canvas>
  );
}
```

- [ ] **Step 2: Write `src/components/sections/TitleScreen.tsx`** (dynamic import, INSERT COIN loader, fallback)

```tsx
"use client";
import dynamic from "next/dynamic";
import { motion } from "motion/react";
import { portfolio } from "@/content/portfolio";
import { ArcadeButton } from "@/components/ui/ArcadeButton";
import { Marquee } from "@/components/ui/Marquee";

const HeroScene = dynamic(() => import("@/components/three/HeroScene"), {
  ssr: false,
  loading: () => (
    <div className="absolute inset-0 grid place-items-center">
      <p className="font-pixel text-pop-yellow animate-pulse">INSERT COIN…</p>
    </div>
  ),
});

export function TitleScreen() {
  const { profile } = portfolio;
  const reduced = typeof window !== "undefined" && window.matchMedia?.("(prefers-reduced-motion: reduce)").matches;
  return (
    <section id="title" aria-label="Title screen" className="relative h-screen w-full overflow-hidden">
      <div className="absolute inset-0">
        {reduced
          ? <img src="/sprites/hero-fallback.png" alt="Arcade hero scene" className="h-full w-full object-cover" />
          : <HeroScene />}
      </div>
      <div className="relative z-10 flex h-full flex-col items-center justify-center text-center px-4 pointer-events-none">
        <motion.h1 initial={{ scale: 0.8, opacity: 0 }} animate={{ scale: 1, opacity: 1 }}
          transition={{ type: "spring", stiffness: 200, damping: 14 }}
          className="font-comic text-5xl md:text-8xl text-pop-yellow [-webkit-text-stroke:2px_black] drop-shadow-[6px_6px_0_#000]">
          {profile.name.toUpperCase()}
        </motion.h1>
        <p className="font-pixel text-xs md:text-base text-pop-cyan mt-4">{profile.title}</p>
        <p className="font-body text-paper/90 max-w-xl mt-4">{profile.tagline}</p>
        <div className="mt-8 pointer-events-auto">
          <ArcadeButton href="#about" color="red" className="text-base animate-pulse">▶ PRESS START</ArcadeButton>
        </div>
      </div>
      <div className="absolute bottom-0 inset-x-0 z-10">
        <Marquee items={["INSERT COIN", "1 PLAYER", "HIGH SCORE: 999999", "PRESS START", ...profile.socials.map((s) => s.label)]} />
      </div>
    </section>
  );
}
```

- [ ] **Step 3: Typecheck & commit**

Run: `npm run typecheck` → no errors.
```bash
git add src/components/three/HeroScene.tsx src/components/sections/TitleScreen.tsx
git commit -m "feat(3d): HeroScene + Title Screen w/ dynamic load + reduced-motion fallback"
```

---

# PHASE 8 — App Assembly (layout, page, 404, blog stub)

### Task 8.1: Root layout with fonts + providers + metadata

**Files:** Create `src/app/layout.tsx`

- [ ] **Step 1: Write `src/app/layout.tsx`**

```tsx
import type { Metadata } from "next";
import { Press_Start_2P, Bungee, Bangers, Space_Grotesk, JetBrains_Mono, Pirata_One } from "next/font/google";
import { Providers } from "@/providers/Providers";
import { Hud } from "@/components/hud/Hud";
import { Scanlines } from "@/components/effects/Scanlines";
import { PixelCursor } from "@/components/effects/PixelCursor";
import { portfolio } from "@/content/portfolio";
import "./globals.css";

const press = Press_Start_2P({ weight: "400", subsets: ["latin"], variable: "--font-press-start" });
const bungee = Bungee({ weight: "400", subsets: ["latin"], variable: "--font-bungee" });
const bangers = Bangers({ weight: "400", subsets: ["latin"], variable: "--font-bangers" });
const space = Space_Grotesk({ subsets: ["latin"], variable: "--font-space-grotesk" });
const jet = JetBrains_Mono({ subsets: ["latin"], variable: "--font-jetbrains" });
const black = Pirata_One({ weight: "400", subsets: ["latin"], variable: "--font-blackletter" });

export const metadata: Metadata = {
  metadataBase: new URL("https://press-start.vercel.app"),
  title: `${portfolio.profile.name} — ${portfolio.profile.title}`,
  description: portfolio.profile.tagline,
  openGraph: {
    title: `${portfolio.profile.name} — Portfolio`,
    description: portfolio.profile.tagline, type: "website",
  },
  twitter: { card: "summary_large_image" },
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en" className={`${press.variable} ${bungee.variable} ${bangers.variable} ${space.variable} ${jet.variable} ${black.variable}`}>
      <body className="scanlines">
        <a href="#about" className="skip-link font-pixel text-xs">Skip to content</a>
        <Providers>
          <Hud />
          {children}
          <Scanlines />
          <PixelCursor />
        </Providers>
      </body>
    </html>
  );
}
```

> Note: `Pirata_One` is a Google blackletter used as the default "Deutsch Gothic" stand-in. To use the real Deutsch Gothic, place `DeutschGothic.ttf` in `public/fonts/`, swap to `next/font/local`, and keep the `--font-blackletter` variable name.

- [ ] **Step 2: Commit**

```bash
git add src/app/layout.tsx
git commit -m "feat: root layout — fonts, providers, HUD, global effects, metadata"
```

### Task 8.2: Home page assembly + Konami easter egg

**Files:** Create `src/app/page.tsx`

- [ ] **Step 1: Write `src/app/page.tsx`**

```tsx
"use client";
import { useState } from "react";
import { useKonami } from "@/hooks/useKonami";
import { PowBurst } from "@/components/effects/PowBurst";
import { TitleScreen } from "@/components/sections/TitleScreen";
import { CharacterSelect } from "@/components/sections/CharacterSelect";
import { CampaignLog } from "@/components/sections/CampaignLog";
import { BossFights } from "@/components/sections/BossFights";
import { PowerUpShop } from "@/components/sections/PowerUpShop";
import { Archives } from "@/components/sections/Archives";
import { Transmissions } from "@/components/sections/Transmissions";
import { SideQuests } from "@/components/sections/SideQuests";
import { Inventory } from "@/components/sections/Inventory";
import { TrophyRoom } from "@/components/sections/TrophyRoom";
import { ContinueScreen } from "@/components/sections/ContinueScreen";

export default function Home() {
  const [unlocked, setUnlocked] = useState(false);
  useKonami(() => setUnlocked(true));
  return (
    <main>
      <TitleScreen />
      <CharacterSelect />
      <CampaignLog />
      <BossFights />
      <PowerUpShop />
      <Archives />
      <Transmissions />
      <SideQuests />
      <Inventory />
      <TrophyRoom />
      <ContinueScreen />
      {unlocked && (
        <div className="fixed bottom-6 left-1/2 -translate-x-1/2 z-[90]">
          <PowBurst word="1UP! KONAMI UNLOCKED" />
        </div>
      )}
    </main>
  );
}
```

- [ ] **Step 2: Build to verify the whole app compiles**

Run: `npm run build`
Expected: build succeeds (all sections + 3D dynamic import compile).

- [ ] **Step 3: Commit**

```bash
git add src/app/page.tsx
git commit -m "feat: assemble all 11 stages + Konami easter egg on home page"
```

### Task 8.3: GAME OVER 404 + blog stub

**Files:** Create `src/app/not-found.tsx`, `src/app/blog/[slug]/page.tsx`

- [ ] **Step 1: Write `src/app/not-found.tsx`**

```tsx
import Link from "next/link";
import { ArcadeButton } from "@/components/ui/ArcadeButton";

export default function NotFound() {
  return (
    <main className="grid min-h-screen place-items-center text-center px-4">
      <div>
        <h1 className="font-comic text-6xl md:text-8xl text-pop-red [-webkit-text-stroke:2px_black]">GAME OVER</h1>
        <p className="font-pixel text-xs text-pop-yellow mt-4">404 — STAGE NOT FOUND</p>
        <div className="mt-8"><Link href="/"><ArcadeButton color="green">▶ CONTINUE</ArcadeButton></Link></div>
      </div>
    </main>
  );
}
```

- [ ] **Step 2: Write `src/app/blog/[slug]/page.tsx`** (stub reading from content)

```tsx
import { notFound } from "next/navigation";
import Link from "next/link";
import { portfolio } from "@/content/portfolio";
import { ArcadeButton } from "@/components/ui/ArcadeButton";

export function generateStaticParams() {
  return portfolio.blogs.map((b) => ({ slug: b.slug }));
}

export default async function BlogPost({ params }: { params: Promise<{ slug: string }> }) {
  const { slug } = await params;
  const post = portfolio.blogs.find((b) => b.slug === slug);
  if (!post) notFound();
  return (
    <main className="mx-auto max-w-2xl px-5 py-28">
      <Link href="/#blogs" className="font-pixel text-xs text-pop-cyan">◂ BACK</Link>
      <h1 className="font-comic text-4xl text-pop-yellow mt-4 [-webkit-text-stroke:1px_black]">{post.title}</h1>
      <p className="font-pixel text-[10px] mt-2">{post.date} · {post.readingMins} MIN READ</p>
      <p className="font-body mt-6">{post.excerpt}</p>
      <p className="font-body mt-4 text-paper/70 italic">Full post content coming soon — wire to MDX when ready.</p>
      <div className="mt-8"><ArcadeButton href="/#blogs" color="green">▶ MORE ISSUES</ArcadeButton></div>
    </main>
  );
}
```

- [ ] **Step 3: Build + commit**

Run: `npm run build` → succeeds.
```bash
git add src/app/not-found.tsx src/app/blog/
git commit -m "feat: GAME OVER 404 + blog stub route"
```

---

# PHASE 9 — A11y / Perf / SEO polish

### Task 9.1: sitemap, robots, OG image

**Files:** Create `src/app/sitemap.ts`, `src/app/robots.ts`, `src/app/opengraph-image.tsx`

- [ ] **Step 1: Write `src/app/sitemap.ts`**

```ts
import type { MetadataRoute } from "next";
import { portfolio } from "@/content/portfolio";
const base = "https://press-start.vercel.app";
export default function sitemap(): MetadataRoute.Sitemap {
  return [
    { url: base, priority: 1 },
    ...portfolio.blogs.map((b) => ({ url: `${base}/blog/${b.slug}`, priority: 0.6 })),
  ];
}
```

- [ ] **Step 2: Write `src/app/robots.ts`**

```ts
import type { MetadataRoute } from "next";
export default function robots(): MetadataRoute.Robots {
  return { rules: { userAgent: "*", allow: "/" }, sitemap: "https://press-start.vercel.app/sitemap.xml" };
}
```

- [ ] **Step 3: Write `src/app/opengraph-image.tsx`** (generated OG card)

```tsx
import { ImageResponse } from "next/og";
import { portfolio } from "@/content/portfolio";
export const size = { width: 1200, height: 630 };
export const contentType = "image/png";
export default function OG() {
  return new ImageResponse(
    (
      <div style={{ width: "100%", height: "100%", display: "flex", flexDirection: "column",
        alignItems: "center", justifyContent: "center", background: "#0b0b12", color: "#ffd23f",
        fontSize: 80, fontWeight: 700, border: "16px solid #0a0a0a" }}>
        <div>{portfolio.profile.name.toUpperCase()}</div>
        <div style={{ fontSize: 32, color: "#00e5ff", marginTop: 16 }}>{portfolio.profile.title}</div>
        <div style={{ fontSize: 24, color: "#fdf6e3", marginTop: 24 }}>▶ PRESS START</div>
      </div>
    ), { ...size }
  );
}
```

- [ ] **Step 4: Build + commit**

Run: `npm run build` → succeeds (OG route compiles).
```bash
git add src/app/sitemap.ts src/app/robots.ts src/app/opengraph-image.tsx
git commit -m "feat: sitemap, robots, generated OG image"
```

### Task 9.2: A11y + reduced-motion audit pass

**Files:** Modify section/effect files as needed.

- [ ] **Step 1: Verify checklist (manual + grep)**
  - All `<section>` have `aria-label` (via `Stage`). TitleScreen has explicit `aria-label`.
  - Decorative effects (`Scanlines`, `Speedlines`, `HalftoneBg`, `PixelCursor`, `PowBurst` bursts) have `aria-hidden` or are non-content.
  - Interactive controls are real `<button>`/`<a>` with labels (HUD buttons have `aria-label`).
  - `HealthBar` exposes `role="progressbar"`.
  - Skip link present in layout.
  - Run: `grep -rL "aria-label" src/components/sections` — review any section missing a landmark label.
- [ ] **Step 2: Confirm reduced-motion** — TitleScreen swaps to static image; globals.css kills animations. Verify by toggling OS reduce-motion in browser later.
- [ ] **Step 3: Commit any fixes**

```bash
git add -A && git commit -m "a11y: landmark labels, aria-hidden on decorative effects, reduced-motion checks"
```

---

# PHASE 10 — E2E smoke + full verification

### Task 10.1: Playwright smoke test

**Files:** Create `e2e/smoke.spec.ts`

- [ ] **Step 1: Write `e2e/smoke.spec.ts`**

```ts
import { test, expect } from "@playwright/test";
const STAGES = ["title","about","experience","projects","packages","research","blogs","volunteer","skills","certifications","contact"];

test("home loads with all 11 stages and no console errors", async ({ page }) => {
  const errors: string[] = [];
  page.on("console", (m) => { if (m.type() === "error") errors.push(m.text()); });
  await page.goto("/");
  await expect(page.locator("text=PRESS START").first()).toBeVisible();
  for (const id of STAGES) {
    await expect(page.locator(`#${id}`)).toHaveCount(1);
  }
  expect(errors, errors.join("\n")).toEqual([]);
});

test("stage-select menu navigates", async ({ page }) => {
  await page.goto("/");
  await page.getByLabel("Open stage select menu").click();
  await expect(page.getByRole("navigation", { name: /stage select/i })).toBeVisible();
});
```

- [ ] **Step 2: Install browser + run**

Run: `npx playwright install chromium && npm run test:e2e`
Expected: 2 passing (builds, serves, asserts).

- [ ] **Step 3: Commit**

```bash
git add e2e/smoke.spec.ts
git commit -m "test(e2e): smoke — all stages render, menu navigates, no console errors"
```

### Task 10.2: Full green gate

- [ ] **Step 1:** `npm run typecheck` → no errors.
- [ ] **Step 2:** `npm run test` → all unit tests pass.
- [ ] **Step 3:** `npm run build` → succeeds.
- [ ] **Step 4:** `npm run test:e2e` → passes.
- [ ] **Step 5: Commit** (if any fixes) `git commit -am "chore: green typecheck/test/build/e2e"`

---

# PHASE 11 — Deploy config + docs

### Task 11.1: README + Vercel readiness

**Files:** Create `README.md`; verify `.gitignore`.

- [ ] **Step 1: Write `README.md`**

```markdown
# 🕹️ PRESS START — Arcade-Comic Portfolio

A scroll-as-experience developer portfolio: a playable retro arcade cartridge × comic book.
Built with Next.js 15, Tailwind v4, Motion, and React Three Fiber.

## Run
\`\`\`bash
npm install
npm run dev      # http://localhost:3000
\`\`\`

## Test
\`\`\`bash
npm run test       # unit (Vitest)
npm run test:e2e   # smoke (Playwright)
npm run build      # production build
\`\`\`

## Edit content
All content lives in **`src/content/portfolio.ts`** (typed by `src/content/types.ts`).
Swap placeholder text/links/sprites there — no component edits needed.
Drop pixel art into `public/sprites/`, sounds into `public/sfx/`.

## Fonts
Google fonts load automatically. To use the real Deutsch Gothic / The Wildeast blackletter,
add the `.ttf` to `public/fonts/`, switch `--font-blackletter` to `next/font/local` in `src/app/layout.tsx`.

## Deploy (Vercel)
Push to GitHub → import in Vercel → framework auto-detected (Next.js) → deploy. No env vars required.
\`\`\`bash
npx vercel        # or: npx vercel --prod
\`\`\`
```

- [ ] **Step 2: Verify `.gitignore`** includes `node_modules/ .next/ out/ .vercel/`.

- [ ] **Step 3: Final commit**

```bash
git add README.md .gitignore
git commit -m "docs: README with run/test/content/deploy instructions"
```

- [ ] **Step 4: (Optional) Deploy** — `npx vercel --prod` (interactive login required; user runs this).

---

## Self-Review (run against the spec)

**1. Spec coverage** — every spec section maps to tasks:
- 11 sections → Tasks 7.2 (Home/Title) + 6.1–6.10 (other 10). ✓
- Visual system (tokens/fonts/effects) → Tasks 0.2, 3.1, 8.1. ✓
- 3D hero (procedural voxel, dynamic load, fallback) → Phase 7. ✓
- Content layer (typed, swappable) → Phase 1. ✓
- HUD (coins/XP/level/pause/sound) → Phase 5. ✓
- Easter eggs (Konami, GAME OVER 404, INSERT COIN loader, marquees, pixel cursor) → 2.2/8.2, 8.3, 7.2, 4.3, 3.1. ✓
- A11y/perf/SEO (landmarks, reduced-motion, sitemap/robots/OG, lazy 3D) → Phase 9 + 7.2 + 8.1. ✓
- Testing (unit + smoke + build gate) → Phases scattered + Phase 10. ✓
- Deploy (Vercel, README) → Phase 11. ✓

**2. Placeholder scan** — no "TBD/TODO/handle edge cases" left in steps; the blog "full content coming soon" is intentional in-product copy for a stub route, not a plan placeholder.

**3. Type consistency** — `portfolio`/`Portfolio` shape (Task 1.1/1.2) is consumed with matching field names by every section (6.x) and 3D/title (7.2); `SfxName`/`SectionId`/`SECTION_LABELS` (2.1) used consistently in `useSound`, `Hud`, `PauseMenu`, `Stage`; `HealthBar`/`Panel`/`ArcadeButton`/`ComicPanel` props match call sites; `Rarity` map in TrophyRoom matches `types.ts`. ✓

---

## Execution notes
- **Parallel fan-out:** After Phase 5, Tasks 6.1–6.10 and Phase 7 are independent (read-only on content + primitives) → ideal for parallel subagents, each owning its own files. Re-converge at Phase 8.
- **Order within parallel work doesn't matter**, but Phase 8 (page assembly) imports all sections, so it must run after they exist.
