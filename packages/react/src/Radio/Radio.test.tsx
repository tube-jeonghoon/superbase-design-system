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
});
