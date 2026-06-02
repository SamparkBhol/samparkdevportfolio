import { ImageResponse } from "next/og";
import { portfolio } from "@/content/portfolio";
export const size = { width: 1200, height: 630 };
export const contentType = "image/png";
export default function OG() {
  return new ImageResponse(
    (
      <div style={{ width: "100%", height: "100%", display: "flex", flexDirection: "column",
        alignItems: "center", justifyContent: "center", background: "#0b0b12", color: "#ffd23f",
        fontSize: 80, fontWeight: 700, border: "16px solid #0a0a0a" }}>
        <div>{portfolio.profile.name.toUpperCase()}</div>
        <div style={{ fontSize: 32, color: "#00e5ff", marginTop: 16 }}>{portfolio.profile.title}</div>
        <div style={{ fontSize: 24, color: "#fdf6e3", marginTop: 24 }}>▶ PRESS START</div>
      </div>
    ), { ...size }
  );
}
