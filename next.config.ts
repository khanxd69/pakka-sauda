import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  // Evidence photos go through the uploadEvidence server action (A3.3); the action itself caps files at 5 MB.
  experimental: { serverActions: { bodySizeLimit: "6mb" } },
};

export default nextConfig;
