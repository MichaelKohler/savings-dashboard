import type { APIRoute } from "astro";
import { requireUserId } from "~/lib/session.server";
import { updateType } from "~/models/types.server";

export const POST: APIRoute = async ({ params, request, cookies }) => {
  try {
    const userId = await requireUserId(cookies);
    const { typeId } = params;

    if (!typeId) {
      return new Response(
        JSON.stringify({ errors: { generic: "Type ID is required" } }),
        { status: 400, headers: { "Content-Type": "application/json" } }
      );
    }

    const formData = await request.formData();
    const name = formData.get("name");

    if (typeof name !== "string" || name.length === 0) {
      return new Response(
        JSON.stringify({
          errors: { name: "Name is required" },
        }),
        { status: 400, headers: { "Content-Type": "application/json" } }
      );
    }

    await updateType({ id: typeId, name, userId });

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
      JSON.stringify({ errors: { generic: "Failed to update type" } }),
      { status: 500, headers: { "Content-Type": "application/json" } }
    );
  }
};
