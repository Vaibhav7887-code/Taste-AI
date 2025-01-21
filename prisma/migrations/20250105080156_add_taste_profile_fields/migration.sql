/*
  Warnings:

  - Added the required column `allergies` to the `TasteProfile` table without a default value. This is not possible if the table is not empty.
  - Added the required column `cuisinePreferences` to the `TasteProfile` table without a default value. This is not possible if the table is not empty.
  - Added the required column `spicePreference` to the `TasteProfile` table without a default value. This is not possible if the table is not empty.

*/
-- RedefineTables
PRAGMA defer_foreign_keys=ON;
PRAGMA foreign_keys=OFF;
CREATE TABLE "new_TasteProfile" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "userId" TEXT NOT NULL,
    "favoriteDishes" TEXT NOT NULL,
    "dislikedIngredients" TEXT NOT NULL,
    "dietaryRestrictions" TEXT NOT NULL,
    "spicePreference" TEXT NOT NULL DEFAULT 'medium',
    "cuisinePreferences" TEXT NOT NULL DEFAULT '[]',
    "allergies" TEXT NOT NULL DEFAULT '[]',
    "additionalNotes" TEXT NOT NULL DEFAULT '',
    "createdAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" DATETIME NOT NULL,
    CONSTRAINT "TasteProfile_userId_fkey" FOREIGN KEY ("userId") REFERENCES "User" ("id") ON DELETE CASCADE ON UPDATE CASCADE
);
INSERT INTO "new_TasteProfile" ("createdAt", "dietaryRestrictions", "dislikedIngredients", "favoriteDishes", "id", "updatedAt", "userId", "spicePreference", "cuisinePreferences", "allergies", "additionalNotes") 
SELECT 
    "createdAt", 
    "dietaryRestrictions", 
    "dislikedIngredients", 
    "favoriteDishes", 
    "id", 
    "updatedAt", 
    "userId",
    'medium',
    '[]',
    '[]',
    ''
FROM "TasteProfile";
DROP TABLE "TasteProfile";
ALTER TABLE "new_TasteProfile" RENAME TO "TasteProfile";
CREATE UNIQUE INDEX "TasteProfile_userId_key" ON "TasteProfile"("userId");
PRAGMA foreign_keys=ON;
PRAGMA defer_foreign_keys=OFF;
