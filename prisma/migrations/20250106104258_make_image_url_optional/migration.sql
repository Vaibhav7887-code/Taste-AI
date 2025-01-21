-- RedefineTables
PRAGMA defer_foreign_keys=ON;
PRAGMA foreign_keys=OFF;
CREATE TABLE "new_MenuUpload" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "userId" TEXT NOT NULL,
    "imageUrl" TEXT,
    "parsedText" TEXT NOT NULL,
    "recommendations" TEXT NOT NULL,
    "restaurantName" TEXT,
    "mood" TEXT,
    "createdAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" DATETIME NOT NULL,
    CONSTRAINT "MenuUpload_userId_fkey" FOREIGN KEY ("userId") REFERENCES "User" ("id") ON DELETE CASCADE ON UPDATE CASCADE
);
INSERT INTO "new_MenuUpload" ("createdAt", "id", "imageUrl", "mood", "parsedText", "recommendations", "restaurantName", "updatedAt", "userId") SELECT "createdAt", "id", "imageUrl", "mood", "parsedText", "recommendations", "restaurantName", "updatedAt", "userId" FROM "MenuUpload";
DROP TABLE "MenuUpload";
ALTER TABLE "new_MenuUpload" RENAME TO "MenuUpload";
PRAGMA foreign_keys=ON;
PRAGMA defer_foreign_keys=OFF;
