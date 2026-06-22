import { iconPaths, iconNames, ICON_VIEWBOX } from "./index";

describe("icons data", () => {
  it("exposes 23 icons", () => {
    expect(iconNames).toHaveLength(23);
  });

  it("includes the navigation icons", () => {
    for (const n of ["home", "calendar", "users", "chat", "arrow-left"] as const) {
      expect(iconNames).toContain(n);
    }
  });

  it("every icon has a non-empty path string", () => {
    for (const name of iconNames) {
      expect(typeof iconPaths[name]).toBe("string");
      expect(iconPaths[name].length).toBeGreaterThan(0);
    }
  });

  it("iconNames matches iconPaths keys", () => {
    expect([...iconNames].sort()).toEqual(Object.keys(iconPaths).sort());
  });

  it("uses a 24px viewBox", () => {
    expect(ICON_VIEWBOX).toBe("0 0 24 24");
  });
});
