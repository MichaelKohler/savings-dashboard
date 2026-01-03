import type { APIRoute } from "astro";
import { verifyLogin } from "~/models/user.server";
import { createUserSession } from "~/lib/session.server";
import { validateEmail, safeRedirect } from "~/lib/utils";

export const POST: APIRoute = async ({ request, cookies }) => {
  const formData = await request.formData();
  const email = formData.get("email");
  const password = formData.get("password");
  const redirectTo = safeRedirect(formData.get("redirectTo"), "/charts");
  const remember = formData.get("remember") === "on";

  const errors = {
    email: null as string | null,
    password: null as string | null,
  };

  if (!validateEmail(email)) {
    return new Response(
      JSON.stringify({
        errors: { ...errors, email: "Email is invalid" },
      }),
      { status: 400, headers: { "Content-Type": "application/json" } }
    );
  }

  if (typeof password !== "string" || password.length === 0) {
    return new Response(
      JSON.stringify({
        errors: { ...errors, password: "Password is required" },
      }),
      { status: 400, headers: { "Content-Type": "application/json" } }
    );
  }

  const user = await verifyLogin(email, password);

  if (!user) {
    return new Response(
      JSON.stringify({
        errors: { ...errors, email: "Invalid email or password" },
      }),
      { status: 400, headers: { "Content-Type": "application/json" } }
    );
  }

  const redirect = await createUserSession({
    cookies,
    userId: user.id,
    remember,
    redirectTo,
  });

  return new Response(JSON.stringify({ success: true, redirect }), {
    status: 200,
    headers: { "Content-Type": "application/json" },
  });
};
