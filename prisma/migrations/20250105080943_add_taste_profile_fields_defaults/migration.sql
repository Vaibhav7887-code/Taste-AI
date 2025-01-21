-- RedefineTables
PRAGMA defer_foreign_keys=ON;
PRAGMA foreign_keys=OFF;
CREATE TABLE "new_TasteProfile" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "userId" TEXT NOT NULL,
    "favoriteDishes" TEXT NOT NULL,
    "dislikedIngredients" TEXT NOT NULL,
    "dietaryRestrictions" TEXT NOT NULL,
    "spicePreference" TEXT NOT NULL,
    "cuisinePreferences" TEXT NOT NULL,
    "allergies" TEXT NOT NULL,
    "additionalNotes" TEXT NOT NULL DEFAULT '',
    "createdAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" DATETIME NOT NULL,
    CONSTRAINT "TasteProfile_userId_fkey" FOREIGN KEY ("userId") REFERENCES "User" ("id") ON DELETE CASCADE ON UPDATE CASCADE
);
INSERT INTO "new_TasteProfile" ("additionalNotes", "allergies", "createdAt", "cuisinePreferences", "dietaryRestrictions", "dislikedIngredients", "favoriteDishes", "id", "spicePreference", "updatedAt", "userId") SELECT "additionalNotes", "allergies", "createdAt", "cuisinePreferences", "dietaryRestrictions", "dislikedIngredients", "favoriteDishes", "id", "spicePreference", "updatedAt", "userId" FROM "TasteProfile";
DROP TABLE "TasteProfile";
ALTER TABLE "new_TasteProfile" RENAME TO "TasteProfile";
CREATE UNIQUE INDEX "TasteProfile_userId_key" ON "TasteProfile"("userId");
PRAGMA foreign_keys=ON;
PRAGMA defer_foreign_keys=OFF;
