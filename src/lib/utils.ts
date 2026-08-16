import type { User } from "~/models/user.server";

const DEFAULT_REDIRECT = "/";

/**
 * This should be used any time the redirect path is user-provided
 * (Like the query string on our login/signup pages). This avoids
 * open-redirect vulnerabilities.
 * @param {string} to The redirect destination
 * @param {string} defaultRedirect The redirect to use if the to is unsafe.
 */
export function safeRedirect(
  to: FormDataEntryValue | string | null | undefined,
  defaultRedirect: string = DEFAULT_REDIRECT
) {
  if (!to || typeof to !== "string") {
    return defaultRedirect;
  }

  if (!to.startsWith("/") || to.startsWith("//")) {
    return defaultRedirect;
  }

  return to;
}

// eslint-disable-next-line @typescript-eslint/no-explicit-any
export function isUser(user: any): user is User {
  return user && typeof user === "object" && typeof user.email === "string";
}

export function validateEmail(email: unknown): email is string {
  return typeof email === "string" && email.length > 3 && email.includes("@");
}

export function validatePassword(password: unknown): password is string {
  return typeof password === "string" && password.length >= 8;
}

const balanceFormatter = new Intl.NumberFormat("de-CH", {
  maximumFractionDigits: 2,
});

/**
 * Formats a balance with ' as the thousands (and millions, etc.) separator,
 * without forcing decimal places (e.g. no trailing ".00").
 */
export function formatBalance(balance: number): string {
  return balanceFormatter.format(balance);
}
