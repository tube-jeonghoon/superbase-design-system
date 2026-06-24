import { render, screen, fireEvent } from "@testing-library/react";
import { BottomNavigation } from "./BottomNavigation";
import { BottomNavigationItem } from "./BottomNavigationItem";

function items() {
  return (
    <>
      <BottomNavigationItem value="home" label="홈" icon={(a) => <span>{a ? "home-on" : "home-off"}</span>} />
      <BottomNavigationItem value="calendar" label="일정" icon={(a) => <span>{a ? "cal-on" : "cal-off"}</span>} />
      <BottomNavigationItem value="me" label="마이" disabled icon={(a) => <span>{a ? "me-on" : "me-off"}</span>} />
    </>
  );
}

describe("BottomNavigation", () => {
  it("marks the active item with aria-current=page", () => {
    render(<BottomNavigation value="home" onChange={() => {}}>{items()}</BottomNavigation>);
    expect(screen.getByRole("button", { name: /홈/ })).toHaveAttribute("aria-current", "page");
    expect(screen.getByRole("button", { name: /일정/ })).not.toHaveAttribute("aria-current");
  });

  it("passes active=true to the active item's icon only", () => {
    render(<BottomNavigation value="home" onChange={() => {}}>{items()}</BottomNavigation>);
    expect(screen.getByText("home-on")).toBeInTheDocument();
    expect(screen.getByText("cal-off")).toBeInTheDocument();
  });

  it("calls onChange with the item value on click", () => {
    const onChange = vi.fn();
    render(<BottomNavigation value="home" onChange={onChange}>{items()}</BottomNavigation>);
    fireEvent.click(screen.getByRole("button", { name: /일정/ }));
    expect(onChange).toHaveBeenCalledWith("calendar");
  });

  it("does not call onChange for a disabled item", () => {
    const onChange = vi.fn();
    render(<BottomNavigation value="home" onChange={onChange}>{items()}</BottomNavigation>);
    fireEvent.click(screen.getByRole("button", { name: /마이/ }));
    expect(onChange).not.toHaveBeenCalled();
  });

  it("renders no back button by default", () => {
    render(<BottomNavigation value="home" onChange={() => {}}>{items()}</BottomNavigation>);
    expect(screen.queryByRole("button", { name: "뒤로" })).toBeNull();
  });

  it("renders a back button when onBack is given and calls it", () => {
    const onBack = vi.fn();
    render(<BottomNavigation value="home" onChange={() => {}} onBack={onBack}>{items()}</BottomNavigation>);
    fireEvent.click(screen.getByRole("button", { name: "뒤로" }));
    expect(onBack).toHaveBeenCalledTimes(1);
  });

  it("exposes a nav landmark with aria-label", () => {
    render(<BottomNavigation value="home" onChange={() => {}} aria-label="주요 메뉴">{items()}</BottomNavigation>);
    expect(screen.getByRole("navigation", { name: "주요 메뉴" })).toBeInTheDocument();
  });

  it("defaults to the bar variant and accepts floating", () => {
    const { container, rerender } = render(
      <BottomNavigation value="home" onChange={() => {}}>{items()}</BottomNavigation>,
    );
    expect(container.querySelector('[data-variant="bar"]')).not.toBeNull();
    rerender(
      <BottomNavigation value="home" onChange={() => {}} variant="floating">{items()}</BottomNavigation>,
    );
    expect(container.querySelector('[data-variant="floating"]')).not.toBeNull();
  });
});
