-- AlterTable
ALTER TABLE "MenuUpload" ADD COLUMN "mood" TEXT;
ALTER TABLE "MenuUpload" ADD COLUMN "restaurantName" TEXT;

-- CreateTable
CREATE TABLE "RestaurantVisit" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "userId" TEXT NOT NULL,
    "restaurantName" TEXT NOT NULL,
    "visitDate" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "menuUploadId" TEXT,
    "orderedDish" TEXT NOT NULL,
    "rating" INTEGER,
    "notes" TEXT,
    "mood" TEXT,
    "createdAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" DATETIME NOT NULL,
    CONSTRAINT "RestaurantVisit_userId_fkey" FOREIGN KEY ("userId") REFERENCES "User" ("id") ON DELETE CASCADE ON UPDATE CASCADE,
    CONSTRAINT "RestaurantVisit_menuUploadId_fkey" FOREIGN KEY ("menuUploadId") REFERENCES "MenuUpload" ("id") ON DELETE SET NULL ON UPDATE CASCADE
);

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
    "verified" BOOLEAN NOT NULL DEFAULT false,
    "verificationToken" TEXT,
    "onboardingStatus" TEXT NOT NULL DEFAULT 'NOT_STARTED',
    "freeScanCount" INTEGER NOT NULL DEFAULT 2
);
INSERT INTO "new_User" ("createdAt", "email", "emailVerified", "id", "image", "lastUploadReset", "name", "password", "plan", "stripeCustomerId", "updatedAt", "uploadsThisWeek", "verificationToken", "verified") SELECT "createdAt", "email", "emailVerified", "id", "image", "lastUploadReset", "name", "password", "plan", "stripeCustomerId", "updatedAt", "uploadsThisWeek", "verificationToken", "verified" FROM "User";
DROP TABLE "User";
ALTER TABLE "new_User" RENAME TO "User";
CREATE UNIQUE INDEX "User_email_key" ON "User"("email");
CREATE UNIQUE INDEX "User_verificationToken_key" ON "User"("verificationToken");
PRAGMA foreign_keys=ON;
PRAGMA defer_foreign_keys=OFF;
