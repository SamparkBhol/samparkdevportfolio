"use client";
import { memo, useCallback, useEffect, useLayoutEffect, useRef, useState } from "react";
import { useInk } from "@/components/motion/InkProvider";
import { complete, contactLines, execute, type CommandAction, type LineTone } from "@/lib/commands";
import { create, endLines, gameInfo, needsTick, quit, render, steer, submit, tick, type Dir, type GameName, type GameState } from "@/lib/termgames";

/* sampark.term: a drawn CRT that reads the whole issue by command, and runs four games.
   - Output prints instantly, keeps the last 300 lines, and never touches the page scroll: the log
     scrolls inside itself (data-lenis-prevent keeps the desktop wheel layer out of it).
   - The caret is the browser's own (caret-color), so there is no blink loop and no fake cursor.
   - Keys: Enter runs; Tab completes a command name only when a candidate exists (Shift+Tab is never
     trapped); ArrowUp/Down walk history; Ctrl+L clears; Esc leaves the input.
   - Games (`play <name>`): the frame is one <pre> line redrawn in place; the prompt reads "game> ";
     Escape or `quit` ends it. Arrow keys are captured (preventDefault) only while a game runs, so
     the page never scrolls under a snake and never loses its arrows otherwise. The only timer is a
     140 ms interval that exists while a snake is alive; nothing else ticks. Touch gets a pad.
   - Screen readers hear one polite live region holding only the last result, not the whole log. */

const MAX_LINES = 300;
const TICK_MS = 140;
const PS1 = "guest@sampark:~$ ";
const GAME_PS1 = "game> ";
const CHIPS = ["help", "about", "experience", "projects", "packages", "games", "contact", "resume", "clear"];
const ARROWS: Record<string, Dir> = { ArrowUp: "up", ArrowDown: "down", ArrowLeft: "left", ArrowRight: "right" };
const WASD: Record<string, Dir> = { w: "up", s: "down", a: "left", d: "right" };
const PAD: { dir: Dir; glyph: string }[] = [{ dir: "up", glyph: "↑" }, { dir: "left", glyph: "←" }, { dir: "down", glyph: "↓" }, { dir: "right", glyph: "→" }];

type Kind = LineTone | "in" | "game";
interface Line { id: number; kind: Kind; text: string }

let seq = 0;
const mk = (text: string, kind: Kind): Line => ({ id: seq++, kind, text });
const boot = (): Line[] => [
  mk("sampark.term · guest session · no save file · type help, or games", "sys"),
  mk(`${PS1}contact`, "in"),
  ...contactLines().map((t) => mk(t, "out")),
];

/* URLs, the CV path and the email become real links inside a printed line. */
const LINK = /(https?:\/\/[^\s·]+|\/[\w./-]+\.pdf|[\w.+-]+@[\w-]+\.[\w.]+)/g;
function Linked({ text }: { text: string }) {
  const parts = text.split(LINK);
  if (parts.length === 1) return <>{text}</>;
  return (
    <>
      {parts.map((p, i) => {
        if (i % 2 === 0) return p;
        const web = p.startsWith("http");
        const href = web || p.startsWith("/") ? p : `mailto:${p}`;
        return <a key={i} href={href} target={web ? "_blank" : undefined} rel={web ? "noopener" : undefined}>{p}</a>;
      })}
    </>
  );
}

const Log = memo(function Log({ lines }: { lines: Line[] }) {
  return (
    <>
      {lines.map((l) =>
        l.kind === "game" ? (
          /* A game frame: fixed monospace, never wrapped, never linkified, redrawn in place under one id. */
          <pre key={l.id} className="ct-frame">{l.text}</pre>
        ) : (
          <p key={l.id} className={`ct-line ct-l-${l.kind}`}>{l.text ? <Linked text={l.text} /> : null}</p>
        ),
      )}
    </>
  );
});

interface Running { state: GameState; line: number; timer: number }

