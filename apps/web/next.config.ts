import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  // Consume the shared TypeScript source of these packages directly.
  transpilePackages: ["@ninjamountain/triage"],
};

export default nextConfig;
