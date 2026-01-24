import { getIronSession, type IronSession } from "iron-session";
import type { AstroCookies } from "astro";
import invariant from "tiny-invariant";

import type { User } from "~/models/user.server";
import { getUserById } from "~/models/user.server";

invariant(process.env.SESSION_SECRET, "SESSION_SECRET must be set");

interface SessionData {
  userId?: string;
}

export async function getSession(
  cookies: AstroCookies,
  maxAge?: number
): Promise<IronSession<SessionData>> {
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
        const mergedOptions = { ...cookieOptions };
        if (maxAge !== undefined) {
          mergedOptions.maxAge = maxAge;
        }
        cookies.set(name, value, mergedOptions);
      } else {
        // Called with name, value, options
        const cookieOptions: Record<string, unknown> = { ...(options || {}) };
        if (maxAge !== undefined) {
          cookieOptions.maxAge = maxAge;
        }
        cookies.set(nameOrOptions, value!, cookieOptions);
      }
    },
  };

  return getIronSession(cookieStore, {
    password: process.env.SESSION_SECRET!,
    cookieName: "__session",
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
  const maxAge = remember ? 60 * 60 * 24 * 7 : undefined;
  const session = await getSession(cookies, maxAge);
  session.userId = userId;
  await session.save();

  return redirectTo;
}

export async function logout(cookies: AstroCookies) {
  const session = await getSession(cookies);
  session.destroy();

  return "/";
}
