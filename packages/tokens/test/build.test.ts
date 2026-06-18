import { describe, it, expect, beforeAll } from "vitest";
import { execSync } from "node:child_process";
import { readFileSync, existsSync } from "node:fs";
import { fileURLToPath } from "node:url";
import { dirname, join } from "node:path";

const pkgRoot = dirname(fileURLToPath(import.meta.url)).replace(/\/test$/, "");

beforeAll(() => {
  execSync("node build.mjs", { cwd: pkgRoot, stdio: "inherit" });
});

describe("token build outputs", () => {
  it("creates web CSS variables file", () => {
    const cssPath = join(pkgRoot, "dist/web/variables.css");
    expect(existsSync(cssPath)).toBe(true);
    const css = readFileSync(cssPath, "utf8");
    expect(css).toContain("--color-blue-500: #3182f6;");
    expect(css).toContain(":root");
  });

  it("creates native TS tokens file with named exports", () => {
    const tsPath = join(pkgRoot, "dist/native/tokens.ts");
    expect(existsSync(tsPath)).toBe(true);
    const ts = readFileSync(tsPath, "utf8");
    expect(ts).toContain("export const ColorBlue500 = \"#3182f6\";");
  });

  it("maps semantic tokens to resolved values in :root (light)", () => {
    const css = readFileSync(join(pkgRoot, "dist/web/variables.css"), "utf8");
    expect(css).toContain("--color-text-primary: #191f28;");
    expect(css).toContain("--color-background-default: #ffffff;");
  });

  it("emits a dark theme block overriding semantic tokens", () => {
    const css = readFileSync(join(pkgRoot, "dist/web/variables.css"), "utf8");
    expect(css).toContain('[data-theme="dark"]');
    expect(css).toContain("--color-background-default: #191f28;");
  });
});
