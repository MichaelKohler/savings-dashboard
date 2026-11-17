import type { AstroCookies } from "astro";

import { createUserSession, getUserId, logout } from "./session.server";

interface StoredCookie {
  value: string;
  options: Record<string, unknown>;
}

const createCookieJar = () => {
  const store = new Map<string, StoredCookie>();
  const cookies = {
    get: (name: string) => {
      const cookie = store.get(name);
      return cookie ? { value: cookie.value } : undefined;
    },
    set: (name: string, value: string, options: Record<string, unknown>) => {
      store.set(name, { value, options });
    },
  } as unknown as AstroCookies;

  return { cookies, store };
};

const SEVEN_DAYS_IN_SECONDS = 60 * 60 * 24 * 7;

describe("createUserSession", () => {
  it("sets a browser session cookie without maxAge when remember is off", async () => {
    const { cookies, store } = createCookieJar();

    await createUserSession({
      cookies,
      userId: "user-1",
      remember: false,
      redirectTo: "/charts",
    });

    const sessionCookie = store.get("__session");
    expect(sessionCookie?.value).toBeTruthy();
    expect(sessionCookie?.options).not.toHaveProperty("maxAge");
    expect(sessionCookie?.options).not.toHaveProperty("expires");
    await expect(getUserId(cookies)).resolves.toBe("user-1");
  });

  it("sets a persistent cookie of about seven days when remember is on", async () => {
    const { cookies, store } = createCookieJar();

    await createUserSession({
      cookies,
      userId: "user-1",
      remember: true,
      redirectTo: "/charts",
    });

    const maxAge = store.get("__session")?.options.maxAge as number;
    expect(maxAge).toBeGreaterThan(SEVEN_DAYS_IN_SECONDS - 120);
    expect(maxAge).toBeLessThanOrEqual(SEVEN_DAYS_IN_SECONDS);
    await expect(getUserId(cookies)).resolves.toBe("user-1");
  });

  it("expires a browser session after one day even if the cookie survives", async () => {
    vi.useFakeTimers();
    try {
      const { cookies } = createCookieJar();

      await createUserSession({
        cookies,
        userId: "user-1",
        remember: false,
        redirectTo: "/charts",
      });

      vi.advanceTimersByTime(1000 * 60 * 60 * 25);

      await expect(getUserId(cookies)).resolves.toBeUndefined();
    } finally {
      vi.useRealTimers();
    }
  });
});

describe("logout", () => {
  it("clears the session cookie", async () => {
    const { cookies, store } = createCookieJar();
    await createUserSession({
      cookies,
      userId: "user-1",
      remember: false,
      redirectTo: "/charts",
    });

    await logout(cookies);

    expect(store.get("__session")).toEqual({
      value: "",
      options: expect.objectContaining({ maxAge: 0 }),
    });
  });
});
