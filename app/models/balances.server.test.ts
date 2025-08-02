import * as accountsServer from "./accounts.server";
import {
  getBalance,
  getBalances,
  createBalance,
  updateBalance,
  deleteBalance,
  getBalancesForCharts,
  getPredictedBalances,
} from "./balances.server";
import { prisma } from "~/db.server";
import type { Balance, Account, Group, Type } from "@prisma/client";

vi.mock("~/db.server", () => ({
  prisma: {
    balance: {
      findFirst: vi.fn(),
      findMany: vi.fn(),
      create: vi.fn(),
      update: vi.fn(),
      deleteMany: vi.fn(),
    },
  },
}));

vi.mock("./accounts.server", async () => {
  const actual = await vi.importActual("./accounts.server");
  return {
    ...actual,
    getAccounts: vi.fn(),
  };
});

describe("models/balances", () => {
  const mockBalance: Balance = {
    id: "1",
    balance: 100,
    date: new Date(),
    accountId: "a1",
    userId: "1",
    createdAt: new Date(),
    updatedAt: new Date(),
  };

  afterEach(() => {
    vi.clearAllMocks();
  });

  describe("getBalance", () => {
    it("should return a balance if found", async () => {
      vi.mocked(prisma.balance.findFirst).mockResolvedValue(mockBalance);
      const balance = await getBalance({ id: "1", userId: "1" });
      expect(prisma.balance.findFirst).toHaveBeenCalledWith({
        where: { id: "1", userId: "1" },
      });
      expect(balance).toEqual(mockBalance);
    });
  });

  describe("getBalances", () => {
    it("should return a list of balances", async () => {
      const mockBalances = [mockBalance];
      vi.mocked(prisma.balance.findMany).mockResolvedValue(mockBalances);
      const balances = await getBalances({ userId: "1" });
      expect(prisma.balance.findMany).toHaveBeenCalledWith({
        where: { userId: "1" },
        orderBy: { date: "desc" },
        include: expect.any(Object),
      });
      expect(balances).toEqual(mockBalances);
    });
  });

  describe("createBalance", () => {
    it("should create a new balance", async () => {
      const newBalanceData = {
        date: new Date(),
        accountId: "a1",
        balance: 150,
      };
      vi.mocked(prisma.balance.create).mockResolvedValue({
        ...mockBalance,
        ...newBalanceData,
      });
      const result = await createBalance(newBalanceData, "1");
      expect(prisma.balance.create).toHaveBeenCalledWith({
        data: {
          date: newBalanceData.date,
          balance: newBalanceData.balance,
          user: { connect: { id: "1" } },
          account: { connect: { id: "a1" } },
        },
      });
      expect(result.balance).toEqual(newBalanceData.balance);
    });
  });

  describe("updateBalance", () => {
    it("should update an existing balance", async () => {
      const updatedData = {
        ...mockBalance,
        balance: 200,
      };
      vi.mocked(prisma.balance.findFirst).mockResolvedValue(mockBalance);
      vi.mocked(prisma.balance.update).mockResolvedValue(updatedData);
      const result = await updateBalance(updatedData);
      expect(prisma.balance.update).toHaveBeenCalledWith({
        where: { id: "1" },
        data: {
          date: updatedData.date,
          balance: 200,
          accountId: "a1",
        },
      });
      expect(result.balance).toBe(200);
    });
  });

  describe("deleteBalance", () => {
    it("should delete a balance", async () => {
      vi.mocked(prisma.balance.deleteMany).mockResolvedValue({ count: 1 });
      const result = await deleteBalance({ id: "1", userId: "1" });
      expect(prisma.balance.deleteMany).toHaveBeenCalledWith({
        where: { id: "1", userId: "1" },
      });
      expect(result).toEqual({ count: 1 });
    });
  });

  describe("getPredictedBalances", () => {
    it("should calculate predicted balances based on percentages", () => {
      process.env.PREDICTION_PERCENTAGES = "5,10";
      const predictions = getPredictedBalances(1000);
      expect(predictions).toHaveLength(40);
      expect(predictions[0][5]).toBe(1050);
      expect(predictions[0][10]).toBe(1100);
      expect(predictions[1][5]).toBe(1103); // 1050 * 1.05 rounded
    });
  });

  describe("getBalancesForCharts", () => {
    it("should return correct chart data", async () => {
      vi.spyOn(accountsServer, "getAccounts").mockResolvedValue([
        {
          id: "a1",
          name: "Acc 1",
          showInGraphs: true,
          type: { id: "t1", name: "Type 1", userId: "1" },
          group: { id: "g1", name: "Group 1", userId: "1" },
        },
        {
          id: "a2",
          name: "Acc 2",
          showInGraphs: false,
          type: { id: "t2", name: "Type 2", userId: "1" },
          group: { id: "g2", name: "Group 2", userId: "1" },
        },
      ] as (Account & { group: Group | null; type: Type | null })[]);

      vi.mocked(prisma.balance.findMany).mockResolvedValue([
        {
          ...mockBalance,
          accountId: "a1",
          balance: 100,
          date: new Date("2023-01-15"),
        },
        {
          ...mockBalance,
          accountId: "a2",
          balance: 200,
          date: new Date("2023-01-20"),
        },
        {
          ...mockBalance,
          accountId: "a1",
          balance: 120,
          date: new Date("2023-02-10"),
        },
      ]);

      const { balances } = await getBalancesForCharts({ userId: "1" });

      // We expect data from Jan 2023 up to the current month.
      // This test might be fragile if run at the start of a new year.
      // For now, we will check the first few months.
      expect(balances[0].date).toBe("2023-01");
      expect(balances[0].total).toBe(100);
      expect(balances[0].byAccount).toEqual({ a1: 100, a2: 200 });

      expect(balances[1].date).toBe("2023-02");
      expect(balances[1].total).toBe(120);
      expect(balances[1].byAccount).toEqual({ a1: 120, a2: 200 });
    });
  });
});
