import { vi } from "vitest";

import { prisma } from "~/db.server";
import {
  getTypes,
  getType,
  createType,
  updateType,
  deleteType,
} from "./types.server";

vi.mock("~/db.server");

describe("type models", () => {
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
  };

  describe("getTypes", () => {
    it("should return a list of types for a user", async () => {
      prisma.type.findMany.mockResolvedValue([type]);

      const result = await getTypes({ userId: user.id });

      expect(result).toEqual([type]);
      expect(prisma.type.findMany).toHaveBeenCalledWith({
        where: { userId: user.id },
        include: {
          accounts: true,
        },
      });
    });
  });

  describe("getType", () => {
    it("should return a single type by id", async () => {
      prisma.type.findUnique.mockResolvedValue(type);

      const result = await getType({ id: type.id, userId: user.id });

      expect(result).toEqual(type);
      expect(prisma.type.findUnique).toHaveBeenCalledWith({
        where: { id: type.id, userId: user.id },
        include: {
          accounts: true,
        },
      });
    });
  });

  describe("createType", () => {
    it("should create a new type", async () => {
      prisma.type.create.mockResolvedValue(type);

      const result = await createType({ name: type.name, userId: user.id });

      expect(result).toEqual(type);
      expect(prisma.type.create).toHaveBeenCalledWith({
        data: { name: type.name, userId: user.id },
      });
    });
  });

  describe("updateType", () => {
    it("should update a type", async () => {
      prisma.type.update.mockResolvedValue(type);

      const result = await updateType({
        id: type.id,
        name: type.name,
        userId: user.id,
      });

      expect(result).toEqual(type);
      expect(prisma.type.update).toHaveBeenCalledWith({
        where: { id: type.id, userId: user.id },
        data: { name: type.name },
      });
    });
  });

  describe("deleteType", () => {
    it("should delete a type", async () => {
      prisma.type.delete.mockResolvedValue(type);

      const result = await deleteType({ id: type.id, userId: user.id });

      expect(result).toEqual(type);
      expect(prisma.type.delete).toHaveBeenCalledWith({
        where: { id: type.id, userId: user.id },
      });
    });
  });
});
