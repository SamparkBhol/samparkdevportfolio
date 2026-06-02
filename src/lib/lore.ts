/** The Codex of Mainline — hidden lore that explains the dragon, the war, and
 *  the fox. Each fragment is unlocked by a secret interaction somewhere on the
 *  page; collect all five and the myth resolves. Pure data (no DOM) — unit-tested. */

export type LoreId = "realm" | "dragon" | "war" | "fox" | "playerone";

export interface LoreFragment {
  id: LoreId;
  numeral: string; // I..V
  title: string;
  /** the lore line, revealed when found */
  text: string;
  /** a gentle nudge toward how this one is found (shown once earlier ones exist) */
  hint: string;
}

/** Fixed order = Codex slot order. */
export const LORE: LoreFragment[] = [
  {
    id: "realm",
    numeral: "I",
    title: "The Realm",
    text: "This realm is called Mainline. Everything built here is shipped here — there is no staging in legend.",
    hint: "Legends are typed, not found. Speak to the machine.",
  },
  {
    id: "dragon",
    numeral: "II",
    title: "The Dragon",
    text: "Every release wakes the Dragon — the sum of all bugs, circling, never landing. “HERE BE DRAGONS” was never a warning. It is an address.",
    hint: "The moon has seen every release. Knock three times.",
  },
  {
    id: "war",
    numeral: "III",
    title: "The War Below",
    text: "Two armies war without end: the Red of broken builds, the Cyan of passing tests. The Dragon rains fire on both. Mortals call this place production.",
    hint: "Some victories must be cut open. Strike the rarest trophy.",
  },
  {
    id: "fox",
    numeral: "IV",
    title: "The Fox",
    text: "Only the Fox crosses no-man’s-land untouched — too clever to be caught, carrying patches between the trenches. The clever survive what the strong cannot.",
    hint: "The Fox performs for those who ask. Again. And again.",
  },
  {
    id: "playerone",
    numeral: "V",
    title: "Player One",
    text: "One adventurer learned to ride the Dragon instead of slaying it, and tamed the Fox to ride along. That is the whole job.",
    hint: "The oldest spell of all. Up, up, down, down…",
  },
];

export const LORE_TOTAL = LORE.length;
export const LORE_IDS: LoreId[] = LORE.map((l) => l.id);

/** Shown only once every fragment is collected. */
export const LORE_CAPSTONE = {
  title: "THE WHOLE JOB",
  text: "Ride the Dragon. Tame the Fox. Ship into the war and live. — Player One",
  badge: "LORE MASTER",
};

export function isLoreId(v: unknown): v is LoreId {
  return typeof v === "string" && (LORE_IDS as string[]).includes(v);
}

export function loreById(id: LoreId): LoreFragment {
  const f = LORE.find((l) => l.id === id);
  if (!f) throw new Error(`unknown lore id: ${id}`);
  return f;
}
