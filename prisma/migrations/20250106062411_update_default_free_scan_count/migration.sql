/*
  Warnings:

  - You are about to drop the column `verified` on the `User` table. All the data in the column will be lost.

*/
-- RedefineTables
PRAGMA defer_foreign_keys=ON;
PRAGMA foreign_keys=OFF;
CREATE TABLE "new_User" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "name" TEXT NOT NULL,
    "email" TEXT NOT NULL,
    "password" TEXT NOT NULL,
    "image" TEXT,
    "emailVerified" DATETIME,
    "createdAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" DATETIME NOT NULL,
    "plan" TEXT NOT NULL DEFAULT 'FREE',
    "stripeCustomerId" TEXT,
    "uploadsThisWeek" INTEGER NOT NULL DEFAULT 0,
    "lastUploadReset" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "verificationToken" TEXT,
    "resetToken" TEXT,
    "resetTokenExpiry" DATETIME,
    "onboardingStatus" TEXT NOT NULL DEFAULT 'NOT_STARTED',
    "freeScanCount" INTEGER NOT NULL DEFAULT 1
);
INSERT INTO "new_User" ("createdAt", "email", "emailVerified", "freeScanCount", "id", "image", "lastUploadReset", "name", "onboardingStatus", "password", "plan", "resetToken", "resetTokenExpiry", "stripeCustomerId", "updatedAt", "uploadsThisWeek", "verificationToken") SELECT "createdAt", "email", "emailVerified", "freeScanCount", "id", "image", "lastUploadReset", "name", "onboardingStatus", "password", "plan", "resetToken", "resetTokenExpiry", "stripeCustomerId", "updatedAt", "uploadsThisWeek", "verificationToken" FROM "User";
DROP TABLE "User";
ALTER TABLE "new_User" RENAME TO "User";
CREATE UNIQUE INDEX "User_email_key" ON "User"("email");
CREATE UNIQUE INDEX "User_verificationToken_key" ON "User"("verificationToken");
PRAGMA foreign_keys=ON;
PRAGMA defer_foreign_keys=OFF;
