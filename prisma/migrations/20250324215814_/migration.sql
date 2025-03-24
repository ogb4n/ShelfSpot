/*
  Warnings:

  - You are about to drop the `Income` table. If the table is not empty, all the data it contains will be lost.
  - You are about to drop the `Outcome` table. If the table is not empty, all the data it contains will be lost.
  - You are about to drop the `Tags` table. If the table is not empty, all the data it contains will be lost.
  - You are about to drop the `Wallet` table. If the table is not empty, all the data it contains will be lost.
  - You are about to drop the column `tags` on the `Item` table. All the data in the column will be lost.
  - A unique constraint covering the columns `[name,roomId]` on the table `Place` will be added. If there are existing duplicate values, this will fail.
  - A unique constraint covering the columns `[name]` on the table `Room` will be added. If there are existing duplicate values, this will fail.

*/
-- DropIndex
DROP INDEX "Tags_name_key";

-- DropIndex
DROP INDEX "Wallet_name_key";

-- DropTable
PRAGMA foreign_keys=off;
DROP TABLE "Income";
PRAGMA foreign_keys=on;

-- DropTable
PRAGMA foreign_keys=off;
DROP TABLE "Outcome";
PRAGMA foreign_keys=on;

-- DropTable
PRAGMA foreign_keys=off;
DROP TABLE "Tags";
PRAGMA foreign_keys=on;

-- DropTable
PRAGMA foreign_keys=off;
DROP TABLE "Wallet";
PRAGMA foreign_keys=on;

-- CreateTable
CREATE TABLE "Tag" (
    "id" INTEGER NOT NULL PRIMARY KEY AUTOINCREMENT,
    "name" TEXT NOT NULL,
    "icon" TEXT
);

-- CreateTable
CREATE TABLE "ItemTag" (
    "id" INTEGER NOT NULL PRIMARY KEY AUTOINCREMENT,
    "itemId" INTEGER NOT NULL,
    "tagId" INTEGER NOT NULL,
    CONSTRAINT "ItemTag_itemId_fkey" FOREIGN KEY ("itemId") REFERENCES "Item" ("id") ON DELETE CASCADE ON UPDATE CASCADE,
    CONSTRAINT "ItemTag_tagId_fkey" FOREIGN KEY ("tagId") REFERENCES "Tag" ("id") ON DELETE CASCADE ON UPDATE CASCADE
);

-- CreateTable
CREATE TABLE "Favourite" (
    "id" INTEGER NOT NULL PRIMARY KEY AUTOINCREMENT,
    "userId" INTEGER NOT NULL,
    "itemId" INTEGER NOT NULL,
    CONSTRAINT "Favourite_userId_fkey" FOREIGN KEY ("userId") REFERENCES "User" ("id") ON DELETE CASCADE ON UPDATE CASCADE,
    CONSTRAINT "Favourite_itemId_fkey" FOREIGN KEY ("itemId") REFERENCES "Item" ("id") ON DELETE CASCADE ON UPDATE CASCADE
);

-- RedefineTables
PRAGMA defer_foreign_keys=ON;
PRAGMA foreign_keys=OFF;
CREATE TABLE "new_Item" (
    "id" INTEGER NOT NULL PRIMARY KEY AUTOINCREMENT,
    "name" TEXT NOT NULL,
    "quantity" INTEGER NOT NULL DEFAULT 1,
    "image" TEXT,
    "price" REAL,
    "sellprice" REAL,
    "status" TEXT,
    "consumable" BOOLEAN NOT NULL DEFAULT false,
    "placeId" INTEGER,
    "roomId" INTEGER,
    CONSTRAINT "Item_placeId_fkey" FOREIGN KEY ("placeId") REFERENCES "Place" ("id") ON DELETE SET NULL ON UPDATE CASCADE,
    CONSTRAINT "Item_roomId_fkey" FOREIGN KEY ("roomId") REFERENCES "Room" ("id") ON DELETE SET NULL ON UPDATE CASCADE
);
INSERT INTO "new_Item" ("consumable", "id", "image", "name", "placeId", "price", "quantity", "roomId", "sellprice", "status") SELECT "consumable", "id", "image", "name", "placeId", "price", "quantity", "roomId", "sellprice", "status" FROM "Item";
DROP TABLE "Item";
ALTER TABLE "new_Item" RENAME TO "Item";
CREATE INDEX "Item_placeId_idx" ON "Item"("placeId");
CREATE INDEX "Item_roomId_idx" ON "Item"("roomId");
PRAGMA foreign_keys=ON;
PRAGMA defer_foreign_keys=OFF;

-- CreateIndex
CREATE UNIQUE INDEX "Tag_name_key" ON "Tag"("name");

-- CreateIndex
CREATE INDEX "ItemTag_tagId_idx" ON "ItemTag"("tagId");

-- CreateIndex
CREATE INDEX "ItemTag_itemId_idx" ON "ItemTag"("itemId");

-- CreateIndex
CREATE UNIQUE INDEX "ItemTag_itemId_tagId_key" ON "ItemTag"("itemId", "tagId");

-- CreateIndex
CREATE INDEX "Favourite_userId_idx" ON "Favourite"("userId");

-- CreateIndex
CREATE INDEX "Favourite_itemId_idx" ON "Favourite"("itemId");

-- CreateIndex
CREATE UNIQUE INDEX "Favourite_userId_itemId_key" ON "Favourite"("userId", "itemId");

-- CreateIndex
CREATE INDEX "Place_roomId_idx" ON "Place"("roomId");

-- CreateIndex
CREATE UNIQUE INDEX "Place_name_roomId_key" ON "Place"("name", "roomId");

-- CreateIndex
CREATE UNIQUE INDEX "Room_name_key" ON "Room"("name");

-- CreateIndex
CREATE INDEX "User_email_idx" ON "User"("email");
