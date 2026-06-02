"use client";
import {
  useCallback,
  useEffect,
  useMemo,
  useRef,
  useState,
} from "react";
import { motion } from "motion/react";
import { portfolio } from "@/content/portfolio";
import { reportLore } from "@/providers/LoreProvider";
import { cn } from "@/lib/cn";

/**
 * A single printed line in the terminal output history.
 * `kind` only drives color/styling — everything is plain text.
 */
type LineKind = "out" | "in" | "ok" | "warn" | "err" | "sys";
interface Line {
  id: number;
  kind: LineKind;
  text: string;
}

/** Which interactive mini-game (if any) is currently capturing input. */
type Mode =
  | { name: "shell" }
  | { name: "guess"; secret: number; tries: number }
  | { name: "rps"; rounds: number; wins: number; losses: number }
  | { name: "typing"; target: string; started: number };

const KIND_CLASS: Record<LineKind, string> = {
  out: "text-pop-green",
  in: "text-pop-cyan",
  ok: "text-pop-green font-bold",
  warn: "text-pop-yellow",
  err: "text-pop-red",
  sys: "text-pop-green/70",
};

const PROMPT = "guest@press-start:~$";

const BANNER = [
  " ____  ____  ____  ____  ____    ____  ____  ____  ____  ____ ",
  "||P ||||R ||||E ||||S ||||S ||  ||S ||||T ||||A ||||R ||||T ||",
  "||__||||__||||__||||__||||__||  ||__||||__||||__||||__||||__||",
  "|/__\\||/__\\||/__\\||/__\\||/__\\|  |/__\\||/__\\||/__\\||/__\\||/__\\|",
];

const HELP = [
  "AVAILABLE COMMANDS  (pick a quest)",
  "  help        show this list",
  "  about       the legend, in one paragraph",
  "  whoami      check your save file",
  "  skills      list the skill tree",
  "  projects    boss fights, already slain",
  "  experience  read the campaign log",
  "  research    published papers & open source",
  "  certs       achievements unlocked",
  "  packages    open-source power-ups (npm) dropped",
  "  resume      download the CV",
  "  social      portals to summon me",
  "  contact     phone + email + links",
  "  email       fire a raven (mailto:)",
  "  banner      reprint the PRESS START sign",
  "  play        load a mini-game (guess | rps | typing)",
  "  clear       nuke the screen from orbit",
  "",
  "TIP: [Tab] autocompletes. ArrowUp / ArrowDown walk history.",
];

/* commands offered to Tab-autocomplete */
const COMMANDS = [
  "help", "about", "whoami", "skills", "projects", "experience", "research",
  "certs", "packages", "resume", "social", "contact", "email", "banner",
  "play", "clear",
];

/* words for the typing mini-game */
const TYPING_PHRASES = [
  "ship it on mainline",
  "fine tune the frontier model",
  "retrieval augmented generation",
  "press start no continues",
  "quantize the weights and stream",
];

let LINE_ID = 0;
const nextId = () => ++LINE_ID;

