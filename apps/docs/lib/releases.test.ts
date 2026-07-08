import { describe, it, expect } from "vitest";
import { releases } from "./releases";

describe("releases", () => {
  it("최소 4개 릴리즈, 각 항목에 version/title/summary", () => {
    expect(releases.length).toBeGreaterThanOrEqual(4);
    for (const r of releases) {
      expect(r.version).toMatch(/^\d+\.\d+\.\d+$/);
      expect(r.title.length).toBeGreaterThan(0);
      expect(r.summary.length).toBeGreaterThan(0);
    }
  });

  it("최신순(내림차순) 정렬", () => {
    const nums = releases.map((r) => r.version.split(".").map(Number));
    for (let i = 1; i < nums.length; i++) {
      const a = nums[i - 1], b = nums[i];
      const cmp = a[0] - b[0] || a[1] - b[1] || a[2] - b[2];
      expect(cmp).toBeGreaterThan(0);
    }
  });
});
