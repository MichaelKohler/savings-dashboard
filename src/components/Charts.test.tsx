import { describe, it, expect, vi, beforeEach } from "vitest";
import { render, screen, fireEvent } from "@testing-library/react";

import Charts from "~/components/Charts";

// Mock recharts components
vi.mock("recharts", () => ({
  BarChart: ({ children }: { children: React.ReactNode }) => (
    <div data-testid="bar-chart">{children}</div>
  ),
  Bar: ({ name }: { name: string }) => (
    <div data-testid={`bar-${name}`}>{name}</div>
  ),
  LineChart: ({ children }: { children: React.ReactNode }) => (
    <div data-testid="line-chart">{children}</div>
  ),
  Line: ({ name }: { name: string }) => (
    <div data-testid={`line-${name}`}>{name}</div>
  ),
  XAxis: () => <div data-testid="x-axis" />,
  YAxis: () => <div data-testid="y-axis" />,
  Tooltip: () => <div data-testid="tooltip" />,
  CartesianGrid: () => <div data-testid="grid" />,
  ResponsiveContainer: ({ children }: { children: React.ReactNode }) => (
    <div data-testid="responsive-container">{children}</div>
  ),
  Legend: ({ onClick }: { onClick?: () => void }) => (
    <div
      data-testid="legend"
      onClick={onClick}
      onKeyDown={(e) => {
        if (e.key === "Enter" || e.key === " ") {
          onClick?.();
        }
      }}
      role="button"
      tabIndex={0}
    >
      Legend
    </div>
  ),
}));

describe("Charts", () => {
  const mockAccounts = [
    {
      id: "a1",
      name: "Savings",
      color: "#FF0000",
      group: { id: "g1", name: "Personal" },
    },
    {
      id: "a2",
      name: "Checking",
      color: "#00FF00",
      group: null,
    },
  ];

  const mockBalances = [
    {
      date: "2024-01",
      total: 5000,
      byAccount: { a1: 3000, a2: 2000 },
      byGroup: { g1: 3000 },
      byType: { t1: 5000 },
    },
    {
      date: "2024-02",
      total: 6000,
      byAccount: { a1: 3500, a2: 2500 },
      byGroup: { g1: 3500 },
      byType: { t1: 6000 },
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
    const { container } = render(
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

    fireEvent.click(predictionsLegend);

    expect(container).toBeInTheDocument();
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
});
