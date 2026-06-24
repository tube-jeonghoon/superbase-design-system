import { render, screen, fireEvent } from "@testing-library/react";
import { Header } from "./Header";
import { HeaderBrand } from "./HeaderBrand";
import { HeaderTitle } from "./HeaderTitle";
import { HeaderActions } from "./HeaderActions";
import { HeaderAction } from "./HeaderAction";

describe("Header", () => {
  it("renders title and subtitle", () => {
    render(
      <Header>
        <HeaderTitle title="오늘의대회" subtitle="Smash today" />
      </Header>,
    );
    expect(screen.getByText("오늘의대회")).toBeInTheDocument();
    expect(screen.getByText("Smash today")).toBeInTheDocument();
  });

  it("exposes a banner landmark with default aria-label", () => {
    render(<Header><HeaderTitle title="T" /></Header>);
    expect(screen.getByRole("banner", { name: "앱 헤더" })).toBeInTheDocument();
  });

  it("renders no back button by default", () => {
    render(<Header><HeaderTitle title="T" /></Header>);
    expect(screen.queryByRole("button", { name: "뒤로" })).toBeNull();
  });

  it("renders a back button when onBack is given and calls it", () => {
    const onBack = vi.fn();
    render(<Header onBack={onBack}><HeaderTitle title="T" /></Header>);
    fireEvent.click(screen.getByRole("button", { name: "뒤로" }));
    expect(onBack).toHaveBeenCalledTimes(1);
  });

  it("renders an action with aria-label and fires its handler", () => {
    const onClick = vi.fn();
    render(
      <Header>
        <HeaderTitle title="T" />
        <HeaderActions>
          <HeaderAction icon={<span>i</span>} label="알림" onClick={onClick} />
        </HeaderActions>
      </Header>,
    );
    fireEvent.click(screen.getByRole("button", { name: "알림" }));
    expect(onClick).toHaveBeenCalledTimes(1);
  });

  it("renders a badge dot only when badge is set", () => {
    const { container, rerender } = render(
      <Header>
        <HeaderActions>
          <HeaderAction icon={<span>i</span>} label="알림" />
        </HeaderActions>
      </Header>,
    );
    expect(container.querySelector('[data-badge="true"]')).toBeNull();
    rerender(
      <Header>
        <HeaderActions>
          <HeaderAction icon={<span>i</span>} label="알림" badge />
        </HeaderActions>
      </Header>,
    );
    expect(container.querySelector('[data-badge="true"]')).not.toBeNull();
  });

  it("disables the action button and does not fire its handler", () => {
    const onClick = vi.fn();
    render(
      <Header>
        <HeaderActions>
          <HeaderAction icon={<span>i</span>} label="알림" disabled onClick={onClick} />
        </HeaderActions>
      </Header>,
    );
    const btn = screen.getByRole("button", { name: "알림" });
    expect(btn).toBeDisabled();
    fireEvent.click(btn);
    expect(onClick).not.toHaveBeenCalled();
  });

  it("defaults to the bar variant and accepts floating", () => {
    const { container, rerender } = render(<Header><HeaderTitle title="T" /></Header>);
    expect(container.querySelector('[data-variant="bar"]')).not.toBeNull();
    rerender(<Header variant="floating"><HeaderTitle title="T" /></Header>);
    expect(container.querySelector('[data-variant="floating"]')).not.toBeNull();
  });

  it("throws when a part is used outside <Header>", () => {
    const spy = vi.spyOn(console, "error").mockImplementation(() => {});
    expect(() => render(<HeaderTitle title="T" />)).toThrow();
    expect(() => render(<HeaderBrand>b</HeaderBrand>)).toThrow();
    expect(() => render(<HeaderActions>a</HeaderActions>)).toThrow();
    expect(() => render(<HeaderAction icon={<span>i</span>} label="x" />)).toThrow();
    spy.mockRestore();
  });
});
