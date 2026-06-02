import { useEffect, useRef } from "react";

const CODE = ["ArrowUp", "ArrowUp", "ArrowDown", "ArrowDown", "ArrowLeft", "ArrowRight", "ArrowLeft", "ArrowRight", "b", "a"];

export function useKonami(onUnlock: () => void) {
  const pos = useRef(0);
  useEffect(() => {
    function handler(e: KeyboardEvent) {
      const key = e.key.length === 1 ? e.key.toLowerCase() : e.key;
      if (key === CODE[pos.current]) {
        pos.current += 1;
        if (pos.current === CODE.length) { pos.current = 0; onUnlock(); }
      } else {
        pos.current = key === CODE[0] ? 1 : 0;
      }
    }
    window.addEventListener("keydown", handler);
    return () => window.removeEventListener("keydown", handler);
  }, [onUnlock]);
}
