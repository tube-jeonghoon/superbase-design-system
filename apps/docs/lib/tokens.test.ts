import { semanticColors, spacingScale, fontSizes, radii } from "./tokens";

describe("foundations token data", () => {
  it("lists the 8 semantic color tokens with --color-* vars", () => {
    expect(semanticColors).toHaveLength(8);
    for (const token of semanticColors) {
      expect(token.cssVar.startsWith("--color-")).toBe(true);
      expect(token.name.length).toBeGreaterThan(0);
    }
  });

  it("exposes the spacing scale used by Stack", () => {
    expect([...spacingScale]).toEqual([0, 1, 2, 3, 4, 6, 8]);
  });

  it("lists font sizes and radii with token vars", () => {
    expect(fontSizes.map((f) => f.name)).toEqual([
      "caption",
      "body",
      "title",
      "display",
    ]);
    expect(radii.map((r) => r.name)).toEqual(["sm", "md", "lg", "full"]);
  });
});
