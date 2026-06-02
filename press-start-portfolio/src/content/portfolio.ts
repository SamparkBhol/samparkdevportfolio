import type { Portfolio } from "./types";

export const portfolio: Portfolio = {
  profile: {
    name: "Player One", handle: "@player_one", title: "FULL-STACK ADVENTURER",
    tagline: "I build cool sh!t for the web — fast, weird, and well-tested.",
    location: "Earth, Sector 7", avatarSprite: "/sprites/avatar.svg",
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
      { caption: "Found a keyboard.", sprite: "/sprites/origin-1.svg" },
      { caption: "Broke the internet (locally).", sprite: "/sprites/origin-2.svg" },
      { caption: "Shipped to prod. Survived.", sprite: "/sprites/origin-3.svg" },
    ],
  },
  experience: [
    { id: "exp-1", role: "Senior Frontend Engineer", org: "Pixel Forge Inc.", period: "2023 — Now",
      location: "Remote", level: 24, summary: "Lead the web platform guild.",
      highlights: ["Cut LCP 45%", "Shipped design system", "Mentored 5 devs"], stack: ["Next.js", "TS", "R3F"] },
    { id: "exp-2", role: "Full-Stack Developer", org: "Arcade Labs", period: "2021 — 2023",
      location: "Hybrid", level: 16, summary: "Built realtime multiplayer tooling.",
      highlights: ["WebSocket infra", "10k concurrent users"], stack: ["Node", "React", "Postgres"] },
    { id: "exp-3", role: "Junior Developer", org: "Startup Quest", period: "2019 — 2021",
      location: "On-site", level: 8, summary: "First boss fights with production.",
      highlights: ["Shipped MVP", "On-call survivor"], stack: ["JS", "Express", "MySQL"] },
  ],
  projects: [
    { id: "proj-1", name: "NEON DASH", tagline: "A WebGL endless runner", hp: 100, difficulty: "BOSS",
      description: "Browser game with custom shaders and a global leaderboard.", year: "2024",
      tags: ["R3F", "Shaders", "Zustand"], sprite: "/sprites/proj-1.svg",
      links: [{ label: "PLAY", href: "#" }, { label: "CODE", href: "#" }] },
    { id: "proj-2", name: "DEVDECK", tagline: "Dev dashboard CLI+web", hp: 80, difficulty: "HARD",
      description: "Unified dashboard for repos, CI, and incidents.", year: "2023",
      tags: ["Next.js", "tRPC", "Prisma"], sprite: "/sprites/proj-2.svg",
      links: [{ label: "DEMO", href: "#" }, { label: "CODE", href: "#" }] },
    { id: "proj-3", name: "PIXELPAINT", tagline: "Collaborative pixel canvas", hp: 60, difficulty: "NORMAL",
      description: "Realtime multiplayer pixel art board.", year: "2022",
      tags: ["WebSocket", "Canvas"], sprite: "/sprites/proj-3.svg",
      links: [{ label: "TRY", href: "#" }] },
    { id: "proj-4", name: "LORE ENGINE", tagline: "Static site gen for TTRPGs", hp: 40, difficulty: "EASY",
      description: "Markdown to beautiful campaign sites.", year: "2021",
      tags: ["Astro", "MDX"], sprite: "/sprites/proj-4.svg",
      links: [{ label: "DOCS", href: "#" }] },
  ],
  packages: [
    { id: "pkg-1", name: "use-arcade", description: "React hooks for game-feel UIs.", version: "2.1.0",
      weeklyDownloads: 18400, installCmd: "npm i use-arcade", href: "#", tags: ["react", "hooks"] },
    { id: "pkg-2", name: "crt-css", description: "Zero-dep CRT/scanline effects.", version: "1.4.2",
      weeklyDownloads: 9200, installCmd: "npm i crt-css", href: "#", tags: ["css", "effects"] },
    { id: "pkg-3", name: "konami-react", description: "Tiny Konami-code hook.", version: "0.9.0",
      weeklyDownloads: 3100, installCmd: "npm i konami-react", href: "#", tags: ["react", "easter-egg"] },
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
      date: "2025-02-10", readingMins: 7, tags: ["motion", "ux"], cover: "/sprites/blog-1.svg" },
    { slug: "tailwind-v4-tokens", title: "Design Tokens with Tailwind v4", excerpt: "The @theme directive changes everything.",
      date: "2024-12-01", readingMins: 5, tags: ["css", "tailwind"], cover: "/sprites/blog-2.svg" },
    { slug: "r3f-perf", title: "R3F Performance Cheatsheet", excerpt: "Instancing, DPR, and offscreen pausing.",
      date: "2024-09-18", readingMins: 9, tags: ["webgl", "r3f"], cover: "/sprites/blog-3.svg" },
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
      { name: "TypeScript", level: 90, category: "Frontend" }, { name: "Motion", level: 85, category: "Frontend" }] },
    { name: "Graphics", skills: [
      { name: "Three.js / R3F", level: 80, category: "Graphics" }, { name: "GLSL", level: 65, category: "Graphics" },
      { name: "Canvas", level: 78, category: "Graphics" }] },
    { name: "Backend", skills: [
      { name: "Node.js", level: 85, category: "Backend" }, { name: "Postgres", level: 75, category: "Backend" },
      { name: "tRPC", level: 70, category: "Backend" }] },
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
