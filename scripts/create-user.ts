import * as readline from "readline/promises";
import { stdin as input, stdout as output } from "process";
import { createUser } from "../app/models/user.server";
import { prisma } from "../app/db.server";

const rl = readline.createInterface({ input, output });

async function main() {
  const email = await rl.question("Enter the email for the new user: ");
  const password = await rl.question("Enter the password for the new user: ");

  if (!email || !password) {
    console.error("Email and password are required.");
    return;
  }

  await createUser(email, password);

  console.log(`User ${email} created successfully. 🌱`);
}

main()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
    rl.close();
  });
