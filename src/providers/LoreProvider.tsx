"use client";
import { createContext, useCallback, useContext, useEffect, useMemo, useRef, useState } from "react";
import { LORE_IDS, LORE_TOTAL, isLoreId, type LoreId } from "@/lib/lore";

const KEY = "press-start-lore";

interface LoreCtx {
  found: Set<LoreId>;
  count: number;
  total: number;
  /** Mark a fragment found. Returns true if it was NEW (for one-shot SFX/toast). */
  unlock: (id: LoreId) => boolean;
  has: (id: LoreId) => boolean;
  /** transient: the id just unlocked this tick (drives the reveal toast), or null */
  justFound: LoreId | null;
  clearJustFound: () => void;
}

const Ctx = createContext<LoreCtx | null>(null);

/** Fire from anywhere (even outside React, e.g. the R3F canvas):
 *    window.dispatchEvent(new CustomEvent("lore-found", { detail: "dragon" })) */
export function reportLore(id: LoreId) {
  if (typeof window !== "undefined") {
    window.dispatchEvent(new CustomEvent("lore-found", { detail: id }));
  }
}

export function LoreProvider({ children }: { children: React.ReactNode }) {
  const [found, setFound] = useState<Set<LoreId>>(new Set());
  const [justFound, setJustFound] = useState<LoreId | null>(null);
  const foundRef = useRef(found);
  foundRef.current = found;

  // hydrate from localStorage on mount (client-only → no SSR mismatch)
  useEffect(() => {
    try {
      const raw = localStorage.getItem(KEY);
      if (!raw) return;
      const ids = (JSON.parse(raw) as unknown[]).filter(isLoreId);
      if (ids.length) setFound(new Set(ids));
    } catch {
      /* ignore malformed save */
    }
  }, []);

  const unlock = useCallback((id: LoreId): boolean => {
    if (foundRef.current.has(id)) return false;
    setFound((prev) => {
      const next = new Set(prev);
      next.add(id);
      try {
        localStorage.setItem(KEY, JSON.stringify([...next]));
      } catch {
        /* storage may be unavailable; the run still works in-memory */
      }
      return next;
    });
    setJustFound(id);
    return true;
  }, []);

  // listen for the global event so non-React / cross-renderer code can report finds
  useEffect(() => {
    const onFound = (e: Event) => {
      const id = (e as CustomEvent).detail;
      if (isLoreId(id)) unlock(id);
    };
    window.addEventListener("lore-found", onFound);
    return () => window.removeEventListener("lore-found", onFound);
  }, [unlock]);

  const value = useMemo<LoreCtx>(
    () => ({
      found,
      count: found.size,
      total: LORE_TOTAL,
      unlock,
      has: (id: LoreId) => found.has(id),
      justFound,
      clearJustFound: () => setJustFound(null),
    }),
    [found, unlock, justFound],
  );

  return <Ctx.Provider value={value}>{children}</Ctx.Provider>;
}

export function useLore(): LoreCtx {
  const ctx = useContext(Ctx);
  if (!ctx) {
    // Safe no-op outside the provider (e.g. isolated unit tests).
    return {
      found: new Set(),
      count: 0,
      total: LORE_TOTAL,
      unlock: () => false,
      has: () => false,
      justFound: null,
      clearJustFound: () => {},
    };
  }
  return ctx;
}

export { LORE_IDS };
