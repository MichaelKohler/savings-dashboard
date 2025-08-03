import { vi } from "vitest";

import { prisma } from "~/db.server";
import {
  getGroups,
  getGroup,
  createGroup,
  updateGroup,
  deleteGroup,
} from "./groups.server";

vi.mock("~/db.server");

describe("group models", () => {
  const user = {
    id: "1",
    email: "test@example.com",
    createdAt: new Date(),
    updatedAt: new Date(),
  };

  const group = {
    id: "1",
    name: "Test Group",
    userId: user.id,
    accounts: [],
  };

  describe("getGroups", () => {
    it("should return a list of groups for a user", async () => {
      prisma.group.findMany.mockResolvedValue([group]);

      const result = await getGroups({ userId: user.id });

      expect(result).toEqual([group]);
      expect(prisma.group.findMany).toHaveBeenCalledWith({
        where: { userId: user.id },
        include: {
          accounts: true,
        },
      });
    });
  });

  describe("getGroup", () => {
    it("should return a single group by id", async () => {
      prisma.group.findUnique.mockResolvedValue(group);

      const result = await getGroup({ id: group.id, userId: user.id });

      expect(result).toEqual(group);
      expect(prisma.group.findUnique).toHaveBeenCalledWith({
        where: { id: group.id, userId: user.id },
        include: {
          accounts: true,
        },
      });
    });
  });

  describe("createGroup", () => {
    it("should create a new group", async () => {
      prisma.group.create.mockResolvedValue(group);

      const result = await createGroup({ name: group.name, userId: user.id });

      expect(result).toEqual(group);
      expect(prisma.group.create).toHaveBeenCalledWith({
        data: { name: group.name, userId: user.id },
      });
    });
  });

  describe("updateGroup", () => {
    it("should update a group", async () => {
      prisma.group.update.mockResolvedValue(group);

      const result = await updateGroup({
        id: group.id,
        name: group.name,
        userId: user.id,
      });

      expect(result).toEqual(group);
      expect(prisma.group.update).toHaveBeenCalledWith({
        where: { id: group.id, userId: user.id },
        data: { name: group.name },
      });
    });
  });

  describe("deleteGroup", () => {
    it("should delete a group", async () => {
      prisma.group.delete.mockResolvedValue(group);

      const result = await deleteGroup({ id: group.id, userId: user.id });

      expect(result).toEqual(group);
      expect(prisma.group.delete).toHaveBeenCalledWith({
        where: { id: group.id, userId: user.id },
      });
    });
  });
});
