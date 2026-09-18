import type { MetadataRoute } from "next";
import { resume } from "@/content/resume";
export const dynamic = "force-static";
export default function sitemap(): MetadataRoute.Sitemap {
  const base = resume.profile.siteUrl;
  return [
    { url: `${base}/`, lastModified: new Date("2026-09-17"), changeFrequency: "monthly", priority: 1 },
    { url: `${base}/resume/`, lastModified: new Date("2026-09-17"), changeFrequency: "monthly", priority: 0.8 },
  ];
}
