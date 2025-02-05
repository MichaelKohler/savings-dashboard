import type { User, Account, Balance } from "@prisma/client";
import type { SerializeFrom } from "@remix-run/node";

import { prisma } from "~/db.server";
import { getAccounts } from "./accounts.server";

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
      account: {
        include: {
          group: true,
          type: true,
        },
      },
    },
  });

  return balances;
}

function getMonthKey(date: Date) {
  return `${date.getFullYear()}-${String(date.getMonth() + 1).padStart(
    2,
    "0"
  )}`;
}

export async function getBalancesForCharts({ userId }: { userId: User["id"] }) {
  const accounts = await getAccounts({ userId });
  const accountIdsForTotals = new Set(
    accounts
      .filter((account) => account.showInGraphs)
      .map((account) => account.id)
  );
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
  const lastKnownBalances: Record<string, number> = {};

  while (monthCursor <= currentMonth) {
    const monthKey = getMonthKey(monthCursor);
    const accountsMap: Record<string, number> = {};

    for (const balance of allBalances) {
      const balMonthKey = getMonthKey(balance.date);
      if (balMonthKey === monthKey) {
        lastKnownBalances[balance.accountId] = balance.balance;
      }
    }

    for (const accId in lastKnownBalances) {
      accountsMap[accId] = lastKnownBalances[accId];
    }

    const total = Object.entries(accountsMap)
      .filter(([accountId]) => accountIdsForTotals.has(accountId))
      .map(([, balance]) => balance)
      .reduce((a, b) => a + b, 0);

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
