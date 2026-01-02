import { vi, beforeEach } from "vitest";
import { mockPrisma } from "../test-setup";

import {
  getBalance,
  getBalances,
  createBalance,
  updateBalance,
  deleteBalance,
  getBalancesForCharts,
  getPredictedBalances,
} from "./balances.server";

describe("balance models", () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });
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

  describe("getBalance", () => {
    beforeEach(() => {
      vi.clearAllMocks();
    });
    it("should return a single balance by id", async () => {
      mockPrisma.balance.findFirst.mockResolvedValue(balance);

      const result = await getBalance({ id: balance.id, userId: user.id });

      expect(result).toEqual(balance);
      expect(mockPrisma.balance.findFirst).toHaveBeenCalledWith({
        where: { id: balance.id, userId: user.id },
        select: {
          id: true,
          balance: true,
          date: true,
          accountId: true,
          userId: true,
          createdAt: true,
          updatedAt: true,
        },
      });
    });
  });

  describe("getBalances", () => {
    beforeEach(() => {
      vi.clearAllMocks();
    });
    it("should return a list of balances for a user", async () => {
      mockPrisma.balance.findMany.mockResolvedValue([balance]);

      const result = await getBalances({ userId: user.id });

      expect(result).toEqual([balance]);
      expect(mockPrisma.balance.findMany).toHaveBeenCalledWith({
        where: { userId: user.id },
        orderBy: { date: "desc" },
        select: {
          id: true,
          balance: true,
          date: true,
          createdAt: true,
          updatedAt: true,
          userId: true,
          accountId: true,
          account: {
            select: {
              id: true,
              name: true,
              color: true,
              showInGraphs: true,
              archived: true,
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
          },
        },
      });
    });
  });

  describe("createBalance", () => {
    beforeEach(() => {
      vi.clearAllMocks();
    });
    it("should create a new balance", async () => {
      mockPrisma.balance.create.mockResolvedValue(balance);

      const result = await createBalance(
        {
          date: balance.date,
          accountId: balance.accountId,
          balance: balance.balance,
        },
        user.id
      );

      expect(result).toEqual(balance);
      expect(mockPrisma.balance.create).toHaveBeenCalledWith({
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
    beforeEach(() => {
      vi.clearAllMocks();
    });
    it("should update a balance", async () => {
      mockPrisma.balance.findFirst.mockResolvedValue(balance);
      mockPrisma.balance.update.mockResolvedValue(balance);

      const result = await updateBalance(balance);

      expect(result).toEqual(balance);
      expect(mockPrisma.balance.update).toHaveBeenCalledWith({
        where: { id: balance.id },
        data: {
          date: balance.date,
          balance: balance.balance,
          accountId: balance.accountId,
        },
      });
    });

    it("should throw an error if balance is not found", async () => {
      mockPrisma.balance.findFirst.mockResolvedValue(null);
      await expect(updateBalance(balance)).rejects.toThrow("BALANCE_NOT_FOUND");
    });
  });

  describe("deleteBalance", () => {
    beforeEach(() => {
      vi.clearAllMocks();
    });
    it("should delete a balance", async () => {
      mockPrisma.balance.deleteMany.mockResolvedValue({ count: 1 });

      const result = await deleteBalance({ id: balance.id, userId: user.id });

      expect(result).toEqual({ count: 1 });
      expect(mockPrisma.balance.deleteMany).toHaveBeenCalledWith({
        where: { id: balance.id, userId: user.id },
      });
    });
  });

  describe("getBalancesForCharts", () => {
    beforeEach(() => {
      vi.clearAllMocks();
    });
    it("should return balances for charts", async () => {
      const accounts = [
        {
          id: "1",
          showInGraphs: true,
          type: { id: "t1" },
          group: { id: "g1" },
        },
        {
          id: "2",
          showInGraphs: false,
          type: { id: "t2" },
          group: { id: "g2" },
        },
      ];
      const balances = [
        { accountId: "1", date: new Date("2023-01-15"), balance: 100 },
        { accountId: "1", date: new Date("2023-02-15"), balance: 150 },
        { accountId: "2", date: new Date("2023-01-15"), balance: 200 },
      ];

      mockPrisma.account.findMany.mockResolvedValue(accounts);
      mockPrisma.balance.findMany.mockResolvedValue(balances);

      const { balances: result } = await getBalancesForCharts({
        userId: user.id,
      });

      expect(result.length).toBeGreaterThan(0);
      expect(result[0].total).toBe(100);
      expect(result[1].total).toBe(150);
    });

    it("should return empty array if no balances", async () => {
      mockPrisma.account.findMany.mockResolvedValue([
        {
          id: "1",
          showInGraphs: true,
          type: { id: "t1" },
          group: { id: "g1" },
        },
      ]);
      mockPrisma.balance.findMany.mockResolvedValue([]);

      const { balances: result } = await getBalancesForCharts({
        userId: user.id,
      });
      expect(result).toEqual([]);
    });
  });

  describe("getPredictedBalances", () => {
    beforeEach(() => {
      vi.clearAllMocks();
    });
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
