import { defineAction, ActionError } from "astro:actions";
import { z } from "astro:schema";
import { verifyLogin } from "~/models/user.server";
import { createUserSession, logout } from "~/lib/session.server";
import { safeRedirect } from "~/lib/utils";

export const login = defineAction({
  accept: "form",
  input: z.object({
    email: z.string().email("Email is invalid"),
    password: z.string().min(1, "Password is required"),
    redirectTo: z.string().optional(),
    remember: z.string().optional(),
  }),
  handler: async (input, context) => {
    const user = await verifyLogin(input.email, input.password);

    if (!user) {
      throw new ActionError({
        code: "UNAUTHORIZED",
        message: "Invalid email or password",
      });
    }

    const redirectTo = safeRedirect(input.redirectTo, "/charts");
    const remember = input.remember === "on";

    const redirect = await createUserSession({
      cookies: context.cookies,
      userId: user.id,
      remember,
      redirectTo,
    });

    return { success: true, redirect };
  },
});

export const logoutAction = defineAction({
  accept: "form",
  handler: async (_input, context) => {
    const redirectPath = await logout(context.cookies);
    return { redirect: redirectPath };
  },
});
