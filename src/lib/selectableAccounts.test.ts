import { describe, it, expect } from "vitest";
import { getSelectableAccounts } from "~/lib/selectableAccounts";

describe("getSelectableAccounts", () => {
  const active = { id: "1", archived: false };
  const archivedCurrent = { id: "2", archived: true };
  const archivedOther = { id: "3", archived: true };
  const accounts = [active, archivedCurrent, archivedOther];

  it("returns only non-archived accounts when no current account is given", () => {
    expect(getSelectableAccounts(accounts)).toEqual([active]);
  });

  it("keeps the current archived account and preserves order", () => {
    expect(getSelectableAccounts(accounts, archivedCurrent.id)).toEqual([
      active,
      archivedCurrent,
    ]);
  });

  it("does not duplicate a current account that is not archived", () => {
    expect(getSelectableAccounts(accounts, active.id)).toEqual([active]);
  });
});
