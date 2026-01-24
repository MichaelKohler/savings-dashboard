import { vi, beforeEach } from "vitest";
import { mockPrisma } from "../test-setup";

import {
  getTypes,
  getType,
  createType,
  updateType,
  deleteType,
} from "./types.server";

describe("type models", () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });
  const user = {
    id: "1",
    email: "test@example.com",
    createdAt: new Date(),
    updatedAt: new Date(),
  };

  const type = {
    id: "1",
    name: "Test Type",
    userId: user.id,
    accounts: [],
    createdAt: new Date(),
    updatedAt: new Date(),
  };

  describe("getTypes", () => {
    beforeEach(() => {
      vi.clearAllMocks();
    });
    it("should return a list of types for a user", async () => {
      mockPrisma.type.findMany.mockResolvedValue([type]);

      const result = await getTypes({ userId: user.id });

      expect(result).toEqual([type]);
      expect(mockPrisma.type.findMany).toHaveBeenCalledWith({
        where: { userId: user.id },
        select: {
          id: true,
          name: true,
          createdAt: true,
          updatedAt: true,
          userId: true,
          accounts: {
            select: {
              id: true,
              name: true,
              archived: true,
            },
          },
        },
        orderBy: { createdAt: "desc" },
      });
    });
  });

  describe("getType", () => {
    beforeEach(() => {
      vi.clearAllMocks();
    });
    it("should return a single type by id", async () => {
      mockPrisma.type.findUnique.mockResolvedValue(type);

      const result = await getType({ id: type.id, userId: user.id });

      expect(result).toEqual(type);
      expect(mockPrisma.type.findUnique).toHaveBeenCalledWith({
        where: { id: type.id, userId: user.id },
        select: {
          id: true,
          name: true,
          createdAt: true,
          updatedAt: true,
          userId: true,
          accounts: {
            select: {
              id: true,
              name: true,
              archived: true,
            },
          },
        },
      });
    });
  });

  describe("createType", () => {
    beforeEach(() => {
      vi.clearAllMocks();
    });
    it("should create a new type", async () => {
      mockPrisma.type.create.mockResolvedValue(type);

      const result = await createType({ name: type.name, userId: user.id });

      expect(result).toEqual(type);
      expect(mockPrisma.type.create).toHaveBeenCalledWith({
        data: { name: type.name, userId: user.id },
      });
    });
  });

  describe("updateType", () => {
    beforeEach(() => {
      vi.clearAllMocks();
    });
    it("should update a type", async () => {
      mockPrisma.type.update.mockResolvedValue(type);

      const result = await updateType({
        id: type.id,
        name: type.name,
        userId: user.id,
      });

      expect(result).toEqual(type);
      expect(mockPrisma.type.update).toHaveBeenCalledWith({
        where: { id: type.id, userId: user.id },
        data: { name: type.name },
      });
    });
  });

  describe("deleteType", () => {
    beforeEach(() => {
      vi.clearAllMocks();
    });
    it("should delete a type", async () => {
      mockPrisma.type.delete.mockResolvedValue(type);

      const result = await deleteType({ id: type.id, userId: user.id });

      expect(result).toEqual(type);
      expect(mockPrisma.type.delete).toHaveBeenCalledWith({
        where: { id: type.id, userId: user.id },
      });
    });
  });
});
