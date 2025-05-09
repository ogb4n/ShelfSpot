/*
  Warnings:

  - You are about to drop the column `stock` on the `Item` table. All the data in the column will be lost.

*/
-- RedefineTables
PRAGMA defer_foreign_keys=ON;
PRAGMA foreign_keys=OFF;
CREATE TABLE "new_Item" (
    "id" INTEGER NOT NULL PRIMARY KEY AUTOINCREMENT,
    "name" TEXT NOT NULL,
    "quantity" INTEGER NOT NULL DEFAULT 0,
    "image" TEXT,
    "price" REAL,
    "sellprice" REAL,
    "status" TEXT,
    "tags" TEXT,
    "consumable" BOOLEAN NOT NULL DEFAULT false,
    "placeId" INTEGER,
    "roomId" INTEGER,
    CONSTRAINT "Item_placeId_fkey" FOREIGN KEY ("placeId") REFERENCES "Place" ("id") ON DELETE SET NULL ON UPDATE CASCADE,
    CONSTRAINT "Item_roomId_fkey" FOREIGN KEY ("roomId") REFERENCES "Room" ("id") ON DELETE SET NULL ON UPDATE CASCADE
);
INSERT INTO "new_Item" ("consumable", "id", "image", "name", "placeId", "price", "roomId", "sellprice", "status", "tags") SELECT "consumable", "id", "image", "name", "placeId", "price", "roomId", "sellprice", "status", "tags" FROM "Item";
DROP TABLE "Item";
ALTER TABLE "new_Item" RENAME TO "Item";
PRAGMA foreign_keys=ON;
PRAGMA defer_foreign_keys=OFF;
