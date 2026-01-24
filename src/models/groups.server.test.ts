import { vi, beforeEach } from "vitest";
import { mockPrisma } from "../test-setup";

import {
  getGroups,
  getGroup,
  createGroup,
  updateGroup,
  deleteGroup,
} from "./groups.server";

describe("group models", () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });
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
    beforeEach(() => {
      vi.clearAllMocks();
    });
    it("should return a list of groups for a user", async () => {
      mockPrisma.group.findMany.mockResolvedValue([group]);

      const result = await getGroups({ userId: user.id });

      expect(result).toEqual([group]);
      expect(mockPrisma.group.findMany).toHaveBeenCalledWith({
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
    beforeEach(() => {
      vi.clearAllMocks();
    });
    it("should return a single group by id", async () => {
      mockPrisma.group.findUnique.mockResolvedValue(group);

      const result = await getGroup({ id: group.id, userId: user.id });

      expect(result).toEqual(group);
      expect(mockPrisma.group.findUnique).toHaveBeenCalledWith({
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
    beforeEach(() => {
      vi.clearAllMocks();
    });
    it("should create a new group", async () => {
      mockPrisma.group.create.mockResolvedValue(group);

      const result = await createGroup({ name: group.name, userId: user.id });

      expect(result).toEqual(group);
      expect(mockPrisma.group.create).toHaveBeenCalledWith({
        data: { name: group.name, userId: user.id },
      });
    });
  });

  describe("updateGroup", () => {
    beforeEach(() => {
      vi.clearAllMocks();
    });
    it("should update a group", async () => {
      mockPrisma.group.update.mockResolvedValue(group);

      const result = await updateGroup({
        id: group.id,
        name: group.name,
        userId: user.id,
      });

      expect(result).toEqual(group);
      expect(mockPrisma.group.update).toHaveBeenCalledWith({
        where: { id: group.id, userId: user.id },
        data: { name: group.name },
      });
    });
  });

  describe("deleteGroup", () => {
    beforeEach(() => {
      vi.clearAllMocks();
    });
    it("should delete a group", async () => {
      mockPrisma.group.delete.mockResolvedValue(group);

      const result = await deleteGroup({ id: group.id, userId: user.id });

      expect(result).toEqual(group);
      expect(mockPrisma.group.delete).toHaveBeenCalledWith({
        where: { id: group.id, userId: user.id },
      });
    });
  });
});
