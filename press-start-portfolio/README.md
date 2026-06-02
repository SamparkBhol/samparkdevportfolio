# 🕹️ PRESS START — Arcade-Comic Portfolio

A scroll-as-experience developer portfolio styled as a playable retro arcade cartridge ×
comic book. Built with **Next.js 15**, **Tailwind v4**, **Motion**, and
**React Three Fiber**. Eleven sections, reframed as game screens, behind a sticky arcade HUD.

## Run

```bash
npm install
npm run dev      # http://localhost:3000
```

## Test

```bash
npm run test       # unit (Vitest) — content wiring + hook logic
npm run test:e2e   # smoke (Playwright) — all stages render, menu, 404
npm run build      # production build
npm run typecheck  # tsc --noEmit
```

## Edit content

All content lives in **`src/content/portfolio.ts`** (typed by `src/content/types.ts`).
Swap the placeholder text / links / sprites there — **no component edits needed**.

- Pixel art / images → `public/sprites/` (referenced as `/sprites/*.png`)
- 8-bit sounds → `public/sfx/` (sound is off by default; toggle in the HUD)

The site degrades gracefully when sprites/sounds are absent (broken images auto-hide,
audio failures are swallowed), so you can ship before adding every asset.

## Sections → game screens

| Section | Screen | Section | Screen |
|---|---|---|---|
| Home | Title Screen (3D) | Research | Archives (blackletter) |
| About | Character Select | Blogs | Transmissions |
| Experience | Campaign Log | Volunteer | Side Quests |
| Projects | Boss Fights | Skills | Inventory / Skill Tree |
| NPM Packages | Power-Up Shop | Certifications | Trophy Room |
| | | Contact | Continue? (high-score entry) |

## Fonts

Loaded via `next/font/google`: Press Start 2P (HUD), Bungee + Bangers (display),
Bricolage Grotesque (body), Space Mono (code), Pirata One (blackletter).
To use the real **Deutsch Gothic** / **The Wildeast**, drop the `.ttf` into
`public/fonts/`, switch `--font-blackletter` to `next/font/local` in `src/app/layout.tsx`,
and keep the variable name.

## Accessibility & performance

- Semantic landmarks under the game chrome, keyboard nav, skip link, visible focus.
- `prefers-reduced-motion` swaps the 3D hero for a static image and disables flicker/motion.
- Sound off by default. WebGL is concentrated in the hero and code-split (home First Load
  JS ≈ 154 kB; 3D loads lazily behind an INSERT COIN loader).

## Deploy (Vercel)

Push to GitHub → import in Vercel → framework auto-detected (Next.js) → deploy.
No environment variables required.

```bash
npx vercel          # preview
npx vercel --prod   # production
```

## Easter eggs

- Konami code (↑↑↓↓←→←→ B A) → 1UP unlock.
- `GAME OVER` 404 page, `INSERT COIN` 3D loader, scrolling marquees, custom pixel cursor.
```
