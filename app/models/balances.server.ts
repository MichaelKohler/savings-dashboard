import type { User, Account, Balance } from "@prisma/client";
import type { SerializeFrom } from "@remix-run/node";

import { prisma } from "~/db.server";
import { getAccounts } from "./accounts.server";

export type SerializedBalance = SerializeFrom<Balance>;

export type { Balance } from "@prisma/client";

type ChartDataEntry = {
  byAccount: Record<string, Balance["balance"] | string>;
  byGroup: Record<string, Balance["balance"] | string>;
  byType: Record<string, Balance["balance"] | string>;
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

type BalanceReducerTempType = {
  balance: number;
  type: string;
  group: string;
};

function reduceToBalance(
  byAccount: { [key: string]: number },
  [accountId, account]: [string, BalanceReducerTempType]
) {
  byAccount[accountId] = account.balance;
  return byAccount;
}

function reduceToGroupBalance(
  byGroup: { [key: string]: number },
  [_, account]: [string, BalanceReducerTempType]
) {
  const group = account.group;

  if (!byGroup[group]) {
    byGroup[group] = 0;
  }

  byGroup[group] += account.balance;
  return byGroup;
}

function reduceToTypeBalance(
  byType: { [key: string]: number },
  [_, account]: [string, BalanceReducerTempType]
) {
  const type = account.type;

  if (!byType[type]) {
    byType[type] = 0;
  }

  byType[type] += account.balance;
  return byType;
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
    return { balances: [], predictions: [] };
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
    const accountsMap: Record<
      string,
      {
        balance: number;
        type: string;
        group: string;
      }
    > = {};

    for (const balance of allBalances) {
      const balMonthKey = getMonthKey(balance.date);
      if (balMonthKey === monthKey) {
        lastKnownBalances[balance.accountId] = balance.balance;
      }
    }

    for (const accId in lastKnownBalances) {
      accountsMap[accId] = {
        type: accounts.find((acc) => acc.id === accId)?.type?.id || "",
        group: accounts.find((acc) => acc.id === accId)?.group?.id || "",
        balance: lastKnownBalances[accId],
      };
    }

    const total = Object.entries(accountsMap)
      .filter(([accountId]) => accountIdsForTotals.has(accountId))
      .map(([, account]) => account.balance)
      .reduce((a, b) => a + b, 0);

    result.push({
      date: monthKey,
      total,
      byAccount: Object.entries(accountsMap).reduce(reduceToBalance, {}),
      byGroup: Object.entries(accountsMap).reduce(reduceToGroupBalance, {}),
      byType: Object.entries(accountsMap).reduce(reduceToTypeBalance, {}),
    });

    monthCursor.setMonth(monthCursor.getMonth() + 1);
  }

  const removeEntriesAmount = parseInt(
    process.env.REMOVE_FIRST_X_ENTRIES_FROM_CHARTS || "0",
    10
  );
  result.splice(0, removeEntriesAmount);

  const lastTotal = result[result.length - 1].total;
  const predictions = getPredictedBalances(lastTotal);

  return { balances: result, predictions };
}

export function getPredictedBalances(currentTotal: number) {
  const predictionPercentages = process.env.PREDICTION_PERCENTAGES ?? "";
  const percentages = predictionPercentages?.split(",").map(Number);
  const result = [];

  const accumulatingTotals: { [key: number]: number } = {};
  for (const percentage of percentages) {
    accumulatingTotals[percentage] = currentTotal;
  }

  for (let i = 1; i <= 40; i++) {
    const totalsInYear: { year: number; [key: number]: number } = {
      year: new Date().getFullYear() + i,
    };
    for (const percentage of percentages) {
      accumulatingTotals[percentage] +=
        (accumulatingTotals[percentage] / 100) * percentage;
      totalsInYear[percentage] = Math.round(accumulatingTotals[percentage]);
    }
    result.push(totalsInYear);
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
