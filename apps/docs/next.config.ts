import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  transpilePackages: ["@thesuperbase/react", "@thesuperbase/tokens"],
};

export default nextConfig;
