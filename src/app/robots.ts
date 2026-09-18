import type { MetadataRoute } from "next";
import { resume } from "@/content/resume";
export const dynamic = "force-static";
export default function robots(): MetadataRoute.Robots {
  return { rules: { userAgent: "*", allow: "/" }, sitemap: `${resume.profile.siteUrl}/sitemap.xml` };
}
