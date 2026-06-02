# 🕹️ PRESS START — Arcade-Comic Developer Portfolio (Design Spec)

- **Date:** 2026-05-29
- **Owner:** Player One (hello@example.com)
- **Status:** Approved (design) → ready for implementation plan
- **Working title:** "PRESS START" (renameable)

---

## 1. Overview

A single-page, scroll-as-experience developer portfolio styled as a **playable retro
arcade cartridge crossed with a comic book**. The visitor `INSERT COIN` →
`PRESS START` → scrolls through "stages," each of the 11 portfolio sections rendered as
a **game screen drawn as a comic panel**, all wrapped in a persistent neobrutalist
arcade-cabinet **HUD**. The aesthetic fuses neobrutalism × RetroUI with
retro / gaming / medieval / comic / anime vibes under one unifying fiction so the chaos
reads as intentional. Built as fully-custom code, deployable to Vercel.

### Design pillars
1. **One backbone, many vibes** — the arcade-comic fiction makes every style "another
   screen of the same game."
2. **Scroll is play** — scrolling drives the HUD, camera, reveals, and progression.
3. **Goofy but premium** — loud and playful, executed with neobrutalist precision (thick
   ink borders, hard shadows, deliberate type, real motion design).
4. **Heavy where it counts** — one maxed-out 3D hero; everything else rich-but-light 2D.
5. **Content as data** — placeholder content now, swap to real content later with zero
   component edits.

---

## 2. Goals & Non-Goals

### Goals
- Distinctive, memorable, "best/different from anyone" arcade-comic portfolio.
- All 11 sections present and reframed in-fiction.
- Smooth, performant scroll experience (target 60fps scroll on mid-tier laptop).
- One interactive WebGL hero centerpiece; rich 2D motion elsewhere.
- One-click Vercel deploy, good Lighthouse (perf/a11y/SEO) scores.
- Easy content swap via a single typed content layer.
- Accessible (keyboard, reduced-motion, semantic landmarks) despite the game chrome.

### Non-Goals (YAGNI)
- No CMS / backend / database. Content is local typed data (+ optional MDX later).
- No auth, no real high-score persistence beyond `localStorage` flavor.
- No real playable game engine — the "game" is aesthetic + light interactions, not a
  physics platformer. (A hidden mini-game is an optional stretch, not in scope.)
- No multi-language i18n in v1.
- No e-commerce, analytics dashboards, or server-rendered personalization.

---

## 3. The Concept — sections reframed

Default scroll order follows the user's original list. Each maps to an in-game screen:

| # | Section | In-game screen | Dominant vibe |
|---|---|---|---|
| 1 | **Home** | `TITLE SCREEN / INSERT COIN` — 3D hero arcade scene + PRESS START | the WebGL piece |
| 2 | **About** | `PLAYER 1 — CHARACTER SELECT` — bio stat-card + origin-story comic strip | comic |
| 3 | **Experience** | `CAMPAIGN LOG / STAGE SELECT` — jobs as cleared levels on a side-scroll map | retro RPG |
| 4 | **Projects** | `BOSS FIGHTS` — each project a boss w/ health bar + comic showcase panel | comic + arcade |
| 5 | **NPM Packages** | `POWER-UP SHOP` — packages as power-ups; downloads = ammo; `npm i` to "buy" | arcade |
| 6 | **Research** | `ARCHIVES / SCROLLS OF LORE` — papers as ancient tomes (the medieval beat) | medieval |
| 7 | **Blogs** | `TRANSMISSIONS` — posts as comic-book issues / news bulletins | comic / anime |
| 8 | **Volunteer** | `SIDE QUESTS / CO-OP` — community missions | RPG |
| 9 | **Skills** | `INVENTORY / SKILL TREE` — abilities w/ levels in a grid/tree | RPG |
| 10 | **Certifications** | `TROPHY ROOM / ACHIEVEMENTS UNLOCKED` — badge case | arcade |
| 11 | **Contact** | `CONTINUE? — ENTER YOUR NAME` — contact form as high-score entry screen | arcade |

---

## 4. Visual System

### Color — comic-pop on CRT-black
- **Ink:** `#0A0A0A` (borders/outlines, 3–4px, hard offset drop shadows — neobrutalism).
- **Paper:** `#FDF6E3` warm comic-page cream (panel surfaces).
- **Backdrop:** near-black CRT `#0B0B12` with vignette.
- **Pop accents:** electric red `#FF3B3B`, pop-yellow `#FFD23F`, cyan `#00E5FF`,
  magenta `#FF4FD8`, arcade-green `#39FF14`.
- **Textures:** Ben-Day / halftone dot patterns; scanline overlay; subtle paper grain.
- Tailwind theme tokens for all of the above; a `data-theme`/CRT toggle for an optional
  "lights off" CRT-heavy mode.

