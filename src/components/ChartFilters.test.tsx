import { describe, it, expect, vi } from "vitest";
import { render, screen, fireEvent } from "@testing-library/react";
import ChartFilters from "~/components/ChartFilters";
import type { FilterableAccount } from "~/lib/chartFiltering";

describe("ChartFilters", () => {
  const accounts: FilterableAccount[] = [
    {
      id: "a1",
      name: "Savings",
      color: "#FF0000",
      groupId: "g1",
      typeId: "t1",
      showInGraphs: true,
      archived: false,
      uncheckedInChartsByDefault: false,
      group: { id: "g1", name: "Personal" },
      type: { id: "t1", name: "Type A" },
    },
    {
      id: "a2",
      name: "Checking",
      color: "#00FF00",
      groupId: null,
      typeId: null,
      showInGraphs: true,
      archived: false,
      uncheckedInChartsByDefault: false,
      group: null,
      type: null,
    },
  ];

  const groups = [
    {
      id: "g1",
      name: "Personal",
      uncheckedInChartsByDefault: false,
      userId: "u1",
      createdAt: new Date(),
      updatedAt: new Date(),
    },
  ];

  const types = [
    {
      id: "t1",
      name: "Type A",
      uncheckedInChartsByDefault: false,
      userId: "u1",
      createdAt: new Date(),
      updatedAt: new Date(),
    },
  ];

  function renderFilters(
    overrides: Partial<React.ComponentProps<typeof ChartFilters>> = {}
  ) {
    const onToggleAccount = vi.fn();
    const onToggleGroup = vi.fn();
    const onToggleType = vi.fn();
    const onResetToDefaults = vi.fn();
    const onShowEverything = vi.fn();

    render(
      <ChartFilters
        accounts={accounts}
        groups={groups}
        types={types}
        excludedAccountIds={new Set()}
        excludedGroupIds={new Set()}
        excludedTypeIds={new Set()}
        defaultExclusions={{
          excludedAccountIds: new Set(),
          excludedGroupIds: new Set(),
          excludedTypeIds: new Set(),
        }}
        onToggleAccount={onToggleAccount}
        onToggleGroup={onToggleGroup}
        onToggleType={onToggleType}
        onResetToDefaults={onResetToDefaults}
        onShowEverything={onShowEverything}
        {...overrides}
      />
    );

    return {
      onToggleAccount,
      onToggleGroup,
      onToggleType,
      onResetToDefaults,
      onShowEverything,
    };
  }

  function openDropdown(testIdPrefix: string) {
    fireEvent.click(screen.getByTestId(`${testIdPrefix}-toggle`));
  }

  it("renders all checkboxes checked by default", () => {
    renderFilters();
    openDropdown("filter-account");
    openDropdown("filter-group");
    openDropdown("filter-type");

    expect(screen.getByTestId("filter-account-a1")).toBeChecked();
    expect(screen.getByTestId("filter-account-a2")).toBeChecked();
    expect(screen.getByTestId("filter-group-g1")).toBeChecked();
    expect(screen.getByTestId("filter-type-t1")).toBeChecked();
  });

  it("renders excluded items as unchecked", () => {
    renderFilters({
      excludedAccountIds: new Set(["a1"]),
      excludedGroupIds: new Set(["g1"]),
      excludedTypeIds: new Set(["t1"]),
    });
    openDropdown("filter-account");
    openDropdown("filter-group");
    openDropdown("filter-type");

    expect(screen.getByTestId("filter-account-a1")).not.toBeChecked();
    expect(screen.getByTestId("filter-account-a2")).toBeChecked();
    expect(screen.getByTestId("filter-group-g1")).not.toBeChecked();
    expect(screen.getByTestId("filter-type-t1")).not.toBeChecked();
  });

  it("shows a selection summary on each dropdown's toggle button", () => {
    renderFilters({ excludedAccountIds: new Set(["a1"]) });

    expect(screen.getByTestId("filter-account-toggle")).toHaveTextContent(
      "1/2"
    );
    expect(screen.getByTestId("filter-group-toggle")).toHaveTextContent("All");
  });

  it("calls onToggleAccount with the account id when its checkbox is clicked", () => {
    const { onToggleAccount, onToggleGroup, onToggleType } = renderFilters();
    openDropdown("filter-account");

    fireEvent.click(screen.getByTestId("filter-account-a1"));

    expect(onToggleAccount).toHaveBeenCalledWith("a1");
    expect(onToggleGroup).not.toHaveBeenCalled();
    expect(onToggleType).not.toHaveBeenCalled();
  });

  it("calls onToggleGroup with the group id when its checkbox is clicked", () => {
    const { onToggleGroup } = renderFilters();
    openDropdown("filter-group");

    fireEvent.click(screen.getByTestId("filter-group-g1"));

    expect(onToggleGroup).toHaveBeenCalledWith("g1");
  });

  it("calls onToggleType with the type id when its checkbox is clicked", () => {
    const { onToggleType } = renderFilters();
    openDropdown("filter-type");

    fireEvent.click(screen.getByTestId("filter-type-t1"));

    expect(onToggleType).toHaveBeenCalledWith("t1");
  });

  it("shows an account excluded via its group as unchecked and disabled, not directly toggleable", () => {
    const { onToggleAccount } = renderFilters({
      excludedGroupIds: new Set(["g1"]),
    });
    openDropdown("filter-account");

    const cascadeExcluded = screen.getByTestId("filter-account-a1");
    expect(cascadeExcluded).not.toBeChecked();
    expect(cascadeExcluded).toBeDisabled();
    expect(cascadeExcluded.closest("label")).toHaveTextContent(
      "Savings (Personal) (hidden by group/type filter)"
    );

    // Unaffected account (no group) stays checked and interactive
    const unaffected = screen.getByTestId("filter-account-a2");
    expect(unaffected).toBeChecked();
    expect(unaffected).not.toBeDisabled();

    fireEvent.click(cascadeExcluded);
    expect(onToggleAccount).not.toHaveBeenCalled();
  });

  it("keeps an account directly excluded before its group is excluded disabled", () => {
    renderFilters({
      excludedAccountIds: new Set(["a1"]),
      excludedGroupIds: new Set(["g1"]),
    });
    openDropdown("filter-account");

    expect(screen.getByTestId("filter-account-a1")).toBeDisabled();
  });

  it("'Select all' in the Accounts dropdown does not touch accounts excluded via group/type", () => {
    const { onToggleAccount } = renderFilters({
      excludedGroupIds: new Set(["g1"]),
      excludedAccountIds: new Set(["a2"]),
    });
    openDropdown("filter-account");

    fireEvent.click(screen.getByTestId("filter-account-select-all"));

    expect(onToggleAccount).toHaveBeenCalledTimes(1);
    expect(onToggleAccount).toHaveBeenCalledWith("a2");
  });

  it("calls onShowEverything when the 'Show everything' button is clicked", () => {
    const { onShowEverything } = renderFilters({
      excludedAccountIds: new Set(["a1"]),
    });

    fireEvent.click(screen.getByRole("button", { name: "Show everything" }));

    expect(onShowEverything).toHaveBeenCalled();
  });

  it("disables 'Show everything' when nothing is excluded", () => {
    renderFilters();

    expect(
      screen.getByRole("button", { name: "Show everything" })
    ).toBeDisabled();
  });

  it("disables 'Reset to defaults' while the filters match the defaults", () => {
    renderFilters({
      excludedGroupIds: new Set(["g1"]),
      defaultExclusions: {
        excludedAccountIds: new Set(),
        excludedGroupIds: new Set(["g1"]),
        excludedTypeIds: new Set(),
      },
    });

    expect(
      screen.getByRole("button", { name: "Reset to defaults" })
    ).toBeDisabled();
    expect(
      screen.getByRole("button", { name: "Show everything" })
    ).toBeEnabled();
  });

  it("calls onResetToDefaults when the filters differ from the defaults", () => {
    const { onResetToDefaults } = renderFilters({
      defaultExclusions: {
        excludedAccountIds: new Set(["a1"]),
        excludedGroupIds: new Set(),
        excludedTypeIds: new Set(),
      },
    });

    const resetButton = screen.getByRole("button", {
      name: "Reset to defaults",
    });
    expect(resetButton).toBeEnabled();

    fireEvent.click(resetButton);

    expect(onResetToDefaults).toHaveBeenCalled();
  });

  it("marks entities that are unchecked by default in the dropdowns", () => {
    renderFilters({
      defaultExclusions: {
        excludedAccountIds: new Set(["a2"]),
        excludedGroupIds: new Set(["g1"]),
        excludedTypeIds: new Set(["t1"]),
      },
    });
    openDropdown("filter-account");
    openDropdown("filter-group");
    openDropdown("filter-type");

    expect(
      screen.getByTestId("filter-account-a2").closest("label")
    ).toHaveTextContent("Checking (unchecked by default)");
    expect(
      screen.getByTestId("filter-account-a1").closest("label")
    ).toHaveTextContent(/^Savings \(Personal\)$/);
    expect(
      screen.getByTestId("filter-group-g1").closest("label")
    ).toHaveTextContent("Personal (unchecked by default)");
    expect(
      screen.getByTestId("filter-type-t1").closest("label")
    ).toHaveTextContent("Type A (unchecked by default)");
  });

  it("renders without crashing when there are no groups, types, or accounts", () => {
    renderFilters({ groups: [], types: [], accounts: [] });

    expect(screen.queryByTestId(/filter-/)).not.toBeInTheDocument();
  });
});
