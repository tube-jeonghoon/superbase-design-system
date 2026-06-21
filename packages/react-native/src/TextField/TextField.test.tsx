import { render, screen, fireEvent } from "@testing-library/react";
import { TextField } from "./TextField";

describe("TextField (RN)", () => {
  it("renders the label text", () => {
    render(<TextField label="이름" />);
    expect(screen.getByText("이름")).toBeInTheDocument();
  });

  it("calls onChangeText with the new value", () => {
    const onChangeText = vi.fn();
    render(<TextField label="이름" placeholder="입력" onChangeText={onChangeText} />);
    fireEvent.change(screen.getByPlaceholderText("입력"), { target: { value: "ab" } });
    expect(onChangeText).toHaveBeenCalledWith("ab");
  });

  it("renders an error message", () => {
    render(<TextField label="이메일" error="필수 항목" />);
    expect(screen.getByText("필수 항목")).toBeInTheDocument();
  });

  it("renders prefix and suffix slots", () => {
    render(<TextField label="L" prefix={<span data-testid="p" />} suffix={<span data-testid="s" />} />);
    expect(screen.getByTestId("p")).toBeInTheDocument();
    expect(screen.getByTestId("s")).toBeInTheDocument();
  });

  it("shows a clear button when clearable with a value and clears on press", () => {
    const onChangeText = vi.fn();
    render(<TextField label="L" clearable value="hi" onChangeText={onChangeText} />);
    fireEvent.click(screen.getByLabelText("Clear"));
    expect(onChangeText).toHaveBeenCalledWith("");
  });

  it("renders helper text when there is no error", () => {
    render(<TextField label="L" helperText="도움말" />);
    expect(screen.getByText("도움말")).toBeInTheDocument();
  });
});
