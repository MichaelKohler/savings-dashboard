import * as bcrypt from "@node-rs/bcrypt";
import {
  getUserById,
  getUserByEmail,
  countUsers,
  createUser,
  changePassword,
  deleteUserByEmail,
  deleteUserByUserId,
  verifyLogin,
} from "./user.server";
import { prisma } from "~/db.server";

vi.mock("~/db.server", () => ({
  prisma: {
    user: {
      findUnique: vi.fn(),
      count: vi.fn(),
      create: vi.fn(),
      delete: vi.fn(),
    },
    password: {
      update: vi.fn(),
    },
  },
}));

vi.mock("@node-rs/bcrypt", () => ({
  hash: vi.fn(),
  compare: vi.fn(),
}));

import type { User } from "@prisma/client";

describe("models/user", () => {
  const mockUser: User = {
    id: "1",
    email: "test@example.com",
    createdAt: new Date(),
    updatedAt: new Date(),
  };

  afterEach(() => {
    vi.clearAllMocks();
  });

  describe("getUserById", () => {
    it("should get user by id", async () => {
      vi.mocked(prisma.user.findUnique).mockResolvedValue(mockUser);
      await getUserById("1");
      expect(prisma.user.findUnique).toHaveBeenCalledWith({
        where: { id: "1" },
      });
    });
  });

  describe("getUserByEmail", () => {
    it("should get user by email", async () => {
      vi.mocked(prisma.user.findUnique).mockResolvedValue(mockUser);
      await getUserByEmail("test@example.com");
      expect(prisma.user.findUnique).toHaveBeenCalledWith({
        where: { email: "test@example.com" },
      });
    });
  });

  describe("countUsers", () => {
    it("should return the number of users", async () => {
      vi.mocked(prisma.user.count).mockResolvedValue(5);
      const count = await countUsers();
      expect(count).toBe(5);
    });
  });

  describe("createUser", () => {
    it("should create a user", async () => {
      vi.mocked(bcrypt.hash).mockResolvedValue("hashedpassword");
      await createUser("test@example.com", "password");
      expect(bcrypt.hash).toHaveBeenCalledWith("password", 10);
      expect(prisma.user.create).toHaveBeenCalledWith({
        data: {
          email: "test@example.com",
          password: {
            create: {
              hash: "hashedpassword",
            },
          },
        },
      });
    });
  });

  describe("changePassword", () => {
    it("should change a user's password", async () => {
      vi.mocked(prisma.user.findUnique).mockResolvedValue(mockUser);
      vi.mocked(bcrypt.hash).mockResolvedValue("newhashedpassword");
      await changePassword("test@example.com", "newpassword");
      expect(prisma.password.update).toHaveBeenCalledWith({
        where: { userId: "1" },
        data: { hash: "newhashedpassword" },
      });
    });
  });

  describe("deleteUserByEmail", () => {
    it("should delete a user by email", async () => {
      await deleteUserByEmail("test@example.com");
      expect(prisma.user.delete).toHaveBeenCalledWith({
        where: { email: "test@example.com" },
      });
    });
  });

  describe("deleteUserByUserId", () => {
    it("should delete a user by id", async () => {
      await deleteUserByUserId("1");
      expect(prisma.user.delete).toHaveBeenCalledWith({ where: { id: "1" } });
    });
  });

  describe("verifyLogin", () => {
    it("should return user if login is valid", async () => {
      const userWithPassword = {
        ...mockUser,
        password: { hash: "hashed" },
      };
      vi.mocked(prisma.user.findUnique).mockResolvedValue(userWithPassword);
      vi.mocked(bcrypt.compare).mockResolvedValue(true);
      const result = await verifyLogin("test@example.com", "password");
      expect(bcrypt.compare).toHaveBeenCalledWith("password", "hashed");
      expect(result).toEqual(mockUser);
    });

    it("should return null if user not found", async () => {
      vi.mocked(prisma.user.findUnique).mockResolvedValue(null);
      const result = await verifyLogin("test@example.com", "password");
      expect(result).toBeNull();
    });

    it("should return null if password does not match", async () => {
      const userWithPassword = {
        ...mockUser,
        password: { hash: "hashed" },
      };
      vi.mocked(prisma.user.findUnique).mockResolvedValue(userWithPassword);
      vi.mocked(bcrypt.compare).mockResolvedValue(false);
      const result = await verifyLogin("test@example.com", "password");
      expect(result).toBeNull();
    });
  });
});
