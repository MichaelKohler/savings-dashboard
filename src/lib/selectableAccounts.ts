/**
 * Returns the accounts a balance can be assigned to: all non-archived
 * accounts, plus the balance's current account even if it is archived.
 */
export function getSelectableAccounts<
  T extends { id: string; archived: boolean },
>(accounts: T[], currentAccountId?: string | null): T[] {
  return accounts.filter(
    (account) => !account.archived || account.id === currentAccountId
  );
}
