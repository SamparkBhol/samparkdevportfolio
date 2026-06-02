# 🎮 PLAYER ONE — Game Boy Title Screen + Playable "BLOX" (Design Spec)

- **Date:** 2026-05-29
- **Status:** Approved → ready for implementation plan
- **Feature:** Replace the 3D-robot title screen with a life-size 2D DMG-style handheld
  that boots up and plays a real falling-blocks game on its dot-matrix LCD.
- **Parent project:** PRESS START arcade-comic portfolio.

---

## 1. Overview

The site's title screen becomes a **classic gray DMG-style handheld console** ("PLAYER ONE ·
PB-01"). On scroll-in it runs a **boot sequence** (logo-drop + CRT power-on flash + 8-bit
chime), then plays a **fully working falling-blocks puzzle game ("BLOX")** on an authentic
**160×144 pea-green 4-shade dot-matrix LCD**. The device's **D-pad / A / B / START / SELECT
physically work** (mouse + keyboard). A prominent **"▼ ENTER PORTFOLIO"** prompt scrolls into
the rest of the site, so the handheld is both the hero *and* a playable toy.

### Trademark safety (hard requirement)
No "Nintendo", "Game Boy", or "Tetris" wordmarks, logos, or boot jingles. Use the original
device name ("PLAYER ONE · PB-01"), generic bezel text ("DOT MATRIX WITH STEREO SOUND"), and
label the cartridge "BLOX". The falling-blocks game *mechanic* is not protected — only the
branding is, which we avoid.

### Pillars
1. **It's real** — a genuine, fun, replayable game, not eye-candy.
2. **It's tactile** — every physical button works and depresses; keyboard too.
3. **It's authentic** — true 160×144 resolution, 4-green palette, scanlines/ghosting.
4. **It's the title** — still gates entry to the portfolio via a clear scroll prompt.

---

## 2. The game — "BLOX"

A complete falling-blocks puzzle:
- **Well:** 10 columns × 18 visible rows.
- **Pieces:** all 7 standard tetromino shapes (I, O, T, S, Z, J, L), each its own color
  index in the 4-green palette; random bag-of-7 spawner.
- **Moves:** left / right, **soft-drop** (down), **hard-drop** (instant), **rotate CW** and
  **rotate CCW** (simple wall-kick: try offset 0, −1, +1, −2, +2).
- **Line clears:** full rows clear with a brief flash; multi-line bonus scoring.
- **Scoring:** classic-style — 1 line = 100, 2 = 300, 3 = 500, 4 = 800, × (level+1);
  soft/hard-drop add small bonuses. **Level** increases every 10 lines; **gravity interval**
  shortens per level. Track **lines** and **level**. **Best score** persisted to
  `localStorage` (`blox.best`).
- **States:** `boot → ready (PRESS START) → playing → paused → gameover`. Game-over screen
  shows score + best + "PRESS START". Pause overlay on START during play.
- **Next-piece preview** rendered in the side panel of the LCD.

---

## 3. Controls

| Action | Device button | Keyboard |
|---|---|---|
| Move left / right | D-pad ◀ ▶ | ← → |
| Soft drop | D-pad ▼ | ↓ |
| Hard drop | **SELECT** | Space |
| Rotate CW | **A** | X or ↑ |
| Rotate CCW | **B** | Z |
| Start / Pause / Restart | **START** | Enter |

- All on-device buttons are real `<button>`s with `aria-label`s and visible press-depress
  animation; clicking dispatches the same action as the key.
- Keyboard handler is active when the Game Boy is on-screen; it calls `preventDefault` only
  for the keys it owns (so page scroll with arrows is intercepted only while focused/hovered —
  see Decisions §8).
- A small hint ("CLICK + ▶ START · or use ← → ↓ Z X SPACE") sits under the device.

---

## 4. Visual design & effects

- **Shell:** dusty DMG **gray** (`#c9c9bd`/`#a7a79b` shading), rounded body with the classic
  off-center LCD, **maroon A/B** buttons, black D-pad, gray START/SELECT pills (angled),
  **red power LED**, speaker grille (diagonal dot grid), volume/contrast nubs, headphone jack,
  cartridge slot with a "BLOX" cart peeking out. Built with CSS + inline SVG (no images).
- **LCD:** a `<canvas>` at 160×144 internal resolution, CSS-upscaled with
  `image-rendering: pixelated`; rendered in 4 greens (`#0f380f #306230 #8bac0f #9bbc0f`).
  Overlays: **scanlines**, faint **pixel-ghosting/trail**, **glass glare sweep**, green glow,
  inner vignette.
- **Boot sequence:** "PLAYER ONE" wordmark drops from top, lands with a bounce + flash + chime;
  LCD does a CRT power-on (bright line → expand); power LED lights.
