import { describe, it, expect, vi, beforeEach } from "vitest";
import { render, screen, fireEvent, waitFor } from "@testing-library/react";

import GroupForm from "~/components/GroupForm";
import { actions, isInputError } from "astro:actions";

describe("GroupForm", () => {
  const mockGroup = {
    id: "g1",
    name: "Personal",
    userId: "u1",
    createdAt: new Date(),
    updatedAt: new Date(),
  };

  beforeEach(() => {
    vi.clearAllMocks();
    vi.mocked(actions.createGroup).mockResolvedValue({
      data: { success: true },
      error: undefined,
    });
    vi.mocked(actions.updateGroup).mockResolvedValue({
      data: { success: true },
      error: undefined,
    });
    vi.mocked(isInputError).mockReturnValue(false);
    delete (window as { location?: { href?: string } }).location;
    (window as { location?: { href?: string } }).location = { href: "" };
  });

  it("renders form with name field", () => {
    render(<GroupForm />);
    expect(screen.getByLabelText(/Name:/)).toBeInTheDocument();
  });

  it("renders save button", () => {
    render(<GroupForm />);
    expect(screen.getByRole("button", { name: "Save" })).toBeInTheDocument();
  });

  it("populates form with group data in edit mode", () => {
    render(<GroupForm group={mockGroup} />);
    expect(screen.getByDisplayValue("Personal")).toBeInTheDocument();
  });

  it("has required attribute on name input", () => {
    render(<GroupForm />);
    const nameInput = screen.getByLabelText(/Name:/);
    expect(nameInput).toHaveAttribute("required");
  });

  it("disables save button when submitting", async () => {
    vi.mocked(actions.createGroup).mockImplementation(
      // eslint-disable-next-line @typescript-eslint/no-empty-function
      () => new Promise(() => {}) // Never resolves
    );

    render(<GroupForm />);
    const nameInput = screen.getByLabelText(/Name:/);
    fireEvent.change(nameInput, { target: { value: "Test Group" } });

    const saveButton = screen.getByRole("button", { name: "Save" });
    fireEvent.click(saveButton);

    await waitFor(() => {
      expect(saveButton).toBeDisabled();
    });
  });

  it("shows spinner when submitting", async () => {
    vi.mocked(actions.createGroup).mockImplementation(
      // eslint-disable-next-line @typescript-eslint/no-empty-function
      () => new Promise(() => {}) // Never resolves
    );

    render(<GroupForm />);
    const nameInput = screen.getByLabelText(/Name:/);
    fireEvent.change(nameInput, { target: { value: "Test Group" } });

    const saveButton = screen.getByRole("button", { name: "Save" });
    fireEvent.click(saveButton);

    await waitFor(() => {
      expect(screen.getByRole("status")).toBeInTheDocument();
    });
  });

  it("calls create API when creating new group", async () => {
    render(<GroupForm />);
    const nameInput = screen.getByLabelText(/Name:/);
    fireEvent.change(nameInput, { target: { value: "Business" } });

    const saveButton = screen.getByRole("button", { name: "Save" });
    fireEvent.click(saveButton);

    await waitFor(() => {
      expect(actions.createGroup).toHaveBeenCalledWith(expect.any(FormData));
    });
  });

  it("calls update API when editing existing group", async () => {
    render(<GroupForm group={mockGroup} />);
    const nameInput = screen.getByLabelText(/Name:/);
    fireEvent.change(nameInput, { target: { value: "Updated Group" } });

    const saveButton = screen.getByRole("button", { name: "Save" });
    fireEvent.click(saveButton);

    await waitFor(() => {
      expect(actions.updateGroup).toHaveBeenCalledWith(expect.any(FormData));
    });
  });

  it("redirects to /groups on successful submission", async () => {
    render(<GroupForm />);
    const nameInput = screen.getByLabelText(/Name:/);
    fireEvent.change(nameInput, { target: { value: "Business" } });

    const saveButton = screen.getByRole("button", { name: "Save" });
    fireEvent.click(saveButton);

    await waitFor(() => {
      expect(window.location.href).toBe("/groups");
    });
  });

  it("displays name error when returned from API", async () => {
    const mockError = { fields: { name: "Name is required" } };

    vi.mocked(actions.createGroup).mockResolvedValue({
      data: undefined,
      error: mockError as never,
    });
    vi.mocked(isInputError).mockReturnValue(true);

    render(<GroupForm />);
    const nameInput = screen.getByLabelText(/Name:/);
    fireEvent.change(nameInput, { target: { value: "a" } }); // Fill with something to pass HTML5 validation

    const saveButton = screen.getByRole("button", { name: "Save" });
    fireEvent.click(saveButton);

    await waitFor(() => {
      expect(screen.getByText("Name is required")).toBeInTheDocument();
    });
  });

  it("displays generic error on network failure", async () => {
    vi.mocked(actions.createGroup).mockResolvedValue({
      data: undefined,
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      error: {} as any,
    });
    vi.mocked(isInputError).mockReturnValue(false);

    render(<GroupForm />);
    const nameInput = screen.getByLabelText(/Name:/);
    fireEvent.change(nameInput, { target: { value: "Test Group" } });

    const saveButton = screen.getByRole("button", { name: "Save" });
    fireEvent.click(saveButton);

    await waitFor(() => {
      expect(screen.getByText("Failed to save group")).toBeInTheDocument();
    });
  });

  it("focuses name input when name error occurs", async () => {
    const mockError = { fields: { name: "Name is required" } };

    vi.mocked(actions.createGroup).mockResolvedValue({
      data: undefined,
      error: mockError as never,
    });
    vi.mocked(isInputError).mockReturnValue(true);

    render(<GroupForm />);
    const nameInput = screen.getByLabelText(/Name:/);
    fireEvent.change(nameInput, { target: { value: "a" } });

    const saveButton = screen.getByRole("button", { name: "Save" });
    fireEvent.click(saveButton);

    await waitFor(() => {
      expect(document.activeElement).toBe(nameInput);
    });
  });

  it("sets correct aria attributes when name error exists", async () => {
    const mockError = { fields: { name: "Name is required" } };

    vi.mocked(actions.createGroup).mockResolvedValue({
      data: undefined,
      error: mockError as never,
    });
    vi.mocked(isInputError).mockReturnValue(true);

    render(<GroupForm />);
    const nameInput = screen.getByLabelText(/Name:/);
    fireEvent.change(nameInput, { target: { value: "a" } });

    const saveButton = screen.getByRole("button", { name: "Save" });
    fireEvent.click(saveButton);

    await waitFor(() => {
      expect(nameInput).toHaveAttribute("aria-invalid", "true");
      expect(nameInput).toHaveAttribute("aria-errormessage", "name-error");
    });
  });

  it("clears errors on new submission", async () => {
    const mockError = { fields: { name: "Name is required" } };
    vi.mocked(actions.createGroup)
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      .mockResolvedValueOnce({ data: undefined, error: mockError as any })
      .mockResolvedValueOnce({ data: { success: true }, error: undefined });
    vi.mocked(isInputError)
      .mockReturnValueOnce(true)
      .mockReturnValueOnce(false);

    render(<GroupForm />);
    const nameInput = screen.getByLabelText(/Name:/);
    fireEvent.change(nameInput, { target: { value: "a" } });

    const saveButton = screen.getByRole("button", { name: "Save" });
    fireEvent.click(saveButton);

    await waitFor(() => {
      expect(screen.getByText("Name is required")).toBeInTheDocument();
    });

    fireEvent.change(nameInput, { target: { value: "Valid Name" } });
    fireEvent.click(saveButton);

    await waitFor(() => {
      expect(screen.queryByText("Name is required")).not.toBeInTheDocument();
    });
  });

  it("re-enables submit button after error", async () => {
    const mockError = { fields: { name: "Name is required" } };

    vi.mocked(actions.createGroup).mockResolvedValue({
      data: undefined,
      error: mockError as never,
    });
    vi.mocked(isInputError).mockReset().mockReturnValue(true);

    render(<GroupForm />);
    const nameInput = screen.getByLabelText(/Name:/);
    fireEvent.change(nameInput, { target: { value: "a" } });

    const saveButton = screen.getByRole("button", { name: "Save" });
    fireEvent.click(saveButton);

    await waitFor(() => {
      expect(screen.getByText("Name is required")).toBeInTheDocument();
    });

    expect(saveButton).toBeEnabled();
  });

  it("prevents form submission and calls preventDefault", async () => {
    render(<GroupForm />);
    const form = screen.getByRole("button", { name: "Save" }).closest("form");
    const submitEvent = new Event("submit", {
      bubbles: true,
      cancelable: true,
    });
    const preventDefaultSpy = vi.spyOn(submitEvent, "preventDefault");

    form?.dispatchEvent(submitEvent);

    expect(preventDefaultSpy).toHaveBeenCalled();
  });
});
