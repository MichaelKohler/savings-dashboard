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
  uncheckedInChartsByDefault: boolean;
  group?: { id: string; name: string } | null;
  type?: { id: string; name: string } | null;
}

export type ChartAccount = Pick<
  FilterableAccount,
  "id" | "groupId" | "typeId" | "showInGraphs" | "archived"
>;

export interface AggregatedChartEntry extends ChartDataEntry {
  total: number;
  byGroup: Record<string, number>;
  byType: Record<string, number>;
}

export const UNASSIGNED_KEY = "unassigned";

export interface ChartSeries {
  id: string;
  name: string;
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

interface DefaultUncheckable {
  id: string;
  uncheckedInChartsByDefault: boolean;
}

function idsUncheckedByDefault(entities: DefaultUncheckable[]): Set<string> {
  return new Set(
    entities
      .filter((entity) => entity.uncheckedInChartsByDefault)
      .map((entity) => entity.id)
  );
}

/**
 * Builds the initial chart filter state from the entities' "unchecked in
 * charts filter by default" setting.
 */
export function getDefaultExclusions(
  accounts: DefaultUncheckable[],
  groups: DefaultUncheckable[],
  types: DefaultUncheckable[]
): ChartExclusions {
  return {
    excludedAccountIds: idsUncheckedByDefault(accounts),
    excludedGroupIds: idsUncheckedByDefault(groups),
    excludedTypeIds: idsUncheckedByDefault(types),
  };
}

function areSetsEqual(a: Set<string>, b: Set<string>): boolean {
  return a.size === b.size && [...a].every((id) => b.has(id));
}

export function areExclusionsEqual(
  a: ChartExclusions,
  b: ChartExclusions
): boolean {
  return (
    areSetsEqual(a.excludedAccountIds, b.excludedAccountIds) &&
    areSetsEqual(a.excludedGroupIds, b.excludedGroupIds) &&
    areSetsEqual(a.excludedTypeIds, b.excludedTypeIds)
  );
}

/**
 * Whether the account is hidden because its group or type (including the
 * "unassigned" bucket for accounts without one) is excluded.
 */
export function isAccountHiddenByGroupOrType(
  account: Pick<FilterableAccount, "groupId" | "typeId">,
  exclusions: Pick<ChartExclusions, "excludedGroupIds" | "excludedTypeIds">
): boolean {
  return (
    exclusions.excludedGroupIds.has(account.groupId ?? UNASSIGNED_KEY) ||
    exclusions.excludedTypeIds.has(account.typeId ?? UNASSIGNED_KEY)
  );
}

const NO_EXCLUSIONS: ChartExclusions = {
  excludedAccountIds: new Set(),
  excludedGroupIds: new Set(),
  excludedTypeIds: new Set(),
};

export function isAccountExcluded(
  account: Pick<FilterableAccount, "id" | "groupId" | "typeId">,
  exclusions: ChartExclusions
): boolean {
  return (
    exclusions.excludedAccountIds.has(account.id) ||
    isAccountHiddenByGroupOrType(account, exclusions)
  );
}

/**
 * Derives the total, per-group and per-type figures of a month from its
 * per-account balances, skipping accounts hidden from graphs or excluded by
 * the chart filters.
 */
export function aggregateChartEntry(
  entry: ChartDataEntry,
  accountsById: Map<string, ChartAccount>,
  exclusions: ChartExclusions = NO_EXCLUSIONS
): AggregatedChartEntry {
  let total = 0;
  const byGroup: Record<string, number> = {};
  const byType: Record<string, number> = {};

  for (const [accountId, balance] of Object.entries(entry.byAccount)) {
    const account = accountsById.get(accountId);
    if (!account?.showInGraphs) continue;
    if (isAccountExcluded(account, exclusions)) continue;

    if (isAccountBalanceCountedInTotal(account, balance)) {
      total += balance;
    }

    const groupKey = account.groupId ?? UNASSIGNED_KEY;
    byGroup[groupKey] = (byGroup[groupKey] ?? 0) + balance;

    const typeKey = account.typeId ?? UNASSIGNED_KEY;
    byType[typeKey] = (byType[typeKey] ?? 0) + balance;
  }

  return { ...entry, total, byGroup, byType };
}

export function getFilteredChartData(
  balances: ChartDataEntry[],
  accounts: ChartAccount[],
  exclusions: ChartExclusions
): AggregatedChartEntry[] {
  const accountsById = new Map(
    accounts.map((account) => [account.id, account])
  );

  return balances.map((entry) =>
    aggregateChartEntry(entry, accountsById, exclusions)
  );
}

export function getPredictionPercentages(
  predictions: PredictionEntry[]
): number[] {
  if (predictions.length === 0) return [];

  return Object.keys(predictions[0])
    .filter((key) => key !== "year")
    .map(Number)
    .sort((a, b) => a - b);
}

export function getFilteredPredictions(
  predictions: PredictionEntry[],
  currentTotal: number
): PredictionEntry[] {
  if (predictions.length === 0) return [];

  const percentages = getPredictionPercentages(predictions);

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
