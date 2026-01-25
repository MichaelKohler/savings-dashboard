import { vi, beforeEach } from "vitest";

import {
  getAccount,
  getAccounts,
  createAccount,
  updateAccount,
  deleteAccount,
} from "./accounts.server";
import { mockPrisma } from "../test-setup";

describe("account models", () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });
  const user = {
    id: "1",
    email: "test@example.com",
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

  describe("getAccount", () => {
    it("should return a single account by id", async () => {
      mockPrisma.account.findFirst.mockResolvedValue(account);

      const result = await getAccount({ id: account.id, userId: user.id });

      expect(result).toEqual(account);
      expect(mockPrisma.account.findFirst).toHaveBeenCalledWith({
        where: { id: account.id, userId: user.id },
        select: {
          id: true,
          name: true,
          color: true,
          showInGraphs: true,
          archived: true,
          createdAt: true,
          updatedAt: true,
          userId: true,
          groupId: true,
          typeId: true,
        },
      });
    });
  });

  describe("getAccounts", () => {
    it("should return a list of accounts for a user", async () => {
      mockPrisma.account.findMany.mockResolvedValue([account]);

      const result = await getAccounts({ userId: user.id });

      expect(result).toEqual([account]);
      expect(mockPrisma.account.findMany).toHaveBeenCalledWith({
        where: { userId: user.id },
        orderBy: { createdAt: "desc" },
        select: {
          id: true,
          name: true,
          color: true,
          showInGraphs: true,
          archived: true,
          createdAt: true,
          updatedAt: true,
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
      });
    });

    it("should return a list of archived accounts for a user", async () => {
      mockPrisma.account.findMany.mockResolvedValue([account]);

      const result = await getAccounts({ userId: user.id, archived: true });

      expect(result).toEqual([account]);
      expect(mockPrisma.account.findMany).toHaveBeenCalledWith({
        where: { archived: true, userId: user.id },
        orderBy: { createdAt: "desc" },
        select: {
          id: true,
          name: true,
          color: true,
          showInGraphs: true,
          archived: true,
          createdAt: true,
          updatedAt: true,
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
      });
    });
  });

  describe("createAccount", () => {
    it("should create a new account", async () => {
      mockPrisma.account.create.mockResolvedValue(account);

      const result = await createAccount(
        {
          name: account.name,
          color: account.color,
          showInGraphs: account.showInGraphs,
          archived: account.archived,
          groupId: account.groupId,
          typeId: account.typeId,
        },
        user.id
      );

      expect(result).toEqual(account);
      expect(mockPrisma.account.create).toHaveBeenCalledWith({
        data: {
          name: account.name,
          color: account.color,
          showInGraphs: account.showInGraphs,
          archived: account.archived,
          group: {
            connect: {
              id: account.groupId,
            },
          },
          type: {
            connect: {
              id: account.typeId,
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

  describe("updateAccount", () => {
    it("should update an account", async () => {
      mockPrisma.account.findFirst.mockResolvedValue(account);
      mockPrisma.account.update.mockResolvedValue(account);

      const result = await updateAccount(account);

      expect(result).toEqual(account);
      expect(mockPrisma.account.update).toHaveBeenCalledWith({
        where: { id: account.id },
        data: {
          name: account.name,
          color: account.color,
          showInGraphs: account.showInGraphs,
          groupId: account.groupId,
          archived: account.archived,
          typeId: account.typeId,
        },
      });
    });

    it("should throw an error if account is not found", async () => {
      mockPrisma.account.findFirst.mockResolvedValue(null);
      await expect(updateAccount(account)).rejects.toThrow("ACCOUNT_NOT_FOUND");
    });
  });

  describe("deleteAccount", () => {
    it("should delete an account", async () => {
      mockPrisma.account.deleteMany.mockResolvedValue({ count: 1 });

      const result = await deleteAccount({ id: account.id, userId: user.id });

      expect(result).toEqual({ count: 1 });
      expect(mockPrisma.account.deleteMany).toHaveBeenCalledWith({
        where: { id: account.id, userId: user.id },
      });
    });
  });
});