export function Terminal({ className }: { className?: string }) {
  const { contact, profile, projects, experience, packages, skills } =
    portfolio;

  const [lines, setLines] = useState<Line[]>([]);
  const [value, setValue] = useState("");
  const [mode, setMode] = useState<Mode>({ name: "shell" });
  const [cursorOn, setCursorOn] = useState(true);

  // Command history (most-recent last) + a pointer for ArrowUp/ArrowDown.
  const history = useRef<string[]>([]);
  const histPos = useRef<number>(-1);

  const scrollRef = useRef<HTMLDivElement>(null);
  const inputRef = useRef<HTMLInputElement>(null);

  /** Append one or more lines to the output history. */
  const print = useCallback((text: string | string[], kind: LineKind = "out") => {
    const arr = Array.isArray(text) ? text : [text];
    setLines((prev) => [
      ...prev,
      ...arr.map((t) => ({ id: nextId(), kind, text: t })),
    ]);
  }, []);

  // Seed the welcome banner once on mount.
  useEffect(() => {
    setLines([
      ...BANNER.map((t) => ({ id: nextId(), kind: "sys" as LineKind, text: t })),
      { id: nextId(), kind: "out", text: "" },
      {
        id: nextId(),
        kind: "ok",
        text: `>> ${profile.name}.term v1.0 — boot OK. 0 viruses, 1 friendly fox.`,
      },
      {
        id: nextId(),
        kind: "out",
        text: "Connection established at 9600 baud. Coffee at 100%. Ego at 60%.",
      },
      { id: nextId(), kind: "warn", text: "Lost, traveller? type 'help' to begin." },
    ]);
    // profile.name is from a static module; safe to omit but listed for lint.
  }, [profile.name]);

  // Blinking block cursor.
  useEffect(() => {
    const t = setInterval(() => setCursorOn((c) => !c), 530);
    return () => clearInterval(t);
  }, []);

  // Auto-scroll to the newest line whenever output grows.
  useEffect(() => {
    const el = scrollRef.current;
    if (el) el.scrollTop = el.scrollHeight;
  }, [lines]);

  /** ---- Command handlers (shell mode) ---- */
  const runShell = useCallback(
    (raw: string) => {
      const [cmd, ...rest] = raw.split(/\s+/);
      const arg = (rest[0] ?? "").toLowerCase();
      switch (cmd) {
        case "help":
          print(HELP, "out");
          return;
        case "banner":
          print(BANNER, "sys");
          print("INSERT COIN ▸ PRESS START ▸ ACCEPT NO IMITATIONS", "warn");
          return;
        case "about":
          print("// LORE ENTRY: player one", "ok");
          print(portfolio.about.blurb, "out");
          return;
        case "whoami":
          print("// SAVE FILE LOADED", "sys");
          print(`${profile.handle} — ${profile.title}`, "ok");
          print(`spawn point: ${profile.location}`, "out");
          print(profile.tagline, "out");
          return;
        case "skills": {
          print("SKILL TREE  (no respec available, sorry)", "ok");
          skills.forEach((cat) => {
            print(`  [${cat.name}]`, "warn");
            cat.skills.forEach((s) => {
              const filled = Math.round(s.level / 10);
              const bar = "#".repeat(filled) + "-".repeat(10 - filled);
              print(`    ${s.name.padEnd(16)} ${bar} ${s.level}`, "out");
            });
          });
          return;
        }
        case "projects": {
          print("BOSS FIGHTS  (loot already claimed)", "ok");
          projects.forEach((p) => {
            print(`  ${p.name} [${p.difficulty}] HP:${p.hp} (${p.year})`, "warn");
            print(`    ${p.tagline}`, "out");
          });
          return;
        }
        case "experience": {
          print("CAMPAIGN LOG  (no game-overs on record)", "ok");
          experience.forEach((e) => {
            print(`  LV${e.level} ${e.role} @ ${e.org} (${e.period})`, "warn");
            print(`    ${e.summary}`, "out");
          });
          return;
        }
        case "packages": {
          print("POWER-UPS  (npm drops, freely lootable)", "ok");
          packages.forEach((pk) => {
            print(`  ${pk.name}@${pk.version} — ${pk.weeklyDownloads.toLocaleString()}/wk`, "warn");
            print(`    ${pk.description}  [${pk.installCmd}]`, "out");
          });
          return;
        }
        case "social":
        case "socials": {
          print("SUMMONING PORTALS  (socials)", "ok");
          contact.socials.forEach((s) => print(`  ${s.label.padEnd(10)} ${s.href}`, "out"));
          return;
        }
        case "email": {
          const mailto = `mailto:${contact.email}`;
          print(`Dispatching raven to ${mailto} ...`, "ok");
          if (typeof window !== "undefined") window.location.href = mailto;
          return;
        }
        case "contact": {
          print("CONTACT CARD", "ok");
          print(`  email   ${contact.email}`, "out");
          contact.socials.forEach((s) => print(`  ${s.label.padEnd(8)}${s.href}`, "out"));
          print("Type 'resume' to grab the CV.", "sys");
          return;
        }
        case "resume":
        case "cv": {
          const url = profile.resumeUrl ?? "/resume.pdf";
          print("Fetching the scroll of deeds (CV) ...", "ok");
          if (typeof window !== "undefined") window.open(url, "_blank");
          print(`  opened ${url}`, "out");
          return;
        }
        case "research":
        case "papers": {
          print("RESEARCH GRIMOIRE", "ok");
          portfolio.research.forEach((r) => {
            print(`  ${r.title}`, "warn");
            print(`    ${r.venue} (${r.year})`, "out");
            r.links.forEach((l) => print(`    ${l.label}: ${l.href}`, "sys"));
          });
          return;
        }
        case "certs":
        case "certifications": {
          print("ACHIEVEMENTS UNLOCKED  (certifications)", "ok");
          portfolio.certifications.forEach((c) => {
            print(`  [${c.rarity}] ${c.title} — ${c.issuer} (${c.year})`, "out");
            if (c.credentialUrl) print(`    verify: ${c.credentialUrl}`, "sys");
          });
          return;
        }
        case "play": {
          if (!arg) {
            print("ARCADE CABINET — pick your poison", "ok");
            print("  play guess    guess my number (1-100, no peeking)", "out");
            print("  play rps      rock / paper / scissors, for honour", "out");
            print("  play typing   type the phrase, get your WPM", "out");
            print("Load one, e.g. 'play guess'. Type 'quit' to flee a game.", "warn");
            return;
          }
          if (arg === "typing") {
            const target = TYPING_PHRASES[Math.floor(Math.random() * TYPING_PHRASES.length)];
            setMode({ name: "typing", target, started: 0 });
            print("TYPING TEST — retype this phrase exactly, then Enter:", "ok");
            print(`  ${target}`, "warn");
            print("Timer starts on your first keystroke. 'quit' to bail.", "sys");
            return;
          }
          if (arg === "guess") {
            // Fresh secret per game — generated INSIDE the handler, never at module load.
            const secret = Math.floor(Math.random() * 100) + 1;
            setMode({ name: "guess", secret, tries: 0 });
            print("NUMBER GUESS — I've hidden a number from 1 to 100.", "ok");
            print("Guess it and hit Enter. 'quit' to admit defeat.", "warn");
            return;
          }
          if (arg === "rps") {
            setMode({ name: "rps", rounds: 0, wins: 0, losses: 0 });
            print("ROCK / PAPER / SCISSORS — winner takes the bragging rights.", "ok");
            print("Type rock, paper, or scissors. 'quit' to bail.", "warn");
            return;
          }
          print(`no such game in the cabinet: ${arg} — try 'play'`, "err");
          return;
        }
        case "clear":
          setLines([]);
          return;
        case "lore": {
          // hidden command — Fragment I of the Codex
          print("// CODEX FRAGMENT I — THE REALM", "ok");
          print("This realm is called Mainline. Everything built here is shipped here.", "out");
          print("A fragment was added to your Codex. Four more hide in the realm.", "sys");
          reportLore("realm");
          return;
        }
        default:
          print(`command not found: ${cmd} — that's not a spell. type 'help'`, "err");
          return;
      }
    },
    [
      print,
      profile.handle,
      profile.title,
      profile.location,
      profile.tagline,
      profile.resumeUrl,
      skills,
      projects,
      experience,
      packages,
      contact.socials,
      contact.email,
    ],
  );

  /** ---- Typing-test mode: time from first keystroke to a correct line ---- */
  const runTyping = useCallback(
    (raw: string, m: Extract<Mode, { name: "typing" }>) => {
      if (raw.trim() !== m.target) {
        print("not quite — retype it exactly (or 'quit')", "warn");
        return;
      }
      const elapsed = m.started ? (performance.now() - m.started) / 1000 : 0.001;
      const words = m.target.split(/\s+/).length;
      const wpm = Math.round((words / elapsed) * 60);
      print(`★ CLEAN RUN — ${m.target.length} chars in ${elapsed.toFixed(1)}s ≈ ${wpm} WPM`, "ok");
      print("Back to shell. 'play typing' to beat it.", "sys");
      setMode({ name: "shell" });
    },
    [print],
  );

  /** ---- Guess mode ---- */
  const runGuess = useCallback(
    (raw: string, m: Extract<Mode, { name: "guess" }>) => {
      const n = Number.parseInt(raw, 10);
      if (Number.isNaN(n)) {
        print("the oracle accepts digits only — type 1-100 or 'quit'", "warn");
        return;
      }
      const tries = m.tries + 1;
      if (n === m.secret) {
        print(`★ NAILED IT! ${m.secret} in ${tries} tries. Flawless victory.`, "ok");
        print("Returned to shell. Type 'play' for a rematch.", "sys");
        setMode({ name: "shell" });
        return;
      }
      if (n < m.secret) print(`${n} → too LOW, aim higher, champ. (try #${tries})`, "warn");
      else print(`${n} → too HIGH, ease off. (try #${tries})`, "warn");
      setMode({ ...m, tries });
    },
    [print],
  );

  /** ---- Rock / Paper / Scissors mode ---- */
  const runRps = useCallback(
    (raw: string, m: Extract<Mode, { name: "rps" }>) => {
      const pick = raw.toLowerCase();
      const choices = ["rock", "paper", "scissors"] as const;
      if (!choices.includes(pick as (typeof choices)[number])) {
        print("the duel allows rock, paper, or scissors (or 'quit')", "warn");
        return;
      }
      const cpu = choices[Math.floor(Math.random() * 3)];
      const player = pick as (typeof choices)[number];
      const beats: Record<(typeof choices)[number], (typeof choices)[number]> = {
        rock: "scissors",
        paper: "rock",
        scissors: "paper",
      };
      const rounds = m.rounds + 1;
      print(`you: ${player}   cpu: ${cpu}`, "in");
      if (player === cpu) {
        print("DRAW. great minds, etc. go again.", "out");
        setMode({ ...m, rounds });
      } else if (beats[player] === cpu) {
        const wins = m.wins + 1;
        print(`YOU WIN! ${player} crushes ${cpu}. (record ${wins}-${m.losses})`, "ok");
        setMode({ ...m, rounds, wins });
      } else {
        const losses = m.losses + 1;
        print(`CPU wins — ${cpu} beats ${player}. The machine gloats. (record ${m.wins}-${losses})`, "err");
        setMode({ ...m, rounds, losses });
      }
      print("rematch? type rock/paper/scissors, or 'quit'.", "sys");
    },
    [print],
  );

  /** Route a submitted command to the correct mode. */
  const submit = useCallback(
    (raw: string) => {
      const trimmed = raw.trim();
      // Echo the input line with the prompt for that CRT feel.
      const label =
        mode.name === "shell"
          ? PROMPT
          : mode.name === "guess"
            ? "guess>"
            : mode.name === "rps"
              ? "rps>"
              : "type>";
      print(`${label} ${trimmed}`, "in");

      if (trimmed === "") return; // typing nothing is a no-op

      // Track history (skip duplicate of the previous entry).
      const h = history.current;
      if (h[h.length - 1] !== trimmed) h.push(trimmed);
      histPos.current = h.length;

      const lower = trimmed.toLowerCase();

      // Universal escapes available in every mode.
      if (lower === "clear") {
        setLines([]);
        return;
      }
      if (mode.name !== "shell" && (lower === "quit" || lower === "exit")) {
        print("fled the arena. back to the safety of the shell.", "sys");
        setMode({ name: "shell" });
        return;
      }
      if (mode.name === "shell" && (lower === "quit" || lower === "exit")) {
        print("nowhere to quit to — you're already home. try 'help' or 'play'.", "warn");
        return;
      }

      if (mode.name === "guess") {
        runGuess(trimmed, mode);
        return;
      }
      if (mode.name === "rps") {
        runRps(trimmed, mode);
        return;
      }
      if (mode.name === "typing") {
        runTyping(trimmed, mode);
        return;
      }
      runShell(lower);
    },
    [mode, print, runShell, runGuess, runRps, runTyping],
  );

  const onKeyDown = useCallback(
    (e: React.KeyboardEvent<HTMLInputElement>) => {
      // Start the typing-test clock on the first real keystroke.
      if (mode.name === "typing" && !mode.started && e.key.length === 1) {
        setMode({ ...mode, started: performance.now() });
      }
      // Tab-autocomplete shell commands.
      if (e.key === "Tab") {
        e.preventDefault();
        if (mode.name !== "shell") return;
        const frag = value.trim().toLowerCase();
        if (!frag) return;
        const matches = COMMANDS.filter((c) => c.startsWith(frag));
        if (matches.length === 1) setValue(matches[0] + " ");
        else if (matches.length > 1) {
          print(`${PROMPT} ${value}`, "in");
          print(matches.join("   "), "sys");
        }
        return;
      }
      if (e.key === "Enter") {
        e.preventDefault();
        submit(value);
        setValue("");
        return;
      }
      if (e.key === "ArrowUp") {
        e.preventDefault();
        const h = history.current;
        if (h.length === 0) return;
        histPos.current = Math.max(0, histPos.current - 1);
        setValue(h[histPos.current] ?? "");
        return;
      }
      if (e.key === "ArrowDown") {
        e.preventDefault();
        const h = history.current;
        if (h.length === 0) return;
        histPos.current = Math.min(h.length, histPos.current + 1);
        setValue(h[histPos.current] ?? "");
        return;
      }
    },
    [submit, value, mode, print],
  );

  const promptLabel = useMemo(() => {
    if (mode.name === "guess") return "guess>";
    if (mode.name === "rps") return "rps>";
    if (mode.name === "typing") return "type>";
    return PROMPT;
  }, [mode]);

  return (
    <motion.div
      initial={{ opacity: 0, y: 24 }}
      whileInView={{ opacity: 1, y: 0 }}
      viewport={{ once: true, amount: 0.2 }}
      transition={{ type: "spring", stiffness: 200, damping: 22 }}
      className={cn(
        "relative nb-border nb-shadow-lg bg-crt overflow-hidden",
        className,
      )}
    >
      {/* CRT title bar */}
      <div className="flex items-center gap-2 border-b-[3px] border-ink bg-ink px-3 py-2">
        <span aria-hidden className="flex gap-1.5">
          <span className="h-3 w-3 rounded-full bg-pop-red nb-border" />
          <span className="h-3 w-3 rounded-full bg-pop-yellow nb-border" />
          <span className="h-3 w-3 rounded-full bg-pop-green nb-border" />
        </span>
        <span className="ml-1 font-pixel text-[9px] text-pop-green">
          {profile.name.toLowerCase().replace(/\s+/g, "_")}.term
        </span>
        <span className="ml-auto font-pixel text-[8px] text-pop-cyan">
          ◉ ONLINE
        </span>
      </div>

      {/* Screen: output history + scanline overlay */}
      <div
        onClick={() => inputRef.current?.focus()}
        className="relative"
      >
        {/* Decorative scanline + glow overlay (local to the screen) */}
        <div
          aria-hidden
          className="pointer-events-none absolute inset-0 z-10"
          style={{
            background:
              "repeating-linear-gradient(to bottom, rgba(0,0,0,0) 0px, rgba(0,0,0,0) 2px, rgba(0,0,0,0.28) 3px, rgba(0,0,0,0.28) 3px)",
            mixBlendMode: "multiply",
          }}
        />
        <div
          aria-hidden
          className="pointer-events-none absolute inset-0 z-10"
          style={{
            background:
              "radial-gradient(120% 120% at 50% 0%, rgba(57,255,20,0.07), transparent 60%)",
          }}
        />

        <div
          ref={scrollRef}
          role="log"
          aria-live="polite"
          aria-label="terminal output"
          className="relative z-0 h-72 md:h-80 overflow-y-auto px-4 py-3 font-mono text-[12px] leading-relaxed crt-flicker"
        >
          {lines.map((l) => (
            <pre
              key={l.id}
              className={cn(
                "m-0 whitespace-pre-wrap break-words font-mono",
                KIND_CLASS[l.kind],
              )}
            >
              {l.text === "" ? " " : l.text}
            </pre>
          ))}
        </div>
      </div>

      {/* Input row */}
      <form
        onSubmit={(e) => {
          e.preventDefault();
          submit(value);
          setValue("");
        }}
        className="flex items-center gap-2 border-t-[3px] border-ink bg-crt px-4 py-3"
      >
        <span aria-hidden className="font-mono text-[12px] text-pop-cyan shrink-0">
          {promptLabel}
        </span>
        <label htmlFor="terminal-input" className="sr-only">
          terminal input
        </label>
        <div className="relative flex-1">
          <input
            id="terminal-input"
            ref={inputRef}
            type="text"
            value={value}
            onChange={(e) => setValue(e.target.value)}
            onKeyDown={onKeyDown}
            aria-label="terminal input"
            autoComplete="off"
            autoCorrect="off"
            autoCapitalize="off"
            spellCheck={false}
            className="w-full bg-transparent font-mono text-[12px] text-pop-green caret-transparent placeholder:text-pop-green/40 focus:outline-none"
            placeholder="type a command…"
          />
          {/* Blinking block cursor sits just after typed text. */}
          <span
            aria-hidden
            className={cn(
              "pointer-events-none absolute top-1/2 -translate-y-1/2 h-[14px] w-[8px] bg-pop-green transition-opacity",
              cursorOn ? "opacity-90" : "opacity-0",
            )}
            style={{ left: `${value.length}ch` }}
          />
        </div>
      </form>
    </motion.div>
  );
}
