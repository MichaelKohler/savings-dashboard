import {
  getGroups,
  getGroup,
  createGroup,
  updateGroup,
  deleteGroup,
} from "./groups.server";
import { prisma } from "~/db.server";

vi.mock("~/db.server", () => ({
  prisma: {
    group: {
      findMany: vi.fn(),
      findUnique: vi.fn(),
      create: vi.fn(),
      update: vi.fn(),
      delete: vi.fn(),
    },
  },
}));

import type { Group } from "@prisma/client";

describe("models/groups", () => {
  const mockGroup: Group = {
    id: "g1",
    name: "Group 1",
    userId: "1",
    createdAt: new Date(),
    updatedAt: new Date(),
  };

  afterEach(() => {
    vi.clearAllMocks();
  });

  describe("getGroups", () => {
    it("should return a list of groups", async () => {
      const mockGroups = [mockGroup];
      vi.mocked(prisma.group.findMany).mockResolvedValue(mockGroups);
      const groups = await getGroups({ userId: "1" });
      expect(prisma.group.findMany).toHaveBeenCalledWith({
        where: { userId: "1" },
        include: { accounts: true },
      });
      expect(groups).toEqual(mockGroups);
    });
  });

  describe("getGroup", () => {
    it("should return a single group", async () => {
      vi.mocked(prisma.group.findUnique).mockResolvedValue(mockGroup);
      const group = await getGroup({ id: "g1", userId: "1" });
      expect(prisma.group.findUnique).toHaveBeenCalledWith({
        where: { id: "g1", userId: "1" },
        include: { accounts: true },
      });
      expect(group).toEqual(mockGroup);
    });
  });

  describe("createGroup", () => {
    it("should create a new group", async () => {
      const newGroupData = { name: "New Group", userId: "1" };
      vi.mocked(prisma.group.create).mockResolvedValue({
        ...mockGroup,
        ...newGroupData,
      });
      const result = await createGroup(newGroupData);
      expect(prisma.group.create).toHaveBeenCalledWith({
        data: newGroupData,
      });
      expect(result.name).toEqual(newGroupData.name);
    });
  });

  describe("updateGroup", () => {
    it("should update a group", async () => {
      const updatedGroupData = { ...mockGroup, name: "Updated Group" };
      vi.mocked(prisma.group.update).mockResolvedValue(updatedGroupData);
      const result = await updateGroup(updatedGroupData);
      expect(prisma.group.update).toHaveBeenCalledWith({
        where: { id: "g1", userId: "1" },
        data: { name: "Updated Group" },
      });
      expect(result).toEqual(updatedGroupData);
    });
  });

  describe("deleteGroup", () => {
    it("should delete a group", async () => {
      vi.mocked(prisma.group.delete).mockResolvedValue(mockGroup);
      const result = await deleteGroup({ id: "g1", userId: "1" });
      expect(prisma.group.delete).toHaveBeenCalledWith({
        where: { id: "g1", userId: "1" },
      });
      expect(result).toEqual(mockGroup);
    });
  });
});
