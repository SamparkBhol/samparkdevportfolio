import Link from "next/link";
import { ArcadeButton } from "@/components/ui/ArcadeButton";

export default function NotFound() {
  return (
    <main className="grid min-h-screen place-items-center text-center px-4">
      <div>
        <h1 className="font-comic text-6xl md:text-8xl text-pop-red [-webkit-text-stroke:2px_black]">GAME OVER</h1>
        <p className="font-pixel text-xs text-pop-yellow mt-4">404 — STAGE NOT FOUND</p>
        <div className="mt-8"><Link href="/"><ArcadeButton color="green">▶ CONTINUE</ArcadeButton></Link></div>
      </div>
    </main>
  );
}
