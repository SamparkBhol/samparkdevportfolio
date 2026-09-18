# Issue No.1, second printing — implementation plan (2026-09-18)

Client verdicts on the first printing, and what changes:

| Verdict | Change |
|---|---|
| "what is 200OK? … it's my general portfolio, not helmit based" | The issue is titled **SAMPARK BHOL · Vol. 1**. "200 OK" survives only as the Helmit flow's real HTTP stamp. Masthead, cover, spine, OG image, icon, README renamed. |
| "resume pdf you made is bad — use this" | `public/cv.pdf` is the client's own PDF. `scripts/build-cv.mjs` stays but is no longer the source. |
| "the flow request animation is pretty good, make that for all experience" | Every role carries a `flow` (traveller, nodes, stamp, optional burst). One data-driven `FlowStrip` renders all five. Each role is a `Stage` of equal weight inside CAMPAIGN. |
| "npm packages should be properly separate" | POWER-UP SHOP chapter from `resume.packages` (three packages, real weekly downloads with the checked date). |
| "you missed interactable terminal" | CONTINUE? carries a real terminal (`src/lib/commands.ts` registry over `resume.ts`). |
| "education and character select" | CHARACTER SELECT (six classes with per-class portraits, real stats, roles and projects per class) + ORIGIN (education with coursework). |
| "medium cards with live games" | TRANSMISSIONS: ten cards, each a CRT running a pure-function mini-game (`src/lib/minigames.ts`), demo while in view, playable on PLAY. |
| "medieval scroll for research" | ARCHIVES: parchment scrolls with rods, wax seal, blackletter titles, unroll on click/drag. |
| "companion fox … must be much better" | `src/components/companion/Fox.tsx`: a vector guide that reacts to `chapter-change`, tracks eyes, speaks one true line per chapter, a command ring, a Konami trick. No cursor chasing by default. |
| "sidequests", "skills", "TV and knife cursor" | SIDE QUESTS (quest log), INVENTORY (RPG slots with USED AT evidence), TROPHY ROOM (anime TV, dagger cursor scoped to the section). |
| "all sections distinct … nothing overwhelms the other" | Twelve chapters, each with its own device (book, select screen, stages, fanned issues, shop counter, cartridge ring, quest log, scrolls, broadcast cards, inventory, TV, terminal). |

## Chapters (src/content/chapters.ts)

00 COVER · 01 CHARACTER SELECT · 02 CAMPAIGN · 03 BOSS FIGHTS · 04 POWER-UP SHOP · 05 ARCADE · 06 SIDE QUESTS · 07 ARCHIVES · 08 TRANSMISSIONS · 09 INVENTORY · 10 TROPHY ROOM · 11 CONTINUE?

## Build

Eight builders in isolated worktrees (Workflow `build-portfolio-v2`), one section group each, verifying with typecheck, build and screenshots at 1440/1024/390. The lead merges the branches, rewrites `src/app/page.tsx`, renames the title everywhere, updates the e2e chapter list, runs unit + lint-numbers + e2e + Lighthouse, then a design-review round with fixes, then re-zips.

Rules unchanged from the final plan: no WebGL, one input one job, nothing moves unless you move it (videos and one blink excepted), every number from `resume.ts`, phones never play video before a gesture.
