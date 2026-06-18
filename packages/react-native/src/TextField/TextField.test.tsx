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
});
