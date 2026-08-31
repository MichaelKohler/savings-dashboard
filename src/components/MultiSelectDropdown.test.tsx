import { describe, it, expect, vi } from "vitest";
import { render, screen, fireEvent } from "@testing-library/react";
import MultiSelectDropdown from "~/components/MultiSelectDropdown";

describe("MultiSelectDropdown", () => {
  const options = [
    { id: "a1", label: "Savings" },
    { id: "a2", label: "Checking", color: "#00FF00" },
  ];

  function renderDropdown(
    overrides: Partial<React.ComponentProps<typeof MultiSelectDropdown>> = {}
  ) {
    const onToggle = vi.fn();

    render(
      <MultiSelectDropdown
        label="Accounts"
        options={options}
        excludedIds={new Set()}
        onToggle={onToggle}
        testIdPrefix="filter-account"
        {...overrides}
      />
    );

    return { onToggle };
  }

  it("does not render options until the toggle is clicked", () => {
    renderDropdown();

    expect(screen.queryByTestId("filter-account-a1")).not.toBeInTheDocument();

    fireEvent.click(screen.getByTestId("filter-account-toggle"));

    expect(screen.getByTestId("filter-account-a1")).toBeInTheDocument();
    expect(screen.getByTestId("filter-account-a2")).toBeInTheDocument();
  });

  it("shows a summary of how many options are selected", () => {
    renderDropdown({ excludedIds: new Set(["a1"]) });

    expect(screen.getByTestId("filter-account-toggle")).toHaveTextContent(
      "1/2"
    );
  });

  it("shows 'All' when nothing is excluded", () => {
    renderDropdown();

    expect(screen.getByTestId("filter-account-toggle")).toHaveTextContent(
      "All"
    );
  });

  it("renders excluded options as unchecked", () => {
    renderDropdown({ excludedIds: new Set(["a1"]) });
    fireEvent.click(screen.getByTestId("filter-account-toggle"));

    expect(screen.getByTestId("filter-account-a1")).not.toBeChecked();
    expect(screen.getByTestId("filter-account-a2")).toBeChecked();
  });

  it("calls onToggle with the option id when a checkbox is clicked", () => {
    const { onToggle } = renderDropdown();
    fireEvent.click(screen.getByTestId("filter-account-toggle"));

    fireEvent.click(screen.getByTestId("filter-account-a1"));

    expect(onToggle).toHaveBeenCalledWith("a1");
  });

  it("calls onToggle for every currently-excluded option when 'Select all' is clicked", () => {
    const { onToggle } = renderDropdown({ excludedIds: new Set(["a1", "a2"]) });
    fireEvent.click(screen.getByTestId("filter-account-toggle"));

    fireEvent.click(screen.getByTestId("filter-account-select-all"));

    expect(onToggle).toHaveBeenCalledTimes(2);
    expect(onToggle).toHaveBeenCalledWith("a1");
    expect(onToggle).toHaveBeenCalledWith("a2");
  });

  it("does not call onToggle for already-included options when 'Select all' is clicked", () => {
    const { onToggle } = renderDropdown({ excludedIds: new Set(["a1"]) });
    fireEvent.click(screen.getByTestId("filter-account-toggle"));

    fireEvent.click(screen.getByTestId("filter-account-select-all"));

    expect(onToggle).toHaveBeenCalledTimes(1);
    expect(onToggle).toHaveBeenCalledWith("a1");
  });

  it("calls onToggle for every currently-included option when 'Unselect all' is clicked", () => {
    const { onToggle } = renderDropdown();
    fireEvent.click(screen.getByTestId("filter-account-toggle"));

    fireEvent.click(screen.getByTestId("filter-account-select-none"));

    expect(onToggle).toHaveBeenCalledTimes(2);
    expect(onToggle).toHaveBeenCalledWith("a1");
    expect(onToggle).toHaveBeenCalledWith("a2");
  });

  it("does not call onToggle for already-excluded options when 'Unselect all' is clicked", () => {
    const { onToggle } = renderDropdown({ excludedIds: new Set(["a1"]) });
    fireEvent.click(screen.getByTestId("filter-account-toggle"));

    fireEvent.click(screen.getByTestId("filter-account-select-none"));

    expect(onToggle).toHaveBeenCalledTimes(1);
    expect(onToggle).toHaveBeenCalledWith("a2");
  });

  it("renders a disabled option as unchecked and does not call onToggle on click", () => {
    const { onToggle } = renderDropdown({
      options: [
        { id: "a1", label: "Savings" },
        { id: "a2", label: "Checking", disabled: true },
      ],
      excludedIds: new Set(["a2"]),
    });
    fireEvent.click(screen.getByTestId("filter-account-toggle"));

    const disabledCheckbox = screen.getByTestId("filter-account-a2");
    expect(disabledCheckbox).toBeDisabled();
    expect(disabledCheckbox).not.toBeChecked();
    expect(disabledCheckbox.closest("label")).toHaveClass("opacity-50");

    fireEvent.click(disabledCheckbox);
    expect(onToggle).not.toHaveBeenCalled();
  });

  it("skips disabled options when 'Select all' is clicked", () => {
    const { onToggle } = renderDropdown({
      options: [
        { id: "a1", label: "Savings" },
        { id: "a2", label: "Checking", disabled: true },
      ],
      excludedIds: new Set(["a1", "a2"]),
    });
    fireEvent.click(screen.getByTestId("filter-account-toggle"));

    fireEvent.click(screen.getByTestId("filter-account-select-all"));

    expect(onToggle).toHaveBeenCalledTimes(1);
    expect(onToggle).toHaveBeenCalledWith("a1");
  });

  it("skips disabled options when 'Unselect all' is clicked", () => {
    const { onToggle } = renderDropdown({
      options: [
        { id: "a1", label: "Savings" },
        { id: "a2", label: "Checking", disabled: true },
      ],
      excludedIds: new Set(),
    });
    fireEvent.click(screen.getByTestId("filter-account-toggle"));

    fireEvent.click(screen.getByTestId("filter-account-select-none"));

    expect(onToggle).toHaveBeenCalledTimes(1);
    expect(onToggle).toHaveBeenCalledWith("a1");
  });

  it("closes when clicking outside", () => {
    renderDropdown();
    fireEvent.click(screen.getByTestId("filter-account-toggle"));
    expect(screen.getByTestId("filter-account-a1")).toBeInTheDocument();

    fireEvent.mouseDown(document.body);

    expect(screen.queryByTestId("filter-account-a1")).not.toBeInTheDocument();
  });

  it("closes on Escape", () => {
    renderDropdown();
    fireEvent.click(screen.getByTestId("filter-account-toggle"));
    expect(screen.getByTestId("filter-account-a1")).toBeInTheDocument();

    fireEvent.keyDown(document, { key: "Escape" });

    expect(screen.queryByTestId("filter-account-a1")).not.toBeInTheDocument();
  });
});
