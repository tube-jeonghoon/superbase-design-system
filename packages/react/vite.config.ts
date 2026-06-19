import { defineConfig, mergeConfig } from "vite";
import react from "@vitejs/plugin-react";
import dts from "vite-plugin-dts";
import { resolve } from "node:path";
import { defineConfig as defineVitestConfig } from "vitest/config";

const viteConfig = defineConfig({
  plugins: [
    react(),
    dts({ include: ["src"], exclude: ["**/*.test.*", "src/test-setup.ts"] }),
  ],
  build: {
    lib: {
      entry: resolve(import.meta.dirname, "src/index.ts"),
      formats: ["es"],
      fileName: "index",
      // vite emits library CSS as dist/style.css by default; package
      // exports["./styles.css"] points there. (No vite-6-only cssFileName.)
    },
    rollupOptions: {
      external: [
        "react",
        "react-dom",
        "react/jsx-runtime",
        "react/jsx-dev-runtime",
      ],
      output: {
        // The bundle now includes createContext (RadioGroup). Next.js App
        // Router rejects a module that calls createContext at module scope
        // unless it is marked as a Client Component. Rollup strips in-source
        // "use client" directives during bundling, so re-emit it as a banner.
        // TODO(v2): this marks the WHOLE bundle client-only, so pure
        // presentational components (Badge/Text/Stack) can't be Server
        // Components. Revisit with per-component entry points + exports
        // subpaths once the component count justifies it.
        banner: '"use client";',
      },
    },
  },
});

const vitestConfig = defineVitestConfig({
  test: {
    environment: "jsdom",
    globals: true,
    setupFiles: ["./src/test-setup.ts"],
    css: true,
  },
});

export default mergeConfig(viteConfig, vitestConfig);
