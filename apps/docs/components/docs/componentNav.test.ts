import { componentNav } from "./componentNav";

describe("componentNav", () => {
  it("lists the 9 components with slug + label", () => {
    expect(componentNav).toHaveLength(9);
    expect(componentNav.map((c) => c.slug)).toContain("button");
    for (const c of componentNav) {
      expect(c.slug.length).toBeGreaterThan(0);
      expect(c.label.length).toBeGreaterThan(0);
    }
  });
});
