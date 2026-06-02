"use client";
import { SoundProvider } from "@/hooks/useSound";
export function Providers({ children }: { children: React.ReactNode }) {
  return <SoundProvider>{children}</SoundProvider>;
}
