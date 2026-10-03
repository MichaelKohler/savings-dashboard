import type { Type, User } from "~/generated/prisma/client";

import { prisma } from "~/lib/db.server";

export type { Type } from "~/generated/prisma/client";

export async function getTypes({ userId }: { userId: User["id"] }) {
  return prisma.type.findMany({
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

export async function getType({ id, userId }: Pick<Type, "id" | "userId">) {
  return prisma.type.findUnique({
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

export function createType({
  name,
  uncheckedInChartsByDefault,
  userId,
}: Pick<Type, "name" | "uncheckedInChartsByDefault" | "userId">) {
  return prisma.type.create({
    data: { name, uncheckedInChartsByDefault, userId },
  });
}

export function updateType({
  id,
  name,
  uncheckedInChartsByDefault,
  userId,
}: Pick<Type, "id" | "name" | "uncheckedInChartsByDefault" | "userId">) {
  return prisma.type.update({
    where: { id, userId },
    data: { name, uncheckedInChartsByDefault },
  });
}

export function deleteType({ id, userId }: Pick<Type, "id" | "userId">) {
  return prisma.type.delete({
    where: { id, userId },
  });
}
