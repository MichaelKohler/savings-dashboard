import Button from "~/components/button";
import MultiSelectDropdown from "~/components/MultiSelectDropdown";
import type { Group } from "~/models/groups.server";
import type { Type } from "~/models/types.server";
import {
  areExclusionsEqual,
  formatAccountLabel,
  isAccountExcluded,
  type ChartExclusions,
  type FilterableAccount,
} from "~/lib/chartFiltering";

interface ChartFiltersProps {
  accounts: FilterableAccount[];
  groups: Group[];
  types: Type[];
  excludedAccountIds: Set<string>;
  excludedGroupIds: Set<string>;
  excludedTypeIds: Set<string>;
  defaultExclusions: ChartExclusions;
  onToggleAccount: (accountId: string) => void;
  onToggleGroup: (groupId: string) => void;
  onToggleType: (typeId: string) => void;
  onResetToDefaults: () => void;
  onShowEverything: () => void;
}

const UNCHECKED_BY_DEFAULT_SUFFIX = " (unchecked by default)";

function withDefaultSuffix(
  label: string,
  id: string,
  defaultExcludedIds: Set<string>
): string {
  return defaultExcludedIds.has(id)
    ? `${label}${UNCHECKED_BY_DEFAULT_SUFFIX}`
    : label;
}

export default function ChartFilters({
  accounts,
  groups,
  types,
  excludedAccountIds,
  excludedGroupIds,
  excludedTypeIds,
  defaultExclusions,
  onToggleAccount,
  onToggleGroup,
  onToggleType,
  onResetToDefaults,
  onShowEverything,
}: ChartFiltersProps) {
  const hasActiveFilters =
    excludedAccountIds.size > 0 ||
    excludedGroupIds.size > 0 ||
    excludedTypeIds.size > 0;

  const exclusions: ChartExclusions = {
    excludedAccountIds,
    excludedGroupIds,
    excludedTypeIds,
  };

  const isAtDefaults = areExclusionsEqual(exclusions, defaultExclusions);

  const accountExcludedIds = new Set(
    accounts
      .filter((account) => isAccountExcluded(account, exclusions))
      .map((account) => account.id)
  );

  // An account can be hidden because its own id, its group, or its type is
  // excluded. Only the first is this dropdown's to control, so accounts
  // hidden via group/type are shown disabled here rather than silently
  // no-op'ing on toggle/"Select all" (their state is owned by another panel).
  const accountCascadeExcludedIds = new Set(
    accounts
      .filter(
        (account) =>
          (account.groupId !== null && excludedGroupIds.has(account.groupId)) ||
          (account.typeId !== null && excludedTypeIds.has(account.typeId))
      )
      .map((account) => account.id)
  );

  return (
    <section className="flex flex-col gap-4">
      <div className="flex items-center justify-between">
        <h2 className="text-2xl">Filters</h2>
        <div className="flex gap-2">
          <Button onClick={onResetToDefaults} isDisabled={isAtDefaults}>
            Reset to defaults
          </Button>
          <Button onClick={onShowEverything} isDisabled={!hasActiveFilters}>
            Show everything
          </Button>
        </div>
      </div>

      <div className="flex flex-wrap gap-4">
        {types.length > 0 && (
          <MultiSelectDropdown
            label="Types"
            options={types.map((type) => ({
              id: type.id,
              label: withDefaultSuffix(
                type.name,
                type.id,
                defaultExclusions.excludedTypeIds
              ),
            }))}
            excludedIds={excludedTypeIds}
            onToggle={onToggleType}
            testIdPrefix="filter-type"
          />
        )}

        {groups.length > 0 && (
          <MultiSelectDropdown
            label="Groups"
            options={groups.map((group) => ({
              id: group.id,
              label: withDefaultSuffix(
                group.name,
                group.id,
                defaultExclusions.excludedGroupIds
              ),
            }))}
            excludedIds={excludedGroupIds}
            onToggle={onToggleGroup}
            testIdPrefix="filter-group"
          />
        )}

        {accounts.length > 0 && (
          <MultiSelectDropdown
            label="Accounts"
            options={accounts.map((account) => {
              const hiddenByOtherFilter = accountCascadeExcludedIds.has(
                account.id
              );
              const label = withDefaultSuffix(
                formatAccountLabel(account),
                account.id,
                defaultExclusions.excludedAccountIds
              );
              return {
                id: account.id,
                label: hiddenByOtherFilter
                  ? `${label} (hidden by group/type filter)`
                  : label,
                color: account.color,
                disabled: hiddenByOtherFilter,
              };
            })}
            excludedIds={accountExcludedIds}
            onToggle={onToggleAccount}
            testIdPrefix="filter-account"
          />
        )}
      </div>
    </section>
  );
}
