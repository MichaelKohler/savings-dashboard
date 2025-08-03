import * as readline from "readline/promises";
import { stdin as input, stdout as output } from "process";

import { PrismaClient } from "@prisma/client";
import bcrypt from "@node-rs/bcrypt";

const rl = readline.createInterface({ input, output });

async function main() {
  const prisma = new PrismaClient();

  const email = await rl.question("Enter the email for the new user: ");
  const password = await rl.question("Enter the password for the new user: ");

  if (!email || !password) {
    console.error("Email and password are required.");
    return;
  }

  const hashedPassword = await bcrypt.hash(password, 10);

  await prisma.user.create({
    data: {
      email,
      password: {
        create: {
          hash: hashedPassword,
        },
      },
    },
  });

  console.log(`User ${email} created successfully. 🌱`);
}

main()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(async () => {
    rl.close();
  });
