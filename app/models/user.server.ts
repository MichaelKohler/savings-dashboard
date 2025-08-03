import type { Password, User } from "@prisma/client";
import { compare } from "@node-rs/bcrypt";

import { prisma } from "~/db.server";

export type { User } from "@prisma/client";

export async function getUserById(id: User["id"]) {
  return prisma.user.findUnique({ where: { id } });
}

export async function getUserByEmail(email: User["email"]) {
  return prisma.user.findUnique({ where: { email } });
}

export function countUsers() {
  return prisma.user.count();
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

  const isValid = await compare(password, userWithPassword.password.hash);

  if (!isValid) {
    return null;
  }

  // Do not trust linting here, we do not want to expose the password,
  // therefore we explicitly do not want it to be part of the return value.
  // This variable is unused, but intentionally.
  const { password: _password, ...userWithoutPassword } = userWithPassword;

  return userWithoutPassword;
}
