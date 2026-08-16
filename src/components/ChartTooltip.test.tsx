import { describe, it, expect } from "vitest";
import { render, screen } from "@testing-library/react";
import type { TooltipContentProps } from "recharts";
import type {
  NameType,
  ValueType,
} from "recharts/types/component/DefaultTooltipContent";

import ChartTooltip from "~/components/ChartTooltip";
import { formatBalance } from "~/lib/utils";

type Props = TooltipContentProps<ValueType, NameType>;

const baseProps: Pick<
  Props,
  "coordinate" | "accessibilityLayer" | "activeIndex"
> = {
  coordinate: undefined,
  accessibilityLayer: false,
  activeIndex: null,
};

const mockPayload: Props["payload"] = [
  {
    name: "Savings",
    value: 3000,
    color: "#FF0000",
    dataKey: "a1",
    graphicalItemId: "a1",
  },
  {
    name: "Checking",
    value: 2000,
    color: "#00FF00",
    dataKey: "a2",
    graphicalItemId: "a2",
  },
];

describe("ChartTooltip", () => {
  it("renders nothing when inactive", () => {
    const { container } = render(
      <ChartTooltip
        {...baseProps}
        active={false}
        payload={mockPayload}
        label="2024-01"
      />
    );
    expect(container).toBeEmptyDOMElement();
  });

  it("renders nothing when payload is empty", () => {
    const { container } = render(
      <ChartTooltip {...baseProps} active={true} payload={[]} label="2024-01" />
    );
    expect(container).toBeEmptyDOMElement();
  });

  it("renders each series name and value", () => {
    render(
      <ChartTooltip
        {...baseProps}
        active={true}
        payload={mockPayload}
        label="2024-01"
      />
    );
    expect(
      screen.getByText(`Savings: ${formatBalance(3000)}`)
    ).toBeInTheDocument();
    expect(
      screen.getByText(`Checking: ${formatBalance(2000)}`)
    ).toBeInTheDocument();
  });

  it("renders the label", () => {
    render(
      <ChartTooltip
        {...baseProps}
        active={true}
        payload={mockPayload}
        label="2024-01"
      />
    );
    expect(screen.getByText("2024-01")).toBeInTheDocument();
  });

  it("renders the sum of all series as the total", () => {
    render(
      <ChartTooltip
        {...baseProps}
        active={true}
        payload={mockPayload}
        label="2024-01"
      />
    );
    expect(
      screen.getByText(`Total: ${formatBalance(5000)}`)
    ).toBeInTheDocument();
  });

  it("computes the correct total for a single series", () => {
    render(
      <ChartTooltip
        {...baseProps}
        active={true}
        payload={[mockPayload[0]]}
        label="2024-01"
      />
    );
    expect(
      screen.getByText(`Total: ${formatBalance(3000)}`)
    ).toBeInTheDocument();
  });

  it("ignores non-numeric values when computing the total", () => {
    render(
      <ChartTooltip
        {...baseProps}
        active={true}
        payload={[
          ...mockPayload,
          {
            name: "Other",
            value: "n/a",
            color: "#0000FF",
            dataKey: "a3",
            graphicalItemId: "a3",
          },
        ]}
        label="2024-01"
      />
    );
    expect(
      screen.getByText(`Total: ${formatBalance(5000)}`)
    ).toBeInTheDocument();
  });
});
