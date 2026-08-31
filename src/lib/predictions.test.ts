import { describe, it, expect } from "vitest";
import { computePredictedBalances } from "~/lib/predictions";

describe("computePredictedBalances", () => {
  it("compounds each percentage independently across years", () => {
    const result = computePredictedBalances(1000, [5, 10], 2);

    expect(result.length).toBe(2);
    expect(result[0].year).toBe(new Date().getFullYear() + 1);
    expect(result[0][5]).toBe(1050);
    expect(result[0][10]).toBe(1100);
    expect(result[1].year).toBe(new Date().getFullYear() + 2);
    expect(result[1][5]).toBe(1103);
    expect(result[1][10]).toBe(1210);
  });

  it("returns an empty array when years is 0", () => {
    expect(computePredictedBalances(1000, [5], 0)).toEqual([]);
  });

  it("returns year-only entries when there are no percentages", () => {
    const result = computePredictedBalances(1000, [], 2);

    expect(result).toEqual([
      { year: new Date().getFullYear() + 1 },
      { year: new Date().getFullYear() + 2 },
    ]);
  });
});
