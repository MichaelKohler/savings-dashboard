import type { APIRoute } from "astro";
import { requireUserId } from "~/lib/session.server";
import { createBalance } from "~/models/balances.server";

export const POST: APIRoute = async ({ request, cookies }) => {
  try {
    const userId = await requireUserId(cookies);
    const formData = await request.formData();

    const balance = formData.get("balance");
    const date = formData.get("date");
    const accountId = formData.get("accountId");

    const errors = {
      balance: null as string | null,
      date: null as string | null,
      accountId: null as string | null,
    };

    if (typeof balance !== "string" || balance.length === 0) {
      return new Response(
        JSON.stringify({
          errors: { ...errors, balance: "Balance is required and must be text" },
        }),
        { status: 400, headers: { "Content-Type": "application/json" } }
      );
    }

    if (typeof date !== "string" || date.length === 0) {
      return new Response(
        JSON.stringify({
          errors: { ...errors, date: "Date is required and must be text" },
        }),
        { status: 400, headers: { "Content-Type": "application/json" } }
      );
    }

    if (typeof accountId !== "string" || accountId.length === 0) {
      return new Response(
        JSON.stringify({
          errors: { ...errors, accountId: "Account is required" },
        }),
        { status: 400, headers: { "Content-Type": "application/json" } }
      );
    }

    const balanceNum = parseFloat(balance);
    const dateObj = new Date(date);

    await createBalance({ balance: balanceNum, date: dateObj, accountId }, userId);

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
      JSON.stringify({ errors: { generic: "Failed to create balance" } }),
      { status: 500, headers: { "Content-Type": "application/json" } }
    );
  }
};
