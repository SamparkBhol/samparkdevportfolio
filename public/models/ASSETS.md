# 3D Model Credits

All models here are free to use. Licenses noted; CC0 = public domain (no attribution required).

- **dragon.glb** — rigged + animated dragon by **Mesh2Motion** (mesh2motion.org), **CC0**.
  Self-contained: skinned mesh + animation clips (Fly Flap, Fly Glide, Idle, Walk).
  Used as the animated title hero (plays the flight/flap cycle).

- **Fox.glb** — by **PixelMannen** / rig & animation by **@tomkranis**, **CC0**.
  Animations: Survey, Walk, Run. Used as the cursor-following companion.

- **HDRIs** in `../hdri/` — from **Poly Haven** (polyhaven.com), **CC0**.
  `night.hdr` (dikhololo_night) lights the dragon; `sky.hdr` (the_sky_is_on_fire) is a
  bundled dramatic alternative.

## Swapping
Drop a `.glb` into `public/models/` and point the loader at it:
- Dragon: `src/components/three/DragonScene.tsx` → `useGLTF("/models/<your>.glb")`
  (if it ships animation clips, they'll show up in `useAnimations`).
- Buddy: `src/components/buddy/FoxBuddy.tsx` → `useGLTF("/models/<your>.glb")`.

Free sources: Mesh2Motion (CC0 rigs+anims), Quaternius (CC0), Poly Haven (CC0 HDRIs),
Khronos glTF Sample Assets, Sketchfab (filter Downloadable + CC). Avoid shipping
copyrighted game-studio character files (Skyrim, Tarisland, etc.).
