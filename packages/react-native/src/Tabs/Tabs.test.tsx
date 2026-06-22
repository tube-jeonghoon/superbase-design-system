import { useState } from "react";
import { render, screen, fireEvent } from "@testing-library/react";
import { Tabs } from "./Tabs";
import { TabList } from "./TabList";
import { Tab } from "./Tab";
import { TabPanel } from "./TabPanel";

function Fixture({ onChangeSpy }: { onChangeSpy?: (v: string) => void }) {
  const [value, setValue] = useState("a");
  return (
    <Tabs value={value} onChange={(v) => { setValue(v); onChangeSpy?.(v); }}>
      <TabList>
        <Tab value="a">A</Tab>
        <Tab value="b">B</Tab>
      </TabList>
      <TabPanel value="a">Panel A</TabPanel>
      <TabPanel value="b">Panel B</TabPanel>
    </Tabs>
  );
}

describe("Tabs (RN)", () => {
  it("shows only the active panel", () => {
    render(<Fixture />);
    expect(screen.getByText("Panel A")).toBeInTheDocument();
    expect(screen.queryByText("Panel B")).not.toBeInTheDocument();
  });

  it("switches panel on press", () => {
    const spy = vi.fn();
    render(<Fixture onChangeSpy={spy} />);
    fireEvent.click(screen.getByText("B"));
    expect(spy).toHaveBeenCalledWith("b");
    expect(screen.getByText("Panel B")).toBeInTheDocument();
  });
});
