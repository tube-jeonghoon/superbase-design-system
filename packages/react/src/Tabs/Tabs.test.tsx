import { useState } from "react";
import { render, screen, fireEvent } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { Tabs } from "./Tabs";
import { TabList } from "./TabList";
import { Tab } from "./Tab";
import { TabPanel } from "./TabPanel";

function Fixture({ onChangeSpy }: { onChangeSpy?: (v: string) => void }) {
  const [value, setValue] = useState("a");
  return (
    <Tabs value={value} onChange={(v) => { setValue(v); onChangeSpy?.(v); }}>
      <TabList aria-label="섹션">
        <Tab value="a">A</Tab>
        <Tab value="b">B</Tab>
      </TabList>
      <TabPanel value="a">Panel A</TabPanel>
      <TabPanel value="b">Panel B</TabPanel>
    </Tabs>
  );
}

describe("Tabs", () => {
  it("shows only the active panel and exposes ARIA roles", () => {
    render(<Fixture />);
    expect(screen.getByRole("tablist", { name: "섹션" })).toBeInTheDocument();
    expect(screen.getByRole("tab", { name: "A" })).toHaveAttribute("aria-selected", "true");
    expect(screen.getByRole("tabpanel")).toHaveTextContent("Panel A");
    expect(screen.queryByText("Panel B")).not.toBeInTheDocument();
  });

  it("switches panel on click", async () => {
    const spy = vi.fn();
    render(<Fixture onChangeSpy={spy} />);
    await userEvent.click(screen.getByRole("tab", { name: "B" }));
    expect(spy).toHaveBeenCalledWith("b");
    expect(screen.getByRole("tabpanel")).toHaveTextContent("Panel B");
  });

  it("moves the active tab with ArrowRight", () => {
    const spy = vi.fn();
    render(<Fixture onChangeSpy={spy} />);
    fireEvent.keyDown(screen.getByRole("tablist"), { key: "ArrowRight" });
    expect(spy).toHaveBeenCalledWith("b");
  });
});
