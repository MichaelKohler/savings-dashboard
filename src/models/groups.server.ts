import type { Group, User } from "~/generated/prisma/client";

import { prisma } from "~/lib/db.server";

export type { Group } from "~/generated/prisma/client";

export async function getGroups({ userId }: { userId: User["id"] }) {
  return prisma.group.findMany({
    where: { userId },
    select: {
      id: true,
      name: true,
      uncheckedInChartsByDefault: true,
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
      uncheckedInChartsByDefault: true,
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

export function createGroup({
  name,
  uncheckedInChartsByDefault,
  userId,
}: Pick<Group, "name" | "uncheckedInChartsByDefault" | "userId">) {
  return prisma.group.create({
    data: { name, uncheckedInChartsByDefault, userId },
  });
}

export function updateGroup({
  id,
  name,
  uncheckedInChartsByDefault,
  userId,
}: Pick<Group, "id" | "name" | "uncheckedInChartsByDefault" | "userId">) {
  return prisma.group.update({
    where: { id, userId },
    data: { name, uncheckedInChartsByDefault },
  });
}

export function deleteGroup({ id, userId }: Pick<Group, "id" | "userId">) {
  return prisma.group.delete({
    where: { id, userId },
  });
}
