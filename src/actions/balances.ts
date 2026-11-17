import { defineAction, ActionError } from "astro:actions";
import { z } from "zod";
import { balanceInputSchema, dateInputSchema } from "~/lib/balanceInput";
import { requireUserId } from "~/lib/session.server";
import {
  createBalance,
  updateBalance,
  deleteBalance,
} from "~/models/balances.server";

export const createBalanceAction = defineAction({
  accept: "form",
  input: z.object({
    balance: balanceInputSchema,
    date: dateInputSchema,
    accountId: z.string().min(1, "Account ID is required"),
  }),
  handler: async (input, context) => {
    try {
      const userId = await requireUserId(context.cookies);

      await createBalance(
        {
          balance: input.balance,
          date: input.date,
          accountId: input.accountId,
        },
        userId
      );

      return { success: true };
    } catch (_error: unknown) {
      throw new ActionError({
        code: "INTERNAL_SERVER_ERROR",
        message: "Failed to create balance",
      });
    }
  },
});

export const updateBalanceAction = defineAction({
  accept: "form",
  input: z.object({
    balanceId: z.string().min(1, "Balance ID is required"),
    balance: balanceInputSchema,
    date: dateInputSchema,
    accountId: z.string().min(1, "Account ID is required"),
  }),
  handler: async (input, context) => {
    try {
      const userId = await requireUserId(context.cookies);

      await updateBalance({
        id: input.balanceId,
        balance: input.balance,
        date: input.date,
        accountId: input.accountId,
        userId,
      });

      return { success: true };
    } catch (_error: unknown) {
      throw new ActionError({
        code: "INTERNAL_SERVER_ERROR",
        message: "Failed to update balance",
      });
    }
  },
});

export const deleteBalanceAction = defineAction({
  accept: "form",
  input: z.object({
    balanceId: z.string().min(1, "Balance ID is required"),
  }),
  handler: async (input, context) => {
    try {
      const userId = await requireUserId(context.cookies);

      await deleteBalance({ id: input.balanceId, userId });

      return { success: true };
    } catch (_error: unknown) {
      throw new ActionError({
        code: "INTERNAL_SERVER_ERROR",
        message: "Failed to delete balance",
      });
    }
  },
});
