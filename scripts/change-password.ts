import * as readline from "readline/promises";
import { stdin as input, stdout as output } from "process";
import { changePassword } from "../app/models/user.server";
import { prisma } from "../app/db.server";

const rl = readline.createInterface({ input, output });

async function main() {
  const email = await rl.question(
    "Enter the email of the user to change the password for: "
  );
  const password = await rl.question("Enter the new password: ");

  if (!email || !password) {
    console.error("Email and password are required.");
    return;
  }

  await changePassword(email, password);

  console.log(`Password for user ${email} changed successfully. 🌱`);
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
