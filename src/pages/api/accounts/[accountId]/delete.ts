import type { APIRoute } from "astro";
import { requireUserId } from "~/lib/session.server";
import { deleteAccount } from "~/models/accounts.server";

export const POST: APIRoute = async ({ params, cookies }) => {
  try {
    const userId = await requireUserId(cookies);
    const { accountId } = params;

    if (!accountId) {
      return new Response(
        JSON.stringify({ errors: { generic: "Account ID is required" } }),
        { status: 400, headers: { "Content-Type": "application/json" } }
      );
    }

    await deleteAccount({ id: accountId, userId });

    return new Response(
      JSON.stringify({ success: true }),
      { status: 200, headers: { "Content-Type": "application/json" } }
    );
  } catch (error: unknown) {
    if (error instanceof Error && error.message.startsWith("REDIRECT:")) {
      return new Response(null, {
        status: 401,
        headers: { "Content-Type": "application/json" } }
      );
    }
    return new Response(
      JSON.stringify({ errors: { generic: "Failed to delete account" } }),
      { status: 500, headers: { "Content-Type": "application/json" } }
    );
  }
};
