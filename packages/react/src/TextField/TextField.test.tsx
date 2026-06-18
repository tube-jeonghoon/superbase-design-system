import { render, screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { TextField } from "./TextField";

describe("TextField", () => {
  it("associates the label with the input", () => {
    render(<TextField label="Email" />);
    expect(screen.getByLabelText("Email")).toBeInTheDocument();
  });

  it("calls onChange with the new string value", async () => {
    const onChange = vi.fn();
    render(<TextField label="Name" onChange={onChange} />);
    await userEvent.type(screen.getByLabelText("Name"), "ab");
    expect(onChange).toHaveBeenLastCalledWith("ab");
  });

  it("shows an error message and marks the input invalid", () => {
    render(<TextField label="Email" error="Required" />);
    expect(screen.getByRole("alert")).toHaveTextContent("Required");
    expect(screen.getByLabelText("Email")).toHaveAttribute("aria-invalid", "true");
  });

  it("reflects the value prop when used as a controlled input", () => {
    const { rerender } = render(
      <TextField label="Name" value="a" onChange={() => {}} />,
    );
    expect(screen.getByLabelText("Name")).toHaveValue("a");
    rerender(<TextField label="Name" value="ab" onChange={() => {}} />);
    expect(screen.getByLabelText("Name")).toHaveValue("ab");
  });
});
