import type { APIRoute } from "astro";
import { requireUserId } from "~/lib/session.server";
import { createGroup } from "~/models/groups.server";

export const POST: APIRoute = async ({ request, cookies }) => {
  try {
    const userId = await requireUserId(cookies);
    const formData = await request.formData();
    const name = formData.get("name");

    if (typeof name !== "string" || name.length === 0) {
      return new Response(
        JSON.stringify({
          errors: { name: "Name is required and must be text" },
        }),
        { status: 400, headers: { "Content-Type": "application/json" } }
      );
    }

    await createGroup({ name, userId });

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
      JSON.stringify({ errors: { generic: "Failed to create group" } }),
      { status: 500, headers: { "Content-Type": "application/json" } }
    );
  }
};
