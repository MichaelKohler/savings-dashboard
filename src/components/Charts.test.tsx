import React from "react";
import { describe, it, expect, vi, beforeEach } from "vitest";
import { render, screen, fireEvent } from "@testing-library/react";
import type { TooltipContentProps } from "recharts";
import type {
  NameType,
  ValueType,
} from "recharts/types/component/DefaultTooltipContent";

import Charts from "~/components/Charts";

type MockTooltipContentProps = TooltipContentProps<ValueType, NameType>;

// happy-dom (unlike jsdom) doesn't let testing-library smuggle arbitrary
// extra properties onto a native click event, so the mock Legend below reads
// the payload to report from this shared, test-controlled box instead.
const legendClickPayload = vi.hoisted<{ dataKey?: string }>(() => ({}));

// Mock recharts components
vi.mock("recharts", () => ({
  BarChart: ({
    children,
    data,
  }: {
    children: React.ReactNode;
    data?: unknown;
  }) => (
    <div data-testid="bar-chart" data-chart-data={JSON.stringify(data)}>
      {children}
    </div>
  ),
  Bar: ({
    name,
    dataKey,
    hide,
  }: {
    name: string;
    dataKey?: string;
    hide?: boolean;
  }) => (
    <div
      data-testid={`bar-${name}`}
      data-datakey={dataKey}
      data-hidden={String(!!hide)}
    >
      {name}
    </div>
  ),
  LineChart: ({
    children,
    data,
  }: {
    children: React.ReactNode;
    data?: unknown;
  }) => (
    <div data-testid="line-chart" data-chart-data={JSON.stringify(data)}>
      {children}
    </div>
  ),
  Line: ({
    name,
    dataKey,
    hide,
  }: {
    name: string;
    dataKey?: string;
    hide?: boolean;
  }) => (
    <div
      data-testid={`line-${name}`}
      data-datakey={dataKey}
      data-hidden={String(!!hide)}
    >
      {name}
    </div>
  ),
  XAxis: () => <div data-testid="x-axis" />,
  YAxis: () => <div data-testid="y-axis" />,
  Tooltip: ({
    content,
  }: {
    content?: React.ReactElement<MockTooltipContentProps>;
  }) => (
    <div data-testid="tooltip">
      {content
        ? React.cloneElement(content, {
            active: true,
            label: "2024-01",
            coordinate: undefined,
            accessibilityLayer: false,
            activeIndex: null,
            payload: [
              {
                name: "A",
                value: 100,
                color: "#FF0000",
                dataKey: "a",
                graphicalItemId: "a",
              },
              {
                name: "B",
                value: 200,
                color: "#00FF00",
                dataKey: "b",
                graphicalItemId: "b",
              },
            ],
          })
        : null}
    </div>
  ),
  CartesianGrid: () => <div data-testid="grid" />,
  ResponsiveContainer: ({ children }: { children: React.ReactNode }) => (
    <div data-testid="responsive-container">{children}</div>
  ),
  Legend: ({
    onClick,
  }: {
    onClick?: (payload: { dataKey?: string }) => void;
  }) => (
    <div
      data-testid="legend"
      onClick={() => onClick?.({ dataKey: legendClickPayload.dataKey })}
      onKeyDown={(e) => {
        if (e.key === "Enter" || e.key === " ") {
          onClick?.({});
        }
      }}
      role="button"
      tabIndex={0}
    >
      Legend
    </div>
  ),
}));

function clickLegend(legend: HTMLElement, dataKey: string) {
  legendClickPayload.dataKey = dataKey;
  fireEvent.click(legend);
}

