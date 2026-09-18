import type { Metadata, Viewport } from "next";
import { Dela_Gothic_One, Atkinson_Hyperlegible, Courier_Prime, Patrick_Hand, Bangers, Pirata_One } from "next/font/google";
import { resume } from "@/content/resume";
import { InkProvider } from "@/components/motion/InkProvider";
import { Masthead } from "@/components/chrome/Masthead";
import { ProgressStrip } from "@/components/chrome/ProgressStrip";
import { RecruiterOverlay } from "@/components/chrome/RecruiterOverlay";
import "./globals.css";

const dela = Dela_Gothic_One({ weight: "400", subsets: ["latin"], variable: "--font-dela", display: "swap" });
const atkinson = Atkinson_Hyperlegible({ weight: ["400", "700"], subsets: ["latin"], variable: "--font-atkinson", display: "swap" });
const courier = Courier_Prime({ weight: ["400", "700"], subsets: ["latin"], variable: "--font-courier", display: "swap" });
const patrick = Patrick_Hand({ weight: "400", subsets: ["latin"], variable: "--font-patrick", display: "swap", preload: false });
const bangers = Bangers({ weight: "400", subsets: ["latin"], variable: "--font-bangers", display: "swap", preload: false });
/* Blackletter for the Archives scroll titles only; self-hosted like the others, never render-blocking. */
const pirata = Pirata_One({ weight: "400", subsets: ["latin"], variable: "--font-pirata", display: "swap", preload: false });

const { profile } = resume;

export const metadata: Metadata = {
  metadataBase: new URL(profile.siteUrl),
  title: { default: `${profile.name} — ${profile.title}`, template: `%s · ${profile.name}` },
  description: `${profile.classLine}. ${profile.employer}, ${profile.location}. ${profile.premise}`,
  openGraph: { title: `${profile.name} — ${profile.title} · Issue No.${profile.issue.number}`, description: profile.premise, type: "website", url: "/" },
  twitter: { card: "summary_large_image" },
  alternates: { canonical: "/" },
};

export const viewport: Viewport = { themeColor: "#0E0F14", width: "device-width", initialScale: 1, viewportFit: "cover" };

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en" data-ink="cel" className={`${dela.variable} ${atkinson.variable} ${courier.variable} ${patrick.variable} ${bangers.variable} ${pirata.variable}`}>
      <body>
        <a href="#select" className="skip-link">Skip to the résumé</a>
        <InkProvider>
          <Masthead />
          {children}
          <ProgressStrip />
          <RecruiterOverlay />
        </InkProvider>
      </body>
    </html>
  );
}
