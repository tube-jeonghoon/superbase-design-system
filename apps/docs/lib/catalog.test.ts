import { describe, it, expect } from "vitest";
import { catalog, categoryOrder } from "./catalog";
import { componentNav } from "../components/docs/componentNav";

describe("catalog", () => {
  it("모든 컴포넌트 슬러그가 componentNav와 일치", () => {
    const navSlugs = new Set(componentNav.map((n) => n.slug));
    const catSlugs = new Set(catalog.map((c) => c.slug));
    expect(catSlugs).toEqual(navSlugs);
  });

  it("모든 항목의 category가 categoryOrder에 속함", () => {
    for (const c of catalog) {
      expect(categoryOrder).toContain(c.category);
    }
  });

  it("status는 stable|updated|new 중 하나이고 blurb는 비어있지 않음", () => {
    for (const c of catalog) {
      expect(["stable", "updated", "new"]).toContain(c.status);
      expect(c.blurb.length).toBeGreaterThan(0);
    }
  });
});
