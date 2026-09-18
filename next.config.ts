import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  // Static export: the whole site is HTML/CSS/JS + media. Serve `out/` anywhere (Vercel, GitHub Pages, `npm start`).
  output: "export",
  trailingSlash: true,
  reactStrictMode: true,
  images: { unoptimized: true },
  experimental: { inlineCss: true },
};

export default nextConfig;
