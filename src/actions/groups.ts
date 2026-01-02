import { defineAction, ActionError } from "astro:actions";
import { z } from "astro:schema";
import { requireUserId } from "~/lib/session.server";
import { createGroup, updateGroup, deleteGroup } from "~/models/groups.server";

export const createGroupAction = defineAction({
  accept: "form",
  input: z.object({
    name: z.string().min(1, "Name is required and must be text"),
  }),
  handler: async (input, context) => {
    try {
      const userId = await requireUserId(context.cookies);

      await createGroup({ name: input.name, userId });

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
  }),
  handler: async (input, context) => {
    try {
      const userId = await requireUserId(context.cookies);

      await updateGroup({
        id: input.groupId,
        name: input.name,
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
    try {
      const userId = await requireUserId(context.cookies);

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
