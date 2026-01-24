import { describe, it, expect, vi, beforeEach } from "vitest";
import { render, screen, fireEvent, waitFor } from "@testing-library/react";

import BalancesList from "~/components/BalancesList";
import { actions } from "astro:actions";

describe("BalancesList", () => {
  const mockBalances = [
    {
      id: "b1",
      balance: 1000,
      date: new Date("2024-01-15"),
      accountId: "a1",
      updatedAt: new Date("2024-01-15T10:00:00"),
      account: { id: "a1", name: "Savings Account" },
    },
    {
      id: "b2",
      balance: 2500,
      date: new Date("2024-02-20"),
      accountId: "a2",
      updatedAt: new Date("2024-02-20T10:00:00"),
      account: { id: "a2", name: "Checking Account" },
    },
  ];

  beforeEach(() => {
    vi.clearAllMocks();
    vi.mocked(actions.deleteBalance).mockResolvedValue({
      data: { success: true },
      error: undefined,
    });
    delete (window as { location?: unknown }).location;
    (window as { location?: unknown }).location = { reload: vi.fn() };
  });

  it("renders the new balance button", () => {
    render(<BalancesList balances={[]} />);

    const link = screen.getByRole("link");
    expect(link).toHaveAttribute("href", "/balances/new");
    expect(
      screen.getByRole("button", { name: "+ New Balance" })
    ).toBeInTheDocument();
  });

  it("renders month headers", () => {
    render(<BalancesList balances={mockBalances} />);

    expect(
      screen.getByRole("heading", { name: "2024-02", level: 2 })
    ).toBeInTheDocument();
    expect(
      screen.getByRole("heading", { name: "2024-01", level: 2 })
    ).toBeInTheDocument();
  });

  it("renders table headers for each month", () => {
    render(<BalancesList balances={mockBalances} />);

    const dateHeaders = screen.getAllByRole("columnheader", { name: "Date" });
    const accountHeaders = screen.getAllByRole("columnheader", {
      name: "Account",
    });
    const amountHeaders = screen.getAllByRole("columnheader", {
      name: "Amount",
    });
    const actionsHeaders = screen.getAllByRole("columnheader", {
      name: "Actions",
    });

    // Two months, so two tables with headers
    expect(dateHeaders).toHaveLength(2);
    expect(accountHeaders).toHaveLength(2);
    expect(amountHeaders).toHaveLength(2);
    expect(actionsHeaders).toHaveLength(2);
  });

  it("renders all balances in the list", () => {
    render(<BalancesList balances={mockBalances} />);

    expect(screen.getByText("Savings Account")).toBeInTheDocument();
    expect(screen.getByText("Checking Account")).toBeInTheDocument();
    expect(screen.getByText("1000")).toBeInTheDocument();
    expect(screen.getByText("2500")).toBeInTheDocument();
  });

  it("formats dates correctly", () => {
    render(<BalancesList balances={mockBalances} />);

    expect(screen.getByText("1/15/2024")).toBeInTheDocument();
    expect(screen.getByText("2/20/2024")).toBeInTheDocument();
  });

  it("renders edit button for each balance", () => {
    render(<BalancesList balances={mockBalances} />);

    const editButtons = screen.getAllByRole("button", { name: "Edit" });
    expect(editButtons).toHaveLength(2);
  });

  it("renders edit links with correct hrefs", () => {
    render(<BalancesList balances={mockBalances} />);

    const editLinks = screen
      .getAllByRole("link")
      .filter((link) => link.getAttribute("href")?.includes("/edit"));

    // Months are in descending order, so b2 (Feb) comes before b1 (Jan)
    expect(editLinks[0]).toHaveAttribute("href", "/balances/b2/edit");
    expect(editLinks[1]).toHaveAttribute("href", "/balances/b1/edit");
  });

  it("renders initial delete button (X) for each balance", () => {
    render(<BalancesList balances={mockBalances} />);

    const deleteButtons = screen.getAllByRole("button", { name: "X" });
    expect(deleteButtons).toHaveLength(2);
  });

  it("shows confirmation button (X?) when delete is clicked", () => {
    render(<BalancesList balances={mockBalances} />);

    const deleteButtons = screen.getAllByRole("button", { name: "X" });
    fireEvent.click(deleteButtons[0]);

    expect(screen.getByRole("button", { name: "X?" })).toBeInTheDocument();
  });

  it("calls delete API when confirmation button is clicked", async () => {
    render(<BalancesList balances={mockBalances} />);

    const deleteButtons = screen.getAllByRole("button", { name: "X" });
    fireEvent.click(deleteButtons[0]);

    const confirmButton = screen.getByRole("button", { name: "X?" });
    fireEvent.click(confirmButton);

    await waitFor(() => {
      expect(actions.deleteBalance).toHaveBeenCalledWith(expect.any(FormData));
    });
  });

  it("reloads page after successful deletion", async () => {
    render(<BalancesList balances={mockBalances} />);

    const deleteButtons = screen.getAllByRole("button", { name: "X" });
    fireEvent.click(deleteButtons[0]);

    const confirmButton = screen.getByRole("button", { name: "X?" });
    fireEvent.click(confirmButton);

    await waitFor(() => {
      expect(window.location.reload).toHaveBeenCalled();
    });
  });

  it("handles delete error gracefully", async () => {
    const consoleErrorSpy = vi.spyOn(console, "error");
    vi.mocked(actions.deleteBalance).mockResolvedValue({
      data: undefined,
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      error: {} as any,
    });

    render(<BalancesList balances={mockBalances} />);

    const deleteButtons = screen.getAllByRole("button", { name: "X" });
    fireEvent.click(deleteButtons[0]);

    const confirmButton = screen.getByRole("button", { name: "X?" });
    fireEvent.click(confirmButton);

    await waitFor(() => {
      expect(consoleErrorSpy).toHaveBeenCalledWith(
        "Failed to delete balance",
        expect.anything()
      );
    });

    consoleErrorSpy.mockRestore();
  });

  it("does not reload page on failed deletion", async () => {
    vi.mocked(actions.deleteBalance).mockResolvedValue({
      data: undefined,
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      error: {} as any,
    });

    render(<BalancesList balances={mockBalances} />);

    const deleteButtons = screen.getAllByRole("button", { name: "X" });
    fireEvent.click(deleteButtons[0]);

    const confirmButton = screen.getByRole("button", { name: "X?" });
    fireEvent.click(confirmButton);

    await waitFor(() => {
      expect(actions.deleteBalance).toHaveBeenCalled();
    });

    expect(window.location.reload).not.toHaveBeenCalled();
  });

  it("renders no tables when no balances", () => {
    render(<BalancesList balances={[]} />);

    const tables = screen.queryAllByRole("table");
    expect(tables).toHaveLength(0);
  });

  it("marks only clicked balance for deletion", () => {
    render(<BalancesList balances={mockBalances} />);

    const deleteButtons = screen.getAllByRole("button", { name: "X" });
    fireEvent.click(deleteButtons[0]);

    const confirmButtons = screen.getAllByRole("button", { name: "X?" });
    expect(confirmButtons).toHaveLength(1);

    const remainingDeleteButtons = screen.getAllByRole("button", { name: "X" });
    expect(remainingDeleteButtons).toHaveLength(1);
  });

  it("sorts balances within month by date then updatedAt in descending order", () => {
    const balancesWithSameMonth = [
      {
        id: "b1",
        balance: 1000,
        date: new Date("2024-01-15"),
        accountId: "a1",
        updatedAt: new Date("2024-01-15T09:00:00"),
        account: { id: "a1", name: "Account A" },
      },
      {
        id: "b2",
        balance: 2000,
        date: new Date("2024-01-15"),
        accountId: "a2",
        updatedAt: new Date("2024-01-15T10:00:00"),
        account: { id: "a2", name: "Account B" },
      },
      {
        id: "b3",
        balance: 3000,
        date: new Date("2024-01-10"),
        accountId: "a3",
        updatedAt: new Date("2024-01-10T10:00:00"),
        account: { id: "a3", name: "Account C" },
      },
    ];

    render(<BalancesList balances={balancesWithSameMonth} />);

    const rows = screen.getAllByRole("row");
    // First row is header, then the data rows
    const accountCells = rows
      .slice(1)
      .map((row) => row.querySelectorAll("td")[1].textContent);

    // Should be sorted by date descending (Jan 15, then Jan 10), then by updatedAt descending (10:00, then 09:00)
    expect(accountCells).toEqual(["Account B", "Account A", "Account C"]);
  });

  it("displays months in descending order", () => {
    render(<BalancesList balances={mockBalances} />);

    const headings = screen.getAllByRole("heading", { level: 2 });
    expect(headings[0]).toHaveTextContent("2024-02");
    expect(headings[1]).toHaveTextContent("2024-01");
  });
});
