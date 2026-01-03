import type { APIRoute } from "astro";
import { logout } from "~/lib/session.server";

export const POST: APIRoute = async ({ cookies, redirect }) => {
  const redirectPath = await logout(cookies);
  return redirect(redirectPath);
};