### Typography
- `Press Start 2P` — pixel; HUD, labels, scores, buttons.
- `Bungee` / `Bangers` — comic display headings & onomatopoeia.
- **Deutsch Gothic** (self-hosted blackletter) — the medieval Archives/Research section
  and easter eggs. (The Wildeast available as alt display.)
- `Space Grotesk` — body copy.
- `JetBrains Mono` — code snippets, package install lines, mono accents.
- All Google fonts via `next/font`; Deutsch Gothic / The Wildeast self-hosted from
  `public/fonts/` with `next/font/local` (license note in repo).

### Signature effects
- CRT scanlines + flicker + vignette overlay (CSS, GPU-friendly, reduced-motion aware).
- Chromatic-aberration on hover for headings/panels.
- Halftone shading on panels and images.
- Comic `POW! / BOOM! / NICE!` bursts on key clicks.
- Anime **speedlines** on section enter.
- Pixel-sprite animations (idle avatar, spinning coins, blinking cursor).
- Marquee tickers (`INSERT COIN`, news/now-playing ticker).
- Custom **pixel/crosshair cursor** with trail.
- 8-bit **SFX** on hover/click (Web Audio; **muted by default**, toggle in HUD;
  respects reduced-motion / autoplay policy).
- `STAGE CLEAR` wipe transitions between sections.
- **Konami code** (`↑↑↓↓←→←→BA`) easter egg → cosmetic unlock (e.g. confetti coins +
  "1UP" + secret message).
- `GAME OVER` 404 page; `INSERT COIN` loading state.

---

## 5. The 3D Hero (React Three Fiber)

The single heavy WebGL piece — `TITLE SCREEN`.

- **Scene:** a neon arcade built **procedurally from instanced voxels** (no external
  GLTF model dependency, so it always builds): a low-poly pixel **avatar "the hero"**
  idling beside an arcade cabinet, floating **loot** (coins, floppy disks, power-ups)
  that drift toward the cursor, neon **bloom** lighting, fog, ground reflections.
- **Interaction:** drag-to-orbit (clamped), cursor parallax, loot reacts to pointer,
  `PRESS START` triggers a **scroll-driven camera** pull-back that hands off to the 2D
  stages.
- **Tech:** `@react-three/fiber`, `@react-three/drei`, `@react-three/postprocessing`.
- **Loading/perf:** dynamic `import()` with `ssr: false`, Suspense **INSERT COIN** pixel
  loader; instanced meshes; capped DPR; pauses render when offscreen.
- **Fallbacks:** static comic-panel hero image for mobile / low-power / WebGL-unavailable
  / `prefers-reduced-motion`.

---

## 6. Architecture

### Stack
Next.js (App Router) + TypeScript + Tailwind CSS + Framer Motion (`motion`) +
React Three Fiber / drei / postprocessing. No backend.

### Shape
- `/` — one long scroll page: sticky HUD + all 11 stage sections.
- `/blog/[slug]` — stub route for future long-form posts (lists from content now).
- `not-found.tsx` — `GAME OVER` 404.

### Directory structure (target)
```
src/
  app/
    layout.tsx            # fonts, providers, metadata
    page.tsx              # assembles all stages
    not-found.tsx         # GAME OVER
    blog/[slug]/page.tsx  # stub
    globals.css           # tailwind + base + effect layers
  components/
    ui/                   # primitives (see inventory)
    sections/             # one file per stage section
    hud/                  # HUD bar + pause menu
    three/                # R3F hero scene + pieces
    effects/              # Scanlines, Halftone, Speedlines, PowBurst, Marquee, Cursor
  hooks/                  # useSound, useKonami, useScrollProgress, useCursor, useInView
  providers/              # SoundProvider, Motion/CRT provider
  content/
    portfolio.ts          # ALL section data, typed
    types.ts              # content types
  lib/                    # utils (cn, sfx map, constants)
public/
  fonts/                  # Deutsch Gothic, The Wildeast
  sfx/                    # 8-bit sounds
  sprites/                # pixel art, fallback hero image, OG image
```

### Content layer
A single typed `src/content/portfolio.ts` (validated by `src/content/types.ts`) exports
one object per section (profile, about, experience[], projects[], packages[],
research[], blogs[], volunteer[], skills[], certifications[], contact). Every section
component reads only from this file → placeholder→real swap never touches components.

