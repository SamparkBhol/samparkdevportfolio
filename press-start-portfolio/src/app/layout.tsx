import type { Metadata } from "next";
import { Press_Start_2P, Bungee, Bangers, Bricolage_Grotesque, Space_Mono, Pirata_One } from "next/font/google";
import { Providers } from "@/providers/Providers";
import { Hud } from "@/components/hud/Hud";
import { Scanlines } from "@/components/effects/Scanlines";
import { PixelCursor } from "@/components/effects/PixelCursor";
import { PixelBuddy } from "@/components/buddy/PixelBuddy";
import { portfolio } from "@/content/portfolio";
import "./globals.css";

const press = Press_Start_2P({ weight: "400", subsets: ["latin"], variable: "--font-press-start" });
const bungee = Bungee({ weight: "400", subsets: ["latin"], variable: "--font-bungee" });
const bangers = Bangers({ weight: "400", subsets: ["latin"], variable: "--font-bangers" });
const bricolage = Bricolage_Grotesque({ subsets: ["latin"], variable: "--font-bricolage" });
const spaceMono = Space_Mono({ weight: ["400", "700"], subsets: ["latin"], variable: "--font-space-mono" });
const blackletter = Pirata_One({ weight: "400", subsets: ["latin"], variable: "--font-blackletter" });

export const metadata: Metadata = {
  metadataBase: new URL("https://press-start.vercel.app"),
  title: `${portfolio.profile.name} — ${portfolio.profile.title}`,
  description: portfolio.profile.tagline,
  openGraph: {
    title: `${portfolio.profile.name} — Portfolio`,
    description: portfolio.profile.tagline, type: "website",
  },
  twitter: { card: "summary_large_image" },
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en" className={`${press.variable} ${bungee.variable} ${bangers.variable} ${bricolage.variable} ${spaceMono.variable} ${blackletter.variable}`}>
      <body className="grain">
        <a href="#about" className="skip-link font-pixel text-xs">Skip to content</a>
        <Providers>
          <Hud />
          {children}
          <Scanlines />
          <PixelCursor />
          <PixelBuddy />
        </Providers>
      </body>
    </html>
  );
}
