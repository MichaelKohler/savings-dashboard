import type { User, Account } from "@prisma/client";

import { prisma } from "~/db.server";

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

export async function getAccounts({ userId }: { userId: User["id"] }) {
  const accounts = await prisma.account.findMany({
    where: { userId },
    orderBy: { createdAt: "desc" },
  });

  return accounts;
}

export function createAccount(
  account: Pick<Account, "name" | "color">,
  userId: User["id"]
) {
  return prisma.account.create({
    data: {
      name: account.name,
      color: account.color,
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
}: Pick<Account, "id" | "name" | "color" | "userId">) {
  const account = await getAccount({ id, userId });

  if (!account) {
    throw new Error("ACCOUNT_NOT_FOUND");
  }

  return prisma.account.update({
    where: { id },
    data: {
      name,
      color,
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
