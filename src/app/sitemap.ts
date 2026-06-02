import type { MetadataRoute } from "next";
import { portfolio } from "@/content/portfolio";
const base = "https://press-start.vercel.app";
export default function sitemap(): MetadataRoute.Sitemap {
  return [
    { url: base, priority: 1 },
    ...portfolio.blogs.map((b) => ({ url: `${base}/blog/${b.slug}`, priority: 0.6 })),
  ];
}
