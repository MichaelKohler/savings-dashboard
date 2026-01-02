import { getIronSession, type IronSession } from "iron-session";
import type { AstroCookies } from "astro";
import invariant from "tiny-invariant";

import type { User } from "~/models/user.server";
import { getUserById } from "~/models/user.server";

invariant(process.env.SESSION_SECRET, "SESSION_SECRET must be set");

interface SessionData {
  userId?: string;
}

interface CookieStore {
  get: (name: string) => { name: string; value: string } | undefined;
  set: (name: string, value: string, options?: Record<string, unknown>) => void;
  delete: (name: string) => void;
}

export async function getSession(
  cookies: AstroCookies
): Promise<IronSession<SessionData>> {
  // Convert AstroCookies to a format iron-session can work with
  const cookieStore: CookieStore = {
    get: (name: string) => {
      const cookie = cookies.get(name);
      return cookie ? { name, value: cookie.value } : undefined;
    },
    set: (name: string, value: string, options?: Record<string, unknown>) => {
      cookies.set(name, value, options || {});
    },
    delete: (name: string) => {
      cookies.delete(name, { path: "/" });
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
  cookies: AstroCookies,
  redirectTo = "/"
): Promise<User["id"]> {
  const userId = await getUserId(cookies);
  if (!userId) {
    const searchParams = new URLSearchParams([["redirectTo", redirectTo]]);
    throw new Error(`REDIRECT:/login?${searchParams}`);
  }
  return userId;
}

export async function requireUser(cookies: AstroCookies) {
  const userId = await requireUserId(cookies);

  const user = await getUserById(userId);
  if (user) return user;

  await logout(cookies);
  throw new Error("REDIRECT:/login");
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
  const session = await getSession(cookies);
  session.userId = userId;
  await session.save();

  // Set max age if remember is true
  if (remember) {
    cookies.set("__session", cookies.get("__session")?.value || "", {
      httpOnly: true,
      path: "/",
      sameSite: "lax",
      secure: process.env.NODE_ENV === "production",
      maxAge: 60 * 60 * 24 * 7, // 7 days
    });
  }

  return redirectTo;
}

export async function logout(cookies: AstroCookies) {
  const session = await getSession(cookies);
  await session.destroy();
  return "/";
}
