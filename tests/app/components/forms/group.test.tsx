import { describe, it, expect, vi } from "vitest";
import { render, screen } from "@testing-library/react";

import GroupForm from "~/components/forms/group";

// Mock react-router
vi.mock("react-router", () => ({
  Form: ({ children }: { children: React.ReactNode }) => (
    <form>{children}</form>
  ),
  useActionData: () => null,
  useNavigation: () => ({ formData: null }),
}));

// Mock Button component
vi.mock("~/components/button", () => ({
  default: ({ children }: { children: React.ReactNode }) => (
    <button>{children}</button>
  ),
}));

describe("GroupForm", () => {
  it("renders form for new group", () => {
    render(<GroupForm />);

    expect(screen.getByLabelText(/name/i)).toBeInTheDocument();
    expect(screen.getByRole("button")).toBeInTheDocument();
  });

  it("renders form for editing existing group", () => {
    const group = {
      id: "1",
      name: "Test Group",
      userId: "user1",
      createdAt: new Date(),
      updatedAt: new Date(),
    };

    render(<GroupForm initialData={group} />);

    const nameInput = screen.getByLabelText(/name/i);
    expect(nameInput).toHaveValue("Test Group");
    expect(screen.getByDisplayValue("1")).toBeInTheDocument(); // hidden id field
  });
});
