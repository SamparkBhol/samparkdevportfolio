import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  reactStrictMode: true,
  // three.js ships untranspiled ESM that Next handles, but transpiling is safest:
  transpilePackages: ["three"],
};

export default nextConfig;
