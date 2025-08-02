import { render, screen } from "@testing-library/react";
import { MemoryRouter, useLoaderData } from "react-router";
import ChartsPage from "./charts";

process.env.SESSION_SECRET = "test-secret";

vi.mock("react-router", async () => {
  const actual = await vi.importActual("react-router");
  return {
    ...actual,
    useLoaderData: vi.fn(),
  };
});

vi.mock("~/models/accounts.server", () => ({ getAccounts: vi.fn() }));
vi.mock("~/models/balances.server", () => ({ getBalancesForCharts: vi.fn() }));
vi.mock("~/models/groups.server", () => ({ getGroups: vi.fn() }));
vi.mock("~/models/types.server", () => ({ getTypes: vi.fn() }));
vi.mock("~/session.server", () => ({ requireUserId: vi.fn() }));

vi.mock("recharts", async () => {
  const actual = await vi.importActual("recharts");
  return {
    ...actual,
    ResponsiveContainer: ({ children }: { children: React.ReactNode }) => (
      <div>{children}</div>
    ),
  };
});

describe("routes/charts", () => {
  it("should render the charts page with data", () => {
    const mockData = {
      accounts: [],
      balances: [],
      groups: [],
      types: [],
      predictions: [],
    };
    vi.mocked(useLoaderData).mockReturnValue(mockData);

    render(
      <MemoryRouter>
        <ChartsPage />
      </MemoryRouter>
    );

    expect(screen.getByRole("heading", { name: /Total/i })).toBeInTheDocument();
    expect(
      screen.getByRole("heading", { name: /Predictions/i })
    ).toBeInTheDocument();
    expect(
      screen.getByRole("heading", { name: /Per Account/i })
    ).toBeInTheDocument();
    expect(
      screen.getByRole("heading", { name: /Stacked/i })
    ).toBeInTheDocument();
    expect(
      screen.getByRole("heading", { name: /Per Group/i })
    ).toBeInTheDocument();
    expect(
      screen.getByRole("heading", { name: /Per Type/i })
    ).toBeInTheDocument();
  });
});
