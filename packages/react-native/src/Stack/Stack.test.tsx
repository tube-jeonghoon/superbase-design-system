import { render, screen } from "@testing-library/react";
import { Text } from "react-native";
import { Stack } from "./Stack";

describe("Stack (RN)", () => {
  it("renders its children", () => {
    render(
      <Stack>
        <Text>child</Text>
      </Stack>,
    );
    expect(screen.getByText("child")).toBeInTheDocument();
  });

  it("accepts direction/gap/padding without error", () => {
    render(
      <Stack direction="row" gap={4} padding={2}>
        <Text>x</Text>
      </Stack>,
    );
    expect(screen.getByText("x")).toBeInTheDocument();
  });
});
