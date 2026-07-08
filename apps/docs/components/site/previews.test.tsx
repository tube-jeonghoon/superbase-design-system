import { render } from "@testing-library/react";
import { catalog } from "../../lib/catalog";
import { previews } from "./previews";

describe("previews", () => {
  /* 양방향 커버리지. 누락은 아래 it.each도 잡지만(undefined → firstChild null),
   * catalog에 없는 '남는 미리보기'를 잡는 건 이 단언뿐이다 — it.each는 catalog를
   * 돌기 때문에 잉여 키를 아예 방문하지 않는다. */
  it("catalog의 모든 slug에 미리보기가 있고, 남는 미리보기가 없다", () => {
    expect(new Set(Object.keys(previews))).toEqual(new Set(catalog.map((c) => c.slug)));
  });

  /* it.each로 케이스를 분리해 RTL의 afterEach(cleanup)이 슬러그마다 실행되게 한다.
   * firstChild 단언은 null 미리보기(빈 렌더)를 잡는다 — .not.toThrow()로는 못 잡는다. */
  it.each(catalog)("$slug 미리보기가 DOM을 만든다", (item) => {
    const { container } = render(<>{previews[item.slug]}</>);
    expect(container.firstChild).not.toBeNull();
  });
});
