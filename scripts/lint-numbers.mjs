// Fails when a number written in JSX text under src/components is not present in the résumé data or the chrome allowlist.
// Keeps invented figures (HP, levels, scores) from creeping back in.
import { readFileSync, readdirSync, statSync } from "node:fs";
import { join } from "node:path";
const walk = (d) => readdirSync(d).flatMap((f) => { const p = join(d, f); return statSync(p).isDirectory() ? walk(p) : p.endsWith(".tsx") ? [p] : []; });
const dataText = readFileSync("src/content/resume.ts", "utf8") + readFileSync("src/content/chapters.ts", "utf8");
const allowed = new Set([...dataText.matchAll(/\d[\d,.]*[%K+]?/g)].map((m) => m[0]));
["200", "404", "0", "1", "00", "01", "02", "03", "04", "05", "2026", "3", "28", "2.4", "4", "6", "058", "403", "400", "422", "2", "9600"].forEach((x) => allowed.add(x));
let bad = [];
for (const file of walk("src/components")) {
  const src = readFileSync(file, "utf8");
  for (const m of src.matchAll(/>([^<>{}]*?)</g)) {
    const text = m[1];
    if (!/\d/.test(text)) continue;
    if (/DEMO/.test(text)) continue;
    for (const n of text.matchAll(/\d[\d,.]*[%K+]?/g)) {
      const tok = n[0].replace(/[.,]$/, "");
      if (!allowed.has(tok)) bad.push(`${file}: "${text.trim().slice(0, 60)}" → ${tok}`);
    }
  }
}
if (bad.length) { console.error("Numbers not backed by resume.ts:\n" + bad.join("\n")); process.exit(1); }
console.log("lint-numbers: every number in JSX text is in the résumé data.");
