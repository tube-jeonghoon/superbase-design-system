import { render, screen, fireEvent } from "@testing-library/react";
import { Text } from "react-native";
import { Header } from "./Header";
import { HeaderTitle } from "./HeaderTitle";
import { HeaderActions } from "./HeaderActions";
import { HeaderAction } from "./HeaderAction";

describe("Header (RN)", () => {
  it("renders title and subtitle", () => {
    render(<Header><HeaderTitle title="오늘의대회" subtitle="Smash today" /></Header>);
    expect(screen.getByText("오늘의대회")).toBeInTheDocument();
    expect(screen.getByText("Smash today")).toBeInTheDocument();
  });

  it("renders no back button by default", () => {
    render(<Header><HeaderTitle title="T" /></Header>);
    expect(screen.queryByLabelText("뒤로")).toBeNull();
  });

  it("renders a back button when onBack is given and calls it", () => {
    const onBack = vi.fn();
    render(<Header onBack={onBack}><HeaderTitle title="T" /></Header>);
    fireEvent.click(screen.getByLabelText("뒤로"));
    expect(onBack).toHaveBeenCalledTimes(1);
  });

  it("fires the action handler and exposes its accessibility label", () => {
    const onPress = vi.fn();
    render(
      <Header>
        <HeaderActions>
          <HeaderAction icon={<Text>i</Text>} label="알림" onPress={onPress} />
        </HeaderActions>
      </Header>,
    );
    fireEvent.click(screen.getByLabelText("알림"));
    expect(onPress).toHaveBeenCalledTimes(1);
  });

  it("renders both variants without crashing", () => {
    const { rerender } = render(<Header variant="bar"><HeaderTitle title="T" /></Header>);
    expect(screen.getByText("T")).toBeInTheDocument();
    rerender(<Header variant="floating"><HeaderTitle title="T" /></Header>);
    expect(screen.getByText("T")).toBeInTheDocument();
  });

  it("throws when a part is used outside <Header>", () => {
    const spy = vi.spyOn(console, "error").mockImplementation(() => {});
    expect(() => render(<HeaderTitle title="T" />)).toThrow();
    expect(() => render(<HeaderAction icon={<Text>i</Text>} label="x" />)).toThrow();
    spy.mockRestore();
  });
});
