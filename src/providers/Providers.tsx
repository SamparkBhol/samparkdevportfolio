"use client";
import { SoundProvider } from "@/hooks/useSound";
import { LoreProvider } from "@/providers/LoreProvider";
export function Providers({ children }: { children: React.ReactNode }) {
  return (
    <SoundProvider>
      <LoreProvider>{children}</LoreProvider>
    </SoundProvider>
  );
}
