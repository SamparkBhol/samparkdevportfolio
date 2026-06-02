"use client";
import { createContext, useCallback, useContext, useEffect, useMemo, useRef, useState } from "react";
import { SFX, type SfxName } from "@/lib/sfx";

interface SoundCtx { enabled: boolean; toggle: () => void; play: (name: SfxName) => void }
const Ctx = createContext<SoundCtx | null>(null);

export function SoundProvider({ children }: { children: React.ReactNode }) {
  const [enabled, setEnabled] = useState(false);
  const cache = useRef<Partial<Record<SfxName, HTMLAudioElement>>>({});

  useEffect(() => {
    const saved = localStorage.getItem("sound") === "on";
    if (saved) setEnabled(true);
  }, []);

  const toggle = useCallback(() => {
    setEnabled((e) => {
      const next = !e;
      localStorage.setItem("sound", next ? "on" : "off");
      return next;
    });
  }, []);

  const play = useCallback((name: SfxName) => {
    if (!enabled) return;
    let a = cache.current[name];
    if (!a) { a = new Audio(SFX[name]); a.volume = 0.35; cache.current[name] = a; }
    a.currentTime = 0; void a.play().catch(() => {});
  }, [enabled]);

  const value = useMemo(() => ({ enabled, toggle, play }), [enabled, toggle, play]);
  return <Ctx.Provider value={value}>{children}</Ctx.Provider>;
}

export function useSound(): SoundCtx {
  const ctx = useContext(Ctx);
  if (!ctx) return { enabled: false, toggle: () => {}, play: () => {} };
  return ctx;
}
