/*
  Warnings:

  - Added the required column `recommendations` to the `MenuUpload` table without a default value. This is not possible if the table is not empty.
  - Added the required column `updatedAt` to the `MenuUpload` table without a default value. This is not possible if the table is not empty.
  - Made the column `parsedText` on table `MenuUpload` required. This step will fail if there are existing NULL values in that column.

*/
-- RedefineTables
PRAGMA defer_foreign_keys=ON;
PRAGMA foreign_keys=OFF;
CREATE TABLE "new_MenuUpload" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "userId" TEXT NOT NULL,
    "imageUrl" TEXT NOT NULL,
    "parsedText" TEXT NOT NULL,
    "recommendations" TEXT NOT NULL,
    "createdAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" DATETIME NOT NULL,
    CONSTRAINT "MenuUpload_userId_fkey" FOREIGN KEY ("userId") REFERENCES "User" ("id") ON DELETE CASCADE ON UPDATE CASCADE
);
INSERT INTO "new_MenuUpload" ("createdAt", "id", "imageUrl", "parsedText", "userId") SELECT "createdAt", "id", "imageUrl", "parsedText", "userId" FROM "MenuUpload";
DROP TABLE "MenuUpload";
ALTER TABLE "new_MenuUpload" RENAME TO "MenuUpload";
PRAGMA foreign_keys=ON;
PRAGMA defer_foreign_keys=OFF;