describe("Charts", () => {
  const mockAccounts = [
    {
      id: "a1",
      name: "Savings",
      color: "#FF0000",
      groupId: "g1",
      typeId: "t1",
      showInGraphs: true,
      archived: false,
      group: { id: "g1", name: "Personal" },
      type: { id: "t1", name: "Savings" },
    },
    {
      id: "a2",
      name: "Checking",
      color: "#00FF00",
      groupId: null,
      typeId: null,
      showInGraphs: true,
      archived: false,
      group: null,
      type: null,
    },
  ];

  const mockBalances = [
    {
      date: "2024-01",
      total: 5000,
      byAccount: { a1: 3000, a2: 2000 },
      byGroup: { g1: 3000, "": 2000 },
      byType: { t1: 3000, "": 2000 },
    },
    {
      date: "2024-02",
      total: 6000,
      byAccount: { a1: 3500, a2: 2500 },
      byGroup: { g1: 3500, "": 2500 },
      byType: { t1: 3500, "": 2500 },
    },
  ];

  const mockGroups = [
    {
      id: "g1",
      name: "Personal",
      userId: "u1",
      createdAt: new Date(),
      updatedAt: new Date(),
    },
  ];

  const mockTypes = [
    {
      id: "t1",
      name: "Savings",
      userId: "u1",
      createdAt: new Date(),
      updatedAt: new Date(),
    },
  ];

  const mockPredictions = [
    { year: 2024, "1": 5000, "3": 5200, "5": 5400, "7": 5600 },
    { year: 2025, "1": 6000, "3": 6300, "5": 6600, "7": 6900 },
  ];

  beforeEach(() => {
    vi.clearAllMocks();
    legendClickPayload.dataKey = undefined;
  });

  it("renders total chart heading", () => {
    render(
      <Charts
        accounts={mockAccounts}
        balances={mockBalances}
        groups={mockGroups}
        types={mockTypes}
        predictions={mockPredictions}
      />
    );
    expect(screen.getByRole("heading", { name: "Total" })).toBeInTheDocument();
  });

  it("renders predictions chart heading", () => {
    render(
      <Charts
        accounts={mockAccounts}
        balances={mockBalances}
        groups={mockGroups}
        types={mockTypes}
        predictions={mockPredictions}
      />
    );
    expect(screen.getByText("Predictions")).toBeInTheDocument();
  });

  it("renders per account chart heading", () => {
    render(
      <Charts
        accounts={mockAccounts}
        balances={mockBalances}
        groups={mockGroups}
        types={mockTypes}
        predictions={mockPredictions}
      />
    );
    expect(screen.getByText("Per Account")).toBeInTheDocument();
  });

  it("renders stacked chart heading", () => {
    render(
      <Charts
        accounts={mockAccounts}
        balances={mockBalances}
        groups={mockGroups}
        types={mockTypes}
        predictions={mockPredictions}
      />
    );
    expect(screen.getByText("Stacked")).toBeInTheDocument();
  });

  it("renders per group chart heading", () => {
    render(
      <Charts
        accounts={mockAccounts}
        balances={mockBalances}
        groups={mockGroups}
        types={mockTypes}
        predictions={mockPredictions}
      />
    );
    expect(screen.getByText("Per Group")).toBeInTheDocument();
  });

  it("renders per type chart heading", () => {
    render(
      <Charts
        accounts={mockAccounts}
        balances={mockBalances}
        groups={mockGroups}
        types={mockTypes}
        predictions={mockPredictions}
      />
    );
    expect(screen.getByText("Per Type")).toBeInTheDocument();
  });

  it("renders line charts", () => {
    render(
      <Charts
        accounts={mockAccounts}
        balances={mockBalances}
        groups={mockGroups}
        types={mockTypes}
        predictions={mockPredictions}
      />
    );
    const lineCharts = screen.getAllByTestId("line-chart");
    expect(lineCharts.length).toBeGreaterThan(0);
  });

  it("renders bar charts", () => {
    render(
      <Charts
        accounts={mockAccounts}
        balances={mockBalances}
        groups={mockGroups}
        types={mockTypes}
        predictions={mockPredictions}
      />
    );
    const barCharts = screen.getAllByTestId("bar-chart");
    expect(barCharts.length).toBeGreaterThan(0);
  });

  it("renders responsive containers for all charts", () => {
    render(
      <Charts
        accounts={mockAccounts}
        balances={mockBalances}
        groups={mockGroups}
        types={mockTypes}
        predictions={mockPredictions}
      />
    );
    const containers = screen.getAllByTestId("responsive-container");
    expect(containers).toHaveLength(6); // Total, Predictions, Per Account, Stacked, Per Group, Per Type
  });

  it("renders account names in per account chart", () => {
    render(
      <Charts
        accounts={mockAccounts}
        balances={mockBalances}
        groups={mockGroups}
        types={mockTypes}
        predictions={mockPredictions}
      />
    );
    expect(screen.getByTestId("line-Savings (Personal)")).toBeInTheDocument();
    expect(screen.getByTestId("line-Checking")).toBeInTheDocument();
  });

  it("renders group names in per group chart", () => {
    render(
      <Charts
        accounts={mockAccounts}
        balances={mockBalances}
        groups={mockGroups}
        types={mockTypes}
        predictions={mockPredictions}
      />
    );
    expect(screen.getByTestId("bar-Personal")).toBeInTheDocument();
  });

  it("renders type names in per type chart", () => {
    render(
      <Charts
        accounts={mockAccounts}
        balances={mockBalances}
        groups={mockGroups}
        types={mockTypes}
        predictions={mockPredictions}
      />
    );
    expect(screen.getByTestId("bar-Savings")).toBeInTheDocument();
  });

  it("toggles prediction line visibility when legend is clicked", () => {
    render(
      <Charts
        accounts={mockAccounts}
        balances={mockBalances}
        groups={mockGroups}
        types={mockTypes}
        predictions={mockPredictions}
      />
    );

    const legends = screen.getAllByTestId("legend");
    const predictionsLegend = legends[0]; // First legend is for predictions

    expect(screen.getByTestId("line-1%")).toHaveAttribute(
      "data-hidden",
      "false"
    );

    clickLegend(predictionsLegend, "1");

    expect(screen.getByTestId("line-1%")).toHaveAttribute(
      "data-hidden",
      "true"
    );
  });

  it("renders prediction lines for different growth rates", () => {
    render(
      <Charts
        accounts={mockAccounts}
        balances={mockBalances}
        groups={mockGroups}
        types={mockTypes}
        predictions={mockPredictions}
      />
    );
    expect(screen.getByTestId("line-1%")).toBeInTheDocument();
    expect(screen.getByTestId("line-3%")).toBeInTheDocument();
    expect(screen.getByTestId("line-5%")).toBeInTheDocument();
    expect(screen.getByTestId("line-7%")).toBeInTheDocument();
  });

  it("handles empty data gracefully", () => {
    render(
      <Charts
        accounts={[]}
        balances={[]}
        groups={[]}
        types={[]}
        predictions={[]}
      />
    );
    expect(screen.getByRole("heading", { name: "Total" })).toBeInTheDocument();
    expect(
      screen.getByRole("heading", { name: "Predictions" })
    ).toBeInTheDocument();
  });

  it("applies correct CSS classes to main container", () => {
    const { container } = render(
      <Charts
        accounts={mockAccounts}
        balances={mockBalances}
        groups={mockGroups}
        types={mockTypes}
        predictions={mockPredictions}
      />
    );
    const main = container.querySelector("main");
    expect(main).toHaveClass("h-auto");
    expect(main).toHaveClass("w-full");
  });

  it("applies correct CSS classes to chart headings", () => {
    render(
      <Charts
        accounts={mockAccounts}
        balances={mockBalances}
        groups={mockGroups}
        types={mockTypes}
        predictions={mockPredictions}
      />
    );
    const totalHeading = screen.getByRole("heading", { name: "Total" });
    expect(totalHeading).toHaveClass("text-2xl");
  });

  it("renders a total in the tooltip for multi-series charts", () => {
    render(
      <Charts
        accounts={mockAccounts}
        balances={mockBalances}
        groups={mockGroups}
        types={mockTypes}
        predictions={mockPredictions}
      />
    );
    const tooltips = screen.getAllByTestId("tooltip");
    // Total and Predictions charts have no content prop (Predictions sums
    // alternative growth scenarios, which isn't a meaningful total).
    // Per Account, Stacked, Per Group, and Per Type do.
    expect(tooltips).toHaveLength(6);
    expect(screen.getAllByText("Total: 300").length).toBe(4);
  });

  it("applies margin-top to chart headings after first", () => {
    render(
      <Charts
        accounts={mockAccounts}
        balances={mockBalances}
        groups={mockGroups}
        types={mockTypes}
        predictions={mockPredictions}
      />
    );
    const predictionsHeading = screen.getByText("Predictions");
    expect(predictionsHeading).toHaveClass("mt-16");
  });

  it("renders the filter panel above the Total heading", () => {
    const { container } = render(
      <Charts
        accounts={mockAccounts}
        balances={mockBalances}
        groups={mockGroups}
        types={mockTypes}
        predictions={mockPredictions}
      />
    );
    const headings = Array.from(container.querySelectorAll("h2"));
    expect(headings[0]).toHaveTextContent("Filters");
    expect(headings[1]).toHaveTextContent("Total");
  });

  it("unchecking an account filter hides its line and reduces the Total chart", () => {
    render(
      <Charts
        accounts={mockAccounts}
        balances={mockBalances}
        groups={mockGroups}
        types={mockTypes}
        predictions={mockPredictions}
      />
    );

    fireEvent.click(screen.getByTestId("filter-account-toggle"));
    fireEvent.click(screen.getByTestId("filter-account-a1"));

    expect(screen.getByTestId("line-Savings (Personal)")).toHaveAttribute(
      "data-hidden",
      "true"
    );

    const totalChart = screen.getAllByTestId("line-chart")[0];
    const totalData = JSON.parse(
      totalChart.getAttribute("data-chart-data") ?? "[]"
    );
    expect(totalData[0].total).toBe(2000);
    expect(totalData[1].total).toBe(2500);
  });

  it("clicking an account's chart legend hides it and unchecks the matching filter checkbox", () => {
    render(
      <Charts
        accounts={mockAccounts}
        balances={mockBalances}
        groups={mockGroups}
        types={mockTypes}
        predictions={mockPredictions}
      />
    );

    const legends = screen.getAllByTestId("legend");
    const accountsLegend = legends[1]; // Per Account chart

    clickLegend(accountsLegend, "byAccount.a1");

    expect(screen.getByTestId("line-Savings (Personal)")).toHaveAttribute(
      "data-hidden",
      "true"
    );

    fireEvent.click(screen.getByTestId("filter-account-toggle"));
    expect(screen.getByTestId("filter-account-a1")).not.toBeChecked();
  });

  it("excluding a group cascades to every account in that group across charts", () => {
    render(
      <Charts
        accounts={mockAccounts}
        balances={mockBalances}
        groups={mockGroups}
        types={mockTypes}
        predictions={mockPredictions}
      />
    );

    const legends = screen.getAllByTestId("legend");
    const groupsLegend = legends[3]; // Per Group chart

    clickLegend(groupsLegend, "byGroup.g1");

    expect(screen.getByTestId("line-Savings (Personal)")).toHaveAttribute(
      "data-hidden",
      "true"
    );
    expect(screen.getByTestId("line-Checking")).toHaveAttribute(
      "data-hidden",
      "false"
    );

    const totalChart = screen.getAllByTestId("line-chart")[0];
    const totalData = JSON.parse(
      totalChart.getAttribute("data-chart-data") ?? "[]"
    );
    expect(totalData[0].total).toBe(2000);
  });

  it("does not toggle an account legend hidden by its excluded group", () => {
    render(
      <Charts
        accounts={mockAccounts}
        balances={mockBalances}
        groups={mockGroups}
        types={mockTypes}
        predictions={mockPredictions}
      />
    );

    const legends = screen.getAllByTestId("legend");
    clickLegend(legends[3], "byGroup.g1");
    clickLegend(legends[1], "byAccount.a1");
    clickLegend(legends[3], "byGroup.g1");

    expect(screen.getByTestId("line-Savings (Personal)")).toHaveAttribute(
      "data-hidden",
      "false"
    );
  });

  it("recomputes the Predictions chart from the filtered total", () => {
    render(
      <Charts
        accounts={mockAccounts}
        balances={mockBalances}
        groups={mockGroups}
        types={mockTypes}
        predictions={mockPredictions}
      />
    );

    fireEvent.click(screen.getByTestId("filter-account-toggle"));
    fireEvent.click(screen.getByTestId("filter-account-a1"));

    const predictionsChart = screen.getAllByTestId("line-chart")[1];
    const predictionsData = JSON.parse(
      predictionsChart.getAttribute("data-chart-data") ?? "[]"
    );
    // Filtered last total = month 2 with a1 excluded = 2500 (a2 only)
    expect(predictionsData[0]["1"]).toBe(2525);
  });

  it("clear filters resets excluded lines and recomputed totals", () => {
    render(
      <Charts
        accounts={mockAccounts}
        balances={mockBalances}
        groups={mockGroups}
        types={mockTypes}
        predictions={mockPredictions}
      />
    );

    fireEvent.click(screen.getByTestId("filter-account-toggle"));
    fireEvent.click(screen.getByTestId("filter-account-a1"));
    fireEvent.click(screen.getByText("Clear filters"));

    expect(screen.getByTestId("line-Savings (Personal)")).toHaveAttribute(
      "data-hidden",
      "false"
    );

    const totalChart = screen.getAllByTestId("line-chart")[0];
    const totalData = JSON.parse(
      totalChart.getAttribute("data-chart-data") ?? "[]"
    );
    expect(totalData[0].total).toBe(5000);
  });

  it("'Unselect all' excludes every account and zeroes the Total chart, 'Select all' restores it", () => {
    render(
      <Charts
        accounts={mockAccounts}
        balances={mockBalances}
        groups={mockGroups}
        types={mockTypes}
        predictions={mockPredictions}
      />
    );

    fireEvent.click(screen.getByTestId("filter-account-toggle"));
    fireEvent.click(screen.getByTestId("filter-account-select-none"));

    expect(screen.getByTestId("line-Savings (Personal)")).toHaveAttribute(
      "data-hidden",
      "true"
    );
    expect(screen.getByTestId("line-Checking")).toHaveAttribute(
      "data-hidden",
      "true"
    );

    const totalChart = screen.getAllByTestId("line-chart")[0];
    let totalData = JSON.parse(
      totalChart.getAttribute("data-chart-data") ?? "[]"
    );
    expect(totalData[0].total).toBe(0);

    fireEvent.click(screen.getByTestId("filter-account-select-all"));

    expect(screen.getByTestId("line-Savings (Personal)")).toHaveAttribute(
      "data-hidden",
      "false"
    );
    expect(screen.getByTestId("line-Checking")).toHaveAttribute(
      "data-hidden",
      "false"
    );

    totalData = JSON.parse(totalChart.getAttribute("data-chart-data") ?? "[]");
    expect(totalData[0].total).toBe(5000);
  });
});
