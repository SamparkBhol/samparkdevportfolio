import Link from "next/link";
import { VideoPanel } from "@/components/print/VideoPanel";

export default function NotFound() {
  return (
    <VideoPanel video="hell" priority dim={0.6} className="chapter" ariaLabel="Page not found" style={{ minHeight: "100svh", display: "grid", placeItems: "center" }}>
      <div style={{ textAlign: "center", padding: 24 }}>
        <p className="mono-label" style={{ color: "var(--color-yellow)" }}>404 — stage not found</p>
        <h1 className="display stroke" style={{ fontSize: "clamp(56px, 12vw, 160px)", margin: "8px 0 20px" }}>GAME OVER</h1>
        <Link className="btn btn-red" href="/">▶ Continue</Link>
      </div>
    </VideoPanel>
  );
}
