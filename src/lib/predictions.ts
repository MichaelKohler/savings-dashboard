import type { PredictionEntry } from "~/models/balances.server";

export function computePredictedBalances(
  currentTotal: number,
  percentages: number[],
  years: number
): PredictionEntry[] {
  const result = [];

  const accumulatingTotals: Record<number, number> = {};
  for (const percentage of percentages) {
    accumulatingTotals[percentage] = currentTotal;
  }

  for (let i = 1; i <= years; i++) {
    const totalsInYear: { year: number; [key: number]: number } = {
      year: new Date().getFullYear() + i,
    };
    for (const percentage of percentages) {
      accumulatingTotals[percentage] +=
        (accumulatingTotals[percentage] / 100) * percentage;
      totalsInYear[percentage] = Math.round(accumulatingTotals[percentage]);
    }
    result.push(totalsInYear);
  }

  return result;
}
