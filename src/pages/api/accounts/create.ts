import type { APIRoute } from "astro";
import { requireUserId } from "~/lib/session.server";
import { createAccount } from "~/models/accounts.server";

export const POST: APIRoute = async ({ request, cookies }) => {
  try {
    const userId = await requireUserId(cookies);
    const formData = await request.formData();

    const name = formData.get("name");
    const color = formData.get("color");
    const groupId = formData.get("groupId");
    const typeId = formData.get("typeId");
    const showInGraphs = formData.has("showInGraphs");

    const errors = {
      name: null as string | null,
      color: null as string | null,
      groupId: null as string | null,
      typeId: null as string | null,
    };

    if (typeof name !== "string" || name.length === 0) {
      return new Response(
        JSON.stringify({
          errors: { ...errors, name: "Name is required and must be text" },
        }),
        { status: 400, headers: { "Content-Type": "application/json" } }
      );
    }

    if (typeof color !== "string" || color.length === 0) {
      return new Response(
        JSON.stringify({
          errors: { ...errors, color: "Color is required and must be text" },
        }),
        { status: 400, headers: { "Content-Type": "application/json" } }
      );
    }

    if (typeof groupId !== "undefined" && typeof groupId !== "string") {
      return new Response(
        JSON.stringify({
          errors: { ...errors, groupId: "Group ID must be a string" },
        }),
        { status: 400, headers: { "Content-Type": "application/json" } }
      );
    }

    if (typeof typeId !== "undefined" && typeof typeId !== "string") {
      return new Response(
        JSON.stringify({
          errors: { ...errors, typeId: "Type ID must be a string" },
        }),
        { status: 400, headers: { "Content-Type": "application/json" } }
      );
    }

    await createAccount({ name, color, showInGraphs, groupId, typeId }, userId);

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
      JSON.stringify({ errors: { generic: "Failed to create account" } }),
      { status: 500, headers: { "Content-Type": "application/json" } }
    );
  }
};
