import { CHAPTERS } from "@/content/chapters";
import { resume } from "@/content/resume";

/* Patch says one true line per chapter. Every figure below is computed from resume.ts at module
   load, never typed, so the fox cannot drift from the résumé. Keep each line short: it sits in a
   speech balloon about 300 px wide. */

export const FOX_NAME = "Patch, the fox";

const { profile, roles, projects, packages, games, sideQuests, papers, posts, skills, certs, education, classes, contact } = resume;

const ORDINALS = ["first", "second", "third", "fourth", "fifth", "sixth"];
const ordinal = (i: number) => ORDINALS[i] ?? `${i + 1}th`;
const list = (xs: string[]) => (xs.length <= 1 ? xs.join("") : `${xs.slice(0, -1).join(", ")} and ${xs[xs.length - 1]}`);
const firstName = profile.name.split(" ")[0];

const featured = projects.filter((p) => p.featured);
const cairn = projects.find((p) => p.id === "cairn");
const wsn = papers.find((p) => p.authors.length > 1) ?? papers[0];
const solo = papers.find((p) => p.authors.length === 1);
const lastCert = certs[certs.length - 1];

export const FOX_LINES: Record<string, string> = {
  cover: `${roles.length} stages, ${projects.length} bosses, a shop, an arcade and a library. Press R any time for the plain résumé.`,
  select: `One player, ${classes.length} classes. ${education.degree}, ${education.school}, ${education.period}.`,
  campaign: `${roles.length} stages. The newest is ${roles[0].org}, since ${profile.since}.`,
  boss: cairn
    ? `${projects.length} bosses, ${featured.length} featured. ${cairn.name} is the one that remembers what it tried.`
    : `${projects.length} bosses, ${featured.length} featured.`,
  shop: `${packages.length} packages on npm: ${list(packages.map((p) => p.name))}. Real weekly downloads, counted on ${packages[0].checkedOn}.`,
  arcade: `${games.length} games. ${games[0].name}: ${games[0].sub}.`,
  quests: `${sideQuests.length} side quests. ${sideQuests[0].org}: ${sideQuests[0].rewards[0].toLowerCase()}.`,
  archives: solo
    ? `${wsn.authors.length} authors on the sensor-network paper, ${firstName} ${ordinal(wsn.authorIndex)}. The quantum one is his alone, ${solo.status}.`
    : `${wsn.authors.length} authors on the sensor-network paper, ${firstName} ${ordinal(wsn.authorIndex)}.`,
  transmissions: `${posts.length} posts on Medium. Newest: “${posts[0].title}”.`,
  inventory: `${skills.length} slots: ${list(skills.map((s) => s.slot.toLowerCase()))}. Every item says where it was used.`,
  trophies: `${certs.length} episodes, numbered by the year earned. Episode ${lastCert.ep} is ${lastCert.title}.`,
  continue: `Open to ${contact.openTo.toLowerCase()}. ${contact.where}. Replies in ${contact.response}.`,
};

/** "02 / CAMPAIGN · Experience": the fiction label always carries the résumé word. */
export function foxTag(chapterId: string): string {
  const ch = CHAPTERS.find((c) => c.id === chapterId);
  return ch ? `${ch.n} / ${ch.en} · ${ch.plain}` : "";
}

export function foxLine(chapterId: string): string {
  return FOX_LINES[chapterId] ?? "";
}
