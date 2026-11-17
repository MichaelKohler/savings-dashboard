import { getIronSession, type IronSession } from "iron-session";
import type { AstroCookies } from "astro";
import invariant from "tiny-invariant";

import type { User } from "~/models/user.server";
import { getUserById } from "~/models/user.server";

invariant(process.env.SESSION_SECRET, "SESSION_SECRET must be set");

interface SessionData {
  userId?: string;
}

const BROWSER_SESSION_TTL_SECONDS = 60 * 60 * 24;
const REMEMBER_ME_TTL_SECONDS = 60 * 60 * 24 * 7;

interface SessionLifetime {
  ttl: number;
  persistentCookie: boolean;
}

/**
 * Removes `maxAge` so the browser treats the cookie as a session cookie,
 * while keeping `maxAge: 0`, which iron-session uses to clear cookies.
 */
function toSessionCookieOptions(
  options: Record<string, unknown>
): Record<string, unknown> {
  if (options.maxAge === 0) return options;
  const { maxAge, ...sessionCookieOptions } = options;
  return sessionCookieOptions;
}

export async function getSession(
  cookies: AstroCookies,
  lifetime?: SessionLifetime
): Promise<IronSession<SessionData>> {
  const applyLifetime = (options: Record<string, unknown>) =>
    lifetime?.persistentCookie === false
      ? toSessionCookieOptions(options)
      : options;

  // Convert AstroCookies to a format iron-session can work with
  const cookieStore = {
    get: (name: string) => {
      const cookie = cookies.get(name);
      return cookie ? { name, value: cookie.value } : undefined;
    },
    set: (
      nameOrOptions:
        | string
        // eslint-disable-next-line @typescript-eslint/no-explicit-any
        | { name: string; value: string; [key: string]: any },
      value?: string,
      options?: Record<string, unknown>
    ) => {
      // Handle overloaded signature
      if (typeof nameOrOptions === "object") {
        // Called with ResponseCookie object
        const { name, value, ...cookieOptions } = nameOrOptions;
        cookies.set(name, value, applyLifetime(cookieOptions));
      } else {
        // Called with name, value, options
        cookies.set(nameOrOptions, value!, applyLifetime(options || {}));
      }
    },
  };

  return getIronSession(cookieStore, {
    password: process.env.SESSION_SECRET!,
    cookieName: "__session",
    ...(lifetime && { ttl: lifetime.ttl }),
    cookieOptions: {
      httpOnly: true,
      path: "/",
      sameSite: "lax",
      secure: process.env.NODE_ENV === "production",
    },
  });
}

export async function getUserId(
  cookies: AstroCookies
): Promise<User["id"] | undefined> {
  const session = await getSession(cookies);
  const userId = session.userId;
  return userId;
}

export async function getUser(cookies: AstroCookies) {
  const userId = await getUserId(cookies);
  if (userId === undefined) return null;

  const user = await getUserById(userId);
  if (user) return user;

  // Clear invalid session
  await logout(cookies);
  return null;
}

export async function requireUserId(
  cookies: AstroCookies
): Promise<User["id"]> {
  const userId = await getUserId(cookies);
  if (!userId) {
    throw new Error();
  }
  return userId;
}

export async function createUserSession({
  cookies,
  userId,
  remember,
  redirectTo,
}: {
  cookies: AstroCookies;
  userId: string;
  remember: boolean;
  redirectTo: string;
}) {
  const lifetime: SessionLifetime = remember
    ? { ttl: REMEMBER_ME_TTL_SECONDS, persistentCookie: true }
    : { ttl: BROWSER_SESSION_TTL_SECONDS, persistentCookie: false };
  const session = await getSession(cookies, lifetime);
  session.userId = userId;
  await session.save();

  return redirectTo;
}

export async function logout(cookies: AstroCookies) {
  const session = await getSession(cookies);
  session.destroy();

  return "/";
}
