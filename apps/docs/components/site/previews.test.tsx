import { render } from "@testing-library/react";
import { catalog } from "../../lib/catalog";
import { previews } from "./previews";

describe("previews", () => {
  it("catalog의 모든 slug에 미리보기가 있고, 남는 미리보기가 없다", () => {
    expect(new Set(Object.keys(previews))).toEqual(new Set(catalog.map((c) => c.slug)));
  });

  it("모든 미리보기가 예외 없이 렌더된다", () => {
    for (const item of catalog) {
      expect(() => render(<>{previews[item.slug]}</>), item.slug).not.toThrow();
    }
  });
});
