import { describe, it, expect, vi, beforeEach } from "vitest";
import { render, screen, fireEvent, waitFor } from "@testing-library/react";

import AccountForm from "~/components/AccountForm";
import { actions, isInputError } from "astro:actions";

describe("AccountForm", () => {
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

  const mockAccount = {
    id: "a1",
    name: "Test Account",
    color: "#FF0000",
    archived: false,
    showInGraphs: true,
    userId: "u1",
    groupId: "g1",
    typeId: "t1",
    createdAt: new Date(),
    updatedAt: new Date(),
  };

  beforeEach(() => {
    vi.clearAllMocks();
    vi.mocked(actions.createAccount).mockResolvedValue({
      data: { success: true },
      error: undefined,
    });
    vi.mocked(actions.updateAccount).mockResolvedValue({
      data: { success: true },
      error: undefined,
    });
    vi.mocked(isInputError).mockReturnValue(false);
    delete (window as { location?: { href?: string } }).location;
    (window as { location?: { href?: string } }).location = { href: "" };
  });

  it("renders form with all fields", () => {
    render(<AccountForm groups={mockGroups} types={mockTypes} />);
    expect(screen.getByLabelText(/Name:/)).toBeInTheDocument();
    expect(screen.getByLabelText(/Type:/)).toBeInTheDocument();
    expect(screen.getByLabelText(/Group:/)).toBeInTheDocument();
    expect(screen.getByLabelText(/Color:/)).toBeInTheDocument();
    expect(screen.getByLabelText(/Show in graphs/)).toBeInTheDocument();
  });

  it("renders all group options", () => {
    render(<AccountForm groups={mockGroups} types={mockTypes} />);
    const groupSelect = screen.getByLabelText(/Group:/) as HTMLSelectElement;
    expect(groupSelect.querySelectorAll("option")).toHaveLength(3); // including "Select group"
    expect(
      screen.getByRole("option", { name: "Personal" })
    ).toBeInTheDocument();
    expect(
      screen.getByRole("option", { name: "Business" })
    ).toBeInTheDocument();
  });

  it("renders all type options", () => {
    render(<AccountForm groups={mockGroups} types={mockTypes} />);
    const typeSelect = screen.getByLabelText(/Type:/) as HTMLSelectElement;
    expect(typeSelect.querySelectorAll("option")).toHaveLength(3); // including "Select type"
    expect(screen.getByRole("option", { name: "Savings" })).toBeInTheDocument();
    expect(
      screen.getByRole("option", { name: "Investment" })
    ).toBeInTheDocument();
  });

  it("shows archived checkbox only in edit mode", () => {
    const { rerender } = render(
      <AccountForm groups={mockGroups} types={mockTypes} />
    );
    expect(screen.queryByLabelText(/Archived/)).not.toBeInTheDocument();

    rerender(
      <AccountForm
        account={mockAccount}
        groups={mockGroups}
        types={mockTypes}
      />
    );
    expect(screen.getByLabelText(/Archived/)).toBeInTheDocument();
  });

  it("populates form with account data in edit mode", () => {
    render(
      <AccountForm
        account={mockAccount}
        groups={mockGroups}
        types={mockTypes}
      />
    );
    expect(screen.getByDisplayValue("Test Account")).toBeInTheDocument();
    const colorInput = screen.getByLabelText(/Color:/) as HTMLInputElement;
    expect(colorInput.value.toLowerCase()).toBe("#ff0000");
    const groupSelect = screen.getByLabelText(/Group:/) as HTMLSelectElement;
    expect(groupSelect.value).toBe("g1");
    const typeSelect = screen.getByLabelText(/Type:/) as HTMLSelectElement;
    expect(typeSelect.value).toBe("t1");
  });

  it("renders save button", () => {
    render(<AccountForm groups={mockGroups} types={mockTypes} />);
    expect(screen.getByRole("button", { name: "Save" })).toBeInTheDocument();
  });

  it("disables save button when submitting", async () => {
    vi.mocked(actions.createAccount).mockImplementation(
      // eslint-disable-next-line @typescript-eslint/no-empty-function
      () => new Promise(() => {}) // Never resolves to keep submitting state
    );

    render(<AccountForm groups={mockGroups} types={mockTypes} />);
    const nameInput = screen.getByLabelText(/Name:/);
    fireEvent.change(nameInput, { target: { value: "New Account" } });

    const saveButton = screen.getByRole("button", { name: "Save" });
    fireEvent.click(saveButton);

    await waitFor(() => {
      expect(saveButton).toBeDisabled();
    });
  });

  it("shows spinner when submitting", async () => {
    vi.mocked(actions.createAccount).mockImplementation(
      // eslint-disable-next-line @typescript-eslint/no-empty-function
      () => new Promise(() => {}) // Never resolves
    );

    render(<AccountForm groups={mockGroups} types={mockTypes} />);
    const nameInput = screen.getByLabelText(/Name:/);
    fireEvent.change(nameInput, { target: { value: "New Account" } });

    const saveButton = screen.getByRole("button", { name: "Save" });
    fireEvent.click(saveButton);

    await waitFor(() => {
      expect(screen.getByRole("status")).toBeInTheDocument();
    });
  });

  it("calls create API when creating new account", async () => {
    render(<AccountForm groups={mockGroups} types={mockTypes} />);
    const nameInput = screen.getByLabelText(/Name:/);
    fireEvent.change(nameInput, { target: { value: "New Account" } });

    const saveButton = screen.getByRole("button", { name: "Save" });
    fireEvent.click(saveButton);

    await waitFor(() => {
      expect(actions.createAccount).toHaveBeenCalledWith(expect.any(FormData));
    });
  });

  it("calls update API when editing existing account", async () => {
    render(
      <AccountForm
        account={mockAccount}
        groups={mockGroups}
        types={mockTypes}
      />
    );
    const nameInput = screen.getByLabelText(/Name:/);
    fireEvent.change(nameInput, { target: { value: "Updated Account" } });

    const saveButton = screen.getByRole("button", { name: "Save" });
    fireEvent.click(saveButton);

    await waitFor(() => {
      expect(actions.updateAccount).toHaveBeenCalledWith(expect.any(FormData));
    });
  });

  it("redirects to /accounts on successful submission", async () => {
    render(<AccountForm groups={mockGroups} types={mockTypes} />);
    const nameInput = screen.getByLabelText(/Name:/);
    fireEvent.change(nameInput, { target: { value: "New Account" } });

    const saveButton = screen.getByRole("button", { name: "Save" });
    fireEvent.click(saveButton);

    await waitFor(() => {
      expect(window.location.href).toBe("/accounts");
    });
  });

  it("displays name error when returned from API", async () => {
    const mockError = { fields: { name: "Name is required" } };

    vi.mocked(actions.createAccount).mockResolvedValue({
      data: undefined,
      error: mockError as never,
    });
    vi.mocked(isInputError).mockReturnValue(true);

    render(<AccountForm groups={mockGroups} types={mockTypes} />);
    const saveButton = screen.getByRole("button", { name: "Save" });
    fireEvent.click(saveButton);

    await waitFor(() => {
      expect(screen.getByText("Name is required")).toBeInTheDocument();
    });
  });

  it("displays color error when returned from API", async () => {
    const mockError = { fields: { color: "Invalid color" } };

    vi.mocked(actions.createAccount).mockResolvedValue({
      data: undefined,
      error: mockError as never,
    });
    vi.mocked(isInputError).mockReturnValue(true);

    render(<AccountForm groups={mockGroups} types={mockTypes} />);
    const saveButton = screen.getByRole("button", { name: "Save" });
    fireEvent.click(saveButton);

    await waitFor(() => {
      expect(screen.getByText("Invalid color")).toBeInTheDocument();
    });
  });

  it("displays generic error on network failure", async () => {
    vi.mocked(actions.createAccount).mockResolvedValue({
      data: undefined,
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      error: {} as any,
    });
    vi.mocked(isInputError).mockReturnValue(false);

    render(<AccountForm groups={mockGroups} types={mockTypes} />);
    const saveButton = screen.getByRole("button", { name: "Save" });
    fireEvent.click(saveButton);

    await waitFor(() => {
      expect(screen.getByText("Failed to save account")).toBeInTheDocument();
    });
  });

  it("focuses name input when name error occurs", async () => {
    const mockError = { fields: { name: "Name is required" } };

    vi.mocked(actions.createAccount).mockResolvedValue({
      data: undefined,
      error: mockError as never,
    });
    vi.mocked(isInputError).mockReturnValue(true);

    render(<AccountForm groups={mockGroups} types={mockTypes} />);
    const saveButton = screen.getByRole("button", { name: "Save" });
    fireEvent.click(saveButton);

    const nameInput = screen.getByLabelText(/Name:/);
    await waitFor(() => {
      expect(document.activeElement).toBe(nameInput);
    });
  });

  it("focuses color input when color error occurs", async () => {
    const mockError = { fields: { color: "Invalid color" } };

    vi.mocked(actions.createAccount).mockResolvedValue({
      data: undefined,
      error: mockError as never,
    });
    vi.mocked(isInputError).mockReturnValue(true);

    render(<AccountForm groups={mockGroups} types={mockTypes} />);
    const saveButton = screen.getByRole("button", { name: "Save" });
    fireEvent.click(saveButton);

    const colorInput = screen.getByLabelText(/Color:/);
    await waitFor(() => {
      expect(document.activeElement).toBe(colorInput);
    });
  });

  it("sets correct aria attributes when name error exists", async () => {
    const mockError = { fields: { name: "Name is required" } };

    vi.mocked(actions.createAccount).mockResolvedValue({
      data: undefined,
      error: mockError as never,
    });
    vi.mocked(isInputError).mockReturnValue(true);

    render(<AccountForm groups={mockGroups} types={mockTypes} />);
    const saveButton = screen.getByRole("button", { name: "Save" });
    fireEvent.click(saveButton);

    const nameInput = screen.getByLabelText(/Name:/);
    await waitFor(() => {
      expect(nameInput).toHaveAttribute("aria-invalid", "true");
      expect(nameInput).toHaveAttribute("aria-errormessage", "name-error");
    });
  });

  it("sets correct aria attributes when color error exists", async () => {
    const mockError = { fields: { color: "Invalid color" } };

    vi.mocked(actions.createAccount).mockResolvedValue({
      data: undefined,
      error: mockError as never,
    });
    vi.mocked(isInputError).mockReturnValue(true);

    render(<AccountForm groups={mockGroups} types={mockTypes} />);
    const saveButton = screen.getByRole("button", { name: "Save" });
    fireEvent.click(saveButton);

    const colorInput = screen.getByLabelText(/Color:/);
    await waitFor(() => {
      expect(colorInput).toHaveAttribute("aria-invalid", "true");
      expect(colorInput).toHaveAttribute("aria-errormessage", "color-error");
    });
  });

  it("clears errors on new submission", async () => {
    const mockError = { fields: { name: "Name is required" } };
    vi.mocked(actions.createAccount)
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      .mockResolvedValueOnce({ data: undefined, error: mockError as any })
      .mockResolvedValueOnce({ data: { success: true }, error: undefined });
    vi.mocked(isInputError)
      .mockReturnValueOnce(true)
      .mockReturnValueOnce(false);

    render(<AccountForm groups={mockGroups} types={mockTypes} />);
    const saveButton = screen.getByRole("button", { name: "Save" });
    fireEvent.click(saveButton);

    await waitFor(() => {
      expect(screen.getByText("Name is required")).toBeInTheDocument();
    });

    const nameInput = screen.getByLabelText(/Name:/);
    fireEvent.change(nameInput, { target: { value: "Valid Name" } });
    fireEvent.click(saveButton);

    await waitFor(() => {
      expect(screen.queryByText("Name is required")).not.toBeInTheDocument();
    });
  });
});
