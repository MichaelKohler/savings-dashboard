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

  // Action endpoints must not redirect to the login page, so each handler
  // checks `locals.user` itself via `requireActionUserId`.
  const isActionRequest = pathname.startsWith("/_actions");

  // Allow public routes
  if (
    !isActionRequest &&
    PUBLIC_ROUTES.some((route) => pathname.startsWith(route))
  ) {
    return next();
  }

  // Check authentication
  const user = await getUser(cookies);

  // Make user available to pages and actions
  context.locals.user = user;

  if (!user && !isActionRequest) {
    return redirect(`/login?redirectTo=${encodeURIComponent(pathname)}`);
  }

  return next();
});
