import { ImageResponse } from "next/og";
import { resume } from "@/content/resume";
export const dynamic = "force-static";
export const alt = "Sampark Bhol — Software Engineer · Issue No.1";
export const size = { width: 1200, height: 630 };
export const contentType = "image/png";

export default function OG() {
  const { profile } = resume;
  return new ImageResponse(
    (
      <div style={{ width: "100%", height: "100%", display: "flex", background: "#0E0F14", padding: 40, fontFamily: "sans-serif" }}>
        <div style={{ flex: 1, display: "flex", flexDirection: "column", justifyContent: "space-between", background: "#F3F1EB", border: "8px solid #141210", padding: 48, color: "#141210" }}>
          <div style={{ display: "flex", justifyContent: "space-between", fontSize: 24, letterSpacing: 4, fontWeight: 700 }}>
            <span>ISSUE No.{profile.issue.number} · {profile.issue.volume.toUpperCase()}</span><span>{profile.issue.month.toUpperCase()} · FREE</span>
          </div>
          <div style={{ display: "flex", flexDirection: "column" }}>
            <div style={{ fontSize: 120, fontWeight: 900, lineHeight: 1, letterSpacing: -4 }}>{profile.name.toUpperCase()}</div>
            <div style={{ fontSize: 30, marginTop: 18, letterSpacing: 2, color: "#D0342C", fontWeight: 700 }}>{profile.classLine.toUpperCase()}</div>
          </div>
          <div style={{ display: "flex", justifyContent: "space-between", fontSize: 26 }}>
            <span>{profile.employer} · {profile.location}</span>
            <span style={{ border: "6px solid #D0342C", color: "#D0342C", padding: "4px 18px", fontWeight: 900, transform: "rotate(-6deg)" }}>APPROVED</span>
          </div>
        </div>
      </div>
    ),
    size,
  );
}
