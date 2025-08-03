import { vi } from "vitest";

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
} from "../../../app/models/user.server";
import { prisma } from "~/db.server";

vi.mock("~/db.server");
vi.mock("@node-rs/bcrypt");

describe("user models", () => {
  const user = {
    id: "1",
    email: "test@example.com",
    createdAt: new Date(),
    updatedAt: new Date(),
  };

  const password = {
    hash: "hashedpassword",
    userId: user.id,
  };

  beforeEach(() => {
    vi.clearAllMocks();

    vi.spyOn(bcrypt, "hash").mockImplementation(() =>
      Promise.resolve(password.hash)
    );
    vi.spyOn(bcrypt, "compare").mockImplementation(() => Promise.resolve(true));
  });

  describe("getUserById", () => {
    it("should return a user by id", async () => {
      vi.mocked(prisma.user.findUnique).mockResolvedValue(user);

      const result = await getUserById(user.id);

      expect(result).toEqual(user);
      expect(prisma.user.findUnique).toHaveBeenCalledWith({
        where: { id: user.id },
      });
    });
  });

  describe("getUserByEmail", () => {
    it("should return a user by email", async () => {
      vi.mocked(prisma.user.findUnique).mockResolvedValue(user);

      const result = await getUserByEmail(user.email);

      expect(result).toEqual(user);
      expect(prisma.user.findUnique).toHaveBeenCalledWith({
        where: { email: user.email },
      });
    });
  });

  describe("countUsers", () => {
    it("should return the number of users", async () => {
      vi.mocked(prisma.user.count).mockResolvedValue(1);

      const result = await countUsers();

      expect(result).toEqual(1);
      expect(prisma.user.count).toHaveBeenCalled();
    });
  });

  describe("createUser", () => {
    it("should create a new user", async () => {
      vi.mocked(bcrypt.hash).mockResolvedValue(password.hash);
      vi.mocked(prisma.user.create).mockResolvedValue(user);

      const result = await createUser(user.email, "password");

      expect(result).toEqual(user);
      expect(bcrypt.hash).toHaveBeenCalledWith("password", 10);
      expect(prisma.user.create).toHaveBeenCalledWith({
        data: {
          email: user.email,
          password: {
            create: {
              hash: password.hash,
            },
          },
        },
      });
    });
  });

  describe("changePassword", () => {
    it("should change a user's password", async () => {
      vi.mocked(prisma.user.findUnique).mockResolvedValue(user);
      vi.mocked(bcrypt.hash).mockResolvedValue(password.hash);
      vi.mocked(prisma.password.update).mockResolvedValue(password);

      const result = await changePassword(user.email, "newpassword");

      expect(result).toEqual(password);
      await expect(getUserByEmail(user.email)).resolves.toEqual(user);
      expect(bcrypt.hash).toHaveBeenCalledWith("newpassword", 10);
      expect(prisma.password.update).toHaveBeenCalledWith({
        where: {
          userId: user.id,
        },
        data: {
          hash: password.hash,
        },
      });
    });

    it("should throw an error if no email is passed", async () => {
      await expect(changePassword("", "newpassword")).rejects.toThrow(
        "NO_EMAIL_PASSED"
      );
    });

    it("should throw an error if user is not found", async () => {
      vi.mocked(prisma.user.findUnique).mockResolvedValue(null);
      await expect(
        changePassword("nouser@example.com", "newpassword")
      ).rejects.toThrow("USER_NOT_FOUND");
    });
  });

  describe("deleteUserByEmail", () => {
    it("should delete a user by email", async () => {
      vi.mocked(prisma.user.delete).mockResolvedValue(user);

      const result = await deleteUserByEmail(user.email);

      expect(result).toEqual(user);
      expect(prisma.user.delete).toHaveBeenCalledWith({
        where: { email: user.email },
      });
    });
  });

  describe("deleteUserByUserId", () => {
    it("should delete a user by id", async () => {
      vi.mocked(prisma.user.delete).mockResolvedValue(user);

      const result = await deleteUserByUserId(user.id);

      expect(result).toEqual(user);
      expect(prisma.user.delete).toHaveBeenCalledWith({
        where: { id: user.id },
      });
    });
  });

  describe("verifyLogin", () => {
    it("should return the user if login is valid", async () => {
      const userWithPassword = { ...user, password };
      vi.mocked(prisma.user.findUnique).mockResolvedValue(userWithPassword);
      vi.mocked(bcrypt.compare).mockResolvedValue(true);

      const result = await verifyLogin(user.email, "password");
      const { password: _password, ...userWithoutPassword } = userWithPassword;

      expect(result).toEqual(userWithoutPassword);
      expect(prisma.user.findUnique).toHaveBeenCalledWith({
        where: { email: user.email },
        include: { password: true },
      });
      expect(bcrypt.compare).toHaveBeenCalledWith("password", password.hash);
    });

    it("should return null if user is not found", async () => {
      vi.mocked(prisma.user.findUnique).mockResolvedValue(null);

      const result = await verifyLogin(user.email, "password");

      expect(result).toBeNull();
    });

    it("should return null if password is not valid", async () => {
      const userWithPassword = { ...user, password };
      vi.mocked(prisma.user.findUnique).mockResolvedValue(userWithPassword);
      vi.mocked(bcrypt.compare).mockResolvedValue(false);

      const result = await verifyLogin(user.email, "password");

      expect(result).toBeNull();
    });
  });
});
