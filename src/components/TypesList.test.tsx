import { describe, it, expect, vi, beforeEach } from "vitest";
import { render, screen, fireEvent, waitFor } from "@testing-library/react";

import TypesList from "~/components/TypesList";
import { actions } from "astro:actions";

describe("TypesList", () => {
  const mockTypes = [
    {
      id: "t1",
      name: "Savings",
      userId: "u1",
      createdAt: new Date(),
      updatedAt: new Date(),
    },
    {
      id: "t2",
      name: "Investment",
      userId: "u1",
      createdAt: new Date(),
      updatedAt: new Date(),
    },
  ];

  beforeEach(() => {
    vi.clearAllMocks();
    vi.mocked(actions.deleteType).mockResolvedValue({
      data: { success: true },
      error: undefined,
    });
    delete (window as { location?: unknown }).location;
    (window as { location?: unknown }).location = { reload: vi.fn() };
  });

  it("renders the new type button", () => {
    render(<TypesList types={[]} />);
    const link = screen.getByRole("link");
    expect(link).toHaveAttribute("href", "/types/new");
    expect(
      screen.getByRole("button", { name: "+ New Type" })
    ).toBeInTheDocument();
  });

  it("renders table headers", () => {
    render(<TypesList types={mockTypes} />);
    expect(
      screen.getByRole("columnheader", { name: "Name" })
    ).toBeInTheDocument();
    expect(
      screen.getByRole("columnheader", { name: "Actions" })
    ).toBeInTheDocument();
  });

  it("renders all types in the list", () => {
    render(<TypesList types={mockTypes} />);
    expect(screen.getByText("Savings")).toBeInTheDocument();
    expect(screen.getByText("Investment")).toBeInTheDocument();
  });

  it("renders edit button for each type", () => {
    render(<TypesList types={mockTypes} />);
    const editButtons = screen.getAllByRole("button", { name: "Edit" });
    expect(editButtons).toHaveLength(2);
  });

  it("renders edit links with correct hrefs", () => {
    render(<TypesList types={mockTypes} />);
    const editLinks = screen
      .getAllByRole("link")
      .filter((link) => link.getAttribute("href")?.includes("/edit"));
    expect(editLinks[0]).toHaveAttribute("href", "/types/t1/edit");
    expect(editLinks[1]).toHaveAttribute("href", "/types/t2/edit");
  });

  it("renders initial delete button (X) for each type", () => {
    render(<TypesList types={mockTypes} />);
    const deleteButtons = screen.getAllByRole("button", { name: "X" });
    expect(deleteButtons).toHaveLength(2);
  });

  it("shows confirmation button (X?) when delete is clicked", () => {
    render(<TypesList types={mockTypes} />);
    const deleteButtons = screen.getAllByRole("button", { name: "X" });
    fireEvent.click(deleteButtons[0]);
    expect(screen.getByRole("button", { name: "X?" })).toBeInTheDocument();
  });

  it("calls delete API when confirmation button is clicked", async () => {
    render(<TypesList types={mockTypes} />);
    const deleteButtons = screen.getAllByRole("button", { name: "X" });
    fireEvent.click(deleteButtons[0]);

    const confirmButton = screen.getByRole("button", { name: "X?" });
    fireEvent.click(confirmButton);

    await waitFor(() => {
      expect(actions.deleteType).toHaveBeenCalledWith(expect.any(FormData));
    });
  });

  it("reloads page after successful deletion", async () => {
    render(<TypesList types={mockTypes} />);
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
    vi.mocked(actions.deleteType).mockResolvedValue({
      data: undefined,
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      error: {} as any,
    });

    render(<TypesList types={mockTypes} />);
    const deleteButtons = screen.getAllByRole("button", { name: "X" });
    fireEvent.click(deleteButtons[0]);

    const confirmButton = screen.getByRole("button", { name: "X?" });
    fireEvent.click(confirmButton);

    await waitFor(() => {
      expect(consoleErrorSpy).toHaveBeenCalledWith(
        "Failed to delete type",
        expect.anything()
      );
    });

    consoleErrorSpy.mockRestore();
  });

  it("does not reload page on failed deletion", async () => {
    vi.mocked(actions.deleteType).mockResolvedValue({
      data: undefined,
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      error: {} as any,
    });

    render(<TypesList types={mockTypes} />);
    const deleteButtons = screen.getAllByRole("button", { name: "X" });
    fireEvent.click(deleteButtons[0]);

    const confirmButton = screen.getByRole("button", { name: "X?" });
    fireEvent.click(confirmButton);

    await waitFor(() => {
      expect(actions.deleteType).toHaveBeenCalled();
    });

    expect(window.location.reload).not.toHaveBeenCalled();
  });

  it("renders empty table when no types", () => {
    render(<TypesList types={[]} />);
    const rowgroups = screen.getAllByRole("rowgroup");
    const tbody = rowgroups[1]; // tbody is the second rowgroup
    expect(tbody.querySelectorAll("tr")).toHaveLength(0);
  });

  it("marks only clicked type for deletion", () => {
    render(<TypesList types={mockTypes} />);
    const deleteButtons = screen.getAllByRole("button", { name: "X" });
    fireEvent.click(deleteButtons[0]);

    const confirmButtons = screen.getAllByRole("button", { name: "X?" });
    expect(confirmButtons).toHaveLength(1);

    const remainingDeleteButtons = screen.getAllByRole("button", { name: "X" });
    expect(remainingDeleteButtons).toHaveLength(1);
  });

  it("allows marking multiple types for deletion", () => {
    render(<TypesList types={mockTypes} />);
    const deleteButtons = screen.getAllByRole("button", { name: "X" });

    fireEvent.click(deleteButtons[0]);
    fireEvent.click(deleteButtons[1]);

    const confirmButtons = screen.getAllByRole("button", { name: "X?" });
    expect(confirmButtons).toHaveLength(2);
  });
});
