import { render, screen } from "@testing-library/react";
import { Example } from "./Example";

describe("Example", () => {
  it("renders the live preview, the title/description, and the code", () => {
    const { container } = render(
      <Example title="기본" description="설명입니다" code={`<Button>확인</Button>`}>
        <button>확인</button>
      </Example>,
    );
    expect(screen.getByRole("button", { name: "확인" })).toBeInTheDocument();
    expect(screen.getByText("기본")).toBeInTheDocument();
    expect(screen.getByText("설명입니다")).toBeInTheDocument();
    expect(container.textContent).toContain("Button");
  });
});
