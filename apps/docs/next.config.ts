import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  transpilePackages: ["@superbase/react", "@superbase/tokens"],
};

export default nextConfig;
