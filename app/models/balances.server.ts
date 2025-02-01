import type { User, Account, Balance } from "@prisma/client";
import type { SerializeFrom } from "@remix-run/node";

import { prisma } from "~/db.server";

export type SerializedBalance = SerializeFrom<Balance>;

export type { Balance } from "@prisma/client";

type ChartDataEntry = {
  [key: string]: Balance["balance"] | string;
  date: string;
  total: number;
};

export function getBalance({
  id,
  userId,
}: Pick<Account, "id"> & {
  userId: User["id"];
}) {
  return prisma.balance.findFirst({
    where: { id, userId },
  });
}

export async function getBalances({
  userId,
  order = "desc",
}: {
  userId: User["id"];
  order?: "desc" | "asc";
}) {
  const balances = await prisma.balance.findMany({
    where: { userId },
    orderBy: { date: order },
    include: {
      account: true,
    },
  });

  return balances;
}

export async function getBalancesForCharts({ userId }: { userId: User["id"] }) {
  const allBalances = await getBalances({ userId, order: "asc" });

  if (!allBalances.length) {
    return [];
  }

  const earliestDate = new Date(
    allBalances[0].date.getFullYear(),
    allBalances[0].date.getMonth(),
    1
  );
  const today = new Date();
  const currentMonth = new Date(today.getFullYear(), today.getMonth(), 1);

  const result: ChartDataEntry[] = [];
  const monthCursor = new Date(earliestDate);

  while (monthCursor <= currentMonth) {
    const monthKey = `${monthCursor.getFullYear()}-${String(
      monthCursor.getMonth() + 1
    ).padStart(2, "0")}`;
    const accountsMap: Record<string, number> = {};

    for (const balance of allBalances) {
      const balMonthKey = `${balance.date.getFullYear()}-${String(
        balance.date.getMonth() + 1
      ).padStart(2, "0")}`;
      if (balMonthKey === monthKey) {
        accountsMap[balance.accountId] = balance.balance;
      }
    }

    let total = 0;

    for (const accId in accountsMap) {
      total += accountsMap[accId];
    }

    result.push({
      date: monthKey,
      total,
      ...accountsMap,
    });

    monthCursor.setMonth(monthCursor.getMonth() + 1);
  }

  return result;
}

export function createBalance(
  balance: Pick<Balance, "date" | "accountId" | "balance">,
  userId: User["id"]
) {
  return prisma.balance.create({
    data: {
      date: balance.date,
      balance: balance.balance,
      account: {
        connect: {
          id: balance.accountId,
        },
      },
      user: {
        connect: {
          id: userId,
        },
      },
    },
  });
}

export async function updateBalance({
  id,
  userId,
  date,
  balance,
  accountId,
}: Pick<Balance, "id" | "date" | "balance" | "userId" | "accountId">) {
  const existingBalance = await getBalance({ id, userId });

  if (!existingBalance) {
    throw new Error("BALANCE_NOT_FOUND");
  }

  return prisma.balance.update({
    where: { id },
    data: {
      date,
      balance,
      accountId,
    },
  });
}

export function deleteBalance({
  id,
  userId,
}: Pick<Balance, "id"> & { userId: User["id"] }) {
  return prisma.balance.deleteMany({
    where: { id, userId },
  });
}
