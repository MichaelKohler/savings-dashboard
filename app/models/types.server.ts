import { prisma } from "~/db.server";
import type { Type, User } from "@prisma/client";

export type { Type } from "@prisma/client";

export async function getTypes({ userId }: { userId: User["id"] }) {
  return prisma.type.findMany({
    where: { userId },
    include: {
      accounts: true,
    },
  });
}

export async function getType({ id, userId }: Pick<Type, "id" | "userId">) {
  return prisma.type.findUnique({
    where: { id, userId },
    include: {
      accounts: true,
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
