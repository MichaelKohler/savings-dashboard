import type { APIRoute } from "astro";
import { requireUserId } from "~/lib/session.server";
import { updateGroup } from "~/models/groups.server";

export const POST: APIRoute = async ({ params, request, cookies }) => {
  try {
    const userId = await requireUserId(cookies);
    const { groupId } = params;

    if (!groupId) {
      return new Response(
        JSON.stringify({ errors: { generic: "Group ID is required" } }),
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

    await updateGroup({ id: groupId, name, userId });

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
      JSON.stringify({ errors: { generic: "Failed to update group" } }),
      { status: 500, headers: { "Content-Type": "application/json" } }
    );
  }
};
