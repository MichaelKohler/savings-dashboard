import {
  getAccount,
  getAccounts,
  createAccount,
  updateAccount,
  deleteAccount,
} from "./accounts.server";
import { prisma } from "~/db.server";

vi.mock("~/db.server", () => ({
  prisma: {
    account: {
      findFirst: vi.fn(),
      findMany: vi.fn(),
      create: vi.fn(),
      update: vi.fn(),
      deleteMany: vi.fn(),
    },
  },
}));

import type { Account } from "@prisma/client";

describe("models/accounts", () => {
  const mockAccount: Account = {
    id: "1",
    name: "Test Account",
    color: "#ff0000",
    showInGraphs: true,
    archived: false,
    userId: "1",
    groupId: null,
    typeId: null,
    createdAt: new Date(),
    updatedAt: new Date(),
  };

  afterEach(() => {
    vi.clearAllMocks();
  });

  describe("getAccount", () => {
    it("should return an account if found", async () => {
      vi.mocked(prisma.account.findFirst).mockResolvedValue(mockAccount);

      const account = await getAccount({ id: "1", userId: "1" });

      expect(prisma.account.findFirst).toHaveBeenCalledWith({
        where: { id: "1", userId: "1" },
      });
      expect(account).toEqual(mockAccount);
    });

    it("should return null if account not found", async () => {
      vi.mocked(prisma.account.findFirst).mockResolvedValue(null);

      const account = await getAccount({ id: "1", userId: "1" });

      expect(account).toBeNull();
    });
  });

  describe("getAccounts", () => {
    it("should return a list of accounts", async () => {
      const mockAccounts = [mockAccount];
      vi.mocked(prisma.account.findMany).mockResolvedValue(mockAccounts);

      const accounts = await getAccounts({ userId: "1" });

      expect(prisma.account.findMany).toHaveBeenCalledWith({
        where: { userId: "1" },
        orderBy: { createdAt: "desc" },
        include: {
          group: true,
          type: true,
        },
      });
      expect(accounts).toEqual(mockAccounts);
    });

    it("should filter by archived status if provided", async () => {
      await getAccounts({ userId: "1", archived: true });
      expect(prisma.account.findMany).toHaveBeenCalledWith(
        expect.objectContaining({
          where: { userId: "1", archived: true },
        })
      );

      await getAccounts({ userId: "1", archived: false });
      expect(prisma.account.findMany).toHaveBeenCalledWith(
        expect.objectContaining({
          where: { userId: "1", archived: false },
        })
      );
    });
  });

  describe("createAccount", () => {
    it("should create a new account", async () => {
      const newAccountData = {
        name: "New Account",
        color: "#ffffff",
        showInGraphs: true,
        groupId: null,
        typeId: null,
      };
      vi.mocked(prisma.account.create).mockResolvedValue({
        ...mockAccount,
        ...newAccountData,
      });

      const result = await createAccount(newAccountData, "1");

      expect(prisma.account.create).toHaveBeenCalledWith({
        data: {
          ...newAccountData,
          user: { connect: { id: "1" } },
        },
      });
      expect(result.name).toEqual(newAccountData.name);
    });
  });

  describe("updateAccount", () => {
    it("should update an existing account", async () => {
      const updatedAccountData = {
        ...mockAccount,
        name: "New Name",
        color: "#000000",
        showInGraphs: false,
        groupId: "g1",
        typeId: "t1",
        archived: true,
      };
      vi.mocked(prisma.account.findFirst).mockResolvedValue(mockAccount);
      vi.mocked(prisma.account.update).mockResolvedValue(updatedAccountData);

      const result = await updateAccount(updatedAccountData);

      expect(prisma.account.findFirst).toHaveBeenCalledWith({
        where: {
          id: "1",
          userId: "1",
        },
      });
      expect(prisma.account.update).toHaveBeenCalledWith({
        where: { id: "1" },
        data: {
          name: "New Name",
          color: "#000000",
          showInGraphs: false,
          groupId: "g1",
          typeId: "t1",
          archived: true,
        },
      });
      expect(result.name).toBe("New Name");
    });

    it("should throw an error if account not found", async () => {
      vi.mocked(prisma.account.findFirst).mockResolvedValue(null);
      await expect(updateAccount(mockAccount)).rejects.toThrow(
        "ACCOUNT_NOT_FOUND"
      );
    });
  });

  describe("deleteAccount", () => {
    it("should delete an account", async () => {
      vi.mocked(prisma.account.deleteMany).mockResolvedValue({ count: 1 });

      const result = await deleteAccount({ id: "1", userId: "1" });

      expect(prisma.account.deleteMany).toHaveBeenCalledWith({
        where: { id: "1", userId: "1" },
      });
      expect(result).toEqual({ count: 1 });
    });
  });
});
