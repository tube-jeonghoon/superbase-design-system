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

  it("creates native JS tokens with numeric sizes and a d.ts", () => {
    const jsPath = join(pkgRoot, "dist/native/tokens.js");
    const dtsPath = join(pkgRoot, "dist/native/tokens.d.ts");
    expect(existsSync(jsPath)).toBe(true);
    expect(existsSync(dtsPath)).toBe(true);
    const js = readFileSync(jsPath, "utf8");
    expect(js).toContain('export const ColorBlue500 = "#3182f6";');
    expect(js).toContain("export const Spacing4 = 16;");
    expect(js).toContain("export const FontSizeBody = 15;");
    const dts = readFileSync(dtsPath, "utf8");
    expect(dts).toContain("export const Spacing4");
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

  it("emits status semantic colors (web + native)", () => {
    const css = readFileSync(join(pkgRoot, "dist/web/variables.css"), "utf8");
    expect(css).toContain("--color-status-success: #00b26d;");
    expect(css).toContain("--color-status-warning: #ffb020;");
    expect(css).toContain("--color-status-danger: #f04452;");
    const ts = readFileSync(join(pkgRoot, "dist/native/tokens.js"), "utf8");
    expect(ts).toContain('export const ColorStatusSuccess = "#00b26d";');
  });

  it("emits scalar foundation tokens as CSS variables", () => {
    const css = readFileSync(join(pkgRoot, "dist/web/variables.css"), "utf8");
    expect(css).toContain("--border-width-thin: 1px;");
    expect(css).toContain("--border-width-medium: 2px;");
    expect(css).toContain("--opacity-disabled: 0.4;");
    expect(css).toContain("--opacity-pressed: 0.85;");
    expect(css).toContain("--line-height-body: 1.5;");
    expect(css).toContain("--letter-spacing-tight: -0.02em;");
    expect(css).toContain("--duration-fast: 120ms;");
    expect(css).toContain("--duration-slow: 320ms;");
    expect(css).toContain("--easing-standard: cubic-bezier(0.2, 0, 0, 1);");
    expect(css).toContain("--z-index-modal: 1300;");
    expect(css).toContain("--focus-ring-color: rgba(49, 130, 246, 0.4);");
    expect(css).toContain("--focus-ring-width: 2px;");
  });

  it("matches the CSS output snapshot", () => {
    const css = readFileSync(join(pkgRoot, "dist/web/variables.css"), "utf8");
    expect(css).toMatchSnapshot();
  });

  it("matches the native TS output snapshot", () => {
    const ts = readFileSync(join(pkgRoot, "dist/native/tokens.js"), "utf8");
    expect(ts).toMatchSnapshot();
  });
});
