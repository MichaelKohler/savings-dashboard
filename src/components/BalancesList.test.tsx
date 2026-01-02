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
      account: { id: "a1", name: "Savings Account" },
    },
    {
      id: "b2",
      balance: 2500,
      date: new Date("2024-02-20"),
      accountId: "a2",
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

  it("renders table headers", () => {
    render(<BalancesList balances={mockBalances} />);
    expect(
      screen.getByRole("columnheader", { name: "Date" })
    ).toBeInTheDocument();
    expect(
      screen.getByRole("columnheader", { name: "Account" })
    ).toBeInTheDocument();
    expect(
      screen.getByRole("columnheader", { name: "Amount" })
    ).toBeInTheDocument();
    expect(
      screen.getByRole("columnheader", { name: "Actions" })
    ).toBeInTheDocument();
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
    expect(editLinks[0]).toHaveAttribute("href", "/balances/b1/edit");
    expect(editLinks[1]).toHaveAttribute("href", "/balances/b2/edit");
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

  it("renders empty table when no balances", () => {
    render(<BalancesList balances={[]} />);
    const rowgroups = screen.getAllByRole("rowgroup");
    const tbody = rowgroups[1]; // tbody is the second rowgroup
    expect(tbody.querySelectorAll("tr")).toHaveLength(0);
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
});
