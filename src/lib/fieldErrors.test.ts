import { describe, expect, test } from "vitest";

import { toFieldErrors } from "./fieldErrors";

describe("toFieldErrors", () => {
  test("keeps a single message as is", () => {
    expect(toFieldErrors({ name: ["Name is required"] })).toEqual({
      name: "Name is required",
    });
  });

  test("separates multiple messages for the same field", () => {
    expect(
      toFieldErrors({
        balance: ["Balance is required", "Balance must be a whole number"],
      })
    ).toEqual({
      balance: "Balance is required. Balance must be a whole number",
    });
  });

  test("omits fields without messages", () => {
    expect(toFieldErrors({ name: [], color: undefined })).toEqual({});
  });
});