- **Motion (Framer Motion):** device **parallax tilt toward cursor** (rotateX/rotateY) + gentle
  idle float; **button depress** (translateY + shadow collapse); **line-clear flash** + **screen
  shake**; score pop-ups; cartridge insert wobble on load.
- **Sound:** 8-bit SFX (move, rotate, lock, line-clear, level-up, game-over) via the existing
  `useSound` (muted by default; toggled in HUD). Boot chime only when sound enabled.
- **Reduced motion:** skip boot drop, device tilt, idle float, glare, shake; game still
  playable; LCD static-but-functional.

---

## 5. Architecture (focused, testable units)

```
src/lib/blox.ts            # PURE game logic — no React, no canvas. Unit-tested.
src/hooks/useBlox.ts       # React state + rAF gravity loop + input dispatch; draws to canvas
src/components/gameboy/
  Lcd.tsx                  # 160x144 <canvas> + scanline/glare/boot overlays
  GameBoy.tsx              # DMG shell + buttons + boot + cursor-tilt; wires inputs -> useBlox
src/components/sections/
  TitleScreen.tsx          # rewritten: hosts <GameBoy/> + "ENTER PORTFOLIO" prompt + marquee
```

- **`blox.ts`** exports: `SHAPES`, `createBag()`, `spawn(state)`, `tryMove(state, dx, dy)`,
  `tryRotate(state, dir)`, `hardDrop(state)`, `lockPiece(state)`, `clearLines(board)`,
  `scoreForLines(n, level)`, `gravityMs(level)`, types `BloxState`, `Piece`, `Cell`. All pure
  functions returning new state — no side effects, deterministic given an injected RNG/bag.
- **`useBlox.ts`** owns: current `BloxState`, the rAF/timer gravity loop, a `dispatch(action)`
  for `left|right|softDrop|hardDrop|rotateCW|rotateCCW|startPauseRestart`, `localStorage` best,
  and a `draw(ctx)` that paints the board+piece+preview to the LCD canvas.
- **`GameBoy.tsx`** renders the shell, maps button clicks + a keydown listener to `dispatch`,
  runs the boot animation, and tilts toward the cursor. Receives no props (self-contained) or a
  small `onEnter` to focus the scroll prompt.
- **3D robot:** `HeroScene.tsx` / `HeroBoundary.tsx` are **kept but no longer imported by the
  title**. (Optional follow-up: relocate into the About section — out of scope for this spec.)

---

## 6. Data flow

`keydown` / button `onClick` → `dispatch(action)` → pure `blox.ts` transition → new `BloxState`
in `useBlox` → effect calls `draw(ctx)` on the LCD canvas. A rAF/interval drives `gravity` →
`dispatch('tick')`. Score/level/lines read from state into the LCD side panel + aria-live status.

---

## 7. Testing

- **Unit (`src/lib/blox.test.ts`)**: rotation of each shape stays in-bounds / kicks correctly;
  collision prevents overlap and out-of-bounds; `clearLines` removes full rows and compacts;
  `scoreForLines` matches the table; bag-of-7 yields all 7 before repeating; `gravityMs`
  decreases with level. Pure + deterministic (inject a seeded bag).
- **Render (`GameBoy.test.tsx`)**: device mounts; D-pad/A/B/START buttons present with labels;
  LCD `<canvas>` present; pressing START transitions `ready→playing` (assert via an exposed
  status text / aria-live, not pixels).
- **E2E smoke** (update): `#title` still present; the "ENTER PORTFOLIO" control scrolls to
  `#about`; no uncaught errors. The existing 3 smoke tests must still pass.
- **Green gate:** typecheck + unit + build + e2e.

---

## 8. Decisions locked
- **Game:** falling-blocks ("BLOX"), full implementation (not Snake/Pong).
- **Device:** classic DMG **gray**, original branding (trademark-safe).
- **Title:** Game Boy fully replaces the 3D robot on the title; robot parked (kept in repo).
- **LCD:** real 160×144 canvas, 4-green palette, `image-rendering: pixelated`.
- **Arrow-key capture:** the game claims ← → ↓ ↑ Z X Space/Enter **only while the handheld is
  in view** (IntersectionObserver), so arrow-scrolling the page still works elsewhere.
- **No new npm dependencies** — canvas 2D + Motion (already installed).

## 9. Success criteria
- A genuinely playable falling-blocks game runs on the LCD: pieces fall, move, rotate, lock,
  clear lines, score, level-up, game-over, restart, best-score persists.
- All physical buttons + keyboard work; buttons animate.
- Boot sequence + LCD effects + cursor-tilt land the "wow"; reduced-motion degrades cleanly.
- "ENTER PORTFOLIO" still gates the rest of the site.
- typecheck + unit + build + e2e all green; no new deps.
