"use client";
import { useCallback, useEffect, useRef, useState, useSyncExternalStore } from "react";
import { resume } from "@/content/resume";
import { CHAPTERS } from "@/content/chapters";
import type { ClassId } from "@/content/types";
import { Eyebrow } from "@/components/print/Eyebrow";
import { Kanji } from "@/components/print/Kanji";
import { VideoPanel } from "@/components/print/VideoPanel";
import { cn } from "@/lib/cn";
import { Stage } from "./Stage";
import "@/styles/campaign.css";

/* ============================================================================
   02 / CAMPAIGN · 仕事 shigoto · Experience. ONE stage at a time over the
   sunset road. A STAGE SELECT row names the five roles (resume.roles order,
   newest first); the picked one is built below it: title strip, flow strip,
   spread. Switching stages swaps the content under a short ink wipe and
   remounts the strip, so every stage starts with an empty log. Character
   Select's class (data-player-class on <html>, announced by "class-select")
   lights the tabs it was played in and jumps to the first matching stage.
   ========================================================================== */

const CHAPTER = CHAPTERS.find((c) => c.id === "campaign") ?? { id: "campaign", n: "02", en: "CAMPAIGN", jp: "仕事", romaji: "shigoto", plain: "Experience", short: "Work" };
const CLASS_IDS = new Set<string>(resume.classes.map((c) => c.id));
const asClass = (v: unknown): ClassId | null => (typeof v === "string" && CLASS_IDS.has(v) ? (v as ClassId) : null);

/* Character Select's choice is an external store: the latest "class-select" detail, else data-player-class on <html>. */
let lastDetail: ClassId | null = null;
function subscribeClass(cb: () => void) {
  const on = (e: Event) => { lastDetail = asClass((e as CustomEvent).detail); cb(); };
  window.addEventListener("class-select", on);
  return () => window.removeEventListener("class-select", on);
}
const readClass = () => lastDetail ?? asClass(document.documentElement.dataset.playerClass);
const readClassOnServer = () => null;

