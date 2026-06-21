import { createRef } from "react";
import { render, screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { Checkbox } from "./Checkbox";

describe("Checkbox", () => {
  it("exposes checkbox role with checked state", () => {
    render(<Checkbox checked aria-label="agree" />);
    expect(screen.getByRole("checkbox", { name: "agree" })).toBeChecked();
  });

  it("uses label as the accessible name", () => {
    render(<Checkbox checked={false} label="동의" />);
    expect(screen.getByRole("checkbox", { name: "동의" })).toBeInTheDocument();
  });

  it("calls onChange with the toggled value", async () => {
    const onChange = vi.fn();
    render(<Checkbox checked={false} onChange={onChange} aria-label="x" />);
    await userEvent.click(screen.getByRole("checkbox"));
    expect(onChange).toHaveBeenCalledWith(true);
  });

  it("does not call onChange when disabled", async () => {
    const onChange = vi.fn();
    render(<Checkbox checked={false} onChange={onChange} disabled aria-label="x" />);
    await userEvent.click(screen.getByRole("checkbox"));
    expect(onChange).not.toHaveBeenCalled();
  });

  it("forwards ref to the checkbox button", () => {
    const ref = createRef<HTMLButtonElement>();
    render(<Checkbox checked={false} ref={ref} />);
    expect(ref.current).toBeInstanceOf(HTMLButtonElement);
  });
});
