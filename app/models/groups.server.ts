import type { Group, User } from "@prisma/client";

import { prisma } from "~/db.server";

export type { Group } from "@prisma/client";

export async function getGroups({ userId }: { userId: User["id"] }) {
  return prisma.group.findMany({
    where: { userId },
    include: {
      accounts: true,
    },
  });
}

export async function getGroup({ id, userId }: Pick<Group, "id" | "userId">) {
  return prisma.group.findUnique({
    where: { id, userId },
    include: {
      accounts: true,
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
