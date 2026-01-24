import { validateEmail, validatePassword, safeRedirect } from "./utils";

describe("validateEmail", () => {
  test("returns false for non-emails", () => {
    expect(validateEmail(undefined)).equal(false);
    expect(validateEmail(null)).equal(false);
    expect(validateEmail("")).equal(false);
    expect(validateEmail("not-an-email")).equal(false);
    expect(validateEmail("n@")).equal(false);
    expect(validateEmail("a@b")).equal(false); // too short
    expect(validateEmail(123)).equal(false);
    expect(validateEmail({})).equal(false);
    expect(validateEmail([])).equal(false);
  });

  test("returns true for valid emails", () => {
    expect(validateEmail("test@example.com")).equal(true);
    expect(validateEmail("user@domain.org")).equal(true);
    expect(validateEmail("a@b.co")).equal(true); // exactly 4 characters
    expect(validateEmail("very.long.email.address@example.domain.com")).equal(
      true
    );
    expect(validateEmail("user+tag@example.com")).equal(true);
    expect(validateEmail("user.name@example.com")).equal(true);
  });
});

describe("validatePassword", () => {
  test("returns false for invalid passwords", () => {
    expect(validatePassword(undefined)).equal(false);
    expect(validatePassword(null)).equal(false);
    expect(validatePassword("")).equal(false);
    expect(validatePassword("short")).equal(false); // too short
    expect(validatePassword("1234567")).equal(false); // 7 characters
    expect(validatePassword(123)).equal(false);
    expect(validatePassword({})).equal(false);
    expect(validatePassword([])).equal(false);
  });

  test("returns true for valid passwords", () => {
    expect(validatePassword("12345678")).equal(true); // exactly 8 characters
    expect(validatePassword("password123")).equal(true);
    expect(validatePassword("verylongpassword")).equal(true);
    expect(validatePassword("P@ssw0rd!")).equal(true);
    expect(validatePassword("simple password with spaces")).equal(true);
    expect(validatePassword("🔒🔑🛡️🔐🔓🔒🔑🛡️")).equal(true); // unicode characters
  });
});

describe("safeRedirect", () => {
  test("returns default redirect for invalid inputs", () => {
    expect(safeRedirect(undefined)).equal("/");
    expect(safeRedirect(null)).equal("/");
    expect(safeRedirect("")).equal("/");
  });

  test("returns custom default redirect when specified", () => {
    expect(safeRedirect(undefined, "/dashboard")).equal("/dashboard");
    expect(safeRedirect(null, "/home")).equal("/home");
    expect(safeRedirect("", "/login")).equal("/login");
  });

  test("returns default redirect for unsafe paths", () => {
    expect(safeRedirect("//evil.com")).equal("/");
    expect(safeRedirect("//evil.com/path")).equal("/");
    expect(safeRedirect("http://evil.com")).equal("/");
    expect(safeRedirect("https://evil.com")).equal("/");
    expect(safeRedirect("ftp://evil.com")).equal("/");
    expect(safeRedirect("javascript:alert('xss')")).equal("/");
    expect(safeRedirect("data:text/html,<script>alert('xss')</script>")).equal(
      "/"
    );
  });

  test("returns custom default redirect for unsafe paths", () => {
    expect(safeRedirect("//evil.com", "/safe")).equal("/safe");
    expect(safeRedirect("http://evil.com", "/dashboard")).equal("/dashboard");
  });

  test("returns safe relative paths", () => {
    expect(safeRedirect("/dashboard")).equal("/dashboard");
    expect(safeRedirect("/users/123")).equal("/users/123");
    expect(safeRedirect("/admin/settings")).equal("/admin/settings");
    expect(safeRedirect("/")).equal("/");
    expect(safeRedirect("/path/with/query?param=value")).equal(
      "/path/with/query?param=value"
    );
    expect(safeRedirect("/path#anchor")).equal("/path#anchor");
  });

  test("handles FormDataEntryValue types", () => {
    const file = new File(["content"], "test.txt");
    expect(safeRedirect(file)).equal("/");

    // Test with actual FormData string value
    const formData = new FormData();
    formData.set("redirect", "/valid/path");
    const redirectValue = formData.get("redirect");
    expect(safeRedirect(redirectValue)).equal("/valid/path");
  });
});
