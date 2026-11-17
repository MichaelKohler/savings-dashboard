import { defineAction, ActionError } from "astro:actions";
import { z } from "zod";
import { requireActionUserId } from "~/lib/session.server";
import { createGroup, updateGroup, deleteGroup } from "~/models/groups.server";

export const createGroupAction = defineAction({
  accept: "form",
  input: z.object({
    name: z.string().min(1, "Name is required and must be text"),
    uncheckedInChartsByDefault: z.string().optional(),
  }),
  handler: async (input, context) => {
    const userId = requireActionUserId(context.locals);

    try {
      await createGroup({
        name: input.name,
        uncheckedInChartsByDefault: input.uncheckedInChartsByDefault === "on",
        userId,
      });

      return { success: true };
    } catch (_error: unknown) {
      throw new ActionError({
        code: "INTERNAL_SERVER_ERROR",
        message: "Failed to create group",
      });
    }
  },
});

export const updateGroupAction = defineAction({
  accept: "form",
  input: z.object({
    groupId: z.string().min(1, "Group ID is required"),
    name: z.string().min(1, "Name is required and must be text"),
    uncheckedInChartsByDefault: z.string().optional(),
  }),
  handler: async (input, context) => {
    const userId = requireActionUserId(context.locals);

    try {
      await updateGroup({
        id: input.groupId,
        name: input.name,
        uncheckedInChartsByDefault: input.uncheckedInChartsByDefault === "on",
        userId,
      });

      return { success: true };
    } catch (_error: unknown) {
      throw new ActionError({
        code: "INTERNAL_SERVER_ERROR",
        message: "Failed to update group",
      });
    }
  },
});

export const deleteGroupAction = defineAction({
  accept: "form",
  input: z.object({
    groupId: z.string().min(1, "Group ID is required"),
  }),
  handler: async (input, context) => {
    const userId = requireActionUserId(context.locals);

    try {
      await deleteGroup({ id: input.groupId, userId });

      return { success: true };
    } catch (_error: unknown) {
      throw new ActionError({
        code: "INTERNAL_SERVER_ERROR",
        message: "Failed to delete group",
      });
    }
  },
});
