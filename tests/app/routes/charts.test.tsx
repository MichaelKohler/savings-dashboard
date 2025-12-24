import { describe, it, expect, vi, beforeEach } from "vitest";
import { render, screen } from "@testing-library/react";
import type { LoaderFunctionArgs } from "react-router";

import ChartsPage, { loader } from "../../../app/routes/charts";

// Mock dependencies
vi.mock("~/session.server", () => ({
  requireUserId: vi.fn(),
}));

vi.mock("~/models/accounts.server", () => ({
  getAccounts: vi.fn(),
}));

vi.mock("~/models/balances.server", () => ({
  getBalancesForCharts: vi.fn(),
}));

vi.mock("~/models/groups.server", () => ({
  getGroups: vi.fn(),
}));

vi.mock("~/models/types.server", () => ({
  getTypes: vi.fn(),
}));

// Mock recharts components
vi.mock("recharts", () => ({
  BarChart: ({ children }: { children: React.ReactNode }) => (
    <div data-testid="bar-chart">{children}</div>
  ),
  Bar: () => <div data-testid="bar" />,
  Legend: () => <div data-testid="legend" />,
  LineChart: ({ children }: { children: React.ReactNode }) => (
    <div data-testid="line-chart">{children}</div>
  ),
  Line: () => <div data-testid="line" />,
  XAxis: () => <div data-testid="x-axis" />,
  YAxis: () => <div data-testid="y-axis" />,
  Tooltip: () => <div data-testid="tooltip" />,
  CartesianGrid: () => <div data-testid="cartesian-grid" />,
  ResponsiveContainer: ({ children }: { children: React.ReactNode }) => (
    <div data-testid="responsive-container">{children}</div>
  ),
}));

vi.mock("react-router", () => ({
  useLoaderData: vi.fn(),
}));

const { requireUserId } = vi.mocked(await import("~/session.server"));
const { getAccounts } = vi.mocked(await import("~/models/accounts.server"));
const { getBalancesForCharts } = vi.mocked(
  await import("~/models/balances.server")
);
const { getGroups } = vi.mocked(await import("~/models/groups.server"));
const { getTypes } = vi.mocked(await import("~/models/types.server"));
const { useLoaderData } = vi.mocked(await import("react-router"));

const mockAccounts = [
  {
    id: "1",
    name: "Checking Account",
    color: "#ff0000",
    showInGraphs: true,
    archived: false,
    userId: "user-id",
    groupId: "group-1",
    typeId: "type-1",
    createdAt: new Date(),
    updatedAt: new Date(),
    group: {
      id: "group-1",
      name: "Bank Accounts",
      userId: "user-id",
      createdAt: new Date(),
      updatedAt: new Date(),
    },
    type: {
      id: "type-1",
      name: "Checking",
      userId: "user-id",
      createdAt: new Date(),
      updatedAt: new Date(),
    },
  },
];

const mockBalances = [
  {
    date: "2023-01",
    total: 1000,
    byAccount: { "account-1": 1000 },
    byGroup: { "group-1": 1000 },
    byType: { "type-1": 1000 },
  },
  {
    date: "2023-02",
    total: 1500,
    byAccount: { "account-1": 1500 },
    byGroup: { "group-1": 1500 },
    byType: { "type-1": 1500 },
  },
];

const mockPredictions = [
  { year: 2024, "5": 1050, "10": 1100 },
  { year: 2025, "5": 1102, "10": 1210 },
];

const mockGroups = [
  {
    id: "1",
    name: "Bank Accounts",
    userId: "user-id",
    createdAt: new Date(),
    updatedAt: new Date(),
    accounts: [],
  },
];

const mockTypes = [
  {
    id: "1",
    name: "Checking",
    userId: "user-id",
    createdAt: new Date(),
    updatedAt: new Date(),
    accounts: [],
  },
];

describe("routes/charts", () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  describe("loader", () => {
    it("should return all chart data for authenticated user", async () => {
      requireUserId.mockResolvedValue("user-id");
      getAccounts.mockResolvedValue(mockAccounts);
      getBalancesForCharts.mockResolvedValue({
        balances: mockBalances,
        predictions: mockPredictions,
      });
      getGroups.mockResolvedValue(mockGroups);
      getTypes.mockResolvedValue(mockTypes);

      const request = new Request("http://localhost/charts");
      const result = await loader({ request, unstable_pattern: "" } as LoaderFunctionArgs);

      expect(requireUserId).toHaveBeenCalledWith(request);
      expect(getAccounts).toHaveBeenCalledWith({ userId: "user-id" });
      expect(getBalancesForCharts).toHaveBeenCalledWith({ userId: "user-id" });
      expect(getGroups).toHaveBeenCalledWith({ userId: "user-id" });
      expect(getTypes).toHaveBeenCalledWith({ userId: "user-id" });

      expect(result).toEqual({
        accounts: mockAccounts,
        balances: mockBalances,
        groups: mockGroups,
        types: mockTypes,
        predictions: mockPredictions,
      });
    });

    it("should throw error if user is not authenticated", async () => {
      const error = new Error("Unauthorized");
      requireUserId.mockRejectedValue(error);

      const request = new Request("http://localhost/charts");

      await expect(loader({ request, unstable_pattern: "" } as LoaderFunctionArgs)).rejects.toThrow(
        "Unauthorized"
      );
    });
  });

  describe("component", () => {
    const mockLoaderData = {
      accounts: mockAccounts,
      balances: mockBalances,
      groups: mockGroups,
      types: mockTypes,
      predictions: mockPredictions,
    };

    it("should render charts components", async () => {
      useLoaderData.mockReturnValue(mockLoaderData);

      render(<ChartsPage />);

      // Should render chart containers
      expect(screen.getAllByTestId("responsive-container")).toHaveLength(6); // Based on the actual charts in the component
    });

    it("should render line charts", async () => {
      useLoaderData.mockReturnValue(mockLoaderData);

      render(<ChartsPage />);

      const lineCharts = screen.getAllByTestId("line-chart");
      expect(lineCharts.length).toBeGreaterThan(0);
    });

    it("should render bar charts", async () => {
      useLoaderData.mockReturnValue(mockLoaderData);

      render(<ChartsPage />);

      const barCharts = screen.getAllByTestId("bar-chart");
      expect(barCharts.length).toBeGreaterThan(0);
    });

    it("should render chart axes and grid", async () => {
      useLoaderData.mockReturnValue(mockLoaderData);

      render(<ChartsPage />);

      expect(screen.getAllByTestId("x-axis")).toHaveLength(6);
      expect(screen.getAllByTestId("y-axis")).toHaveLength(6);
      expect(screen.getAllByTestId("cartesian-grid")).toHaveLength(6);
    });

    it("should handle empty data gracefully", async () => {
      const emptyData = {
        accounts: [],
        balances: [],
        groups: [],
        types: [],
        predictions: [],
      };

      useLoaderData.mockReturnValue(emptyData);

      render(<ChartsPage />);

      // Should still render chart containers even with empty data
      expect(screen.getAllByTestId("responsive-container")).toHaveLength(6);
    });
  });
});
