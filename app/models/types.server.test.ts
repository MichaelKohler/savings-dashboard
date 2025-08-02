import {
  getTypes,
  getType,
  createType,
  updateType,
  deleteType,
} from "./types.server";
import { prisma } from "~/db.server";

vi.mock("~/db.server", () => ({
  prisma: {
    type: {
      findMany: vi.fn(),
      findUnique: vi.fn(),
      create: vi.fn(),
      update: vi.fn(),
      delete: vi.fn(),
    },
  },
}));

import type { Type } from "@prisma/client";

describe("models/types", () => {
  const mockType: Type = {
    id: "t1",
    name: "Type 1",
    userId: "1",
    createdAt: new Date(),
    updatedAt: new Date(),
  };

  afterEach(() => {
    vi.clearAllMocks();
  });

  describe("getTypes", () => {
    it("should return a list of types", async () => {
      const mockTypes = [mockType];
      vi.mocked(prisma.type.findMany).mockResolvedValue(mockTypes);
      const types = await getTypes({ userId: "1" });
      expect(prisma.type.findMany).toHaveBeenCalledWith({
        where: { userId: "1" },
        include: { accounts: true },
      });
      expect(types).toEqual(mockTypes);
    });
  });

  describe("getType", () => {
    it("should return a single type", async () => {
      vi.mocked(prisma.type.findUnique).mockResolvedValue(mockType);
      const type = await getType({ id: "t1", userId: "1" });
      expect(prisma.type.findUnique).toHaveBeenCalledWith({
        where: { id: "t1", userId: "1" },
        include: { accounts: true },
      });
      expect(type).toEqual(mockType);
    });
  });

  describe("createType", () => {
    it("should create a new type", async () => {
      const newTypeData = { name: "New Type", userId: "1" };
      vi.mocked(prisma.type.create).mockResolvedValue({
        ...mockType,
        ...newTypeData,
      });
      const result = await createType(newTypeData);
      expect(prisma.type.create).toHaveBeenCalledWith({
        data: newTypeData,
      });
      expect(result.name).toEqual(newTypeData.name);
    });
  });

  describe("updateType", () => {
    it("should update a type", async () => {
      const updatedTypeData = { ...mockType, name: "Updated Type" };
      vi.mocked(prisma.type.update).mockResolvedValue(updatedTypeData);
      const result = await updateType(updatedTypeData);
      expect(prisma.type.update).toHaveBeenCalledWith({
        where: { id: "t1", userId: "1" },
        data: { name: "Updated Type" },
      });
      expect(result).toEqual(updatedTypeData);
    });
  });

  describe("deleteType", () => {
    it("should delete a type", async () => {
      vi.mocked(prisma.type.delete).mockResolvedValue(mockType);
      const result = await deleteType({ id: "t1", userId: "1" });
      expect(prisma.type.delete).toHaveBeenCalledWith({
        where: { id: "t1", userId: "1" },
      });
      expect(result).toEqual(mockType);
    });
  });
});
