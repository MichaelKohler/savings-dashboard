import { describe, expect, test } from "vitest";

import { formatBalance } from "./utils";
import {
  balanceInputSchema,
  dateInputSchema,
  stripThousandsSeparators,
} from "./balanceInput";

const firstIssue = (result: { error?: { issues: { message: string }[] } }) =>
  result.error?.issues[0]?.message;

describe("stripThousandsSeparators", () => {
  test("removes apostrophe variants and whitespace", () => {
    expect(stripThousandsSeparators("12'500")).equal("12500");
    expect(stripThousandsSeparators("12’500")).equal("12500");
    expect(stripThousandsSeparators("1 234 567")).equal("1234567");
  });
});

describe("balanceInputSchema", () => {
  test("parses plain whole numbers", () => {
    expect(balanceInputSchema.parse("500")).equal(500);
    expect(balanceInputSchema.parse("-300")).equal(-300);
    expect(balanceInputSchema.parse("0")).equal(0);
  });

  test("parses the app's own de-CH display format", () => {
    expect(balanceInputSchema.parse("12'500")).equal(12500);
    expect(balanceInputSchema.parse(formatBalance(1234567))).equal(1234567);
    expect(balanceInputSchema.parse(formatBalance(-12500))).equal(-12500);
  });

  test("ignores surrounding whitespace", () => {
    expect(balanceInputSchema.parse("  12'500 ")).equal(12500);
  });

  test("rejects empty input", () => {
    expect(firstIssue(balanceInputSchema.safeParse("  "))).equal(
      "Balance is required"
    );
  });

  test.each(["abc", "12abc", "12.5", "1,5", "1e5", "--5", "5-"])(
    "rejects %s instead of truncating it",
    (value) => {
      expect(firstIssue(balanceInputSchema.safeParse(value))).equal(
        "Balance must be a whole number, e.g. 12'500 or -300"
      );
    }
  );

  test("rejects values outside the stored integer range", () => {
    expect(firstIssue(balanceInputSchema.safeParse("2147483648"))).equal(
      "Balance is too large"
    );
    expect(firstIssue(balanceInputSchema.safeParse("-2147483649"))).equal(
      "Balance is too small"
    );
    expect(balanceInputSchema.parse("2147483647")).equal(2147483647);
  });
});

describe("dateInputSchema", () => {
  test("parses YYYY-MM-DD dates", () => {
    expect(dateInputSchema.parse("2024-01-15")).toEqual(new Date("2024-01-15"));
    expect(dateInputSchema.parse("2024-02-29")).toEqual(new Date("2024-02-29"));
  });

  test("rejects empty input", () => {
    expect(firstIssue(dateInputSchema.safeParse(""))).equal("Date is required");
  });

  test.each(["not-a-date", "2023-02-29", "2024-13-01", "15.01.2024"])(
    "rejects %s",
    (value) => {
      expect(firstIssue(dateInputSchema.safeParse(value))).equal(
        "Date must be a valid date"
      );
    }
  );
});
