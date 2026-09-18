"use client";
import { createContext, useCallback, useContext, useEffect, useState } from "react";
import type { Ink } from "@/content/types";

const Ctx = createContext<{ ink: Ink; setInk: (i: Ink) => void }>({ ink: "cel", setInk: () => {} });
const KEY = "issue01.ink";

export function InkProvider({ children }: { children: React.ReactNode }) {
  const [ink, setInkState] = useState<Ink>("cel");
  useEffect(() => {
    // eslint-disable-next-line react-hooks/set-state-in-effect -- a persisted preference read once after hydration
    try { const s = localStorage.getItem(KEY) as Ink | null; if (s === "cel" || s === "shu" || s === "yellow") setInkState(s); } catch {}
  }, []);
  useEffect(() => { document.documentElement.dataset.ink = ink; }, [ink]);
  const setInk = useCallback((i: Ink) => { setInkState(i); try { localStorage.setItem(KEY, i); } catch {} }, []);
  return <Ctx.Provider value={{ ink, setInk }}>{children}</Ctx.Provider>;
}
export const useInk = () => useContext(Ctx);
