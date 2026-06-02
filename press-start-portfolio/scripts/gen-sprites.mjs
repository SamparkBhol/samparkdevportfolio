// Generates on-theme placeholder pixel-art SVG sprites into public/sprites/.
// Regenerate with: node scripts/gen-sprites.mjs
import { mkdirSync, writeFileSync } from "node:fs";

const OUT = new URL("../public/sprites/", import.meta.url);
mkdirSync(OUT, { recursive: true });

const C = {
  K: "#0a0a0a", paper: "#fdf6e3", crt: "#0b0b12",
  red: "#ff3b3b", yellow: "#ffd23f", cyan: "#00e5ff", magenta: "#ff4fd8", green: "#39ff14",
  ".": "none",
};

// Render a pixel map (array of equal-length strings) to <rect>s at given cell size.
function pixels(map, cell = 8, legend = C) {
  let out = "";
  map.forEach((row, y) => {
    [...row].forEach((ch, x) => {
      const fill = legend[ch] ?? "none";
      if (fill === "none") return;
      out += `<rect x="${x * cell}" y="${y * cell}" width="${cell}" height="${cell}" fill="${fill}"/>`;
    });
  });
  return out;
}

function svg(w, h, body, bg = C.crt) {
  return `<svg xmlns="http://www.w3.org/2000/svg" width="${w}" height="${h}" viewBox="0 0 ${w} ${h}" shape-rendering="crispEdges">` +
    `<rect width="${w}" height="${h}" fill="${bg}"/><rect x="2" y="2" width="${w - 4}" height="${h - 4}" fill="none" stroke="${C.K}" stroke-width="4"/>` +
    body + `</svg>`;
}

// ---- Avatar: a pixel hero face (16x16 grid, cell 8 => 128px) ----
const FACE = [
  "................",
  ".....KKKKKK.....",
  "....KHHHHHHK....",
  "...KHHHHHHHHK...",
  "..KHSSSSSSSSHK..",
  "..KSSSSSSSSSSK..",
  "..KSEEKSSKEESK..",
  "..KSEEKSSKEESK..",
  "..KSSSSSSSSSSK..",
  "..KSSSKKKKSSSK..",
  "..KSSSSSSSSSSK..",
  "..KSSKMMMMKSSK..",
  "...KSSKKKKSSK...",
  "....KSSSSSSK....",
  ".....KKKKKK.....",
  "................",
];
const faceLegend = { ...C, H: C.red, S: C.yellow, E: C.cyan, M: C.red };
writeFileSync(new URL("avatar.svg", OUT), svg(128, 128, pixels(FACE, 8, faceLegend), C.cyan));

// ---- Cartridges for projects (varied palette) ----
const CART = [
  "................",
  ".KKKKKKKKKKKKKK.",
  ".KAAAAAAAAAAAAK.",
  ".KABBBBBBBBBBAK.",
  ".KABLLLLLLLLBAK.",
  ".KABLLLLLLLLBAK.",
  ".KABBBBBBBBBBAK.",
  ".KAAAAAAAAAAAAK.",
  ".KAAAAAAAAAAAAK.",
  ".KAKKAKKAKKAKAK.",
  ".KAKKAKKAKKAKAK.",
  ".KAAAAAAAAAAAAK.",
  "..KAAAAAAAAAAK..",
  "...KKKKKKKKKK...",
  "................",
  "................",
];
const cartColors = [C.red, C.cyan, C.green, C.magenta];
cartColors.forEach((accent, i) => {
  const legend = { ...C, A: accent, B: C.K, L: C.paper };
  writeFileSync(new URL(`proj-${i + 1}.svg`, OUT), svg(128, 128, pixels(CART, 8, legend), C.yellow));
});

// ---- Origin comic strip scenes (1: keyboard, 2: explosion, 3: rocket) ----
const KEYBOARD = [
  "................","................","................",
  "..KKKKKKKKKKKK..","..KCCCCCCCCCCK..","..KCKCKCKCKCCK..",
  "..KCCCCCCCCCCK..","..KCKKKKKKKCCK..","..KCCCCCCCCCCK..",
  "..KKKKKKKKKKKK..","................","................",
  "................","................","................","................",
];
const EXPLOSION = [
  "................","......RR........",".R...RYYR...R...","..RRRYYYYRRR....",
  ".RYYYYWWYYYYR...","RYYWWWWWWWWYYR..",".RYYYYWWYYYYR...","..RRRYYYYRRR....",
  ".R...RYYR...R...","......RR........","................","................",
  "................","................","................","................",
];
const ROCKET = [
  ".......CC.......","......CCCC......","......CKKC......",".....CCKKCC....","....CCCKKCCC...",
  "....CRCKKCRC...","....CCCKKCCC...","......CCCC......",".....R.CC.R....","....RR.CC.RR...",
  "...R...CC...R..","................","................","................","................","................",
];
const sceneLegend = { ...C, C: C.cyan, R: C.red, Y: C.yellow, W: C.paper };
[["origin-1", KEYBOARD], ["origin-2", EXPLOSION], ["origin-3", ROCKET]].forEach(([name, map]) => {
  writeFileSync(new URL(`${name}.svg`, OUT), svg(128, 96, pixels(map, 8, sceneLegend), C.paper));
});

// ---- Blog covers: CRT TV screens (varied screen color) ----
const TV = [
  "......KK....KK......",".......KK..KK.......","........KKKK........","....KKKKKKKKKKKK....",
  "...KSSSSSSSSSSSSK...","...KSGGGGGGGGGGSK...","...KSGGGGGGGGGGSK...","...KSGGGGGGGGGGSK...",
  "...KSGGGGGGGGGGSK...","...KSSSSSSSSSSSSK...","...KKKKKKKKKKKKKK...","....K.K......K.K....",
];
const tvColors = [C.green, C.cyan, C.magenta];
tvColors.forEach((screen, i) => {
  const legend = { ...C, S: C.K, G: screen };
  writeFileSync(new URL(`blog-${i + 1}.svg`, OUT), svg(152, 96, pixels(TV, 8, legend), C.yellow));
});

// ---- Hero fallback: arcade scene (cabinet + character) ----
const HERO = [
  "..........................",
  "....KKKKKK.....KKKKKKKK....",
  "...KHHHHHHK...KCCCCCCCCK...",
  "..KHSSSSSSHK..KCGGGGGGCK...",
  "..KSSEEKEESSK.KCGGGGGGCK...",
  "..KSSSSSSSSSK.KCGGGGGGCK...",
  "..KSSKMMMMKSK.KCCCCCCCCK...",
  "...KSSSSSSSK..KCKKKKKKCK...",
  "....KRRRRK....KCKRRRRKCK...",
  "....KRRRRK....KCCCCCCCCK...",
  "...KKRRRRKK...KKKKKKKKKK...",
  "..........................",
];
const heroLegend = { ...C, H: C.red, S: C.yellow, E: C.cyan, M: C.red, R: C.red, C: C.K, G: C.cyan };
writeFileSync(new URL("hero-fallback.svg", OUT), svg(416, 234, pixels(HERO, 16, heroLegend), C.crt));

console.log("Generated placeholder sprites in public/sprites/");
