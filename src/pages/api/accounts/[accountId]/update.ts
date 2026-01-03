import type { APIRoute } from "astro";
import { requireUserId } from "~/lib/session.server";
import { updateAccount } from "~/models/accounts.server";

export const POST: APIRoute = async ({ params, request, cookies }) => {
  try {
    const userId = await requireUserId(cookies);
    const { accountId } = params;

    if (!accountId) {
      return new Response(
        JSON.stringify({ errors: { generic: "Account ID is required" } }),
        { status: 400, headers: { "Content-Type": "application/json" } }
      );
    }

    const formData = await request.formData();
    const name = formData.get("name");
    const color = formData.get("color");
    const groupId = formData.get("groupId");
    const typeId = formData.get("typeId");
    const showInGraphs = formData.has("showInGraphs");
    const archived = formData.has("archived");

    const errors = {
      name: null as string | null,
      color: null as string | null,
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

    await updateAccount({
      id: accountId,
      name,
      color,
      showInGraphs,
      archived,
      groupId: groupId === "" ? null : (groupId as string | null),
      typeId: typeId === "" ? null : (typeId as string | null),
      userId,
    });

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
      JSON.stringify({ errors: { generic: "Failed to update account" } }),
      { status: 500, headers: { "Content-Type": "application/json" } }
    );
  }
};
