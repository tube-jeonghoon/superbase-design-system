import { describe, it, expect, beforeAll } from "vitest";
import { execSync } from "node:child_process";
import { readFileSync, existsSync, mkdtempSync } from "node:fs";
import { tmpdir } from "node:os";
import { fileURLToPath } from "node:url";
import { dirname, join } from "node:path";

const pkgRoot = dirname(fileURLToPath(import.meta.url)).replace(/\/test$/, "");
const dist = mkdtempSync(join(tmpdir(), "sb-tokens-build-"));

beforeAll(() => {
  execSync("node build.mjs", { cwd: pkgRoot, env: { ...process.env, TOKENS_DIST: dist }, stdio: "inherit" });
});

describe("token build outputs", () => {
  it("creates web CSS variables file", () => {
    const cssPath = join(dist, "web/variables.css");
    expect(existsSync(cssPath)).toBe(true);
    const css = readFileSync(cssPath, "utf8");
    expect(css).toContain("--color-blue-500: #3182f6;");
    expect(css).toContain(":root");
  });

  it("creates native JS tokens with numeric sizes and a d.ts", () => {
    const jsPath = join(dist, "native/tokens.js");
    const dtsPath = join(dist, "native/tokens.d.ts");
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
    const css = readFileSync(join(dist, "web/variables.css"), "utf8");
    expect(css).toContain("--color-text-primary: #191f28;");
    expect(css).toContain("--color-background-default: #ffffff;");
  });

  it("emits a dark theme block overriding semantic tokens", () => {
    const css = readFileSync(join(dist, "web/variables.css"), "utf8");
    expect(css).toContain('[data-theme="dark"]');
    expect(css).toContain("--color-background-default: #191f28;");
  });

  it("emits status semantic colors (web + native)", () => {
    const css = readFileSync(join(dist, "web/variables.css"), "utf8");
    expect(css).toContain("--color-status-success: #00b26d;");
    expect(css).toContain("--color-status-warning: #ffb020;");
    expect(css).toContain("--color-status-danger: #f04452;");
    const ts = readFileSync(join(dist, "native/tokens.js"), "utf8");
    expect(ts).toContain('export const ColorStatusSuccess = "#00b26d";');
  });

  it("emits scalar foundation tokens as CSS variables", () => {
    const css = readFileSync(join(dist, "web/variables.css"), "utf8");
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

  it("emits component-size tokens (web + native)", () => {
    const css = readFileSync(join(dist, "web/variables.css"), "utf8");
    expect(css).toContain("--size-control: 20px;");
    expect(css).toContain("--size-button-md: 44px;");
    expect(css).toContain("--size-field: 48px;");
    expect(css).toContain("--size-switch-thumb: 28px;");
    expect(css).toContain("--size-icon-md: 20px;");
    const js = readFileSync(join(dist, "native/tokens.js"), "utf8");
    expect(js).toContain("export const SizeControl = 20;");
    expect(js).toContain("export const SizeButtonMd = 44;");
  });

  it("emits elevation/shadow CSS variables", () => {
    const css = readFileSync(join(dist, "web/variables.css"), "utf8");
    expect(css).toContain("--shadow-sm: 0 1px 2px rgba(0, 0, 0, 0.06);");
    expect(css).toContain("--shadow-md: 0 4px 8px rgba(0, 0, 0, 0.08);");
    expect(css).toContain("--shadow-lg: 0 8px 24px rgba(0, 0, 0, 0.12);");
    expect(css).toContain("--shadow-xl: 0 16px 48px rgba(0, 0, 0, 0.16);");
  });

  it("emits field size variant tokens (web + native)", () => {
    const css = readFileSync(join(dist, "web/variables.css"), "utf8");
    expect(css).toContain("--size-field-sm: 40px;");
    expect(css).toContain("--size-field-lg: 56px;");
    const js = readFileSync(join(dist, "native/tokens.js"), "utf8");
    expect(js).toContain("export const SizeFieldSm = 40;");
    expect(js).toContain("export const SizeFieldLg = 56;");
  });

  it("emits 2c size tokens (icon-xs, control-sm, switch-sm)", () => {
    const css = readFileSync(join(dist, "web/variables.css"), "utf8");
    expect(css).toContain("--size-icon-xs: 12px;");
    expect(css).toContain("--size-control-sm: 16px;");
    expect(css).toContain("--size-switch-sm-width: 40px;");
    expect(css).toContain("--size-switch-sm-height: 24px;");
    expect(css).toContain("--size-switch-sm-thumb: 20px;");
  });

  it("emits avatar size tokens (web + native)", () => {
    const css = readFileSync(join(dist, "web/variables.css"), "utf8");
    expect(css).toContain("--size-avatar-sm: 32px;");
    expect(css).toContain("--size-avatar-md: 40px;");
    expect(css).toContain("--size-avatar-lg: 56px;");
    const js = readFileSync(join(dist, "native/tokens.js"), "utf8");
    expect(js).toContain("export const SizeAvatarMd = 40;");
  });

  it("emits scrim color and modal size tokens", () => {
    const css = readFileSync(join(dist, "web/variables.css"), "utf8");
    expect(css).toContain("--color-background-scrim: rgba(0, 0, 0, 0.5);"); // light
    expect(css).toContain("--color-background-scrim: rgba(0, 0, 0, 0.6);"); // dark
    expect(css).toContain("--size-modal-sm: 360px;");
    expect(css).toContain("--size-modal-md: 480px;");
    expect(css).toContain("--size-modal-lg: 640px;");

    const theme = readFileSync(join(dist, "native/theme.js"), "utf8");
    expect(theme).toContain('"scrim": "rgba(0, 0, 0, 0.5)"'); // light
    expect(theme).toContain('"scrim": "rgba(0, 0, 0, 0.6)"'); // dark
    expect(theme).toContain('"modal": {');
    expect(theme).toContain('"sm": 360');
  });

  it("matches the CSS output snapshot", () => {
    const css = readFileSync(join(dist, "web/variables.css"), "utf8");
    expect(css).toMatchSnapshot();
  });

  it("matches the native TS output snapshot", () => {
    const ts = readFileSync(join(dist, "native/tokens.js"), "utf8");
    expect(ts).toMatchSnapshot();
  });
});
