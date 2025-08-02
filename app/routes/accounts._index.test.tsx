import { render, screen } from "@testing-library/react";
import { MemoryRouter, useLoaderData } from "react-router";
import AccountsPage from "./accounts._index";
import * as accountModel from "~/models/accounts.server";
import type { Account, Group, Type } from "@prisma/client";

process.env.SESSION_SECRET = "test-secret";
process.env.DATABASE_URL = "postgresql://test:test@localhost:5432/test";

vi.mock("react-router", async () => {
  const actual = await vi.importActual("react-router");
  return {
    ...actual,
    useLoaderData: vi.fn(),
  };
});

vi.mock("~/models/accounts.server", () => ({
  getAccounts: vi.fn(),
}));

vi.mock("~/session.server", () => ({
  requireUserId: vi.fn(),
}));

describe("routes/accounts._index", () => {
  afterEach(() => {
    vi.clearAllMocks();
  });

  it("should render a table of accounts", () => {
    const mockAccounts: (Account & {
      group: Group | null;
      type: Type | null;
    })[] = [
      {
        id: "1",
        name: "Test Account 1",
        color: "#ff0000",
        archived: false,
        group: {
          id: "g1",
          name: "Group 1",
          userId: "user-1",
          createdAt: new Date(),
          updatedAt: new Date(),
        },
        type: {
          id: "t1",
          name: "Type 1",
          userId: "user-1",
          createdAt: new Date(),
          updatedAt: new Date(),
        },
        userId: "user-1",
        showInGraphs: true,
        createdAt: new Date(),
        updatedAt: new Date(),
        groupId: "g1",
        typeId: "t1",
      },
      {
        id: "2",
        name: "Test Account 2",
        color: "#00ff00",
        archived: true,
        group: null,
        type: null,
        userId: "user-1",
        showInGraphs: true,
        createdAt: new Date(),
        updatedAt: new Date(),
        groupId: null,
        typeId: null,
      },
    ];

    vi.mocked(accountModel.getAccounts).mockResolvedValue(mockAccounts);
    vi.mocked(useLoaderData).mockReturnValue({
      accounts: mockAccounts,
    });

    render(
      <MemoryRouter>
        <AccountsPage />
      </MemoryRouter>
    );

    const row1 = screen.getByText(/Test Account 1/).closest("tr");
    expect(row1).toHaveTextContent("Test Account 1");
    expect(row1).toHaveTextContent("(Group 1)");
    expect(row1).toHaveTextContent("Type 1");
    expect(row1).not.toHaveClass("text-gray-300");

    const row2 = screen.getByText(/Test Account 2/).closest("tr");
    expect(row2).toHaveTextContent("Test Account 2");
    expect(row2).toHaveClass("text-gray-300");
  });
});
