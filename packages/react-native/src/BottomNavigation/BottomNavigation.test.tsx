import { render, screen, fireEvent } from "@testing-library/react";
import { Text } from "react-native";
import { BottomNavigation } from "./BottomNavigation";
import { BottomNavigationItem } from "./BottomNavigationItem";

function items() {
  return (
    <>
      <BottomNavigationItem value="home" label="홈" icon={(a) => <Text>{a ? "home-on" : "home-off"}</Text>} />
      <BottomNavigationItem value="calendar" label="일정" icon={(a) => <Text>{a ? "cal-on" : "cal-off"}</Text>} />
      <BottomNavigationItem value="me" label="마이" disabled icon={(a) => <Text>{a ? "me-on" : "me-off"}</Text>} />
    </>
  );
}

describe("BottomNavigation (RN)", () => {
  it("passes active=true to the active item's icon only", () => {
    render(<BottomNavigation value="home" onChange={() => {}}>{items()}</BottomNavigation>);
    expect(screen.getByText("home-on")).toBeInTheDocument();
    expect(screen.getByText("cal-off")).toBeInTheDocument();
  });

  it("calls onChange with the value on press", () => {
    const onChange = vi.fn();
    render(<BottomNavigation value="home" onChange={onChange}>{items()}</BottomNavigation>);
    fireEvent.click(screen.getByText("일정"));
    expect(onChange).toHaveBeenCalledWith("calendar");
  });

  it("does not call onChange for a disabled item", () => {
    const onChange = vi.fn();
    render(<BottomNavigation value="home" onChange={onChange}>{items()}</BottomNavigation>);
    fireEvent.click(screen.getByText("마이"));
    expect(onChange).not.toHaveBeenCalled();
  });

  it("renders no back button by default", () => {
    render(<BottomNavigation value="home" onChange={() => {}}>{items()}</BottomNavigation>);
    expect(screen.queryByLabelText("뒤로")).toBeNull();
  });

  it("renders a back button when onBack is given and calls it", () => {
    const onBack = vi.fn();
    render(<BottomNavigation value="home" onChange={() => {}} onBack={onBack}>{items()}</BottomNavigation>);
    fireEvent.click(screen.getByLabelText("뒤로"));
    expect(onBack).toHaveBeenCalledTimes(1);
  });
});
