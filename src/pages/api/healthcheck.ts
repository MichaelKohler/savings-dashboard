import type { APIRoute } from "astro";
import { prisma } from "~/lib/db.server";

export const GET: APIRoute = async ({ request }) => {
  const host =
    request.headers.get("X-Forwarded-Host") ?? request.headers.get("host");

  try {
    await Promise.all([
      prisma.user.count(),
      fetch(`${new URL(request.url).protocol}//${host}`, {
        method: "HEAD",
      }).then((r) => {
        if (!r.ok) return Promise.reject(r);
      }),
    ]);
    return new Response("OK", { status: 200 });
  } catch (error: unknown) {
    console.log("healthcheck ❌", { error });
    return new Response("ERROR", { status: 500 });
  }
};
