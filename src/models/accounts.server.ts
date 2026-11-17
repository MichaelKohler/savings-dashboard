import type { User, Account } from "~/generated/prisma/client";

import { prisma } from "~/lib/db.server";
import { getGroup } from "~/models/groups.server";
import { getType } from "~/models/types.server";

export type { Account } from "~/generated/prisma/client";

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
      uncheckedInChartsByDefault: true,
      createdAt: true,
      updatedAt: true,
      userId: true,
      groupId: true,
      typeId: true,
    },
  });
}

/**
 * Returns the user's accounts, optionally filtered by archived state.
 * `includeAccountId` keeps that account in the result regardless of the
 * archived filter, e.g. the current account of a balance being edited.
 */
export async function getAccounts({
  userId,
  archived,
  includeAccountId,
}: {
  userId: User["id"];
  archived?: Account["archived"];
  includeAccountId?: Account["id"];
}) {
  const archivedFilter =
    typeof archived === "undefined"
      ? {}
      : includeAccountId
        ? { OR: [{ archived }, { id: includeAccountId }] }
        : { archived };

  const accounts = await prisma.account.findMany({
    where: {
      userId,
      ...archivedFilter,
    },
    orderBy: { createdAt: "desc" },
    select: {
      id: true,
      name: true,
      color: true,
      showInGraphs: true,
      archived: true,
      uncheckedInChartsByDefault: true,
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

async function assertGroupAndTypeOwnership({
  groupId,
  typeId,
  userId,
}: Pick<Account, "groupId" | "typeId"> & { userId: User["id"] }) {
  if (groupId && !(await getGroup({ id: groupId, userId }))) {
    throw new Error("GROUP_NOT_FOUND");
  }

  if (typeId && !(await getType({ id: typeId, userId }))) {
    throw new Error("TYPE_NOT_FOUND");
  }
}

export async function createAccount(
  account: Pick<
    Account,
    | "name"
    | "color"
    | "showInGraphs"
    | "archived"
    | "uncheckedInChartsByDefault"
    | "groupId"
    | "typeId"
  >,
  userId: User["id"]
) {
  await assertGroupAndTypeOwnership({
    groupId: account.groupId,
    typeId: account.typeId,
    userId,
  });

  return prisma.account.create({
    data: {
      name: account.name,
      color: account.color,
      showInGraphs: account.showInGraphs,
      archived: account.archived,
      uncheckedInChartsByDefault: account.uncheckedInChartsByDefault,
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
  uncheckedInChartsByDefault,
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
  | "uncheckedInChartsByDefault"
  | "typeId"
>) {
  const account = await getAccount({ id, userId });

  if (!account) {
    throw new Error("ACCOUNT_NOT_FOUND");
  }

  await assertGroupAndTypeOwnership({ groupId, typeId, userId });

  return prisma.account.update({
    where: { id },
    data: {
      name,
      color,
      showInGraphs,
      groupId,
      archived,
      uncheckedInChartsByDefault,
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
