import { describe, it, expect, beforeAll } from "vitest";
import { execSync } from "node:child_process";
import { readFileSync, existsSync, mkdtempSync } from "node:fs";
import { tmpdir } from "node:os";
import { fileURLToPath } from "node:url";
import { dirname, join } from "node:path";

const pkgRoot = dirname(fileURLToPath(import.meta.url)).replace(/\/test$/, "");
const dist = mkdtempSync(join(tmpdir(), "sb-tokens-theme-"));

beforeAll(() => {
  execSync("node build.mjs", { cwd: pkgRoot, env: { ...process.env, TOKENS_DIST: dist }, stdio: "inherit" });
});

describe("native runtime theme objects", () => {
  it("writes theme.js and theme.d.ts", () => {
    expect(existsSync(join(dist, "native/theme.js"))).toBe(true);
    expect(existsSync(join(dist, "native/theme.d.ts"))).toBe(true);
  });

  it("lightTheme and darkTheme have the expected shared shape with converted values", async () => {
    const mod = await import(join(dist, "native/theme.js"));
    const { lightTheme, darkTheme } = mod;
    expect(lightTheme.color.text.primary).toBe("#191f28");
    expect(darkTheme.color.background.default).toBe("#191f28");
    expect(lightTheme.spacing["4"]).toBe(16);
    expect(lightTheme.radius.md).toBe(12);
    expect(lightTheme.font.size.body).toBe(15);
    expect(lightTheme.borderWidth.thin).toBe(1);
    expect(lightTheme.opacity.disabled).toBe(0.4);
    expect(lightTheme.lineHeight.body).toBe(1.5);
    expect(lightTheme.motion.duration.fast).toBe(120);
    expect(lightTheme.motion.easing.standard).toEqual([0.2, 0, 0, 1]);
    expect(lightTheme.shadow.md.elevation).toBe(4);
    expect(lightTheme.shadow.md.shadowOffset).toEqual({ width: 0, height: 4 });
    expect(lightTheme.shadow.md.shadowOpacity).toBe(0.08);
    expect(lightTheme.size.button.md).toBe(44);
    expect(lightTheme.size.control).toBe(20);
    expect(lightTheme.zIndex).toBeUndefined();
    expect(lightTheme.focusRing).toBeUndefined();
    expect(lightTheme.letterSpacing).toBeUndefined();
  });
});
