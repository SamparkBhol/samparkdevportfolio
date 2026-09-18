import { CHAPTERS } from "@/content/chapters";
import { resume } from "@/content/resume";
import type { ClassId, Ink } from "@/content/types";
import { GAMES, gameInfo, isGameName, type GameName } from "@/lib/termgames";

/* ============================================================================
   The terminal's command registry. Pure: every line is rendered from resume.ts
   and chapters.ts, never retyped. The only side effects are handed back as an
   `action` for the Terminal component to perform (scroll, open, ink, class,
   clear, play). `date` reads the clock; nothing else touches the environment.
   The four games under `play` live in termgames.ts; the Terminal runs them.
   ========================================================================== */

export type CommandAction =
  | { type: "clear" }
  | { type: "open"; href: string }
  | { type: "goto"; chapter: string }
  | { type: "ink"; ink: Ink }
  | { type: "class"; id: ClassId }
  | { type: "play"; game: GameName };

/** How the terminal colours a result: plain output, dim system text, a yellow "→" confirmation, or an error. */
export type LineTone = "out" | "sys" | "ok" | "err";

export interface CommandResult { lines: string[]; action?: CommandAction; tone?: LineTone }
export interface CommandContext { history: string[]; now?: () => Date }
export interface Command {
  name: string;
  usage: string;
  description: string;
  /** Not listed by help or Tab; still runs when typed. */
  hidden?: boolean;
  run(args: string[], ctx: CommandContext): string[] | CommandResult;
}

const { profile, roles, projects, games, papers, posts, certs, education, skills, classes, packages, sideQuests, contact } = resume;

const norm = (s: string) => s.trim().toLowerCase();
const err = (...lines: string[]): CommandResult => ({ tone: "err", lines });
const ok = (...lines: string[]): CommandResult => ({ tone: "ok", lines });
const col = (key: string, value: string, width = 12) => `${key.padEnd(width)}${value}`;

/** A role, project or game id → its printed name (the inventory cites these as evidence). */
const nameOf = (id: string) => roles.find((r) => r.id === id)?.org ?? projects.find((p) => p.id === id)?.name ?? games.find((g) => g.id === id)?.name ?? id;

/** The contact card as text. The terminal boots into this, so the first screen is the useful one. */
export const contactLines = (): string[] => [
  col("EMAIL", profile.email),
  col("GITHUB", profile.github),
  col("LINKEDIN", profile.linkedin),
  col("MEDIUM", profile.medium),
  col("CV", `${profile.cvUrl} · type resume to open it`),
  col("MIRROR", profile.cvMirrorUrl),
  col("OPEN TO", contact.openTo),
  col("WHERE", contact.where),
  col("TIMEZONE", contact.timezone),
  col("RESPONSE", contact.response),
];

const INK_LABEL: Record<Ink, string> = { cel: "Cel blue", shu: "Shu red", yellow: "Yellow" };
const isInk = (s: string): s is Ink => s === "cel" || s === "shu" || s === "yellow";

const findChapter = (q: string) => {
  const n = norm(q);
  if (!n) return undefined;
  return (
    CHAPTERS.find((c) => c.id === n || c.n === n) ??
    CHAPTERS.find((c) => [c.en, c.plain, c.short].some((w) => norm(w) === n)) ??
    CHAPTERS.find((c) => [c.id, c.en, c.plain, c.short].some((w) => norm(w).includes(n)))
  );
};

const chapterList = () => CHAPTERS.map((c) => c.id).join(", ");
const roleList = () => roles.map((r) => r.id).join(", ");

