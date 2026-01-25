import { defineAction, ActionError } from "astro:actions";
import { z } from "astro:schema";
import { requireUserId } from "~/lib/session.server";
import {
  createAccount,
  updateAccount,
  deleteAccount,
} from "~/models/accounts.server";

export const createAccountAction = defineAction({
  accept: "form",
  input: z.object({
    name: z.string().min(1, "Name is required and must be text"),
    color: z.string().min(1, "Color is required and must be text"),
    groupId: z.string().optional(),
    typeId: z.string().optional(),
    showInGraphs: z.string().optional(),
    archived: z.string().optional(),
  }),
  handler: async (input, context) => {
    try {
      const userId = await requireUserId(context.cookies);

      await createAccount(
        {
          name: input.name,
          color: input.color,
          showInGraphs: input.showInGraphs === "on",
          archived: input.archived === "on",
          groupId: input.groupId || null,
          typeId: input.typeId || null,
        },
        userId
      );

      return { success: true };
    } catch (_error: unknown) {
      throw new ActionError({
        code: "INTERNAL_SERVER_ERROR",
        message: "Failed to create account",
      });
    }
  },
});

export const updateAccountAction = defineAction({
  accept: "form",
  input: z.object({
    accountId: z.string().min(1, "Account ID is required"),
    name: z.string().min(1, "Name is required and must be text"),
    color: z.string().min(1, "Color is required and must be text"),
    groupId: z.string().optional(),
    typeId: z.string().optional(),
    showInGraphs: z.string().optional(),
    archived: z.string().optional(),
  }),
  handler: async (input, context) => {
    try {
      const userId = await requireUserId(context.cookies);

      await updateAccount({
        id: input.accountId,
        name: input.name,
        color: input.color,
        showInGraphs: input.showInGraphs === "on",
        archived: input.archived === "on",
        groupId: input.groupId === "" ? null : (input.groupId as string | null),
        typeId: input.typeId === "" ? null : (input.typeId as string | null),
        userId,
      });

      return { success: true };
    } catch (_error: unknown) {
      throw new ActionError({
        code: "INTERNAL_SERVER_ERROR",
        message: "Failed to update account",
      });
    }
  },
});

export const deleteAccountAction = defineAction({
  accept: "form",
  input: z.object({
    accountId: z.string().min(1, "Account ID is required"),
  }),
  handler: async (input, context) => {
    try {
      const userId = await requireUserId(context.cookies);

      await deleteAccount({ id: input.accountId, userId });

      return { success: true };
    } catch (_error: unknown) {
      throw new ActionError({
        code: "INTERNAL_SERVER_ERROR",
        message: "Failed to delete account",
      });
    }
  },
});
