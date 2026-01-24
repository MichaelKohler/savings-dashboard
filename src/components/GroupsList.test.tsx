import { describe, it, expect, vi, beforeEach } from "vitest";
import { render, screen, fireEvent, waitFor } from "@testing-library/react";

import GroupsList from "~/components/GroupsList";
import { actions } from "astro:actions";

describe("GroupsList", () => {
  const mockGroups = [
    {
      id: "g1",
      name: "Personal",
      userId: "u1",
      createdAt: new Date(),
      updatedAt: new Date(),
    },
    {
      id: "g2",
      name: "Business",
      userId: "u1",
      createdAt: new Date(),
      updatedAt: new Date(),
    },
  ];

  beforeEach(() => {
    vi.clearAllMocks();
    vi.mocked(actions.deleteGroup).mockResolvedValue({
      data: { success: true },
      error: undefined,
    });
    delete (window as { location?: unknown }).location;
    (window as { location?: unknown }).location = { reload: vi.fn() };
  });

  it("renders the new group button", () => {
    render(<GroupsList groups={[]} />);
    const link = screen.getByRole("link");
    expect(link).toHaveAttribute("href", "/groups/new");
    expect(
      screen.getByRole("button", { name: "+ New Group" })
    ).toBeInTheDocument();
  });

  it("renders table headers", () => {
    render(<GroupsList groups={mockGroups} />);
    expect(
      screen.getByRole("columnheader", { name: "Name" })
    ).toBeInTheDocument();
    expect(
      screen.getByRole("columnheader", { name: "Actions" })
    ).toBeInTheDocument();
  });

  it("renders all groups in the list", () => {
    render(<GroupsList groups={mockGroups} />);
    expect(screen.getByText("Personal")).toBeInTheDocument();
    expect(screen.getByText("Business")).toBeInTheDocument();
  });

  it("renders edit button for each group", () => {
    render(<GroupsList groups={mockGroups} />);
    const editButtons = screen.getAllByRole("button", { name: "Edit" });
    expect(editButtons).toHaveLength(2);
  });

  it("renders edit links with correct hrefs", () => {
    render(<GroupsList groups={mockGroups} />);
    const editLinks = screen
      .getAllByRole("link")
      .filter((link) => link.getAttribute("href")?.includes("/edit"));
    expect(editLinks[0]).toHaveAttribute("href", "/groups/g1/edit");
    expect(editLinks[1]).toHaveAttribute("href", "/groups/g2/edit");
  });

  it("renders initial delete button (X) for each group", () => {
    render(<GroupsList groups={mockGroups} />);
    const deleteButtons = screen.getAllByRole("button", { name: "X" });
    expect(deleteButtons).toHaveLength(2);
  });

  it("shows confirmation button (X?) when delete is clicked", () => {
    render(<GroupsList groups={mockGroups} />);
    const deleteButtons = screen.getAllByRole("button", { name: "X" });
    fireEvent.click(deleteButtons[0]);
    expect(screen.getByRole("button", { name: "X?" })).toBeInTheDocument();
  });

  it("calls delete API when confirmation button is clicked", async () => {
    render(<GroupsList groups={mockGroups} />);
    const deleteButtons = screen.getAllByRole("button", { name: "X" });
    fireEvent.click(deleteButtons[0]);

    const confirmButton = screen.getByRole("button", { name: "X?" });
    fireEvent.click(confirmButton);

    await waitFor(() => {
      expect(actions.deleteGroup).toHaveBeenCalledWith(expect.any(FormData));
    });
  });

  it("reloads page after successful deletion", async () => {
    render(<GroupsList groups={mockGroups} />);
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
    vi.mocked(actions.deleteGroup).mockResolvedValue({
      data: undefined,
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      error: {} as any,
    });

    render(<GroupsList groups={mockGroups} />);
    const deleteButtons = screen.getAllByRole("button", { name: "X" });
    fireEvent.click(deleteButtons[0]);

    const confirmButton = screen.getByRole("button", { name: "X?" });
    fireEvent.click(confirmButton);

    await waitFor(() => {
      expect(consoleErrorSpy).toHaveBeenCalledWith(
        "Failed to delete group",
        expect.anything()
      );
    });

    consoleErrorSpy.mockRestore();
  });

  it("does not reload page on failed deletion", async () => {
    vi.mocked(actions.deleteGroup).mockResolvedValue({
      data: undefined,
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      error: {} as any,
    });

    render(<GroupsList groups={mockGroups} />);
    const deleteButtons = screen.getAllByRole("button", { name: "X" });
    fireEvent.click(deleteButtons[0]);

    const confirmButton = screen.getByRole("button", { name: "X?" });
    fireEvent.click(confirmButton);

    await waitFor(() => {
      expect(actions.deleteGroup).toHaveBeenCalled();
    });

    expect(window.location.reload).not.toHaveBeenCalled();
  });

  it("renders empty table when no groups", () => {
    render(<GroupsList groups={[]} />);
    const rowgroups = screen.getAllByRole("rowgroup");
    const tbody = rowgroups[1]; // tbody is the second rowgroup
    expect(tbody.querySelectorAll("tr")).toHaveLength(0);
  });

  it("marks only clicked group for deletion", () => {
    render(<GroupsList groups={mockGroups} />);
    const deleteButtons = screen.getAllByRole("button", { name: "X" });
    fireEvent.click(deleteButtons[0]);

    const confirmButtons = screen.getAllByRole("button", { name: "X?" });
    expect(confirmButtons).toHaveLength(1);

    const remainingDeleteButtons = screen.getAllByRole("button", { name: "X" });
    expect(remainingDeleteButtons).toHaveLength(1);
  });

  it("allows marking multiple groups for deletion", () => {
    render(<GroupsList groups={mockGroups} />);
    const deleteButtons = screen.getAllByRole("button", { name: "X" });

    fireEvent.click(deleteButtons[0]);
    fireEvent.click(deleteButtons[1]);

    const confirmButtons = screen.getAllByRole("button", { name: "X?" });
    expect(confirmButtons).toHaveLength(2);
  });

  it("renders table with correct structure", () => {
    render(<GroupsList groups={mockGroups} />);
    const table = screen.getByRole("table");
    expect(table).toHaveClass("mt-5");
    expect(table).toHaveClass("min-w-full");
  });

  it("applies correct styles to table header", () => {
    render(<GroupsList groups={mockGroups} />);
    const rowgroups = screen.getAllByRole("rowgroup");
    const thead = rowgroups[0]; // thead is the first rowgroup
    expect(thead).toHaveClass("border-b");
    expect(thead).toHaveClass("border-gray-300");
    expect(thead).toHaveClass("text-left");
  });

  it("applies correct styles to table rows", () => {
    render(<GroupsList groups={mockGroups} />);
    const rows = screen.getAllByRole("row");
    const dataRows = rows.filter((row) => row.querySelector("td"));
    dataRows.forEach((row) => {
      expect(row).toHaveClass("border-b");
      expect(row).toHaveClass("border-gray-300");
    });
  });
});