export const COMMANDS: Command[] = [
  {
    name: "help", usage: "help [command]", description: "this list",
    run: (args) => {
      if (args[0]) {
        const c = findCommand(args[0]);
        return c && !c.hidden ? [c.usage, `  ${c.description}`] : err(`command not found: ${args[0]} · try help`);
      }
      const listed = COMMANDS.filter((c) => !c.hidden);
      return [
        "COMMANDS · everything below is read from the résumé",
        ...listed.map((c) => `  ${c.usage.padEnd(22)}${c.description}`),
        "",
        `GAMES · ${GAMES.map((g) => g.name).join(", ")} run in here · type games, then play <name>`,
        "TAB completes · ↑↓ history · ctrl+l clears · esc leaves the terminal",
      ];
    },
  },
  {
    name: "whoami", usage: "whoami", description: "check your save file",
    run: () => [`guest · no save file · reading ${profile.issue.title} ${profile.issue.volume} · No.${profile.issue.number} · ${profile.issue.month}`],
  },
  {
    name: "about", usage: "about", description: "who I am",
    run: () => [
      `${profile.name} · ${profile.title}`,
      profile.classLine,
      `${profile.employer} · ${profile.location} · since ${profile.since}`,
      profile.premise,
      profile.narration,
    ],
  },
  {
    name: "experience", usage: "experience [org]", description: "every role · an org shows its panels",
    run: (args) => {
      if (args.length) {
        const q = norm(args.join(" "));
        const r = roles.find((x) => x.id === q) ?? roles.find((x) => [x.org, x.orgNote ?? "", x.title].some((w) => norm(w).includes(q)));
        if (!r) return err(`no role called ${args.join(" ")} · try ${roleList()}`);
        return [
          `${r.org}${r.orgNote ? ` (${r.orgNote})` : ""} · ${r.title}`,
          `${r.period} · ${r.location}`,
          col("STACK", r.stack.join(", "), 7),
          "",
          ...r.panels.flatMap((p) => [`[${p.label.toUpperCase()}] ${p.text}`, ""]),
          `${r.flow.caption} → ${r.flow.stamp}${r.flow.stampNote ? ` · ${r.flow.stampNote}` : ""}`,
        ];
      }
      return [
        ...roles.flatMap((r) => [
          `${r.org}${r.orgNote ? ` (${r.orgNote})` : ""} · ${r.title}${r.current ? " · current" : ""}`,
          `  ${r.period} · ${r.location}`,
          `  ${r.flow.stamp}${r.flow.stampNote ? ` · ${r.flow.stampNote}` : ""}`,
        ]),
        `type experience <org> for its panels · ${roleList()}`,
      ];
    },
  },
  {
    name: "projects", usage: "projects [name]", description: "the boss fights · a name shows the case study",
    run: (args) => {
      if (args.length) {
        const q = norm(args.join(" "));
        const p = projects.find((x) => x.id === q) ?? projects.find((x) => norm(x.name).includes(q) || norm(x.id).includes(q));
        if (!p) return err(`no project called ${args.join(" ")} · try ${projects.map((x) => x.id).join(", ")}`);
        return [
          `${p.name} · ${p.stamp} · ${p.year} · vs ${p.vs}`,
          col("THE IDEA", p.idea),
          col("THE SYSTEM", p.system),
          col("THE RESULT", p.result),
          col("STACK", p.stack.join(", ")),
          col("CODE", p.links.code),
          ...(p.links.live ? [col("LIVE", p.links.live)] : []),
          ...(p.links.npm ? [col("NPM", p.links.npm)] : []),
        ];
      }
      return [
        ...projects.map((p) => `${p.name} · ${p.stamp} · ${p.year} · vs ${p.vs}${p.featured ? " · featured" : ""}`),
        "type projects <name> for the case study",
      ];
    },
  },
  {
    name: "packages", usage: "packages", description: "the npm shop",
    run: () => packages.flatMap((p) => [
      `${p.name}@${p.version} · ${p.install}`,
      `  ${p.description}`,
      `  ${p.weeklyDownloads !== undefined ? `${p.weeklyDownloads} weekly downloads on ${p.checkedOn} · ` : ""}${p.href}`,
    ]),
  },
  {
    name: "arcade", usage: "arcade", description: "the games I shipped",
    run: () => games.flatMap((g) => [`${g.name} · ${g.sub} · ${g.year}${g.install ? ` · ${g.install}` : ""}`, `  ${g.href}`]),
  },
  {
    name: "games", usage: "games", description: "four games that run in here",
    run: () => [
      "GAMES · playable right here · type play <name>",
      ...GAMES.map((g) => `  ${g.name.padEnd(12)}${g.blurb}`),
      "the ones I shipped live in the arcade · type arcade",
    ],
  },
  {
    name: "play", usage: "play <name>", description: "start one · snake, hangman, tictactoe, guess",
    run: (args) => {
      const q = norm(args[0] ?? "");
      if (!isGameName(q)) return err(`usage: play <${GAMES.map((g) => g.name).join("|")}>`);
      const g = gameInfo(q);
      return { ...ok(`→ ${g.title} · ${g.keys}`), action: { type: "play", game: q } };
    },
  },
  {
    name: "quit", usage: "quit", description: "", hidden: true,
    run: () => ({ tone: "sys", lines: ["no game running · type games to see what you can play"] }),
  },
  {
    name: "papers", usage: "papers", description: "research",
    run: () => papers.flatMap((p) => [
      `${p.status.toUpperCase()} · ${p.title} (${p.year})`,
      `  ${p.venue}`,
      `  ${p.authors.map((a, i) => (i === p.authorIndex ? `[${a}]` : a)).join(", ")}`,
      ...(p.doi || p.href ? [`  ${[p.doi ? `doi ${p.doi}` : "", p.href ?? ""].filter(Boolean).join(" · ")}`] : []),
    ]),
  },
  {
    name: "posts", usage: "posts", description: "articles on Medium",
    run: () => posts.flatMap((p) => [`${p.date}  ${p.title} · ${p.words} words · ${p.tags.join(", ")}`, `  ${p.href}`]),
  },
  {
    name: "skills", usage: "skills [slot]", description: "the inventory · a slot shows its items",
    run: (args) => {
      if (args.length) {
        const q = norm(args.join(" "));
        const g = skills.find((x) => x.id === q || norm(x.slot) === q) ?? skills.find((x) => [x.slot, x.group].some((w) => norm(w).includes(q)));
        if (!g) return err(`no slot called ${args.join(" ")} · try ${skills.map((x) => x.id).join(", ")}`);
        return [
          `${g.slot} · ${g.group}`,
          ...g.items.map((s) => `  ${s.name}${s.usedAt.length ? ` · ${s.usedAt.map(nameOf).join(", ")}` : ""}`),
        ];
      }
      return [
        ...skills.map((g) => col(g.slot, `${g.group} (${g.items.length})`)),
        `type skills <slot> for the items · ${skills.map((g) => g.id).join(", ")}`,
      ];
    },
  },
  {
    name: "certs", usage: "certs", description: "the trophy room",
    run: () => certs.flatMap((c) => [`EP.${c.ep}  ${c.title} · ${c.issuer} · ${c.year}`, ...(c.verifyUrl ? [`      ${c.verifyUrl}`] : [])]),
  },
  {
    name: "quests", usage: "quests", description: "clubs and chapters",
    run: () => sideQuests.flatMap((q) => [`${q.org} · ${q.role} · ${q.period} · ${q.status}`, `  ${q.summary}`, ...q.rewards.map((r) => `  + ${r}`)]),
  },
  {
    name: "education", usage: "education", description: "the degree",
    run: () => [`${education.school} · ${education.degree}`, `${education.period} · ${education.location}`, col("COURSEWORK", education.coursework.join(", "))],
  },
  { name: "contact", usage: "contact", description: "how to reach me", run: () => contactLines() },
  {
    name: "resume", usage: "resume", description: "open the CV in a new tab",
    run: () => ({ ...ok(`→ opening ${profile.cvUrl} in a new tab · mirror ${profile.cvMirrorUrl}`), action: { type: "open", href: profile.cvUrl } }),
  },
  {
    name: "goto", usage: "goto <chapter>", description: "jump to a chapter, by id or plain word",
    run: (args) => {
      if (!args.length) return err(`usage: goto <chapter> · ${chapterList()}`);
      const c = findChapter(args.join(" "));
      if (!c) return err(`no chapter called ${args.join(" ")} · try ${chapterList()}`);
      return { ...ok(`→ ${c.n} ${c.en} · ${c.plain}`), action: { type: "goto", chapter: c.id } };
    },
  },
  {
    name: "ink", usage: "ink <cel|shu|yellow>", description: "recolour the issue",
    run: (args) => {
      const i = norm(args[0] ?? "");
      if (!isInk(i)) return err("usage: ink <cel|shu|yellow>");
      return { ...ok(`→ INK · ${INK_LABEL[i]}`), action: { type: "ink", ink: i } };
    },
  },
  {
    name: "class", usage: "class <id>", description: "pick a character class",
    run: (args) => {
      const q = norm(args.join(" "));
      const c = q ? classes.find((x) => x.id === q) ?? classes.find((x) => norm(x.name).includes(q)) : undefined;
      if (!c) return err(`usage: class <id> · ${classes.map((x) => `${x.id} (${x.name})`).join(", ")}`);
      return {
        ...ok(
          `→ CLASS · ${c.name} · ${c.tagline}`,
          ...c.stats.map(([k, v]) => `  ${col(k, v, 22)}`),
          `  played at ${[...c.roles, ...c.projects].map(nameOf).join(", ")}`,
        ),
        action: { type: "class", id: c.id },
      };
    },
  },
  { name: "clear", usage: "clear", description: "wipe the screen (ctrl+l)", run: () => ({ lines: [], action: { type: "clear" } }) },
  {
    name: "history", usage: "history", description: "what you typed",
    run: (_a, ctx) => (ctx.history.length ? ctx.history.map((h, i) => `  ${String(i + 1).padStart(3)}  ${h}`) : ["no history yet"]),
  },
  { name: "echo", usage: "echo <text>", description: "print it back", run: (args) => [args.join(" ")] },
  {
    name: "date", usage: "date", description: "today",
    run: (_a, ctx) => [(ctx.now?.() ?? new Date()).toLocaleString(undefined, { dateStyle: "full", timeStyle: "short" })],
  },
  {
    name: "lore", usage: "lore", description: "", hidden: true,
    run: () => ({ tone: "sys", lines: ["A dragon circles production. It never lands; it waits for the untested deploy, the retry that is not idempotent, the Friday evening. Keep the health checks honest and it keeps circling."] }),
  },
  {
    name: "konami", usage: "konami", description: "", hidden: true,
    run: () => ({
      tone: "ok",
      lines: [
        "+------------------------------+",
        "|   ^ ^ v v < > < > B A        |",
        "|   1UP  ·  CONTINUE?  ·  YES  |",
        "+------------------------------+",
      ],
    }),
  },
];

export function findCommand(name: string): Command | undefined {
  const n = norm(name);
  return COMMANDS.find((c) => c.name === n);
}

/** Command names that start with `prefix` (hidden ones never complete). */
export function complete(prefix: string): string[] {
  const p = norm(prefix);
  return COMMANDS.filter((c) => !c.hidden && c.name.startsWith(p)).map((c) => c.name).sort();
}

/** Parse one typed line and run it. Unknown names come back as an error line, never a throw. */
export function execute(input: string, ctx: CommandContext): CommandResult {
  const [name = "", ...args] = input.trim().split(/\s+/);
  const cmd = findCommand(name);
  if (!cmd) return err(`command not found: ${name} · try help`);
  const r = cmd.run(args, ctx);
  return Array.isArray(r) ? { lines: r } : r;
}
