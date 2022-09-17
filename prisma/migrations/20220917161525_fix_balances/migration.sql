/*
  Warnings:

  - You are about to drop the column `color` on the `Balance` table. All the data in the column will be lost.
  - Added the required column `userId` to the `Balance` table without a default value. This is not possible if the table is not empty.

*/
-- RedefineTables
PRAGMA foreign_keys=OFF;
CREATE TABLE "new_Balance" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "balance" INTEGER NOT NULL,
    "date" DATETIME NOT NULL,
    "createdAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" DATETIME NOT NULL,
    "userId" TEXT NOT NULL,
    "accountId" TEXT NOT NULL,
    CONSTRAINT "Balance_userId_fkey" FOREIGN KEY ("userId") REFERENCES "User" ("id") ON DELETE CASCADE ON UPDATE CASCADE,
    CONSTRAINT "Balance_accountId_fkey" FOREIGN KEY ("accountId") REFERENCES "Account" ("id") ON DELETE CASCADE ON UPDATE CASCADE
);
INSERT INTO "new_Balance" ("accountId", "balance", "createdAt", "date", "id", "updatedAt") SELECT "accountId", "balance", "createdAt", "date", "id", "updatedAt" FROM "Balance";
DROP TABLE "Balance";
ALTER TABLE "new_Balance" RENAME TO "Balance";
PRAGMA foreign_key_check;
PRAGMA foreign_keys=ON;
