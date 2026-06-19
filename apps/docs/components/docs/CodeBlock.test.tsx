import { render, screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { CodeBlock } from "./CodeBlock";

describe("CodeBlock", () => {
  it("renders the code text (tokenized)", () => {
    const { container } = render(<CodeBlock code={`<Button>확인</Button>`} />);
    expect(container.textContent).toContain("Button");
    expect(container.textContent).toContain("확인");
  });

  it("copies the code to the clipboard on copy-button click", async () => {
    const writeText = vi.fn().mockResolvedValue(undefined);
    Object.assign(navigator, { clipboard: { writeText } });
    render(<CodeBlock code={`const a = 1;`} />);
    await userEvent.click(screen.getByRole("button", { name: /복사/ }));
    expect(writeText).toHaveBeenCalledWith("const a = 1;");
  });
});
