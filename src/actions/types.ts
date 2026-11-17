import { defineAction, ActionError } from "astro:actions";
import { z } from "zod";
import { requireActionUserId } from "~/lib/session.server";
import { createType, updateType, deleteType } from "~/models/types.server";

export const createTypeAction = defineAction({
  accept: "form",
  input: z.object({
    name: z.string().min(1, "Name is required and must be text"),
    uncheckedInChartsByDefault: z.string().optional(),
  }),
  handler: async (input, context) => {
    const userId = requireActionUserId(context.locals);

    try {
      await createType({
        name: input.name,
        uncheckedInChartsByDefault: input.uncheckedInChartsByDefault === "on",
        userId,
      });

      return { success: true };
    } catch (_error: unknown) {
      throw new ActionError({
        code: "INTERNAL_SERVER_ERROR",
        message: "Failed to create type",
      });
    }
  },
});

export const updateTypeAction = defineAction({
  accept: "form",
  input: z.object({
    typeId: z.string().min(1, "Type ID is required"),
    name: z.string().min(1, "Name is required and must be text"),
    uncheckedInChartsByDefault: z.string().optional(),
  }),
  handler: async (input, context) => {
    const userId = requireActionUserId(context.locals);

    try {
      await updateType({
        id: input.typeId,
        name: input.name,
        uncheckedInChartsByDefault: input.uncheckedInChartsByDefault === "on",
        userId,
      });

      return { success: true };
    } catch (_error: unknown) {
      throw new ActionError({
        code: "INTERNAL_SERVER_ERROR",
        message: "Failed to update type",
      });
    }
  },
});

export const deleteTypeAction = defineAction({
  accept: "form",
  input: z.object({
    typeId: z.string().min(1, "Type ID is required"),
  }),
  handler: async (input, context) => {
    const userId = requireActionUserId(context.locals);

    try {
      await deleteType({ id: input.typeId, userId });

      return { success: true };
    } catch (_error: unknown) {
      throw new ActionError({
        code: "INTERNAL_SERVER_ERROR",
        message: "Failed to delete type",
      });
    }
  },
});
