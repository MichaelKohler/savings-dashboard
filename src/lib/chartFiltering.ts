import type { ChartDataEntry, PredictionEntry } from "~/models/balances.server";
import { computePredictedBalances } from "~/lib/predictions";
import { isAccountBalanceCountedInTotal } from "~/lib/accountTotals";

export interface FilterableAccount {
  id: string;
  name: string;
  color: string;
  groupId: string | null;
  typeId: string | null;
  showInGraphs: boolean;
  archived: boolean;
  group?: { id: string; name: string } | null;
  type?: { id: string; name: string } | null;
}

export interface ChartExclusions {
  excludedAccountIds: Set<string>;
  excludedGroupIds: Set<string>;
  excludedTypeIds: Set<string>;
}

export function formatAccountLabel(
  account: Pick<FilterableAccount, "name" | "group">
): string {
  return `${account.name}${account.group?.name ? ` (${account.group.name})` : ""}`;
}

export function isAccountExcluded(
  account: Pick<FilterableAccount, "id" | "groupId" | "typeId">,
  exclusions: ChartExclusions
): boolean {
  return (
    exclusions.excludedAccountIds.has(account.id) ||
    (account.groupId !== null &&
      exclusions.excludedGroupIds.has(account.groupId)) ||
    (account.typeId !== null && exclusions.excludedTypeIds.has(account.typeId))
  );
}

export function getFilteredChartData(
  balances: ChartDataEntry[],
  accounts: FilterableAccount[],
  exclusions: ChartExclusions
): ChartDataEntry[] {
  const accountsById = new Map(
    accounts.map((account) => [account.id, account])
  );

  return balances.map((entry) => {
    let total = 0;
    const byGroup: Record<string, number> = {};
    const byType: Record<string, number> = {};

    for (const [accountId, rawBalance] of Object.entries(entry.byAccount)) {
      if (typeof rawBalance !== "number") continue;

      const account = accountsById.get(accountId);
      if (!account) continue;
      if (isAccountExcluded(account, exclusions)) continue;

      if (isAccountBalanceCountedInTotal(account, rawBalance)) {
        total += rawBalance;
      }

      const groupKey = account.groupId ?? "";
      byGroup[groupKey] = (byGroup[groupKey] ?? 0) + rawBalance;

      const typeKey = account.typeId ?? "";
      byType[typeKey] = (byType[typeKey] ?? 0) + rawBalance;
    }

    return { ...entry, total, byGroup, byType };
  });
}

export function getFilteredPredictions(
  predictions: PredictionEntry[],
  currentTotal: number
): PredictionEntry[] {
  if (predictions.length === 0) return [];

  const percentages = Object.keys(predictions[0])
    .filter((key) => key !== "year")
    .map(Number);

  const computed = computePredictedBalances(
    currentTotal,
    percentages,
    predictions.length
  );

  return computed.map((entry, index) => ({
    ...entry,
    year: predictions[index].year,
  }));
}
