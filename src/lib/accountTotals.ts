export function isAccountBalanceCountedInTotal(
  account: { showInGraphs: boolean; archived: boolean },
  balance: number
): boolean {
  return account.showInGraphs && (!account.archived || balance !== 0);
}
