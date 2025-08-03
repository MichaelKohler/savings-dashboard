import { vi } from "vitest";

import { prisma } from "~/db.server";
import * as accountModel from "./accounts.server";
import {
  getBalance,
  getBalances,
  createBalance,
  updateBalance,
  deleteBalance,
  getBalancesForCharts,
  getPredictedBalances,
} from "./balances.server";

vi.mock("~/db.server");
vi.mock("./accounts.server");

describe("balance models", () => {
  const user = {
    id: "1",
    email: "test@example.com",
    createdAt: new Date(),
    updatedAt: new Date(),
  };

  const balance = {
    id: "1",
    date: new Date(),
    balance: 1000,
    accountId: "1",
    userId: user.id,
    createdAt: new Date(),
    updatedAt: new Date(),
  };

  const account = {
    id: "1",
    name: "Test Account",
    color: "#ff0000",
    showInGraphs: true,
    groupId: "1",
    typeId: "1",
    userId: user.id,
    archived: false,
    createdAt: new Date(),
    updatedAt: new Date(),
  };

  describe("getBalance", () => {
    it("should return a single balance by id", async () => {
      prisma.balance.findFirst.mockResolvedValue(balance);

      const result = await getBalance({ id: balance.id, userId: user.id });

      expect(result).toEqual(balance);
      expect(prisma.balance.findFirst).toHaveBeenCalledWith({
        where: { id: balance.id, userId: user.id },
      });
    });
  });

  describe("getBalances", () => {
    it("should return a list of balances for a user", async () => {
      prisma.balance.findMany.mockResolvedValue([balance]);

      const result = await getBalances({ userId: user.id });

      expect(result).toEqual([balance]);
      expect(prisma.balance.findMany).toHaveBeenCalledWith({
        where: { userId: user.id },
        orderBy: { date: "desc" },
        include: {
          account: {
            include: {
              group: true,
              type: true,
            },
          },
        },
      });
    });
  });

  describe("createBalance", () => {
    it("should create a new balance", async () => {
      prisma.balance.create.mockResolvedValue(balance);

      const result = await createBalance(
        {
          date: balance.date,
          accountId: balance.accountId,
          balance: balance.balance,
        },
        user.id
      );

      expect(result).toEqual(balance);
      expect(prisma.balance.create).toHaveBeenCalledWith({
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
              id: user.id,
            },
          },
        },
      });
    });
  });

  describe("updateBalance", () => {
    it("should update a balance", async () => {
      prisma.balance.findFirst.mockResolvedValue(balance);
      prisma.balance.update.mockResolvedValue(balance);

      const result = await updateBalance(balance);

      expect(result).toEqual(balance);
      expect(prisma.balance.update).toHaveBeenCalledWith({
        where: { id: balance.id },
        data: {
          date: balance.date,
          balance: balance.balance,
          accountId: balance.accountId,
        },
      });
    });

    it("should throw an error if balance is not found", async () => {
      prisma.balance.findFirst.mockResolvedValue(null);
      await expect(updateBalance(balance)).rejects.toThrow(
        "BALANCE_NOT_FOUND"
      );
    });
  });

  describe("deleteBalance", () => {
    it("should delete a balance", async () => {
      prisma.balance.deleteMany.mockResolvedValue({ count: 1 });

      const result = await deleteBalance({ id: balance.id, userId: user.id });

      expect(result).toEqual({ count: 1 });
      expect(prisma.balance.deleteMany).toHaveBeenCalledWith({
        where: { id: balance.id, userId: user.id },
      });
    });
  });

  describe("getBalancesForCharts", () => {
    it("should return balances for charts", async () => {
      const accounts = [
        { ...account, id: "1", showInGraphs: true, type: { id: "t1" }, group: { id: "g1" } },
        { ...account, id: "2", showInGraphs: false, type: { id: "t2" }, group: { id: "g2" } },
      ];
      const balances = [
        { ...balance, accountId: "1", date: new Date("2023-01-15"), balance: 100 },
        { ...balance, accountId: "1", date: new Date("2023-02-15"), balance: 150 },
        { ...balance, accountId: "2", date: new Date("2023-01-15"), balance: 200 },
      ];

      vi.spyOn(accountModel, "getAccounts").mockResolvedValue(accounts as any);
      prisma.balance.findMany.mockResolvedValue(balances as any);

      const { balances: result } = await getBalancesForCharts({ userId: user.id });

      expect(result.length).toBeGreaterThan(0);
      expect(result[0].total).toBe(100);
      expect(result[1].total).toBe(150);
    });

    it("should return empty array if no balances", async () => {
      vi.spyOn(accountModel, "getAccounts").mockResolvedValue([account] as any);
      prisma.balance.findMany.mockResolvedValue([]);

      const { balances: result } = await getBalancesForCharts({ userId: user.id });
      expect(result).toEqual([]);
    });
  });

  describe("getPredictedBalances", () => {
    it("should return predicted balances", () => {
      process.env.PREDICTION_PERCENTAGES = "5,10";
      const result = getPredictedBalances(1000);
      expect(result.length).toBe(40);
      expect(result[0].year).toBe(new Date().getFullYear() + 1);
      expect(result[0][5]).toBe(1050);
      expect(result[0][10]).toBe(1100);
    });
  });
});
