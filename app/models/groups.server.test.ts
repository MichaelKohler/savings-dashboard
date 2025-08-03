import { vi } from "vitest";

import {
  getGroups,
  getGroup,
  createGroup,
  updateGroup,
  deleteGroup,
} from "./groups.server";
import { prisma } from "~/db.server";

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
    createdAt: new Date(),
    updatedAt: new Date(),
  };

  describe("getGroups", () => {
    it("should return a list of groups for a user", async () => {
      vi.mocked(prisma.group.findMany).mockResolvedValue([group]);

      const result = await getGroups({ userId: user.id });

      expect(result).toEqual([group]);
      expect(prisma.group.findMany).toHaveBeenCalledWith({
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

  describe("getGroup", () => {
    it("should return a single group by id", async () => {
      vi.mocked(prisma.group.findUnique).mockResolvedValue(group);

      const result = await getGroup({ id: group.id, userId: user.id });

      expect(result).toEqual(group);
      expect(prisma.group.findUnique).toHaveBeenCalledWith({
        where: { id: group.id, userId: user.id },
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

  describe("createGroup", () => {
    it("should create a new group", async () => {
      vi.mocked(prisma.group.create).mockResolvedValue(group);

      const result = await createGroup({ name: group.name, userId: user.id });

      expect(result).toEqual(group);
      expect(prisma.group.create).toHaveBeenCalledWith({
        data: { name: group.name, userId: user.id },
      });
    });
  });

  describe("updateGroup", () => {
    it("should update a group", async () => {
      vi.mocked(prisma.group.update).mockResolvedValue(group);

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
      vi.mocked(prisma.group.delete).mockResolvedValue(group);

      const result = await deleteGroup({ id: group.id, userId: user.id });

      expect(result).toEqual(group);
      expect(prisma.group.delete).toHaveBeenCalledWith({
        where: { id: group.id, userId: user.id },
      });
    });
  });
});
