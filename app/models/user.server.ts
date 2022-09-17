import type { Password, User } from "@prisma/client";
import bcrypt from "@node-rs/bcrypt";
import { createHash } from "crypto";

import { prisma } from "~/db.server";

export type { User } from "@prisma/client";

const ONE_HOUR_MS = 1 * 60 * 60 * 1000;

export async function getUserById(id: User["id"]) {
  return prisma.user.findUnique({ where: { id } });
}

export async function getUserByEmail(email: User["email"]) {
  return prisma.user.findUnique({ where: { email } });
}

export function countUsers() {
  return prisma.user.count();
}

export async function createUser(email: User["email"], password: string) {
  const hashedPassword = await bcrypt.hash(password, 10);

  return prisma.user.create({
    data: {
      email,
      password: {
        create: {
          hash: hashedPassword,
        },
      },
    },
  });
}

export async function changePassword(
  email: User["email"],
  password: string,
  token: string
) {
  let userEmail = email;

  if (!email && !token) {
    throw new Error("NO_EMAIL_OR_TOKEN_PASSED");
  }

  const existingUser = await getUserByEmail(userEmail);
  if (!existingUser) {
    throw new Error("USER_NOT_FOUND");
  }

  const hashedPassword = await bcrypt.hash(password, 10);

  return prisma.password.update({
    where: {
      userId: existingUser.id,
    },
    data: {
      hash: hashedPassword,
    },
  });
}

export async function deleteUserByEmail(email: User["email"]) {
  return prisma.user.delete({ where: { email } });
}

export async function deleteUserByUserId(id: User["id"]) {
  return prisma.user.delete({ where: { id } });
}

export async function verifyLogin(
  email: User["email"],
  password: Password["hash"]
) {
  const userWithPassword = await prisma.user.findUnique({
    where: { email },
    include: {
      password: true,
    },
  });

  if (!userWithPassword || !userWithPassword.password) {
    return null;
  }

  const isValid = await bcrypt.compare(
    password,
    userWithPassword.password.hash
  );

  if (!isValid) {
    return null;
  }

  const { password: _password, ...userWithoutPassword } = userWithPassword;

  return userWithoutPassword;
}
