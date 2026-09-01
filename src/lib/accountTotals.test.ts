import { describe, it, expect } from "vitest";
import { isAccountBalanceCountedInTotal } from "~/lib/accountTotals";

describe("isAccountBalanceCountedInTotal", () => {
  it("counts a non-archived account shown in graphs", () => {
    expect(
      isAccountBalanceCountedInTotal(
        { showInGraphs: true, archived: false },
        100
      )
    ).toBe(true);
  });

  it("excludes an account not shown in graphs, regardless of balance", () => {
    expect(
      isAccountBalanceCountedInTotal(
        { showInGraphs: false, archived: false },
        100
      )
    ).toBe(false);
  });

  it("excludes an archived account with a zero balance", () => {
    expect(
      isAccountBalanceCountedInTotal({ showInGraphs: true, archived: true }, 0)
    ).toBe(false);
  });

  it("counts an archived account with a non-zero balance", () => {
    expect(
      isAccountBalanceCountedInTotal({ showInGraphs: true, archived: true }, 50)
    ).toBe(true);
  });
});
