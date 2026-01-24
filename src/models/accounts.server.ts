import type { User, Account } from "@prisma/client";

import { prisma } from "~/lib/db.server";

export type { Account } from "@prisma/client";

export function getAccount({
  id,
  userId,
}: Pick<Account, "id"> & {
  userId: User["id"];
}) {
  return prisma.account.findFirst({
    where: { id, userId },
    select: {
      id: true,
      name: true,
      color: true,
      showInGraphs: true,
      archived: true,
      createdAt: true,
      updatedAt: true,
      userId: true,
      groupId: true,
      typeId: true,
    },
  });
}

export async function getAccounts({
  userId,
  archived,
}: {
  userId: User["id"];
  archived?: Account["archived"];
}) {
  const accounts = await prisma.account.findMany({
    where: {
      userId,
      ...(typeof archived !== "undefined" ? { archived } : {}),
    },
    orderBy: { createdAt: "desc" },
    select: {
      id: true,
      name: true,
      color: true,
      showInGraphs: true,
      archived: true,
      createdAt: true,
      updatedAt: true,
      userId: true,
      groupId: true,
      typeId: true,
      group: {
        select: {
          id: true,
          name: true,
          createdAt: true,
          updatedAt: true,
          userId: true,
        },
      },
      type: {
        select: {
          id: true,
          name: true,
          createdAt: true,
          updatedAt: true,
          userId: true,
        },
      },
    },
  });

  return accounts;
}

export function createAccount(
  account: Pick<
    Account,
    "name" | "color" | "showInGraphs" | "groupId" | "typeId"
  >,
  userId: User["id"]
) {
  return prisma.account.create({
    data: {
      name: account.name,
      color: account.color,
      showInGraphs: account.showInGraphs,
      ...(account.groupId
        ? {
            group: {
              connect: {
                id: account.groupId,
              },
            },
          }
        : {}),
      ...(account.typeId
        ? {
            type: {
              connect: {
                id: account.typeId,
              },
            },
          }
        : {}),
      user: {
        connect: {
          id: userId,
        },
      },
    },
  });
}

export async function updateAccount({
  id,
  userId,
  name,
  color,
  showInGraphs,
  groupId,
  archived,
  typeId,
}: Pick<
  Account,
  | "id"
  | "name"
  | "color"
  | "showInGraphs"
  | "userId"
  | "groupId"
  | "archived"
  | "typeId"
>) {
  const account = await getAccount({ id, userId });

  if (!account) {
    throw new Error("ACCOUNT_NOT_FOUND");
  }

  return prisma.account.update({
    where: { id },
    data: {
      name,
      color,
      showInGraphs,
      groupId,
      archived,
      typeId,
    },
  });
}

export function deleteAccount({
  id,
  userId,
}: Pick<Account, "id"> & { userId: User["id"] }) {
  return prisma.account.deleteMany({
    where: { id, userId },
  });
}
