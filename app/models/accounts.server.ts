import type { User, Account } from "@prisma/client";
import type { SerializeFrom } from "@remix-run/node";

import { prisma } from "~/db.server";

export type SerializedAccount = SerializeFrom<Account>;

export type { Account } from "@prisma/client";

export function getAccount({
  id,
  userId,
}: Pick<Account, "id"> & {
  userId: User["id"];
}) {
  return prisma.account.findFirst({
    where: { id, userId },
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
  });

  return accounts;
}

export async function getAccountsForCharts({ userId }: { userId: User["id"] }) {
  const accounts = await prisma.account.findMany({
    where: {
      userId,
      showInGraphs: true,
    },
    orderBy: { createdAt: "desc" },
  });

  return accounts;
}

export function createAccount(
  account: Pick<Account, "name" | "color" | "showInGraphs" | "groupId">,
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
}: Pick<
  Account,
  "id" | "name" | "color" | "showInGraphs" | "userId" | "groupId" | "archived"
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
