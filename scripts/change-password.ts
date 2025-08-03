import * as readline from "readline/promises";
import { stdin as input, stdout as output } from "process";

import { PrismaClient } from "@prisma/client";
import bcrypt from "@node-rs/bcrypt";

const rl = readline.createInterface({ input, output });

async function main() {
  const prisma = new PrismaClient();

  const email = await rl.question(
    "Enter the email of the user to change the password for: "
  );
  const password = await rl.question("Enter the new password: ");

  if (!email || !password) {
    console.error("Email and password are required.");
    return;
  }

  const existingUser = await prisma.user.findFirst({
    where: {
      email,
    },
  });

  if (!existingUser) {
    throw new Error("USER_NOT_FOUND");
  }

  const hashedPassword = await bcrypt.hash(password, 10);

  await prisma.password.update({
    where: {
      userId: existingUser.id,
    },
    data: {
      hash: hashedPassword,
    },
  });

  console.log(`Password for user ${email} changed successfully. 🌱`);
}

main()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(async () => {
    rl.close();
  });