export function Terminal({ className }: { className?: string }) {
  const [lines, setLines] = useState<Line[]>(boot);
  const [value, setValue] = useState("");
  const [announce, setAnnounce] = useState<{ n: number; text: string }>({ n: 0, text: "" });
  const [playing, setPlaying] = useState<GameName | null>(null);
  const history = useRef<string[]>([]);
  const cursor = useRef(0); // index into history; history.length means "the fresh line"
  const draft = useRef("");
  const game = useRef<Running | null>(null);
  const logRef = useRef<HTMLDivElement>(null);
  const inputRef = useRef<HTMLInputElement>(null);
  const { setInk } = useInk();

  const print = useCallback((add: Line[]) => setLines((prev) => (prev.length + add.length > MAX_LINES ? [...prev, ...add].slice(-MAX_LINES) : [...prev, ...add])), []);
  const say = useCallback((text: string) => setAnnounce((a) => ({ n: a.n + 1, text })), []);

  // Newest line at the bottom of the screen; only the log's own scrollTop moves, never the page.
  useLayoutEffect(() => { const el = logRef.current; if (el) el.scrollTop = el.scrollHeight; }, [lines]);

  /* ---------- the game runner ---------- */
  const stopGame = useCallback(() => {
    const g = game.current;
    if (!g) return;
    window.clearInterval(g.timer);
    game.current = null;
    setPlaying(null);
  }, []);

  /** Every change to a running game goes through here: redraw the frame in place, end it when it is over. */
  const advance = useCallback((next: GameState) => {
    const g = game.current;
    if (!g || g.state === next) return;
    g.state = next;
    const text = render(next).join("\n");
    setLines((prev) => prev.map((l) => (l.id === g.line ? { ...l, text } : l)));
    if (next.over) {
      stopGame();
      const out = endLines(next);
      print(out.map((t) => mk(t, next.won ? "ok" : "sys")));
      say(out.join(". "));
    } else if (next.kind !== "snake" && next.msg) say(next.msg);
  }, [print, say, stopGame]);

  const startGame = useCallback((name: GameName) => {
    stopGame();
    const state = create(name, Date.now());
    const line = mk(render(state).join("\n"), "game");
    print([line]);
    const g: Running = { state, line: line.id, timer: 0 };
    game.current = g;
    if (needsTick(state)) g.timer = window.setInterval(() => { const cur = game.current; if (cur) advance(tick(cur.state)); }, TICK_MS);
    setPlaying(name);
    say(`${gameInfo(name).title} started. ${gameInfo(name).keys}. Escape ends it.`);
    inputRef.current?.focus({ preventScroll: true });
  }, [advance, print, say, stopGame]);

  const quitGame = useCallback(() => { const g = game.current; if (g) advance(quit(g.state)); }, [advance]);
  const steerGame = useCallback((dir: Dir) => { const g = game.current; if (g && g.state.kind === "snake") advance(steer(g.state, dir)); }, [advance]);

  // A game never outlives the terminal.
  useEffect(() => () => { if (game.current) window.clearInterval(game.current.timer); }, []);

  const act = useCallback((a: CommandAction) => {
    const reduced = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
    const jump = (id: string) => document.getElementById(id)?.scrollIntoView({ behavior: reduced ? "auto" : "smooth", block: "start" });
    switch (a.type) {
      case "clear": setLines([]); break;
      case "open": window.open(a.href, "_blank", "noopener"); break;
      case "goto": jump(a.chapter); break;
      case "ink":
        setInk(a.ink);
        document.documentElement.dataset.ink = a.ink;
        try { localStorage.setItem("issue01.ink", a.ink); } catch {}
        break;
      case "class":
        window.dispatchEvent(new CustomEvent("class-select", { detail: a.id }));
        jump("select");
        break;
      case "play": startGame(a.game); break;
    }
  }, [setInk, startGame]);

  const run = useCallback((raw: string) => {
    const input = raw.trim();
    const echo = mk(`${PS1}${input}`, "in");
    if (!input) { print([echo]); return; }
    const h = history.current;
    if (h[h.length - 1] !== input) h.push(input);
    cursor.current = h.length;
    draft.current = "";
    const res = execute(input, { history: h.slice() });
    if (res.action?.type === "clear") { setLines([]); say("screen cleared"); return; }
    print([echo, ...res.lines.map((t) => mk(t, res.tone ?? "out"))]);
    say(res.lines.join("\n") || "done");
    if (res.action) act(res.action); // synchronous, so window.open keeps the user's activation
  }, [act, print, say]);

  const onKeyDown = useCallback((e: React.KeyboardEvent<HTMLInputElement>) => {
    const g = game.current;
    if (g) {
      /* Game mode: the keys belong to the game. Arrows are always claimed here (so the page never
         scrolls under a snake and history never walks mid-game); letters only when a snake wants them. */
      const k = e.key;
      if (k === "Escape") { e.preventDefault(); quitGame(); return; }
      if (k === "Enter") {
        e.preventDefault();
        const t = value.trim();
        setValue("");
        if (!t) return;
        if (/^(quit|exit)$/i.test(t)) quitGame();
        else advance(submit(g.state, t));
        return;
      }
      if (k in ARROWS) { e.preventDefault(); steerGame(ARROWS[k]); return; }
      if (g.state.kind === "snake" && !e.ctrlKey && !e.metaKey && !e.altKey && k.toLowerCase() in WASD) { e.preventDefault(); steerGame(WASD[k.toLowerCase()]); return; }
      if (e.ctrlKey && !e.metaKey && !e.altKey && (k === "l" || k === "L")) {
        e.preventDefault();
        setLines([{ id: g.line, kind: "game", text: render(g.state).join("\n") }]);
        say("screen cleared, the game is still on");
      }
      return;
    }
    const h = history.current;
    if (e.key === "Enter") { e.preventDefault(); run(value); setValue(""); return; }
    if (e.key === "Tab" && !e.shiftKey) {
      if (value.includes(" ")) return; // only the command name completes; Tab then leaves as usual
      const c = complete(value);
      if (!c.length) return;
      e.preventDefault();
      if (c.length === 1) setValue(`${c[0]} `);
      else print([mk(`${PS1}${value}`, "in"), mk(c.join("  "), "sys")]);
      return;
    }
    if (e.key === "ArrowUp") {
      if (!h.length || cursor.current === 0) return;
      e.preventDefault();
      if (cursor.current === h.length) draft.current = value;
      cursor.current -= 1;
      setValue(h[cursor.current]);
      return;
    }
    if (e.key === "ArrowDown") {
      if (!h.length || cursor.current >= h.length) return;
      e.preventDefault();
      cursor.current += 1;
      setValue(cursor.current === h.length ? draft.current : h[cursor.current]);
      return;
    }
    if (e.ctrlKey && !e.metaKey && !e.altKey && (e.key === "l" || e.key === "L")) { e.preventDefault(); setLines([]); say("screen cleared"); return; }
    if (e.key === "Escape") { e.currentTarget.blur(); }
  }, [advance, print, quitGame, run, say, steerGame, value]);

  /* A click on the glass focuses the prompt, unless the visitor is selecting text or hit a link. */
  const onScreenClick = useCallback((e: React.MouseEvent<HTMLDivElement>) => {
    if (window.getSelection()?.toString()) return;
    if ((e.target as HTMLElement).closest("a, button, input")) return;
    inputRef.current?.focus({ preventScroll: true });
  }, []);

  const inGame = playing !== null;
  const keysHint = inGame ? (playing === "snake" ? "Arrows or WASD steer · Esc quits" : "Type, Enter · Esc quits") : "Tab completes · ↑↓ history · Ctrl+L clears · Esc leaves";

  return (
    <div className={`ct-term${inGame ? " is-game" : ""}${className ? ` ${className}` : ""}`} role="group" aria-label="Terminal · reads the résumé by command, runs four games">
      <span className="ct-screw" aria-hidden="true" /><span className="ct-screw" aria-hidden="true" /><span className="ct-screw" aria-hidden="true" /><span className="ct-screw" aria-hidden="true" />
      <div className="ct-term-bar">
        <span className="ct-led" aria-hidden="true" />
        <span className="ct-term-name">sampark.term — {inGame ? `game> ${playing}` : "guest@portfolio"}</span>
        <p className="mono-label ct-keys">{keysHint}</p>
      </div>

      <div className="ct-screen" onClick={onScreenClick} data-cursor="text">
        <div ref={logRef} className="ct-log" tabIndex={0} role="region" aria-label="Terminal output" data-lenis-prevent data-cursor="text">
          <Log lines={lines} />
        </div>
        <div className="ct-prompt">
          <label htmlFor="ct-input" className="ct-ps1">{inGame ? GAME_PS1 : PS1}</label>
          <input
            ref={inputRef}
            id="ct-input"
            className="ct-input"
            type="text"
            value={value}
            onChange={(e) => setValue(e.target.value)}
            onKeyDown={onKeyDown}
            autoComplete="off"
            autoCapitalize="off"
            autoCorrect="off"
            spellCheck={false}
            enterKeyHint="send"
            placeholder={inGame ? (playing === "snake" ? "arrows steer" : "your move") : "help"}
            aria-describedby="ct-hint"
          />
        </div>
        {inGame ? (
          /* The pad: arrow chips on touch (the keys are not on the screen), QUIT for everyone. */
          <div className="ct-pad" role="group" aria-label="Game controls">
            {playing === "snake" ? PAD.map((p) => (
              <button key={p.dir} type="button" className="ct-chip ct-pad-k" aria-label={`steer ${p.dir}`} onClick={() => steerGame(p.dir)}>{p.glyph}</button>
            )) : null}
            <button type="button" className="ct-chip ct-pad-q" onClick={quitGame}>quit</button>
            <span className="ct-pad-hint mono-label">{playing === "snake" ? "or esc" : "enter plays · esc quits"}</span>
          </div>
        ) : null}
        <p id="ct-hint" className="sr-only">Type a command and press Enter. Tab completes a command name, arrow up and down walk the history, Control L clears, Escape leaves the terminal. While a game runs, Escape or quit ends it.</p>
        <p className="sr-only" aria-live="polite" aria-atomic="true">{announce.text}{announce.n % 2 ? "​" : ""}</p>
      </div>

      <div className="ct-chips">
        {inGame ? (
          <p className="mono-label ct-chips-note">cartridge in · the shortcuts return when the game ends</p>
        ) : CHIPS.map((c) => (
          <button key={c} type="button" className="ct-chip" onClick={() => run(c)}>{c}</button>
        ))}
        <span className="ct-model mono-label" aria-hidden="true"><span className="ct-grille" /> model no.{" "}1</span>
      </div>
    </div>
  );
}