### Component inventory
- **ui/**: `Panel` (neobrutalist), `ArcadeButton`, `SpeechBubble`, `ComicPanel`,
  `HalftoneBg`, `ScanlineOverlay`, `Marquee`, `HealthBar`, `Sprite`, `Badge`, `StatBar`,
  `SectionHeader`, `PixelDivider`.
- **hud/**: `Hud` (sticky cabinet bar: coins counter, HP hearts, XP/level bar tied to
  scroll, ☰ pause menu, sound toggle, CRT toggle), `PauseMenu` (jump to any stage).
- **sections/**: `TitleScreen`, `CharacterSelect`, `CampaignLog`, `BossFights`,
  `PowerUpShop`, `Archives`, `Transmissions`, `SideQuests`, `Inventory`, `TrophyRoom`,
  `ContinueScreen`.
- **three/**: `HeroScene`, `VoxelAvatar`, `ArcadeCabinet`, `FloatingLoot`, `Rig`.
- **effects/**: `Scanlines`, `Halftone`, `Speedlines`, `PowBurst`, `Marquee`,
  `PixelCursor`.

### Hooks / providers
`useScrollProgress` (drives HUD + camera + reveals), `useKonami`, `useSound`
(Web Audio, muted default), `useCursor`, `useInView`. `SoundProvider`, motion/CRT
context.

---

## 7. Interactions & easter eggs
- Coins counter climbs as you scroll / discover sections.
- XP/level bar fills with scroll progress; "STAGE CLEAR" on entering a new section.
- Arcade buttons emit SFX + `PowBurst` when sound is on.
- Konami code → cosmetic 1UP unlock.
- Hover sounds + chromatic aberration on interactive elements.
- All flavor state persisted in `localStorage` where relevant (sound/CRT prefs).

---

## 8. Accessibility, Performance, SEO

### A11y
- Real semantic landmarks (`header`, `main`, `section` w/ `aria-label`, `nav`, `footer`)
  beneath the game chrome.
- Full keyboard navigation; visible focus states; skip-to-content link.
- `prefers-reduced-motion`: disables flicker/speedlines/auto-motion, swaps 3D for static.
- Sound **off by default**; explicit toggle.
- Sufficient contrast for body text; decorative effects marked `aria-hidden`.
- Alt text on all sprites/images.

### Performance
- WebGL only in hero, dynamically imported, paused offscreen, capped DPR.
- Static fallback hero for mobile/low-power.
- Next/font, image optimization, code-split sections, lazy effects.
- Targets: LCP < 2.5s, smooth 60fps scroll on mid laptop, Lighthouse perf ≥ 85
  (desktop), a11y ≥ 95.

### SEO
- Next `metadata` (title/description/OG/Twitter), generated **OG image**, `sitemap.ts`,
  `robots.ts`, JSON-LD `Person` schema.

---

## 9. Testing approach (pragmatic for a visual site)
- **Vitest + Testing Library**: content wiring (each section renders its data) + hook
  logic (`useKonami` sequence detection, `useScrollProgress` math).
- **Playwright smoke test**: page loads, all 11 stages present in DOM, no console errors,
  reduced-motion path renders fallback.
- **Green `next build`** is a hard gate.
- Pixels/feel reviewed via browser + Lighthouse (chrome-devtools), not asserted.

---

## 10. Build phases (with multi-agent orchestration)
1. **Foundation** — scaffold Next.js+TS+Tailwind, fonts, theme tokens, providers,
   content types + placeholder data, base globals.
2. **UI primitives** — neobrutalist `ui/` kit + `effects/` + tests.
3. **HUD** — sticky cabinet bar + pause menu + scroll progress wiring.
4. **Sections (parallel)** — implement the 11 section components (each reads shared
   content; independent → parallelizable via workflow).
5. **3D hero** — R3F scene, loader, fallback.
6. **Polish** — transitions, SFX, Konami, cursor, marquees, 404.
7. **A11y / perf / SEO** — audit + fixes, OG image, sitemap.
8. **Deploy** — Vercel config, build verification, README.

Heavy steps (4, plus reviews) use parallel agents; foundation/primitives are sequential
prerequisites.

---

## 11. Deployment
- Vercel zero-config Next.js. `vercel.json` only if needed.
- `README.md` with run/deploy/content-edit instructions.
- Node + framework versions pinned; no server env vars required for v1.

---

## 12. Decisions locked
- Stack: **Next.js + Motion + R3F**.
- Content: **placeholder now, typed `.ts` data, swap later**.
- Theme spine: **Arcade × Comic Mashup**.
- 3D budget: **one maxed-out WebGL hero; rich 2D everywhere else**.
- Section order: **original user list order**.

## 13. Success criteria
- All 11 sections live, in-fiction, populated with placeholder data from one content file.
- Interactive 3D hero with graceful fallback.
- Distinctive arcade-comic aesthetic with the signature effects working.
- `next build` green; Playwright smoke + unit tests pass.
- Deploys to Vercel; Lighthouse perf ≥ 85 desktop, a11y ≥ 95.
- Swapping placeholder → real content requires editing only `src/content/`.
