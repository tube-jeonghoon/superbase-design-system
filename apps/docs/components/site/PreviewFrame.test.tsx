import { render, screen } from "@testing-library/react";
import { PreviewFrame } from "./PreviewFrame";

describe("PreviewFrame", () => {
  it("children을 렌더한다", () => {
    render(<PreviewFrame><button type="button">클릭</button></PreviewFrame>);
    expect(screen.getByText("클릭")).toBeInTheDocument();
  });

  it("inert를 걸고 children을 그 안에 담아 탭 순서·접근성 트리에서 제거한다", () => {
    const { container } = render(
      <PreviewFrame><button type="button">클릭</button></PreviewFrame>,
    );
    const frame = container.firstElementChild as HTMLElement;
    expect(frame.hasAttribute("inert")).toBe(true);
    expect(frame).toContainElement(screen.getByText("클릭"));
  });
});
