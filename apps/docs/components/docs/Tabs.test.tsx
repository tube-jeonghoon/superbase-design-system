import { render, screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { Tabs } from "./Tabs";

const items = [
  { id: "a", label: "Alpha", content: <div>alpha-content</div> },
  { id: "b", label: "Beta", content: <div>beta-content</div> },
];

describe("Tabs", () => {
  it("shows the first tab's panel by default", () => {
    render(<Tabs items={items} ariaLabel="t" />);
    expect(screen.getByRole("tab", { name: "Alpha" })).toHaveAttribute("aria-selected", "true");
    expect(screen.getByText("alpha-content")).toBeInTheDocument();
    expect(screen.queryByText("beta-content")).not.toBeInTheDocument();
  });

  it("switches the panel when another tab is clicked", async () => {
    render(<Tabs items={items} ariaLabel="t" />);
    await userEvent.click(screen.getByRole("tab", { name: "Beta" }));
    expect(screen.getByRole("tab", { name: "Beta" })).toHaveAttribute("aria-selected", "true");
    expect(screen.getByText("beta-content")).toBeInTheDocument();
    expect(screen.queryByText("alpha-content")).not.toBeInTheDocument();
  });
});
