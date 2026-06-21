import { createRef } from "react";
import { render, screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { RadioGroup } from "./RadioGroup";
import { Radio } from "./Radio";

describe("RadioGroup + Radio", () => {
  it("reflects the group value as checked state", () => {
    render(
      <RadioGroup value="b" aria-label="opt">
        <Radio value="a" label="A" />
        <Radio value="b" label="B" />
      </RadioGroup>,
    );
    expect(screen.getByRole("radio", { name: "A" })).not.toBeChecked();
    expect(screen.getByRole("radio", { name: "B" })).toBeChecked();
  });

  it("calls the group onChange with the selected value", async () => {
    const onChange = vi.fn();
    render(
      <RadioGroup value="a" onChange={onChange} aria-label="opt">
        <Radio value="a" label="A" />
        <Radio value="b" label="B" />
      </RadioGroup>,
    );
    await userEvent.click(screen.getByRole("radio", { name: "B" }));
    expect(onChange).toHaveBeenCalledWith("b");
  });

  it("throws when a Radio is used outside a RadioGroup", () => {
    const spy = vi.spyOn(console, "error").mockImplementation(() => {});
    expect(() => render(<Radio value="a" label="A" />)).toThrow(
      "Radio must be used within a RadioGroup",
    );
    spy.mockRestore();
  });

  it("forwards ref on RadioGroup", () => {
    const ref = createRef<HTMLDivElement>();
    render(
      <RadioGroup value="a" ref={ref}>
        <Radio value="a" label="A" />
      </RadioGroup>,
    );
    expect(ref.current).toBeInstanceOf(HTMLDivElement);
  });

  it("applies the size data attribute on a radio", () => {
    const { container } = render(
      <RadioGroup value="a">
        <Radio value="a" label="A" size="sm" />
      </RadioGroup>,
    );
    expect(container.querySelector('[data-size="sm"]')).not.toBeNull();
  });
});
