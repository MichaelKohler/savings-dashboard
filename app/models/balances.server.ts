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

export async function getBalances({ userId }: { userId: User["id"] }) {
  const balances = await prisma.balance.findMany({
    where: { userId },
    orderBy: { date: "desc" },
    include: {
      account: true,
    },
  });

  return balances;
}

export async function getBalancesForCharts({ userId }: { userId: User["id"] }) {
  const balances = await getBalances({ userId });
  const groupedBalances = balances.reduce(
    (series: ChartDataEntry[], balance) => {
      const date = balance.date.toISOString().substring(0, 10);
      let dateEntry = series.find(
        (entry: ChartDataEntry) => entry.date === date
      );

      if (!dateEntry) {
        dateEntry = {
          date,
          total: 0,
        };
        series.push(dateEntry);
      }

      dateEntry[balance.accountId] = balance.balance;
      dateEntry.total += balance.balance;

      return series;
    },
    []
  );

  const sortedBalances = groupedBalances.sort((a, b) => {
    return a.date.localeCompare(b.date);
  });

  return sortedBalances;
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
