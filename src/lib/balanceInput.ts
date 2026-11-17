import { z } from "zod";

const INT32_MIN = -2_147_483_648;
const INT32_MAX = 2_147_483_647;

/**
 * Removes the thousands separators users may type, including the de-CH
 * apostrophe variants produced by `formatBalance` (e.g. "12'500" or "12’500").
 */
export function stripThousandsSeparators(value: string): string {
  return value.replace(/[\s'’ʼ]/g, "");
}

/**
 * Validates a balance form field and converts it to a whole number.
 * Balances are stored as a 32-bit integer, so decimals and out-of-range
 * values are rejected instead of being silently truncated.
 */
export const balanceInputSchema = z
  .string()
  .trim()
  .min(1, "Balance is required")
  .transform(stripThousandsSeparators)
  .pipe(
    z
      .string()
      .regex(/^-?\d+$/, "Balance must be a whole number, e.g. 12'500 or -300")
  )
  .transform(Number)
  .pipe(
    z
      .number()
      .min(INT32_MIN, "Balance is too small")
      .max(INT32_MAX, "Balance is too large")
  );

/**
 * Validates a date form field in `YYYY-MM-DD` format (as sent by
 * `<input type="date">`) and converts it to a Date.
 */
export const dateInputSchema = z
  .string()
  .trim()
  .min(1, "Date is required")
  .pipe(z.iso.date("Date must be a valid date"))
  .transform((value) => new Date(value));
