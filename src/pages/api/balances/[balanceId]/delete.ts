import type { APIRoute } from "astro";
import { requireUserId } from "~/lib/session.server";
import { deleteBalance } from "~/models/balances.server";

export const POST: APIRoute = async ({ params, cookies }) => {
  try {
    const userId = await requireUserId(cookies);
    const { balanceId } = params;

    if (!balanceId) {
      return new Response(
        JSON.stringify({ errors: { generic: "Balance ID is required" } }),
        { status: 400, headers: { "Content-Type": "application/json" } }
      );
    }

    await deleteBalance({ id: balanceId, userId });

    return new Response(
      JSON.stringify({ success: true }),
      { status: 200, headers: { "Content-Type": "application/json" } }
    );
  } catch (error: unknown) {
    if (error instanceof Error && error.message.startsWith("REDIRECT:")) {
      return new Response(null, {
        status: 401,
        headers: { "Content-Type": "application/json" },
      });
    }
    return new Response(
      JSON.stringify({ errors: { generic: "Failed to delete balance" } }),
      { status: 500, headers: { "Content-Type": "application/json" } }
    );
  }
};
