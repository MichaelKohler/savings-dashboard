import { render, screen } from "@testing-library/react";
import { MemoryRouter, useLoaderData } from "react-router";
import BalancesPage from "./balances._index";
import * as balanceModel from "~/models/balances.server";
import type { Balance, Account, Group, Type } from "@prisma/client";

process.env.SESSION_SECRET = "test-secret";

vi.mock("react-router", async () => {
  const actual = await vi.importActual("react-router");
  return {
    ...actual,
    useLoaderData: vi.fn(),
  };
});

vi.mock("~/models/balances.server", () => ({
  getBalances: vi.fn(),
}));

vi.mock("~/session.server", () => ({
  requireUserId: vi.fn(),
}));

describe("routes/balances._index", () => {
  afterEach(() => {
    vi.clearAllMocks();
  });

  it("should render a table of balances", () => {
    const mockBalances: (Balance & {
      account: Account & { group: Group | null; type: Type | null };
    })[] = [
      {
        id: "1",
        date: new Date("2023-01-01"),
        balance: 1000,
        account: {
          id: "a1",
          name: "Test Account 1",
          group: {
            id: "g1",
            name: "Group 1",
            userId: "user-1",
            createdAt: new Date(),
            updatedAt: new Date(),
          },
          type: null,
          userId: "user-1",
          color: "#ff0000",
          showInGraphs: true,
          archived: false,
          groupId: "g1",
          typeId: null,
          createdAt: new Date(),
          updatedAt: new Date(),
        },
        userId: "user-1",
        accountId: "a1",
        createdAt: new Date(),
        updatedAt: new Date(),
      },
      {
        id: "2",
        date: new Date("2023-01-02"),
        balance: 2000,
        account: {
          id: "a2",
          name: "Test Account 2",
          group: null,
          type: null,
          userId: "user-1",
          color: "#00ff00",
          showInGraphs: true,
          archived: false,
          groupId: null,
          typeId: null,
          createdAt: new Date(),
          updatedAt: new Date(),
        },
        userId: "user-1",
        accountId: "a2",
        createdAt: new Date(),
        updatedAt: new Date(),
      },
    ];

    vi.mocked(balanceModel.getBalances).mockResolvedValue(mockBalances);
    vi.mocked(useLoaderData).mockReturnValue({
      balances: mockBalances,
    });

    render(
      <MemoryRouter>
        <BalancesPage />
      </MemoryRouter>
    );

    expect(screen.getByText("2023-01-01")).toBeInTheDocument();
    expect(screen.getByText("Test Account 1")).toBeInTheDocument();
    expect(screen.getByText("Group 1")).toBeInTheDocument();
    expect(screen.getByText("1000")).toBeInTheDocument();

    expect(screen.getByText("2023-01-02")).toBeInTheDocument();
    expect(screen.getByText("Test Account 2")).toBeInTheDocument();
    expect(screen.getByText("2000")).toBeInTheDocument();
  });
});
