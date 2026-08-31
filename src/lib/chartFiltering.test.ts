import { describe, it, expect } from "vitest";
import {
  formatAccountLabel,
  isAccountExcluded,
  getFilteredChartData,
  getFilteredPredictions,
  type FilterableAccount,
  type ChartExclusions,
} from "~/lib/chartFiltering";
import type { ChartDataEntry, PredictionEntry } from "~/models/balances.server";

function makeAccount(overrides: Partial<FilterableAccount>): FilterableAccount {
  return {
    id: "a1",
    name: "Savings",
    color: "#FF0000",
    groupId: "g1",
    typeId: "t1",
    showInGraphs: true,
    archived: false,
    group: { id: "g1", name: "Personal" },
    type: { id: "t1", name: "Type A" },
    ...overrides,
  };
}

function makeExclusions(
  overrides: Partial<ChartExclusions> = {}
): ChartExclusions {
  return {
    excludedAccountIds: new Set(),
    excludedGroupIds: new Set(),
    excludedTypeIds: new Set(),
    ...overrides,
  };
}

describe("formatAccountLabel", () => {
  it("appends the group name in parentheses when present", () => {
    expect(
      formatAccountLabel(
        makeAccount({ name: "Savings", group: { id: "g1", name: "Personal" } })
      )
    ).toBe("Savings (Personal)");
  });

  it("omits the parentheses when there is no group", () => {
    expect(
      formatAccountLabel(makeAccount({ name: "Checking", group: null }))
    ).toBe("Checking");
  });
});

describe("isAccountExcluded", () => {
  it("returns false when nothing is excluded", () => {
    expect(isAccountExcluded(makeAccount({}), makeExclusions())).toBe(false);
  });

  it("returns true when the account id is excluded", () => {
    const exclusions = makeExclusions({ excludedAccountIds: new Set(["a1"]) });
    expect(isAccountExcluded(makeAccount({}), exclusions)).toBe(true);
  });

  it("returns true when the account's group is excluded", () => {
    const exclusions = makeExclusions({ excludedGroupIds: new Set(["g1"]) });
    expect(isAccountExcluded(makeAccount({}), exclusions)).toBe(true);
  });

  it("returns true when the account's type is excluded", () => {
    const exclusions = makeExclusions({ excludedTypeIds: new Set(["t1"]) });
    expect(isAccountExcluded(makeAccount({}), exclusions)).toBe(true);
  });

  it("does not false-match a null groupId/typeId against an empty-string key", () => {
    const exclusions = makeExclusions({
      excludedGroupIds: new Set([""]),
      excludedTypeIds: new Set([""]),
    });
    const account = makeAccount({
      groupId: null,
      typeId: null,
      group: null,
      type: null,
    });
    expect(isAccountExcluded(account, exclusions)).toBe(false);
  });
});

describe("getFilteredChartData", () => {
  const accounts: FilterableAccount[] = [
    makeAccount({
      id: "a1",
      groupId: "g1",
      typeId: "t1",
      showInGraphs: true,
      archived: false,
      group: { id: "g1", name: "Personal" },
      type: { id: "t1", name: "Type A" },
    }),
    makeAccount({
      id: "a2",
      name: "Checking",
      groupId: "g2",
      typeId: "t1",
      showInGraphs: false,
      archived: false,
      group: { id: "g2", name: "Business" },
      type: { id: "t1", name: "Type A" },
    }),
    makeAccount({
      id: "a3",
      name: "Old",
      groupId: "g1",
      typeId: "t2",
      showInGraphs: true,
      archived: true,
      group: { id: "g1", name: "Personal" },
      type: { id: "t2", name: "Type B" },
    }),
  ];

  const balances: ChartDataEntry[] = [
    {
      date: "2024-01",
      total: 0,
      byAccount: { a1: 100, a2: 200, a3: 0 },
      byGroup: {},
      byType: {},
    },
    {
      date: "2024-02",
      total: 0,
      byAccount: { a1: 150, a2: 250, a3: 50 },
      byGroup: {},
      byType: {},
    },
  ];

  it("with no exclusions, matches the server reducer logic including the showInGraphs asymmetry", () => {
    const result = getFilteredChartData(balances, accounts, makeExclusions());

    // total: showInGraphs && (!archived || balance !== 0) -> a2 excluded (showInGraphs=false),
    // a3 excluded in month 1 (archived, balance 0) but included in month 2 (archived, balance !== 0)
    expect(result[0].total).toBe(100); // a1 only
    expect(result[1].total).toBe(150 + 50); // a1 + a3

    // byGroup/byType sum unconditionally, regardless of showInGraphs/archived
    // (a3, archived with balance 0 in month 1, still contributes its 0 to g1/t2)
    expect(result[0].byGroup).toEqual({ g1: 100, g2: 200 });
    expect(result[0].byType).toEqual({ t1: 300, t2: 0 });
    expect(result[1].byGroup).toEqual({ g1: 200, g2: 250 });
    expect(result[1].byType).toEqual({ t1: 400, t2: 50 });

    // byAccount passes through unchanged
    expect(result[0].byAccount).toEqual(balances[0].byAccount);
  });

  it("excludes a single account from total and its own group/type buckets", () => {
    const exclusions = makeExclusions({ excludedAccountIds: new Set(["a1"]) });
    const result = getFilteredChartData(balances, accounts, exclusions);

    expect(result[0].total).toBe(0); // a1 was the only included account for total
    // a3 (group g1/type t2, archived, balance 0) still contributes its 0
    expect(result[0].byGroup).toEqual({ g1: 0, g2: 200 });
    expect(result[0].byType).toEqual({ t1: 200, t2: 0 });
  });

  it("cascades a group exclusion to every account in that group", () => {
    const exclusions = makeExclusions({ excludedGroupIds: new Set(["g1"]) });
    const result = getFilteredChartData(balances, accounts, exclusions);

    // a1 and a3 (group g1) drop out even though neither is individually excluded
    expect(result[1].total).toBe(0);
    expect(result[1].byGroup).toEqual({ g2: 250 });
    expect(result[1].byType).toEqual({ t1: 250 });
  });
});

describe("getFilteredPredictions", () => {
  it("returns an empty array for empty input", () => {
    expect(getFilteredPredictions([], 1000)).toEqual([]);
  });

  it("recomputes values from the filtered total but keeps the original years", () => {
    const predictions: PredictionEntry[] = [
      { year: 2030, 5: 1050, 10: 1100 },
      { year: 2031, 5: 1103, 10: 1210 },
    ];

    const result = getFilteredPredictions(predictions, 2000);

    expect(result[0].year).toBe(2030);
    expect(result[1].year).toBe(2031);
    expect(result[0][5]).toBe(2100);
    expect(result[0][10]).toBe(2200);
    expect(result[1][5]).toBe(2205);
    expect(result[1][10]).toBe(2420);
  });
});
