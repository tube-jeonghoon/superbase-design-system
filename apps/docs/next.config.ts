import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  transpilePackages: [
    "@superbase/react",
    "@superbase/react-native",
    "@superbase/tokens",
    "@superbase/icons",
    "react-native-web",
    "react-native-svg",
  ],
  webpack: (config) => {
    config.resolve.alias = {
      ...config.resolve.alias,
      "react-native$": "react-native-web",
    };
    config.resolve.extensions = [
      ".web.tsx",
      ".web.ts",
      ".web.jsx",
      ".web.js",
      ...(config.resolve.extensions ?? []),
    ];
    return config;
  },
  turbopack: {
    resolveAlias: {
      "react-native": "react-native-web",
    },
  },
};

export default nextConfig;
