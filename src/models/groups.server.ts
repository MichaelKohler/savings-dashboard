import type { Group, User } from "@prisma/client";

import { prisma } from "~/lib/db.server";

export type { Group } from "@prisma/client";

export async function getGroups({ userId }: { userId: User["id"] }) {
  return prisma.group.findMany({
    where: { userId },
    select: {
      id: true,
      name: true,
      createdAt: true,
      updatedAt: true,
      userId: true,
      accounts: {
        select: {
          id: true,
          name: true,
          archived: true,
        },
      },
    },
    orderBy: { createdAt: "desc" },
  });
}

export async function getGroup({ id, userId }: Pick<Group, "id" | "userId">) {
  return prisma.group.findUnique({
    where: { id, userId },
    select: {
      id: true,
      name: true,
      createdAt: true,
      updatedAt: true,
      userId: true,
      accounts: {
        select: {
          id: true,
          name: true,
          archived: true,
        },
      },
    },
  });
}

export function createGroup({ name, userId }: Pick<Group, "name" | "userId">) {
  return prisma.group.create({
    data: { name, userId },
  });
}

export function updateGroup({
  id,
  name,
  userId,
}: Pick<Group, "id" | "name" | "userId">) {
  return prisma.group.update({
    where: { id, userId },
    data: { name },
  });
}

export function deleteGroup({ id, userId }: Pick<Group, "id" | "userId">) {
  return prisma.group.delete({
    where: { id, userId },
  });
}
