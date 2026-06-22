import { componentNav } from "./componentNav";

describe("componentNav", () => {
  it("lists the components with slug + label", () => {
    expect(componentNav).toHaveLength(16);
    expect(componentNav.map((c) => c.slug)).toContain("bottom-navigation");
    expect(componentNav.map((c) => c.slug)).toContain("button");
    expect(componentNav.map((c) => c.slug)).toContain("tabs");
    expect(componentNav.map((c) => c.slug)).toContain("card");
    expect(componentNav.map((c) => c.slug)).toContain("avatar");
    expect(componentNav.map((c) => c.slug)).toContain("modal");
    expect(componentNav.map((c) => c.slug)).toContain("toast");
    for (const c of componentNav) {
      expect(c.slug.length).toBeGreaterThan(0);
      expect(c.label.length).toBeGreaterThan(0);
    }
  });
});
