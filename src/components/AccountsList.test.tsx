import { describe, it, expect, vi, beforeEach } from "vitest";
import { render, screen, fireEvent, waitFor } from "@testing-library/react";

import AccountsList from "~/components/AccountsList";
import { actions } from "astro:actions";

describe("AccountsList", () => {
  const mockAccounts = [
    {
      id: "1",
      name: "Savings Account",
      color: "#FF0000",
      archived: false,
      showInGraphs: true,
      group: { id: "g1", name: "Personal" },
      type: { id: "t1", name: "Savings" },
    },
    {
      id: "2",
      name: "Checking Account",
      color: "#00FF00",
      archived: true,
      showInGraphs: false,
      group: null,
      type: null,
    },
  ];

  beforeEach(() => {
    vi.clearAllMocks();
    vi.mocked(actions.deleteAccount).mockResolvedValue({
      data: { success: true },
      error: undefined,
    });
    delete (window as { location?: unknown }).location;
    (window as { location?: unknown }).location = { reload: vi.fn() };
  });

  it("renders the new account button", () => {
    render(<AccountsList accounts={[]} />);
    const link = screen.getByRole("link");
    expect(link).toHaveAttribute("href", "/accounts/new");
    expect(
      screen.getByRole("button", { name: "+ New Account" })
    ).toBeInTheDocument();
  });

  it("renders table headers", () => {
    render(<AccountsList accounts={mockAccounts} />);
    expect(
      screen.getByRole("columnheader", { name: "Name" })
    ).toBeInTheDocument();
    expect(
      screen.getByRole("columnheader", { name: "Actions" })
    ).toBeInTheDocument();
  });

  it("renders all accounts in the list", () => {
    render(<AccountsList accounts={mockAccounts} />);
    expect(screen.getByText("Savings Account (Personal)")).toBeInTheDocument();
    expect(screen.getByText("Checking Account")).toBeInTheDocument();
  });

  it("renders account with group name", () => {
    render(<AccountsList accounts={mockAccounts} />);
    expect(screen.getByText("Savings Account (Personal)")).toBeInTheDocument();
  });

  it("renders account without group name", () => {
    render(<AccountsList accounts={mockAccounts} />);
    expect(screen.getByText("Checking Account")).toBeInTheDocument();
  });

  it("renders account type when present", () => {
    render(<AccountsList accounts={mockAccounts} />);
    expect(screen.getByText("Savings")).toBeInTheDocument();
  });

  it("does not render type when not present", () => {
    render(<AccountsList accounts={mockAccounts} />);
    const rows = screen.getAllByRole("row");
    const checkingRow = rows.find((row) =>
      row.textContent?.includes("Checking Account")
    );
    expect(checkingRow?.textContent).not.toContain("Savings");
  });

  it("applies archived styling to archived accounts", () => {
    render(<AccountsList accounts={mockAccounts} />);
    const rows = screen.getAllByRole("row");
    const archivedRow = rows.find((row) =>
      row.textContent?.includes("Checking Account")
    );
    expect(archivedRow).toHaveClass("text-gray-300");
  });

  it("does not apply archived styling to active accounts", () => {
    render(<AccountsList accounts={mockAccounts} />);
    const rows = screen.getAllByRole("row");
    const activeRow = rows.find((row) =>
      row.textContent?.includes("Savings Account")
    );
    expect(activeRow).not.toHaveClass("text-gray-300");
  });

  it("renders edit button for each account", () => {
    render(<AccountsList accounts={mockAccounts} />);
    const editButtons = screen.getAllByRole("button", { name: "Edit" });
    expect(editButtons).toHaveLength(2);
  });

  it("renders edit links with correct hrefs", () => {
    render(<AccountsList accounts={mockAccounts} />);
    const editLinks = screen
      .getAllByRole("link")
      .filter((link) => link.getAttribute("href")?.includes("/edit"));
    expect(editLinks[0]).toHaveAttribute("href", "/accounts/1/edit");
    expect(editLinks[1]).toHaveAttribute("href", "/accounts/2/edit");
  });

  it("renders initial delete button (X) for each account", () => {
    render(<AccountsList accounts={mockAccounts} />);
    const deleteButtons = screen.getAllByRole("button", { name: "X" });
    expect(deleteButtons).toHaveLength(2);
  });

  it("shows confirmation button (X?) when delete is clicked", () => {
    render(<AccountsList accounts={mockAccounts} />);
    const deleteButtons = screen.getAllByRole("button", { name: "X" });
    fireEvent.click(deleteButtons[0]);
    expect(screen.getByRole("button", { name: "X?" })).toBeInTheDocument();
  });

  it("calls delete API when confirmation button is clicked", async () => {
    render(<AccountsList accounts={mockAccounts} />);
    const deleteButtons = screen.getAllByRole("button", { name: "X" });
    fireEvent.click(deleteButtons[0]);

    const confirmButton = screen.getByRole("button", { name: "X?" });
    fireEvent.click(confirmButton);

    await waitFor(() => {
      expect(actions.deleteAccount).toHaveBeenCalledWith(expect.any(FormData));
    });
  });

  it("reloads page after successful deletion", async () => {
    render(<AccountsList accounts={mockAccounts} />);
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
    vi.mocked(actions.deleteAccount).mockResolvedValue({
      data: undefined,
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      error: {} as any,
    });

    render(<AccountsList accounts={mockAccounts} />);
    const deleteButtons = screen.getAllByRole("button", { name: "X" });
    fireEvent.click(deleteButtons[0]);

    const confirmButton = screen.getByRole("button", { name: "X?" });
    fireEvent.click(confirmButton);

    await waitFor(() => {
      expect(consoleErrorSpy).toHaveBeenCalledWith(
        "Failed to delete account",
        expect.anything()
      );
    });

    consoleErrorSpy.mockRestore();
  });

  it("renders empty table when there are no accounts", () => {
    render(<AccountsList accounts={[]} />);
    const rowgroups = screen.getAllByRole("rowgroup");
    const tbody = rowgroups[1]; // tbody is the second rowgroup
    expect(tbody.querySelectorAll("tr")).toHaveLength(0);
  });

  it("renders color swatch for each account", () => {
    render(<AccountsList accounts={mockAccounts} />);
    const rows = screen.getAllByRole("row");
    const accountRows = rows.filter((row) =>
      row.querySelector("[style*='background-color']")
    );
    expect(accountRows.length).toBeGreaterThan(0);
  });
});
