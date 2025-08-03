import type { Type, User } from "@prisma/client";

import { prisma } from "~/db.server";

export type { Type } from "@prisma/client";

export async function getTypes({ userId }: { userId: User["id"] }) {
  return prisma.type.findMany({
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

export async function getType({ id, userId }: Pick<Type, "id" | "userId">) {
  return prisma.type.findUnique({
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

export function createType({ name, userId }: Pick<Type, "name" | "userId">) {
  return prisma.type.create({
    data: { name, userId },
  });
}

export function updateType({
  id,
  name,
  userId,
}: Pick<Type, "id" | "name" | "userId">) {
  return prisma.type.update({
    where: { id, userId },
    data: { name },
  });
}

export function deleteType({ id, userId }: Pick<Type, "id" | "userId">) {
  return prisma.type.delete({
    where: { id, userId },
  });
}
