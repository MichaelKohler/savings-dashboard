import { defineMiddleware } from "astro:middleware";
import { getUser } from "~/lib/session.server";

const PUBLIC_ROUTES = [
  "/login",
  "/api/login",
  "/api/logout",
  "/api/healthcheck",
];

export const onRequest = defineMiddleware(async (context, next) => {
  const { url, cookies, redirect } = context;
  const pathname = new URL(url).pathname;

  // Allow public routes
  if (PUBLIC_ROUTES.some((route) => pathname.startsWith(route))) {
    return next();
  }

  // Check authentication
  const user = await getUser(cookies);

  if (!user && !pathname.startsWith("/login")) {
    return redirect(`/login?redirectTo=${encodeURIComponent(pathname)}`);
  }

  // Make user available to pages
  context.locals.user = user;

  return next();
});