export function Campaign() {
  const roles = resume.roles;
  const [active, setActive] = useState(roles[0]?.id ?? "");
  const [wipes, setWipes] = useState(0);
  const activeRef = useRef(active);
  const focusPending = useRef(false);
  const tabs = useRef<HTMLDivElement>(null);
  const playerClass = useSyncExternalStore(subscribeClass, readClass, readClassOnServer);

  const index = Math.max(0, roles.findIndex((r) => r.id === active));
  const role = roles[index];
  const className = (c: ClassId) => resume.classes.find((k) => k.id === c)?.name ?? c;

  /** Pick a stage. The wrapper below is keyed by the stage, so a real change remounts it under the wipe. */
  const go = useCallback((id: string) => {
    if (activeRef.current === id || !roles.some((r) => r.id === id)) return;
    activeRef.current = id;
    setActive(id);
    setWipes((w) => w + 1);
  }, [roles]);
  const step = useCallback((d: 1 | -1) => {
    const i = roles.findIndex((r) => r.id === activeRef.current);
    go(roles[(i + d + roles.length) % roles.length].id);
  }, [go, roles]);

  /* A class picked in Character Select opens the first stage it was played in; a class with no stage keeps this one. */
  useEffect(() => {
    const on = (e: Event) => {
      const c = asClass((e as CustomEvent).detail);
      const first = c ? roles.find((r) => r.classes.includes(c)) : undefined;
      if (first) go(first.id);
    };
    window.addEventListener("class-select", on);
    return () => window.removeEventListener("class-select", on);
  }, [go, roles]);

  /* Roving tabindex: after an arrow key the newly active tab takes focus; on phones the row scrolls it into view. */
  useEffect(() => {
    const ul = tabs.current;
    const a = ul?.querySelector<HTMLElement>(`[data-tab="${active}"]`);
    if (!ul || !a) return;
    if (focusPending.current) { focusPending.current = false; a.focus({ preventScroll: true }); }
    if (ul.scrollWidth > ul.clientWidth + 2) ul.scrollTo({ left: Math.max(0, a.offsetLeft - 12), behavior: "auto" });
  }, [active]);

  const onTabsKey = (e: React.KeyboardEvent<HTMLDivElement>) => {
    if (e.altKey || e.ctrlKey || e.metaKey) return;
    const i = roles.findIndex((r) => r.id === (e.target as HTMLElement).dataset.tab);
    if (i < 0) return;
    let j = i;
    if (e.key === "ArrowRight" || e.key === "ArrowDown") j = (i + 1) % roles.length;
    else if (e.key === "ArrowLeft" || e.key === "ArrowUp") j = (i - 1 + roles.length) % roles.length;
    else if (e.key === "Home") j = 0;
    else if (e.key === "End") j = roles.length - 1;
    else return;
    e.preventDefault();
    focusPending.current = true;
    go(roles[j].id);
  };

  const noStage = !!playerClass && !roles.some((r) => r.classes.includes(playerClass));
  const pager = (
    <div className="camp-pager">
      <button type="button" className="camp-step" onClick={() => step(-1)} aria-label="Previous stage"><span aria-hidden="true">◀</span> Prev</button>
      <span className="camp-pager-n mono-label">{index + 1} / {roles.length}</span>
      <button type="button" className="camp-step" onClick={() => step(1)} aria-label="Next stage">Next <span aria-hidden="true">▶</span></button>
    </div>
  );

  return (
    <VideoPanel video="road" dim={0.72} id={CHAPTER.id} data-chapter={CHAPTER.id} className="chapter campaign" ariaLabel={`${CHAPTER.n} ${CHAPTER.en} · ${CHAPTER.plain}`}>
      <div className="wrap">
        <div className="chapter-head ink-in">
          <Eyebrow n={CHAPTER.n}>{CHAPTER.en}</Eyebrow>
          <span className="camp-plain">{CHAPTER.plain}</span>
        </div>
        <div className="camp-titlerow ink-in">
          <h2 className="chapter-title">Campaign</h2>
          <Kanji en={CHAPTER.en} jp={CHAPTER.jp} romaji={CHAPTER.romaji} />
        </div>
        <p className="camp-intro ink-in">Five stages, one at a time, newest first. Each is a system I worked in: pick it, send something through, read what happens.</p>

        <nav className="camp-select paper ink-border hard-shadow-sm ink-in" aria-label="Stage select · experience">
          <span className="camp-select-label mono-label">Stage select<span className="camp-select-plain">· roles, newest first</span><span className="camp-select-keys"><span aria-hidden="true">← →</span> keys · click a stage</span></span>
          <button type="button" className="camp-step camp-step-prev" onClick={() => step(-1)} aria-label="Previous stage"><span aria-hidden="true">◀</span> Prev</button>
          <div role="tablist" aria-label="Stages · roles" className="camp-tabs" ref={tabs} onKeyDown={onTabsKey}>
            {roles.map((r) => {
              const lit = !!playerClass && r.classes.includes(playerClass);
              const on = active === r.id;
              return (
                <button key={r.id} type="button" role="tab" id={`stage-tab-${r.id}`} data-tab={r.id} aria-selected={on} aria-controls="stage-panel" tabIndex={on ? 0 : -1}
                  className={cn("camp-tab", on && "is-active", lit && "is-lit")} onClick={() => go(r.id)}>
                  <span className="camp-tab-top">
                    {r.org}
                    {r.current ? <span className="camp-tab-now">NOW</span> : null}
                  </span>
                  <span className="camp-tab-title">{r.title}</span>
                  <span className="camp-tab-period">{r.period}</span>
                  {lit && playerClass ? <span className="sr-only"> · played as {className(playerClass)}</span> : null}
                </button>
              );
            })}
          </div>
          <button type="button" className="camp-step camp-step-next" onClick={() => step(1)} aria-label="Next stage">Next <span aria-hidden="true">▶</span></button>
        </nav>
        {noStage && playerClass ? (
          <p className="camp-note mono-label" role="status">no stage for this class yet · <a href="#arcade">see ARCADE</a> <span className="camp-select-plain">· {className(playerClass)} is played off the clock</span></p>
        ) : null}

        <div key={role.id} id="stage-panel" role="tabpanel" aria-labelledby={`stage-tab-${role.id}`} className={cn("camp-stage", wipes > 0 && "is-wipe")}>
          <Stage role={role} fig={`${CHAPTER.n}.${index + 1}`} index={index} total={roles.length} playerClass={playerClass} pager={pager} />
        </div>
      </div>
    </VideoPanel>
  );
}

export default Campaign;
