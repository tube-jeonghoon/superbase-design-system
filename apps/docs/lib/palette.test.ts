import { describe, it, expect } from "vitest";
import { greenScale, neutralScale, semanticSwatches, greenRoles, neutralRoles } from "./palette";

const HEX = /^#[0-9A-Fa-f]{6}$/;

describe("palette 데이터", () => {
  it("green은 10단계, neutral은 9단계", () => {
    expect(greenScale).toHaveLength(10);
    expect(neutralScale).toHaveLength(9);
  });

  it("모든 스와치 hex는 6자리 hex", () => {
    for (const s of [...greenScale, ...neutralScale]) {
      expect(s.hex).toMatch(HEX);
    }
  });

  it("역할 chip과 semantic 카드가 정의됨", () => {
    expect(greenRoles.length).toBeGreaterThan(0);
    expect(neutralRoles.length).toBeGreaterThan(0);
    expect(semanticSwatches).toHaveLength(4);
    for (const c of semanticSwatches) {
      expect(c.baseHex).toMatch(HEX);
      expect(c.softHex).toMatch(HEX);
    }
  });
});
